"use server";

import { db } from "@/database/db";
import { conversations, conversationParticipants, bookings, boats, users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { createSystemMessage } from "@/features/messaging/actions/messages";

/**
 * Creates a conversation automatically when a booking is created
 * This should be called from your booking creation actions
 */
export async function createBookingConversation(bookingId: string) {
  try {
    // Get booking details with related data
    const bookingQuery = await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        boatId: bookings.boatId,
        customerName: bookings.customerName,
        customerEmail: bookings.customerEmail,
        startDate: bookings.startDate,
        bookingType: bookings.bookingType,
        
        // Boat details
        boatName: boats.name,
        ownerId: boats.ownerId,
        
        // Owner details
        ownerFirstName: users.firstName,
        ownerLastName: users.lastName,
      })
      .from(bookings)
      .leftJoin(boats, eq(bookings.boatId, boats.id))
      .leftJoin(users, eq(boats.ownerId, users.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingQuery.length === 0) {
      throw new Error("Booking not found");
    }

    const booking = bookingQuery[0];

    // Determine participants
    const participants: string[] = [];
    
    // Add boat owner
    if (booking.ownerId) {
      participants.push(booking.ownerId);
    }
    
    // Add customer (if they have a user account)
    if (booking.userId) {
      participants.push(booking.userId);
    }

    // Add all admin users for oversight
    const adminUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "ADMIN"));
    
    adminUsers.forEach(admin => {
      if (!participants.includes(admin.id)) {
        participants.push(admin.id);
      }
    });

    if (participants.length === 0) {
      // If no participants found, just return - this shouldn't normally happen
      console.warn(`No participants found for booking conversation: ${bookingId}`);
      return null;
    }

    // Create conversation
    const conversationId = crypto.randomUUID();
    const now = new Date();
    
    const ownerName = booking.ownerFirstName && booking.ownerLastName 
      ? `${booking.ownerFirstName} ${booking.ownerLastName}`.trim()
      : "Boat Owner";

    // Create conversation record (no transaction - Neon HTTP driver doesn't support them)
    await db
      .insert(conversations)
      .values({
        id: conversationId,
        type: "BOOKING",
        bookingId: bookingId,
        initiatedBy: participants[0], // First participant (usually owner or admin)
        participantIds: participants,
        subject: `Booking: ${booking.boatName} - ${booking.customerName}`,
        priority: "NORMAL",
      });

    // Create participant records
    const participantRecords = participants.map(userId => ({
      conversationId: conversationId,
      userId: userId,
      role: userId === booking.ownerId ? "MODERATOR" : 
            (adminUsers.some(admin => admin.id === userId) ? "ADMIN" : "PARTICIPANT"),
      status: "ACTIVE",
      joinedAt: now,
      updatedAt: now,
    }));

    await db
      .insert(conversationParticipants)
      .values(participantRecords);

    // Create initial system message about booking creation
    const systemMessageContent = `New ${booking.bookingType.toLowerCase().replace('_', ' ')} booking created for ${booking.boatName}.\n\nCustomer: ${booking.customerName}\nStart Date: ${booking.startDate.toLocaleDateString()}\n\nUse this conversation to communicate about the booking details.`;
    
    await createSystemMessage(
      conversationId,
      "BOOKING_UPDATE",
      systemMessageContent,
      {
        bookingId: bookingId,
        newStatus: "CREATED",
        updatedBy: "SYSTEM",
        bookingType: booking.bookingType
      }
    );

    return {
      conversationId: conversationId,
      participantCount: participants.length
    };

  } catch (error) {
    console.error("Error creating booking conversation:", error);
    // Don't throw error - booking creation shouldn't fail because of messaging
    return null;
  }
}

/**
 * Updates conversation when booking status changes
 */
