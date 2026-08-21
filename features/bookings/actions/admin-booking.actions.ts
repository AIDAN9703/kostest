"use server";

/**
 * Admin Booking Actions
 * Server actions for admin to manage bookings
 */
import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/shared/lib/utils/auth-utils";

import { bookingService } from "@/features/bookings/services/booking.service";
import { bookingCrewService } from "@/features/bookings/services/booking-crew.service";
import { bookingStatusService } from "@/features/bookings/services/booking-status.service";

/** Assign admin to booking, or pass null to unassign */
export async function assignAdminToBooking(bookingId: string, adminId: string | null) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };
    if (!bookingId) {
      return { success: false, error: "Booking ID is required" };
    }

    await bookingService.assignAdmin(bookingId, adminId, authResult.session!.user.id!);
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin"); // dashboard queue shows unassigned leads

    return {
      success: true,
      message: adminId == null ? "Admin unassigned" : "Admin assigned successfully",
    };
  } catch (error) {
    console.error("Error assigning admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign admin",
    };
  }
}

/** Add a crew member to `booking_crew` (must have active crew profile). */
export async function addBookingCrewMember(
  bookingId: string,
  crewUserId: string,
  role?: string | null
) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };
    if (!bookingId || !crewUserId) {
      return { success: false, error: "Booking and crew user are required" };
    }

    await bookingCrewService.addMember(
      bookingId,
      crewUserId,
      authResult.session!.user.id!,
      role ?? null
    );

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, message: "Crew member added" };
  } catch (error) {
    console.error("Error adding booking crew:", error);
    const msg = error instanceof Error ? error.message : "Failed to add crew";
    if (/unique|duplicate/i.test(msg)) {
      return { success: false, error: "That crew member is already on this booking." };
    }
    return { success: false, error: msg };
  }
}

/** Remove a `booking_crew` row */
export async function removeBookingCrewMember(bookingId: string, bookingCrewId: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };
    if (!bookingId || !bookingCrewId) {
      return { success: false, error: "Booking and crew assignment are required" };
    }

    await bookingCrewService.removeMember(
      bookingCrewId,
      bookingId,
      authResult.session!.user.id!
    );

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, message: "Crew member removed" };
  } catch (error) {
    console.error("Error removing booking crew:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove crew",
    };
  }
}

/** Assign captain (`bookings.captain_user_id`), or pass null to unassign */
export async function assignCaptainToBooking(bookingId: string, captainUserId: string | null) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };
    if (!bookingId) {
      return { success: false, error: "Booking ID is required" };
    }

    await bookingService.assignCaptain(bookingId, captainUserId, authResult.session!.user.id!);
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return {
      success: true,
      message: captainUserId == null ? "Captain unassigned" : "Captain assigned successfully",
    };
  } catch (error) {
    console.error("Error assigning captain:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to assign captain",
    };
  }
}

/** Mark booking as contacted (creates admin note) */
/** Mark a payment-confirmed booking as completed (charter happened). */
export async function markBookingCompleted(bookingId: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };

    await bookingStatusService.complete(bookingId, authResult.session!.user.id);

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, message: "Booking marked as completed" };
  } catch (error) {
    console.error("Error completing booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete booking",
    };
  }
}

/** Cancel a booking with a reason (any active status). */
export async function cancelBooking(bookingId: string, reason: string) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false, error: authResult.error };

    const trimmed = reason?.trim();
    if (!trimmed) return { success: false, error: "A cancellation reason is required" };

    await bookingStatusService.cancel(bookingId, trimmed, authResult.session!.user.id);

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, message: "Booking cancelled" };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel booking",
    };
  }
}

/**
 * Apply the edited boat's start/end deltas to every OTHER boat in its
 * charter party — start and end move independently, so an end-time-only
 * change (longer/shorter trip) propagates just like a date move, and any
 * deliberate stagger between boats stays intact. Runs through applyBookingSingleFieldUpdate so every sibling
 * gets the same availability re-check and timeline event a manual edit
 * would. Sequential and non-transactional (neon-http) — a mid-party failure
 * reports which boat stopped it, with earlier boats already moved.
 */
export async function shiftCharterPartyWindows(
  bookingId: string,
  deltaStartMs: number,
  deltaEndMs: number
) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error !== undefined) return { success: false, error: authResult.error };
    const adminId = authResult.session.user.id;

    if (!Number.isFinite(deltaStartMs)) deltaStartMs = 0;
    if (!Number.isFinite(deltaEndMs)) deltaEndMs = 0;
    if (deltaStartMs === 0 && deltaEndMs === 0) {
      return { success: true, moved: 0 };
    }

    const party = await bookingService.getChargeableParty(bookingId);
    const siblings = (party ?? []).filter(
      (m) =>
        m.booking.id !== bookingId &&
        m.booking.bookingStatus !== "CANCELLED" &&
        m.booking.startDateTime != null &&
        m.booking.endDateTime != null
    );

    let moved = 0;
    for (const m of siblings) {
      const start = new Date(new Date(m.booking.startDateTime as Date).getTime() + deltaStartMs);
      const end = new Date(new Date(m.booking.endDateTime as Date).getTime() + deltaEndMs);
      try {
        await bookingService.applyBookingSingleFieldUpdate(
          m.booking.id,
          {
            field: "tripWindow",
            value: { startDateTime: start.toISOString(), endDateTime: end.toISOString() },
          },
          adminId
        );
        moved += 1;
      } catch (error) {
        console.error("Party shift failed on sibling:", m.booking.id, error);
        const name = m.boat?.name ?? "one of the boats";
        return {
          success: false,
          moved,
          error: `${name} couldn't move (likely a calendar conflict). ${moved} of ${siblings.length} other boats were moved — fix ${name} on its own page.`,
        };
      }
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    return { success: true, moved };
  } catch (error) {
    console.error("Error shifting charter party:", error);
    return { success: false, moved: 0, error: "Failed to move the rest of the party" };
  }
}
