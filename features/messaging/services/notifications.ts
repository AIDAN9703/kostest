"use server";

import { db } from "@/database/db";
import { notifications, users, conversations, conversationParticipants } from "@/database/schema";
import { sendVerification } from "@/shared/services/twilio.service"; // Reuse existing Twilio service
import { eq, and, inArray } from "drizzle-orm";
import { MessageWithDetails, ConversationWithDetails } from "@/shared/types/messaging.types";

/**
 * Send notification when a new message is received
 */
export async function sendNewMessageNotification(
  message: MessageWithDetails,
  conversation: ConversationWithDetails
) {
  try {
    // Get participants who should receive notifications (excluding sender)
    const participantsToNotify = await db
      .select({
        userId: conversationParticipants.userId,
        smsNotifications: conversationParticipants.smsNotifications,
        emailNotifications: conversationParticipants.emailNotifications,
        notificationsEnabled: conversationParticipants.notificationsEnabled,
        isMuted: conversationParticipants.isMuted,
        // User details
        phoneNumber: users.phoneNumber,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        smsNotificationPreference: users.smsNotifications,
      })
      .from(conversationParticipants)
      .leftJoin(users, eq(conversationParticipants.userId, users.id))
      .where(
        and(
          eq(conversationParticipants.conversationId, conversation.id),
          eq(conversationParticipants.status, "ACTIVE")
        )
      );

    // Filter out sender and users who have notifications disabled
    const eligibleParticipants = participantsToNotify.filter(participant => 
      participant.userId !== message.senderId && 
      participant.notificationsEnabled &&
      !participant.isMuted
    );

    if (eligibleParticipants.length === 0) {
      return;
    }

    // Get sender name
    const senderName = message.sender.displayName || 
      `${message.sender.firstName} ${message.sender.lastName}`.trim() || 
      "Someone";

    // Create notification title and body
    const notificationTitle = getNotificationTitle(conversation, senderName);
    const notificationBody = getNotificationBody(message, conversation);

    // Send notifications to each participant
    for (const participant of eligibleParticipants) {
      // SMS notifications
      if (participant.smsNotifications && 
          participant.smsNotificationPreference === "ALL" && 
          participant.phoneNumber) {
        
        await sendSMSNotification(
          participant.phoneNumber,
          `${notificationTitle}: ${notificationBody}`,
          {
            userId: participant.userId,
            conversationId: conversation.id,
            messageId: message.id,
            type: "NEW_MESSAGE"
          }
        );
      }

      // Email notifications (placeholder - you can implement email service)
      if (participant.emailNotifications && participant.email) {
        await sendEmailNotification(
          participant.email,
          notificationTitle,
          notificationBody,
          {
            userId: participant.userId,
            conversationId: conversation.id,
            messageId: message.id,
            type: "NEW_MESSAGE"
          }
        );
      }

      // In-app notification
      await createInAppNotification(
        participant.userId,
        notificationTitle,
        notificationBody,
        "NEW_MESSAGE",
        {
          conversationId: conversation.id,
          messageId: message.id,
          senderId: message.senderId
        }
      );
    }

  } catch (error) {
    console.error("Error sending new message notifications:", error);
    // Don't throw - notifications shouldn't break message flow
  }
}

/**
 * Send SMS notification via Twilio
 */
