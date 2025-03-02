import { db } from "@/database/db";
import { bookingRequests } from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { bookingRequestSchema } from "@/lib/validations";
import { ActionResponse } from "@/types/types";
import { cachedFetch } from "@/lib/utils";
import type { z } from "zod";

export type CreateBookingRequestInput = z.infer<typeof bookingRequestSchema> & {
  boatId: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  depositAmount?: number;
  currency?: string;
};

export async function createBookingRequest(data: CreateBookingRequestInput): Promise<ActionResponse<typeof bookingRequests.$inferSelect>> {
  "use server";
  
  try {
    const [newBooking] = await db.insert(bookingRequests).values({
      boatId: data.boatId,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      isMultiDay: data.isMultiDay,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      startTime: data.startTime,
      endTime: data.endTime,
      numberOfHours: data.numberOfHours,
      numberOfPassengers: data.numberOfPassengers,
      specialRequests: data.specialRequests,
      needsCaptain: data.needsCaptain,
      totalAmount: data.totalAmount,
      depositAmount: data.depositAmount,
      status: "PENDING",
      currency: data.currency || "USD",
    }).returning();

    revalidatePath("/dashboard");
    return { success: true, data: newBooking };
  } catch (error) {
    console.error("Error creating booking request:", error);
    return { success: false, error: "Failed to create booking request" };
  }
}

export async function getBookingRequest(id: string): Promise<ActionResponse<typeof bookingRequests.$inferSelect>> {
  "use server";
  
  return cachedFetch(
    `booking-${id}`,
    async () => {
      try {
        const booking = await db
          .select()
          .from(bookingRequests)
          .where(eq(bookingRequests.id, id))
          .limit(1)
          .then(res => res[0]);

        if (!booking) {
          return { success: false, error: "Booking request not found" };
        }

        return { success: true, data: booking };
      } catch (error) {
        console.error("Error fetching booking request:", error);
        return { success: false, error: "Failed to fetch booking request" };
      }
    },
    {
      revalidate: 60, // Cache for 1 minute since bookings change frequently
      tags: ['bookings', `booking-${id}`]
    }
  );
}

export async function updateBookingRequestStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "AWAITING" | "CONFIRMED" | "DENIED" | "EXPIRED" | "CANCELLED",
  reviewNotes?: string
): Promise<ActionResponse<typeof bookingRequests.$inferSelect>> {
  "use server";
  
  try {
    const [updatedBooking] = await db
      .update(bookingRequests)
      .set({
        status,
        reviewNotes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookingRequests.id, id))
      .returning();

    revalidatePath("/dashboard");
    return { success: true, data: updatedBooking };
  } catch (error) {
    console.error("Error updating booking request status:", error);
    return { success: false, error: "Failed to update booking request status" };
  }
}

export async function getUserBookingRequests(userId: string): Promise<ActionResponse<Array<typeof bookingRequests.$inferSelect>>> {
  "use server";
  
  return cachedFetch(
    `user-bookings-${userId}`,
    async () => {
      try {
        const bookings = await db
          .select()
          .from(bookingRequests)
          .where(eq(bookingRequests.userId, userId))
          .orderBy(desc(bookingRequests.createdAt));

        return { success: true, data: bookings };
      } catch (error) {
        console.error("Error fetching user booking requests:", error);
        return { success: false, error: "Failed to fetch booking requests" };
      }
    },
    {
      revalidate: 60,
      tags: ['bookings', `user-bookings-${userId}`]
    }
  );
}

export async function getBoatBookingRequests(boatId: string): Promise<ActionResponse<Array<typeof bookingRequests.$inferSelect>>> {
  "use server";
  
  return cachedFetch(
    `boat-bookings-${boatId}`,
    async () => {
      try {
        const bookings = await db
          .select()
          .from(bookingRequests)
          .where(eq(bookingRequests.boatId, boatId))
          .orderBy(desc(bookingRequests.createdAt));

        return { success: true, data: bookings };
      } catch (error) {
        console.error("Error fetching boat booking requests:", error);
        return { success: false, error: "Failed to fetch booking requests" };
      }
    },
    {
      revalidate: 60,
      tags: ['bookings', `boat-bookings-${boatId}`]
    }
  );
}

export async function updateBookingRequestPaymentInfo(
  id: string,
  paymentInfo: {
    stripePaymentLinkId?: string;
    stripePaymentLinkUrl?: string;
    stripePaymentLinkExpiresAt?: Date;
    stripePaymentIntentId?: string;
  }
): Promise<ActionResponse<typeof bookingRequests.$inferSelect>> {
  "use server";
  
  try {
    const [updatedBooking] = await db
      .update(bookingRequests)
      .set({
        ...paymentInfo,
        updatedAt: new Date(),
      })
      .where(eq(bookingRequests.id, id))
      .returning();

    revalidatePath("/dashboard");
    return { success: true, data: updatedBooking };
  } catch (error) {
    console.error("Error updating booking request payment info:", error);
    return { success: false, error: "Failed to update payment information" };
  }
} 