"use server";

import { db } from "@/database/db";
import { 
  conversations, 
  messages,
  conversationParticipants, 
  users, 
  bookings,
  boats
} from "@/database/schema";
import { auth } from "@/auth";
import { 
  createConversationRequestSchema,
  updateConversationRequestSchema,
  conversationFiltersSchema,
  paginationParamsSchema,
  adminUpdateConversationRequestSchema
} from "@/shared/validation/messaging";
import { 
  CreateConversationRequest, 
  ConversationWithDetails,
  ConversationFilters,
  PaginationParams,
  ConversationListResponse,
  MESSAGING_ERROR_CODES
} from "@/shared/types/messaging.types";
import { revalidatePath } from "next/cache";
import { eq, and, or, desc, sql, inArray, like, gte, lte } from "drizzle-orm";
import { z } from "zod";

/**
 * Creates a new conversation with participants
 */
export async function createConversation(data: CreateConversationRequest) {
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
    const validatedData = createConversationRequestSchema.parse(data);
    
    // Verify user is authorized to create this conversation
    if (!validatedData.participantIds.includes(session.user.id!)) {
      validatedData.participantIds.push(session.user.id!);
    }

    // If it's a booking conversation, verify the user has access to the booking
    if (validatedData.bookingId) {
      const booking = await db
        .select({
          id: bookings.id,
          userId: bookings.userId,
          boatId: bookings.boatId,
          customerName: bookings.customerName
        })
        .from(bookings)
        .leftJoin(boats, eq(bookings.boatId, boats.id))
        .where(eq(bookings.id, validatedData.bookingId))
        .limit(1);

      if (booking.length === 0) {
        return {
          success: false,
          error: "Booking not found",
          errorCode: MESSAGING_ERROR_CODES.CONVERSATION_NOT_FOUND
        };
      }

      const bookingData = booking[0];
      
      // Check if user is involved in this booking
      const userRole = session.user.role;
      const isAuthorized = 
        userRole === "ADMIN" || 
        bookingData.userId === session.user.id ||
        validatedData.participantIds.includes(session.user.id!);

      if (!isAuthorized) {
        return {
          success: false,
          error: "Not authorized to create conversation for this booking",
          errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
        };
      }

      // Auto-generate subject if not provided
      if (!validatedData.subject) {
        validatedData.subject = `Booking: ${bookingData.customerName}`;
      }
    }

    const conversationId = crypto.randomUUID();
    
    // Create conversation (no transaction - Neon HTTP doesn't support them)
    const [newConversation] = await db
      .insert(conversations)
      .values({
        id: conversationId,
        type: validatedData.type,
        bookingId: validatedData.bookingId,
        initiatedBy: session.user.id!,
        participantIds: validatedData.participantIds,
        subject: validatedData.subject,
        priority: "NORMAL",
      })
      .returning();

    // Create participant records
    const participantRecords = validatedData.participantIds.map(userId => ({
      conversationId: conversationId,
      userId: userId,
      role: userId === session.user.id ? "MODERATOR" : "PARTICIPANT",
      status: "ACTIVE"
    }));

    await db
      .insert(conversationParticipants)
      .values(participantRecords);

    // Create initial message if provided
    if (validatedData.initialMessage) {
      const messageId = crypto.randomUUID();
      
      await db
        .insert(messages)
        .values({
          id: messageId,
          conversationId: conversationId,
          senderId: session.user.id!,
          content: validatedData.initialMessage,
          messageType: "TEXT",
        });

      // Update conversation with last message info
      await db
        .update(conversations)
        .set({
          lastMessageId: messageId,
          messageCount: 1,
          lastMessageAt: new Date(),
          lastActivityAt: new Date(),
        })
        .where(eq(conversations.id, conversationId));
    }

    const result = newConversation;

    revalidatePath("/messages");
    
    return {
      success: true,
      data: {
        conversationId: result.id,
        message: "Conversation created successfully"
      }
    };

  } catch (error) {
    console.error("Error creating conversation:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid conversation data",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR,
        details: error.errors
      };
    }

    return {
      success: false,
      error: "Failed to create conversation",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Gets conversations for the current user with filtering and pagination
 */
export async function getConversations(
  filters: ConversationFilters = {},
  pagination: PaginationParams = { page: 1, limit: 20 }
): Promise<ConversationListResponse | { success: false; error: string; errorCode: string }> {
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
    const validatedFilters = conversationFiltersSchema.parse(filters);
    const validatedPagination = paginationParamsSchema.parse(pagination);

    const { page, limit } = validatedPagination;
    const offset = (page - 1) * limit;

    // Build base query conditions
    const conditions = [];
    
    // User must be a participant (unless admin viewing all)
    if (session.user.role !== "ADMIN" || validatedFilters.participantId === session.user.id) {
      conditions.push(sql`${session.user.id} = ANY(${conversations.participantIds})`);
    }

    // Apply filters
    if (validatedFilters.status?.length) {
      conditions.push(inArray(conversations.status, validatedFilters.status));
    }
    
    if (validatedFilters.type?.length) {
      conditions.push(inArray(conversations.type, validatedFilters.type));
    }
    
    if (validatedFilters.bookingId) {
      conditions.push(eq(conversations.bookingId, validatedFilters.bookingId));
    }
    
    if (validatedFilters.search) {
      conditions.push(
        or(
          like(conversations.subject, `%${validatedFilters.search}%`),
          // We'll add message content search in a more complex query later
        )
      );
    }

    if (validatedFilters.dateFrom) {
      conditions.push(gte(conversations.createdAt, validatedFilters.dateFrom));
    }

    if (validatedFilters.dateTo) {
      conditions.push(lte(conversations.createdAt, validatedFilters.dateTo));
    }

    // Get conversations with related data
    const conversationsQuery = db
      .select({
        // Conversation data
        id: conversations.id,
        type: conversations.type,
        status: conversations.status,
        bookingId: conversations.bookingId,
        initiatedBy: conversations.initiatedBy,
        participantIds: conversations.participantIds,
        subject: conversations.subject,
        lastMessageId: conversations.lastMessageId,
        lastMessageAt: conversations.lastMessageAt,
        lastActivityAt: conversations.lastActivityAt,
        messageCount: conversations.messageCount,
        unreadCount: conversations.unreadCount,
        isLocked: conversations.isLocked,
        autoCloseAt: conversations.autoCloseAt,
        assignedAdmin: conversations.assignedAdmin,
        priority: conversations.priority,
        tags: conversations.tags,
        isArchived: conversations.isArchived,
        archivedBy: conversations.archivedBy,
        archivedAt: conversations.archivedAt,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        
        // Booking data (if exists)
        bookingCustomerName: bookings.customerName,
        bookingStartDate: bookings.startDateTime,
        bookingStatus: bookings.bookingStatus,
        boatName: boats.name,
      })
      .from(conversations)
      .leftJoin(bookings, eq(conversations.bookingId, bookings.id))
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .where(and(...conditions))
      .orderBy(desc(conversations.lastActivityAt))
      .limit(limit)
      .offset(offset);

    const conversationResults = await conversationsQuery;

    // Get total count for pagination
    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(conversations)
      .where(and(...conditions));

    const [{ count: total }] = await totalQuery;

    // Get current user's unread count
    const unreadQuery = db
      .select({ totalUnread: sql<number>`sum(${conversationParticipants.unreadCount})` })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, session.user.id!));

    const [{ totalUnread }] = await unreadQuery;

    // Format response
    const formattedConversations: ConversationWithDetails[] = conversationResults.map(conv => ({
      ...conv,
      priority: conv.priority as "HIGH" | "NORMAL" | "LOW",
      booking: conv.bookingId ? {
        id: conv.bookingId,
        boatId: conv.bookingId, // This would need to be fetched properly
        boatName: conv.boatName ?? undefined,
        customerName: conv.bookingCustomerName ?? "Unknown Customer",
        startDateTime: conv.bookingStartDate ?? new Date(),
        bookingStatus: conv.bookingStatus ?? "PENDING",
      } : null,
      participants: [], // These would be fetched separately for performance
      lastMessage: null, // This would be fetched separately for performance
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      conversations: formattedConversations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      totalUnread: totalUnread || 0,
    };

  } catch (error) {
    console.error("Error fetching conversations:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid filter parameters",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR,
      };
    }

    return {
      success: false,
      error: "Failed to fetch conversations",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Gets a single conversation with full details
 */
export async function getConversation(conversationId: string): Promise<
  { success: true; data: ConversationWithDetails } | 
  { success: false; error: string; errorCode: string }
> {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "Authentication required",
      errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
    };
  }

  try {
    // Validate UUID format
    if (!conversationId || !conversationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      return {
        success: false,
        error: "Invalid conversation ID",
        errorCode: MESSAGING_ERROR_CODES.CONVERSATION_NOT_FOUND
      };
    }

    // Get conversation with related data
    const conversationQuery = await db
      .select({
        // Conversation data
        id: conversations.id,
        type: conversations.type,
        status: conversations.status,
        bookingId: conversations.bookingId,
        initiatedBy: conversations.initiatedBy,
        participantIds: conversations.participantIds,
        subject: conversations.subject,
        lastMessageId: conversations.lastMessageId,
        lastMessageAt: conversations.lastMessageAt,
        lastActivityAt: conversations.lastActivityAt,
        messageCount: conversations.messageCount,
        unreadCount: conversations.unreadCount,
        isLocked: conversations.isLocked,
        autoCloseAt: conversations.autoCloseAt,
        assignedAdmin: conversations.assignedAdmin,
        priority: conversations.priority,
        tags: conversations.tags,
        isArchived: conversations.isArchived,
        archivedBy: conversations.archivedBy,
        archivedAt: conversations.archivedAt,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
        
        // Booking data (if exists)
        bookingCustomerName: bookings.customerName,
        bookingStartDate: bookings.startDateTime,
        bookingStatus: bookings.bookingStatus,
        boatName: boats.name,
      })
      .from(conversations)
      .leftJoin(bookings, eq(conversations.bookingId, bookings.id))
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversationQuery.length === 0) {
      return {
        success: false,
        error: "Conversation not found",
        errorCode: MESSAGING_ERROR_CODES.CONVERSATION_NOT_FOUND
      };
    }

    const conversation = conversationQuery[0];

    // Check if user has access to this conversation
    const isParticipant = conversation.participantIds.includes(session.user.id!);
    const isAdmin = session.user.role === "ADMIN";
    
    if (!isParticipant && !isAdmin) {
      return {
        success: false,
        error: "Access denied to this conversation",
        errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
      };
    }

    // Get participants with user details
    const participantsQuery = await db
      .select({
        id: conversationParticipants.id,
        userId: conversationParticipants.userId,
        role: conversationParticipants.role,
        status: conversationParticipants.status,
        lastReadAt: conversationParticipants.lastReadAt,
        unreadCount: conversationParticipants.unreadCount,
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName,
        profileImage: users.profileImage,
      })
      .from(conversationParticipants)
      .leftJoin(users, eq(conversationParticipants.userId, users.id))
      .where(eq(conversationParticipants.conversationId, conversationId));

    // Get current user's participant data
    const currentUserParticipant = participantsQuery.find(p => p.userId === session.user.id);

    const formattedConversation: ConversationWithDetails = {
      ...conversation,
      priority: conversation.priority as "HIGH" | "NORMAL" | "LOW",
      booking: conversation.bookingId ? {
        id: conversation.bookingId,
        boatId: conversation.bookingId, // This would need proper fetching
        boatName: conversation.boatName ?? undefined,
        customerName: conversation.bookingCustomerName ?? "Unknown Customer",
        startDateTime: conversation.bookingStartDate ?? new Date(),
        bookingStatus: conversation.bookingStatus ?? "PENDING",
      } : null,
      participants: participantsQuery.map(p => ({
        id: p.id,
        userId: p.userId,
        firstName: p.firstName ?? undefined,
        lastName: p.lastName ?? undefined,
        displayName: p.displayName ?? undefined,
        profileImage: p.profileImage ?? undefined,
        role: p.role as "ADMIN" | "MODERATOR" | "PARTICIPANT",
        status: p.status as "ACTIVE" | "LEFT" | "REMOVED" | "MUTED",
        lastReadAt: p.lastReadAt,
        unreadCount: p.unreadCount,
      })),
      lastMessage: null, // Would be fetched separately
      currentUserParticipant: currentUserParticipant ? {
        role: currentUserParticipant.role as any,
        unreadCount: currentUserParticipant.unreadCount,
        lastReadAt: currentUserParticipant.lastReadAt,
        isArchived: false, // Would need proper fetching
        isMuted: false, // Would need proper fetching
        notificationsEnabled: true, // Would need proper fetching
      } : undefined,
    };

    return {
      success: true,
      data: formattedConversation
    };

  } catch (error) {
    console.error("Error fetching conversation:", error);
    return {
      success: false,
      error: "Failed to fetch conversation",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Updates a conversation (for participants)
 */
export async function updateConversation(
  conversationId: string,
  data: z.infer<typeof updateConversationRequestSchema>
) {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "Authentication required",
      errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
    };
  }

  try {
    // Validate input
    const validatedData = updateConversationRequestSchema.parse(data);

    // Check if conversation exists and user has access
    const conversationCheck = await db
      .select({
        id: conversations.id,
        participantIds: conversations.participantIds,
        isLocked: conversations.isLocked,
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

    // Check permissions
    const isParticipant = conversation.participantIds.includes(session.user.id!);
    const isAdmin = session.user.role === "ADMIN";

    if (!isParticipant && !isAdmin) {
      return {
        success: false,
        error: "Access denied",
        errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
      };
    }

    // Update conversation
    await db
      .update(conversations)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    revalidatePath("/messages");
    revalidatePath(`/messages/${conversationId}`);

    return {
      success: true,
      message: "Conversation updated successfully"
    };

  } catch (error) {
    console.error("Error updating conversation:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid update data",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR,
        details: error.errors
      };
    }

    return {
      success: false,
      error: "Failed to update conversation",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Admin-only conversation update with additional permissions
 */
export async function adminUpdateConversation(
  conversationId: string,
  data: z.infer<typeof adminUpdateConversationRequestSchema>
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
    // Validate input
    const validatedData = adminUpdateConversationRequestSchema.parse(data);

    // Check if conversation exists
    const conversationExists = await db
      .select({ id: conversations.id })
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

    // Update conversation with admin privileges
    await db
      .update(conversations)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    revalidatePath("/admin/messages");
    revalidatePath(`/messages/${conversationId}`);

    return {
      success: true,
      message: "Conversation updated successfully"
    };

  } catch (error) {
    console.error("Error updating conversation (admin):", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid update data",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR,
        details: error.errors
      };
    }

    return {
      success: false,
      error: "Failed to update conversation",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}