export async function updateBookingConversationStatus(
  bookingId: string,
  previousStatus: string,
  newStatus: string,
  updatedBy?: string
) {
  try {
    // Find conversation for this booking
    const conversationQuery = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.bookingId, bookingId))
      .limit(1);

    if (conversationQuery.length === 0) {
      // No conversation exists for this booking
      return;
    }

    const conversation = conversationQuery[0];

    // Create system message about status change
    const statusMessages: Record<string, string> = {
      PENDING: "Booking is pending approval",
      APPROVED: "Booking has been approved! 🎉",
      AWAITING_PAYMENT: "Booking approved - awaiting payment",
      CONFIRMED: "Booking confirmed! Payment received ✅",
      DENIED: "Booking request was declined",
      EXPIRED: "Booking request has expired",
      CANCELLED: "Booking has been cancelled",
      COMPLETED: "Booking completed! Thanks for choosing us 🚢",
      REFUNDED: "Booking has been refunded"
    };

    const statusMessage = statusMessages[newStatus] || `Booking status updated to ${newStatus}`;

    await createSystemMessage(
      conversation.id,
      "BOOKING_UPDATE",
      statusMessage,
      {
        bookingId: bookingId,
        previousStatus: previousStatus,
        newStatus: newStatus,
        updatedBy: updatedBy || "SYSTEM"
      }
    );

    // Auto-close conversation if booking is completed, cancelled, or refunded
    if (["COMPLETED", "CANCELLED", "REFUNDED"].includes(newStatus)) {
      const autoCloseDate = new Date();
      autoCloseDate.setDate(autoCloseDate.getDate() + 7); // Auto-close in 7 days

      await db
        .update(conversations)
        .set({
          autoCloseAt: autoCloseDate,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversation.id));
    }

    // Send notification about status change
    if (process.env.NODE_ENV === 'production') {
      import("@/features/messaging/services/notifications").then(({ sendBookingUpdateNotification }) => {
        sendBookingUpdateNotification(
          conversation.id,
          bookingId,
          previousStatus,
          newStatus,
          updatedBy
        ).catch(console.error);
      });
    }

  } catch (error) {
    console.error("Error updating booking conversation status:", error);
    // Don't throw error - status updates shouldn't fail because of messaging
  }
}

/**
 * Creates a system message when payment is processed
 */
export async function updateBookingConversationPayment(
  bookingId: string,
  paymentStatus: string,
  amount?: number,
  currency?: string,
  paymentMethod?: string
) {
  try {
    // Find conversation for this booking
    const conversationQuery = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.bookingId, bookingId))
      .limit(1);

    if (conversationQuery.length === 0) {
      return;
    }

    const conversation = conversationQuery[0];

    // Create payment update message
    const paymentMessages: Record<string, string> = {
      PAID: amount && currency 
        ? `Payment received: ${currency} ${amount} ✅`
        : "Payment received ✅",
      FAILED: "Payment failed - please try again",
      REFUNDED: amount && currency
        ? `Refund processed: ${currency} ${amount}`
        : "Refund has been processed",
      CHARGEBACK: "Payment chargeback initiated"
    };

    const paymentMessage = paymentMessages[paymentStatus] || `Payment status: ${paymentStatus}`;

    await createSystemMessage(
      conversation.id,
      "PAYMENT_UPDATE",
      paymentMessage,
      {
        bookingId: bookingId,
        paymentStatus: paymentStatus,
        amount: amount,
        currency: currency,
        paymentMethod: paymentMethod
      }
    );

  } catch (error) {
    console.error("Error updating booking conversation payment:", error);
  }
}

/**
 * Gets the conversation ID for a booking (if it exists)
 */
export async function getBookingConversationId(bookingId: string): Promise<string | null> {
  try {
    const conversationQuery = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.bookingId, bookingId))
      .limit(1);

    return conversationQuery.length > 0 ? conversationQuery[0].id : null;
  } catch (error) {
    console.error("Error getting booking conversation ID:", error);
    return null;
  }
}

/**
 * Helper function to redirect users to their booking conversation
 * This can be used in your booking flow to redirect users after booking
 */
export async function getBookingConversationRedirectUrl(bookingId: string): Promise<string | null> {
  const conversationId = await getBookingConversationId(bookingId);
  return conversationId ? `/messages/${conversationId}` : null;
}