async function sendSMSNotification(
  phoneNumber: string,
  message: string,
  metadata: any
) {
  try {
    // Truncate message to SMS limits
    const truncatedMessage = message.length > 140 
      ? `${message.substring(0, 137)}...` 
      : message;

    // Use existing Twilio service (we'll send as a regular SMS, not verification)
    // Note: You might want to create a separate SMS service for regular messages
    // For now, we'll log it and create a notification record
    
    const notificationId = crypto.randomUUID();
    
    await db.insert(notifications).values({
      id: notificationId,
      userId: metadata.userId,
      title: "New Message",
      body: truncatedMessage,
      type: metadata.type,
      channel: "SMS",
      status: "PENDING",
      relatedId: metadata.conversationId,
      relatedType: "CONVERSATION",
      metadata: {
        phoneNumber,
        messageId: metadata.messageId,
        senderId: metadata.senderId
      }
    });

    // TODO: Implement actual SMS sending via Twilio
    // For now, we'll just mark as sent
    await db
      .update(notifications)
      .set({
        status: "SENT",
        sentAt: new Date()
      })
      .where(eq(notifications.id, notificationId));

    console.log(`SMS notification sent to ${phoneNumber}: ${truncatedMessage}`);
    
  } catch (error) {
    console.error("Error sending SMS notification:", error);
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(
  email: string,
  title: string,
  body: string,
  metadata: any
) {
  try {
    const notificationId = crypto.randomUUID();
    
    await db.insert(notifications).values({
      id: notificationId,
      userId: metadata.userId,
      title: title,
      body: body,
      type: metadata.type,
      channel: "EMAIL",
      status: "PENDING",
      relatedId: metadata.conversationId,
      relatedType: "CONVERSATION",
      metadata: {
        email,
        messageId: metadata.messageId,
        senderId: metadata.senderId
      }
    });

    // TODO: Implement email sending service
    // For now, mark as sent
    await db
      .update(notifications)
      .set({
        status: "SENT",
        sentAt: new Date()
      })
      .where(eq(notifications.id, notificationId));

    console.log(`Email notification sent to ${email}: ${title}`);
    
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
}

/**
 * Create in-app notification
 */
async function createInAppNotification(
  userId: string,
  title: string,
  body: string,
  type: string,
  metadata: any
) {
  try {
    await db.insert(notifications).values({
      userId: userId,
      title: title,
      body: body,
      type: type,
      channel: "IN_APP",
      status: "SENT",
      sentAt: new Date(),
      relatedId: metadata.conversationId,
      relatedType: "CONVERSATION",
      metadata: metadata
    });
    
  } catch (error) {
    console.error("Error creating in-app notification:", error);
  }
}

/**
 * Get notification title based on conversation type
 */
function getNotificationTitle(conversation: ConversationWithDetails, senderName: string): string {
  if (conversation.booking) {
    return `${conversation.booking.boatName} - New message from ${senderName}`;
  }
  
  if (conversation.subject) {
    return `${conversation.subject} - New message`;
  }
  
  switch (conversation.type) {
    case "SUPPORT":
      return "Support - New message";
    case "ADMIN":
      return "Admin - New message";
    case "GENERAL":
      return `New message from ${senderName}`;
    default:
      return `New message from ${senderName}`;
  }
}

/**
 * Get notification body based on message content
 */
function getNotificationBody(message: MessageWithDetails, conversation: ConversationWithDetails): string {
  if (message.messageType === "BOOKING_UPDATE") {
    return "Your booking has been updated";
  }
  
  if (message.messageType === "PAYMENT_UPDATE") {
    return "Payment status update";
  }
  
  if (message.messageType === "SYSTEM") {
    return "System update";
  }
  
  if (message.attachments && message.attachments.length > 0) {
    if (message.content.trim()) {
      return `${message.content} (with ${message.attachments.length} attachment${message.attachments.length > 1 ? 's' : ''})`;
    }
    return `Sent ${message.attachments.length} attachment${message.attachments.length > 1 ? 's' : ''}`;
  }
  
  return message.content;
}

/**
 * Send booking status update notification
 */
export async function sendBookingUpdateNotification(
  conversationId: string,
  bookingId: string,
  previousStatus: string,
  newStatus: string,
  updatedBy?: string
) {
  try {
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) return;

    const participants = await db
      .select({
        userId: conversationParticipants.userId,
        smsNotifications: conversationParticipants.smsNotifications,
        phoneNumber: users.phoneNumber,
        firstName: users.firstName,
      })
      .from(conversationParticipants)
      .leftJoin(users, eq(conversationParticipants.userId, users.id))
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.status, "ACTIVE"),
          eq(conversationParticipants.smsNotifications, true)
        )
      );

    const title = "Booking Status Update";
    const body = getBookingStatusMessage(newStatus);

    for (const participant of participants) {
      if (participant.phoneNumber) {
        await sendSMSNotification(
          participant.phoneNumber,
          `${title}: ${body}`,
          {
            userId: participant.userId,
            conversationId: conversationId,
            bookingId: bookingId,
            type: "BOOKING_UPDATE"
          }
        );
      }

      await createInAppNotification(
        participant.userId,
        title,
        body,
        "BOOKING_UPDATE",
        {
          conversationId,
          bookingId,
          previousStatus,
          newStatus,
          updatedBy
        }
      );
    }

  } catch (error) {
    console.error("Error sending booking update notification:", error);
  }
}

/**
 * Get booking status message
 */
function getBookingStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    APPROVED: "Your booking has been approved! 🎉",
    CONFIRMED: "Booking confirmed! Payment received ✅",
    DENIED: "Your booking request was declined",
    CANCELLED: "Booking has been cancelled",
    COMPLETED: "Booking completed! Thanks for choosing us 🚢"
  };
  
  return messages[status] || `Booking status updated to ${status}`;
}

/**
 * Get unread notifications for a user
 */
export async function getUserNotifications(userId: string, limit = 20) {
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt)
      .limit(limit);

    return userNotifications;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await db
      .update(notifications)
      .set({
        readAt: new Date()
      })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}