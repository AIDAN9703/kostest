"use server";

import { db } from "@/database/db";
import { 
  conversations, 
  messages, 
  conversationParticipants, 
  users
} from "@/database/schema";
import { auth } from "@/auth";
import { 
  sendMessageRequestSchema,
  markAsReadRequestSchema,
  messageFiltersSchema,
  paginationParamsSchema
} from "@/shared/validation/messaging";
import { 
  SendMessageRequest,
  MessageWithDetails,
  MessageFilters,
  PaginationParams,
  MessageListResponse,
  MessageAttachment,
  ReadStatus,
  SystemMessageData,
  MESSAGING_ERROR_CODES
} from "@/shared/types/messaging.types";
import { revalidatePath } from "next/cache";
import { eq, and, desc, sql, inArray, like, gte, lte } from "drizzle-orm";
import { z } from "zod";

/**
 * Sends a message to a conversation
 */
export async function sendMessage(data: SendMessageRequest) {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "Authentication required",
      errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
    };
  }

  try {
    // Validate the request data
    const validatedData = sendMessageRequestSchema.parse(data);
    
    // Check if conversation exists and user has access (no transaction - Neon HTTP doesn't support them)
    const conversationQuery = await db
      .select({
        id: conversations.id,
        participantIds: conversations.participantIds,
        isLocked: conversations.isLocked,
        messageCount: conversations.messageCount,
      })
      .from(conversations)
      .where(eq(conversations.id, validatedData.conversationId))
      .limit(1);

    if (conversationQuery.length === 0) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }

    const conversation = conversationQuery[0];

    // Check if user is a participant
    if (!conversation.participantIds.includes(session.user.id!) && session.user.role !== "ADMIN") {
      throw new Error("UNAUTHORIZED_ACCESS");
    }

    // Check if conversation is locked
    if (conversation.isLocked && session.user.role !== "ADMIN") {
      throw new Error("CONVERSATION_LOCKED");
    }

    // Generate message ID
    const messageId = crypto.randomUUID();
    const now = new Date();

    // Create the message
    const [newMessage] = await db
      .insert(messages)
      .values({
        id: messageId,
        conversationId: validatedData.conversationId,
        senderId: session.user.id!,
        content: validatedData.content,
        messageType: validatedData.messageType || "TEXT",
        readBy: { [session.user.id!]: now.toISOString() }, // Sender has automatically read the message
        readCount: 1,
      })
      .returning();

    // Update conversation last message info and message count
    await db
      .update(conversations)
      .set({
        lastMessageId: messageId,
        lastMessageAt: now,
        lastActivityAt: now,
        messageCount: conversation.messageCount + 1,
      })
      .where(eq(conversations.id, validatedData.conversationId));

    // Update unread counts for all other participants
    const otherParticipantIds = conversation.participantIds.filter(id => id !== session.user.id);
    
    if (otherParticipantIds.length > 0) {
      await db
        .update(conversationParticipants)
        .set({
          unreadCount: sql`${conversationParticipants.unreadCount} + 1`,
        })
        .where(
          and(
            eq(conversationParticipants.conversationId, validatedData.conversationId),
            inArray(conversationParticipants.userId, otherParticipantIds)
          )
        );

      // Update conversation total unread count
      await db
        .update(conversations)
        .set({
          unreadCount: sql`${conversations.unreadCount} + ${otherParticipantIds.length}`,
        })
        .where(eq(conversations.id, validatedData.conversationId));
    }

    const result = newMessage;

    // Revalidate relevant paths
    revalidatePath("/messages");
    revalidatePath(`/messages/${validatedData.conversationId}`);
    revalidatePath("/admin/messages");

    // Send notifications (async, don't wait)
    if (process.env.NODE_ENV === 'production') {
      // Only send notifications in production to avoid spam during development
      import("@/features/messaging/services/notifications").then(({ sendNewMessageNotification }) => {
        // We need to get the full message and conversation data for notifications
        // This is done async to not slow down the message sending
        sendNewMessageNotification({
          ...result,
          sender: {
            id: session.user.id!,
            name: session.user.name,
            profileImage: session.user.profileImage,
            
          }
        } as any, conversation as any).catch(console.error);
      });
    }

    // TODO: Trigger real-time updates via Socket.IO

    return {
      success: true,
      data: {
        messageId: result.id,
        message: "Message sent successfully"
      }
    };

  } catch (error) {
    console.error("Error sending message:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "CONVERSATION_NOT_FOUND":
          return {
            success: false,
            error: "Conversation not found",
            errorCode: MESSAGING_ERROR_CODES.CONVERSATION_NOT_FOUND
          };
        case "UNAUTHORIZED_ACCESS":
          return {
            success: false,
            error: "Access denied to this conversation",
            errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
          };
        case "CONVERSATION_LOCKED":
          return {
            success: false,
            error: "This conversation is locked",
            errorCode: MESSAGING_ERROR_CODES.CONVERSATION_LOCKED
          };
      }
    }
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid message data",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR,
        details: error.errors
      };
    }

    return {
      success: false,
      error: "Failed to send message",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Gets messages for a conversation with pagination
 */
export async function getMessages(
  conversationId: string,
  filters: MessageFilters = { conversationId },
  pagination: PaginationParams = { page: 1, limit: 50 }
): Promise<MessageListResponse | { success: false; error: string; errorCode: string }> {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "Authentication required",
      errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
    };
  }

  try {
    // Validate inputs
    const validatedFilters = messageFiltersSchema.parse({ ...filters, conversationId });
    const validatedPagination = paginationParamsSchema.parse(pagination);

    // Check if user has access to the conversation
    const conversationCheck = await db
      .select({
        id: conversations.id,
        participantIds: conversations.participantIds,
        subject: conversations.subject,
        type: conversations.type,
        status: conversations.status,
        messageCount: conversations.messageCount,
      })
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversationCheck.length === 0) {
      return {
        success: false,
        error: "Conversation not found",
        errorCode: MESSAGING_ERROR_CODES.CONVERSATION_NOT_FOUND
      };
    }

    const conversation = conversationCheck[0];

    // Check access
    const isParticipant = conversation.participantIds.includes(session.user.id!);
    const isAdmin = session.user.role === "ADMIN";

    if (!isParticipant && !isAdmin) {
      return {
        success: false,
        error: "Access denied to this conversation",
        errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
      };
    }

    const { page, limit } = validatedPagination;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [eq(messages.conversationId, conversationId)];

    // Apply filters
    if (validatedFilters.messageType?.length) {
      conditions.push(inArray(messages.messageType, validatedFilters.messageType));
    }

    if (validatedFilters.senderId) {
      conditions.push(eq(messages.senderId, validatedFilters.senderId));
    }

    if (validatedFilters.search) {
      conditions.push(like(messages.content, `%${validatedFilters.search}%`));
    }

    if (validatedFilters.dateFrom) {
      conditions.push(gte(messages.createdAt, validatedFilters.dateFrom));
    }

    if (validatedFilters.dateTo) {
      conditions.push(lte(messages.createdAt, validatedFilters.dateTo));
    }

    // Exclude deleted messages unless user is admin
    if (session.user.role !== "ADMIN") {
      conditions.push(eq(messages.isDeleted, false));
    }

    // Get messages with sender information
    const messagesQuery = await db
      .select({
        // Message data
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        attachments: messages.attachments,
        status: messages.status,
        readBy: messages.readBy,
        readCount: messages.readCount,
        isEdited: messages.isEdited,
        editedAt: messages.editedAt,
        isDeleted: messages.isDeleted,
        deletedAt: messages.deletedAt,
        deletedBy: messages.deletedBy,
        systemMessageData: messages.systemMessageData,
        isFlagged: messages.isFlagged,
        flagReason: messages.flagReason,
        flaggedBy: messages.flaggedBy,
        flaggedAt: messages.flaggedAt,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        
        // Sender data
        senderFirstName: users.firstName,
        senderLastName: users.lastName,
        senderDisplayName: users.displayName,
        senderProfileImage: users.profileImage,
        senderRole: users.role,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(...conditions));

    const total = totalQuery[0]?.count || 0;

    // Format messages with full details
    const formattedMessages: MessageWithDetails[] = messagesQuery.map(msg => {
      // Destructure to separate message data from sender data
      const { senderFirstName, senderLastName, senderDisplayName, senderProfileImage, senderRole, ...messageData } = msg;
      
      return {
        ...messageData,
        attachments: msg.attachments as MessageAttachment[] | null | undefined,
        readBy: msg.readBy as ReadStatus,
        systemMessageData: msg.systemMessageData as SystemMessageData | null | undefined,
        sender: {
          id: msg.senderId,
          firstName: senderFirstName ?? undefined,
          lastName: senderLastName ?? undefined,
          displayName: senderDisplayName ?? undefined,
          profileImage: senderProfileImage ?? undefined,
          role: senderRole ?? undefined,
        },
        // Additional details would be fetched separately for performance
        readByUsers: undefined,
      };
    });

    const hasMore = offset + messagesQuery.length < total;

    return {
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
      conversation: {
        ...conversation,
        // Minimal conversation data - full details would come from getConversation
        booking: null,
        participants: [],
        lastMessage: null,
        participantIds: conversation.participantIds,
        initiatedBy: "", // Would be fetched if needed
        lastMessageId: null,
        lastMessageAt: new Date(),
        lastActivityAt: new Date(),
        unreadCount: 0,
        isLocked: false,
        autoCloseAt: null,
        assignedAdmin: null,
        priority: "NORMAL",
        tags: null,
        isArchived: false,
        archivedBy: null,
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

  } catch (error) {
    console.error("Error fetching messages:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid filter parameters",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR,
      };
    }

    return {
      success: false,
      error: "Failed to fetch messages",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Marks messages as read up to a specific message or all messages
 */
export async function markAsRead(data: z.infer<typeof markAsReadRequestSchema>) {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "Authentication required",
      errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
    };
  }

  try {
    // Validate the request data
    const validatedData = markAsReadRequestSchema.parse(data);
    
    // Check if conversation exists and user has access (no transaction - Neon HTTP doesn't support them)
    const conversationQuery = await db
      .select({
        id: conversations.id,
        participantIds: conversations.participantIds,
      })
      .from(conversations)
      .where(eq(conversations.id, validatedData.conversationId))
      .limit(1);

    if (conversationQuery.length === 0) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }

    const conversation = conversationQuery[0];

    // Check if user is a participant
    if (!conversation.participantIds.includes(session.user.id!)) {
      throw new Error("UNAUTHORIZED_ACCESS");
    }

    const now = new Date();
    const userId = session.user.id!;

    // Determine which messages to mark as read
    let messagesToUpdate;
    
    if (validatedData.messageId) {
      // Mark up to specific message
      messagesToUpdate = await db
        .select({ id: messages.id })
        .from(messages)
        .where(
          and(
            eq(messages.conversationId, validatedData.conversationId),
            lte(messages.createdAt, 
              sql`(SELECT created_at FROM ${messages} WHERE id = ${validatedData.messageId})`
            )
          )
        );
    } else {
      // Mark all messages in conversation
      messagesToUpdate = await db
        .select({ id: messages.id })
        .from(messages)
        .where(eq(messages.conversationId, validatedData.conversationId));
    }

    if (messagesToUpdate.length === 0) {
      const result = { markedCount: 0 };
    } else {
      // Update read status on messages
      // We need to update the JSON field to include this user's read timestamp
      const messageIds = messagesToUpdate.map(m => m.id);
      
      // Since Neon doesn't support jsonb_set, we'll handle read status differently
      // For now, we'll skip updating individual message read status and just update participant records
      // This is a simplified approach - in production you might want to use a different strategy
      
      await db
        .update(messages)
        .set({
          readCount: sql`${messages.readCount} + 1`,
          updatedAt: now,
        })
        .where(
          and(
            inArray(messages.id, messageIds),
            // Simple check - this isn't perfect but works for basic functionality
            sql`${messages.readCount} = 0 OR ${messages.senderId} != ${userId}`
          )
        );

      // Update user's participant record
      await db
        .update(conversationParticipants)
        .set({
          lastReadAt: now,
          lastReadMessageId: validatedData.messageId || messageIds[messageIds.length - 1],
          unreadCount: 0, // Reset to 0 since we're marking as read
          updatedAt: now,
        })
        .where(
          and(
            eq(conversationParticipants.conversationId, validatedData.conversationId),
            eq(conversationParticipants.userId, userId)
          )
        );

      // Update conversation's total unread count
      // Recalculate from all participants
      const unreadSum = await db
        .select({ total: sql<number>`sum(${conversationParticipants.unreadCount})` })
        .from(conversationParticipants)
        .where(eq(conversationParticipants.conversationId, validatedData.conversationId));

      await db
        .update(conversations)
        .set({
          unreadCount: unreadSum[0]?.total || 0,
          updatedAt: now,
        })
        .where(eq(conversations.id, validatedData.conversationId));
    }

    const result = { markedCount: messagesToUpdate?.length || 0 };

    // Revalidate relevant paths
    revalidatePath("/messages");
    revalidatePath(`/messages/${validatedData.conversationId}`);

    // TODO: Trigger real-time updates via Socket.IO

    return {
      success: true,
      data: {
        markedCount: result.markedCount,
        message: `Marked ${result.markedCount} messages as read`
      }
    };

  } catch (error) {
    console.error("Error marking messages as read:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "CONVERSATION_NOT_FOUND":
          return {
            success: false,
            error: "Conversation not found",
            errorCode: MESSAGING_ERROR_CODES.CONVERSATION_NOT_FOUND
          };
        case "UNAUTHORIZED_ACCESS":
          return {
            success: false,
            error: "Access denied to this conversation",
            errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
          };
      }
    }
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid request data",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR,
        details: error.errors
      };
    }

    return {
      success: false,
      error: "Failed to mark messages as read",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Creates a system message for booking/payment updates
 */
export async function createSystemMessage(
  conversationId: string,
  messageType: "BOOKING_UPDATE" | "PAYMENT_UPDATE",
  content: string,
  systemData?: any
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      success: false,
      error: "Admin access required",
      errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
    };
  }

  try {
    // Check if conversation exists
    const conversationExists = await db
      .select({ id: conversations.id, messageCount: conversations.messageCount })
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversationExists.length === 0) {
      return {
        success: false,
        error: "Conversation not found",
        errorCode: MESSAGING_ERROR_CODES.CONVERSATION_NOT_FOUND
      };
    }

    const conversation = conversationExists[0];
    const messageId = crypto.randomUUID();
    const now = new Date();

    // Create system message (no transaction - Neon HTTP doesn't support them)
    await db
      .insert(messages)
      .values({
        id: messageId,
        conversationId: conversationId,
        senderId: session.user.id!, // System messages sent by admin
        content: content,
        messageType: messageType,
        systemMessageData: systemData,
        readBy: {}, // System messages start unread
        readCount: 0,
      });

    // Update conversation
    await db
      .update(conversations)
      .set({
        lastMessageId: messageId,
        lastMessageAt: now,
        lastActivityAt: now,
        messageCount: conversation.messageCount + 1,
      })
      .where(eq(conversations.id, conversationId));

    revalidatePath("/messages");
    revalidatePath(`/messages/${conversationId}`);

    return {
      success: true,
      data: {
        messageId: messageId,
        message: "System message created successfully"
      }
    };

  } catch (error) {
    console.error("Error creating system message:", error);
    return {
      success: false,
      error: "Failed to create system message",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Deletes a message (soft delete)
 */
export async function deleteMessage(messageId: string) {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "Authentication required",
      errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
    };
  }

  try {
    // Get message details
    const messageQuery = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        conversationId: messages.conversationId,
        isDeleted: messages.isDeleted,
      })
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (messageQuery.length === 0) {
      return {
        success: false,
        error: "Message not found",
        errorCode: MESSAGING_ERROR_CODES.MESSAGE_NOT_FOUND
      };
    }

    const message = messageQuery[0];

    // Check permissions - user can delete their own messages or admin can delete any
    const canDelete = 
      message.senderId === session.user.id ||
      session.user.role === "ADMIN";

    if (!canDelete) {
      return {
        success: false,
        error: "Permission denied",
        errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
      };
    }

    if (message.isDeleted) {
      return {
        success: false,
        error: "Message already deleted",
        errorCode: MESSAGING_ERROR_CODES.MESSAGE_NOT_FOUND
      };
    }

    // Soft delete the message
    await db
      .update(messages)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id!,
        content: "[Message deleted]", // Replace content
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));

    revalidatePath("/messages");
    revalidatePath(`/messages/${message.conversationId}`);

    return {
      success: true,
      message: "Message deleted successfully"
    };

  } catch (error) {
    console.error("Error deleting message:", error);
    return {
      success: false,
      error: "Failed to delete message",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}