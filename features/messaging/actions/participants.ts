"use server";

import { db } from "@/database/db";
import { 
  conversations, 
  conversationParticipants, 
  users 
} from "@/database/schema";
import { auth } from "@/auth";
import { 
  updateParticipantRequestSchema
} from "@/shared/validation/messaging";
import { 
  MESSAGING_ERROR_CODES
} from "@/shared/types/messaging.types";

// Define simple schemas inline since they're not exported from the validation file
const addParticipantRequestSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["PARTICIPANT", "MODERATOR", "ADMIN"]).default("PARTICIPANT"),
});

const removeParticipantRequestSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
});
import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

/**
 * Adds a participant to a conversation
 */
export async function addParticipant(data: z.infer<typeof addParticipantRequestSchema>) {
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
    const validatedData = addParticipantRequestSchema.parse(data);
    
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Check if conversation exists and user has permission to add participants
      const conversationQuery = await tx
        .select({
          id: conversations.id,
          participantIds: conversations.participantIds,
          isLocked: conversations.isLocked,
        })
        .from(conversations)
        .where(eq(conversations.id, validatedData.conversationId))
        .limit(1);

      if (conversationQuery.length === 0) {
        throw new Error("CONVERSATION_NOT_FOUND");
      }

      const conversation = conversationQuery[0];

      // Check permissions - user must be a participant or admin
      const isParticipant = conversation.participantIds.includes(session.user.id!);
      const isAdmin = session.user.role === "ADMIN";

      if (!isParticipant && !isAdmin) {
        throw new Error("UNAUTHORIZED_ACCESS");
      }

      // Check if conversation is locked (admins can still add)
      if (conversation.isLocked && !isAdmin) {
        throw new Error("CONVERSATION_LOCKED");
      }

      // Check if user to be added exists
      const userToAdd = await tx
        .select({ 
          id: users.id, 
          firstName: users.firstName, 
          lastName: users.lastName 
        })
        .from(users)
        .where(eq(users.id, validatedData.userId))
        .limit(1);

      if (userToAdd.length === 0) {
        throw new Error("USER_NOT_FOUND");
      }

      // Check if user is already a participant
      const existingParticipant = await tx
        .select({ id: conversationParticipants.id })
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, validatedData.conversationId),
            eq(conversationParticipants.userId, validatedData.userId)
          )
        )
        .limit(1);

      if (existingParticipant.length > 0) {
        throw new Error("ALREADY_PARTICIPANT");
      }

      const now = new Date();

      // Add participant record
      await tx
        .insert(conversationParticipants)
        .values({
          conversationId: validatedData.conversationId,
          userId: validatedData.userId,
          role: validatedData.role || "PARTICIPANT",
          status: "ACTIVE",
          joinedAt: now,
          updatedAt: now,
        });

      // Update conversation participants array
      const updatedParticipantIds = [...conversation.participantIds, validatedData.userId];
      
      await tx
        .update(conversations)
        .set({
          participantIds: updatedParticipantIds,
          updatedAt: now,
        })
        .where(eq(conversations.id, validatedData.conversationId));

      return {
        participantId: validatedData.userId,
        userName: `${userToAdd[0].firstName} ${userToAdd[0].lastName}`.trim()
      };
    });

    // Revalidate relevant paths
    revalidatePath("/messages");
    revalidatePath(`/messages/${validatedData.conversationId}`);
    revalidatePath("/admin/messages");

    // TODO: Send notification to added participant
    // TODO: Trigger real-time updates via Socket.IO

    return {
      success: true,
      data: {
        message: `${result.userName} added to conversation successfully`,
        participantId: result.participantId
      }
    };

  } catch (error) {
    console.error("Error adding participant:", error);

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
            error: "Permission denied",
            errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
          };
        case "CONVERSATION_LOCKED":
          return {
            success: false,
            error: "Conversation is locked",
            errorCode: MESSAGING_ERROR_CODES.CONVERSATION_LOCKED
          };
        case "USER_NOT_FOUND":
          return {
            success: false,
            error: "User not found",
            errorCode: MESSAGING_ERROR_CODES.PARTICIPANT_NOT_FOUND
          };
        case "ALREADY_PARTICIPANT":
          return {
            success: false,
            error: "User is already a participant",
            errorCode: MESSAGING_ERROR_CODES.PARTICIPANT_NOT_FOUND
          };
      }
    }
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid participant data",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR,
        details: error.errors
      };
    }

    return {
      success: false,
      error: "Failed to add participant",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Removes a participant from a conversation
 */
export async function removeParticipant(data: z.infer<typeof removeParticipantRequestSchema>) {
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
    const validatedData = removeParticipantRequestSchema.parse(data);
    
    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Check if conversation exists and user has permission
      const conversationQuery = await tx
        .select({
          id: conversations.id,
          participantIds: conversations.participantIds,
          isLocked: conversations.isLocked,
        })
        .from(conversations)
        .where(eq(conversations.id, validatedData.conversationId))
        .limit(1);

      if (conversationQuery.length === 0) {
        throw new Error("CONVERSATION_NOT_FOUND");
      }

      const conversation = conversationQuery[0];

      // Check permissions
      const isParticipant = conversation.participantIds.includes(session.user.id!);
      const isAdmin = session.user.role === "ADMIN";
      const isRemovingSelf = validatedData.userId === session.user.id;

      // Users can remove themselves, moderators/admins can remove others
      if (!isRemovingSelf && !isAdmin && !isParticipant) {
        throw new Error("UNAUTHORIZED_ACCESS");
      }

      // Get participant details
      const participantQuery = await tx
        .select({
          id: conversationParticipants.id,
          role: conversationParticipants.role,
        })
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, validatedData.conversationId),
            eq(conversationParticipants.userId, validatedData.userId)
          )
        )
        .limit(1);

      if (participantQuery.length === 0) {
        throw new Error("PARTICIPANT_NOT_FOUND");
      }

      const participant = participantQuery[0];

      // Prevent removing the last participant
      if (conversation.participantIds.length <= 1) {
        throw new Error("CANNOT_REMOVE_LAST_PARTICIPANT");
      }

      // Check if non-admin is trying to remove a moderator/admin
      if (!isAdmin && participant.role !== "PARTICIPANT" && !isRemovingSelf) {
        throw new Error("CANNOT_REMOVE_MODERATOR");
      }

      const now = new Date();

      // Update participant status to LEFT
      await tx
        .update(conversationParticipants)
        .set({
          status: "LEFT",
          leftAt: now,
          updatedAt: now,
        })
        .where(eq(conversationParticipants.id, participant.id));

      // Remove from conversation participants array
      const updatedParticipantIds = conversation.participantIds.filter(id => id !== validatedData.userId);
      
      await tx
        .update(conversations)
        .set({
          participantIds: updatedParticipantIds,
          updatedAt: now,
        })
        .where(eq(conversations.id, validatedData.conversationId));

      // Get user info for response
      const userInfo = await tx
        .select({ 
          firstName: users.firstName, 
          lastName: users.lastName 
        })
        .from(users)
        .where(eq(users.id, validatedData.userId))
        .limit(1);

      return {
        userName: userInfo.length > 0 
          ? `${userInfo[0].firstName} ${userInfo[0].lastName}`.trim()
          : "User"
      };
    });

    // Revalidate relevant paths
    revalidatePath("/messages");
    revalidatePath(`/messages/${validatedData.conversationId}`);
    revalidatePath("/admin/messages");

    // TODO: Create system message about participant leaving
    // TODO: Trigger real-time updates via Socket.IO

    return {
      success: true,
      data: {
        message: `${result.userName} removed from conversation successfully`
      }
    };

  } catch (error) {
    console.error("Error removing participant:", error);

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
            error: "Permission denied",
            errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
          };
        case "PARTICIPANT_NOT_FOUND":
          return {
            success: false,
            error: "Participant not found",
            errorCode: MESSAGING_ERROR_CODES.PARTICIPANT_NOT_FOUND
          };
        case "CANNOT_REMOVE_LAST_PARTICIPANT":
          return {
            success: false,
            error: "Cannot remove the last participant from conversation",
            errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
          };
        case "CANNOT_REMOVE_MODERATOR":
          return {
            success: false,
            error: "Cannot remove moderators without admin privileges",
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
      error: "Failed to remove participant",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Updates participant settings (mute, archive, notifications, etc.)
 */
export async function updateParticipantSettings(
  conversationId: string,
  data: z.infer<typeof updateParticipantRequestSchema>
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
    // Validate the request data
    const validatedData = updateParticipantRequestSchema.parse(data);
    
    // Check if participant record exists for current user
    const participantQuery = await db
      .select({
        id: conversationParticipants.id,
        conversationId: conversationParticipants.conversationId,
      })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, session.user.id!)
        )
      )
      .limit(1);

    if (participantQuery.length === 0) {
      return {
        success: false,
        error: "Participant record not found",
        errorCode: MESSAGING_ERROR_CODES.PARTICIPANT_NOT_FOUND
      };
    }

    const participant = participantQuery[0];

    // Update participant settings
    await db
      .update(conversationParticipants)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(conversationParticipants.id, participant.id));

    // Revalidate relevant paths
    revalidatePath("/messages");
    revalidatePath(`/messages/${conversationId}`);

    return {
      success: true,
      message: "Participant settings updated successfully"
    };

  } catch (error) {
    console.error("Error updating participant settings:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid settings data",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR,
        details: error.errors
      };
    }

    return {
      success: false,
      error: "Failed to update participant settings",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Gets all participants for a conversation with their details
 */
export async function getConversationParticipants(conversationId: string) {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: "Authentication required",
      errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
    };
  }

  try {
    // Check if user has access to this conversation
    const conversationCheck = await db
      .select({
        id: conversations.id,
        participantIds: conversations.participantIds,
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

    // Get participants with user details
    const participantsQuery = await db
      .select({
        id: conversationParticipants.id,
        userId: conversationParticipants.userId,
        role: conversationParticipants.role,
        status: conversationParticipants.status,
        isArchived: conversationParticipants.isArchived,
        isMuted: conversationParticipants.isMuted,
        customName: conversationParticipants.customName,
        lastReadAt: conversationParticipants.lastReadAt,
        lastReadMessageId: conversationParticipants.lastReadMessageId,
        unreadCount: conversationParticipants.unreadCount,
        notificationsEnabled: conversationParticipants.notificationsEnabled,
        emailNotifications: conversationParticipants.emailNotifications,
        smsNotifications: conversationParticipants.smsNotifications,
        joinedAt: conversationParticipants.joinedAt,
        leftAt: conversationParticipants.leftAt,
        updatedAt: conversationParticipants.updatedAt,
        
        // User details
        firstName: users.firstName,
        lastName: users.lastName,
        displayName: users.displayName,
        profileImage: users.profileImage,
        email: users.email,
        userRole: users.role,
      })
      .from(conversationParticipants)
      .leftJoin(users, eq(conversationParticipants.userId, users.id))
      .where(eq(conversationParticipants.conversationId, conversationId));

    return {
      success: true,
      data: {
        participants: participantsQuery.map(p => ({
          id: p.id,
          userId: p.userId,
          role: p.role,
          status: p.status,
          isArchived: p.isArchived,
          isMuted: p.isMuted,
          customName: p.customName,
          lastReadAt: p.lastReadAt,
          lastReadMessageId: p.lastReadMessageId,
          unreadCount: p.unreadCount,
          notificationsEnabled: p.notificationsEnabled,
          emailNotifications: p.emailNotifications,
          smsNotifications: p.smsNotifications,
          joinedAt: p.joinedAt,
          leftAt: p.leftAt,
          updatedAt: p.updatedAt,
          user: {
            id: p.userId,
            firstName: p.firstName,
            lastName: p.lastName,
            displayName: p.displayName,
            profileImage: p.profileImage,
            email: p.email,
            role: p.userRole,
          }
        }))
      }
    };

  } catch (error) {
    console.error("Error fetching conversation participants:", error);
    return {
      success: false,
      error: "Failed to fetch participants",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}

/**
 * Promotes a participant to moderator (admin only)
 */
export async function promoteParticipant(conversationId: string, userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      success: false,
      error: "Admin access required",
      errorCode: MESSAGING_ERROR_CODES.UNAUTHORIZED_ACCESS
    };
  }

  try {
    // Check if participant exists
    const participantQuery = await db
      .select({ id: conversationParticipants.id, role: conversationParticipants.role })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);

    if (participantQuery.length === 0) {
      return {
        success: false,
        error: "Participant not found",
        errorCode: MESSAGING_ERROR_CODES.PARTICIPANT_NOT_FOUND
      };
    }

    const participant = participantQuery[0];

    if (participant.role === "MODERATOR") {
      return {
        success: false,
        error: "User is already a moderator",
        errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
      };
    }

    // Promote to moderator
    await db
      .update(conversationParticipants)
      .set({
        role: "MODERATOR",
        updatedAt: new Date(),
      })
      .where(eq(conversationParticipants.id, participant.id));

    revalidatePath("/admin/messages");
    revalidatePath(`/messages/${conversationId}`);

    return {
      success: true,
      message: "Participant promoted to moderator successfully"
    };

  } catch (error) {
    console.error("Error promoting participant:", error);
    return {
      success: false,
      error: "Failed to promote participant",
      errorCode: MESSAGING_ERROR_CODES.SYSTEM_ERROR
    };
  }
}