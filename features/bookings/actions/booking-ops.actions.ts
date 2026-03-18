"use server";

import { auth } from "@/auth";
import { bookingOpsService } from "@/features/bookings/services/booking-ops.service";
import type { BookingOpsInput } from "@/features/bookings/services/booking-ops.service";
import { revalidatePath } from "next/cache";

export async function updateBookingOps(bookingId: string, input: BookingOpsInput) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return { success: false, error: "Admin access required" };
    }

    await bookingOpsService.upsert(bookingId, input);

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/all");

    return { success: true };
  } catch (error) {
    console.error("Failed to update booking ops:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update",
    };
  }
}
