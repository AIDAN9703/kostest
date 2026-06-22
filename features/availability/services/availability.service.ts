import { db } from "@/database/db";
import { bookings, boatBlocking, boatExternalCalendarEvents } from "@/database/schema";
import { eq, and, or, lte, gte, ne, inArray } from "drizzle-orm";

export interface AvailabilityResult {
  isAvailable: boolean;
  conflicts: Array<{
    type: "booking" | "blocking" | "external" | "validation";
    id: string;
    startTime: Date;
    endTime: Date;
    reason: string;
  }>;
}

export interface CalendarDay {
  date: Date;
  status: "available" | "booked" | "blocked" | "partial";
  conflictCount: number;
}

export class AvailabilityService {
  /**
   * Get calendar availability for a month
   */
  async getMonthAvailability(boatId: string, month: Date): Promise<CalendarDay[]> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Get today's date (start of day) for filtering past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all conflicts for the month
    const conflicts = await this.getConflicts(boatId, startOfMonth, endOfMonth);

    // Generate calendar days
    const days: CalendarDay[] = [];
    const currentDate = new Date(startOfMonth);

    while (currentDate <= endOfMonth) {
      // Skip past dates entirely - don't process or return them
      if (currentDate < today) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const dayConflicts = conflicts.filter((conflict) => {
        const conflictStart = new Date(conflict.startTime);
        const conflictEnd = new Date(conflict.endTime);
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        return (
          (conflictStart <= dayEnd && conflictEnd >= dayStart) ||
          (dayStart <= conflictEnd && dayEnd >= conflictStart)
        );
      });

      let status: CalendarDay["status"] = "available";
      if (dayConflicts.length > 0) {
        const hasFullDayConflict = dayConflicts.some((conflict) => {
          const conflictStart = new Date(conflict.startTime);
          const conflictEnd = new Date(conflict.endTime);
          const dayStart = new Date(currentDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(currentDate);
          dayEnd.setHours(23, 59, 59, 999);

          return conflictStart <= dayStart && conflictEnd >= dayEnd;
        });

        status = hasFullDayConflict ? "booked" : "partial";
      }

      days.push({
        date: new Date(currentDate),
        status,
        conflictCount: dayConflicts.length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  /**
   * Check if a specific time slot is available
   */
  async checkTimeSlotAvailability(
    boatId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<AvailabilityResult> {
    // Validate input parameters
    if (!startTime || !endTime || startTime >= endTime) {
      return {
        isAvailable: false,
        conflicts: [
          {
            type: "validation",
            id: "invalid-time-range",
            startTime,
            endTime,
            reason: "Invalid time range provided",
          },
        ],
      };
    }

    // Check for conflicts
    const conflicts = await this.getConflicts(boatId, startTime, endTime, excludeBookingId);

    return {
      isAvailable: conflicts.length === 0,
      conflicts,
    };
  }

  /**
   * Get all conflicts for a time period
   */
  private async getConflicts(
    boatId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ) {
    // Get blocking bookings
    const blockingBookings = await db
      .select({
        id: bookings.id,
        startDateTime: bookings.startDateTime,
        endDateTime: bookings.endDateTime,
        customerName: bookings.customerName,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.boatId, boatId),
          inArray(bookings.bookingStatus, ["CONFIRMED", "APPROVED"]),
          excludeBookingId ? ne(bookings.id, excludeBookingId) : undefined,
          or(
            and(lte(bookings.startDateTime, startTime), gte(bookings.endDateTime, startTime)),
            and(lte(bookings.startDateTime, endTime), gte(bookings.endDateTime, endTime)),
            and(gte(bookings.startDateTime, startTime), lte(bookings.endDateTime, endTime))
          )
        )
      );

    // Get blocking periods
    const blockingPeriods = await db
      .select()
      .from(boatBlocking)
      .where(
        and(
          eq(boatBlocking.boatId, boatId),
          or(
            and(lte(boatBlocking.startTime, startTime), gte(boatBlocking.endTime, startTime)),
            and(lte(boatBlocking.startTime, endTime), gte(boatBlocking.endTime, endTime)),
            and(gte(boatBlocking.startTime, startTime), lte(boatBlocking.endTime, endTime))
          )
        )
      );

    // Get imported external (iCal) calendar events — owner's Google Calendar etc.
    const externalEvents = await db
      .select()
      .from(boatExternalCalendarEvents)
      .where(
        and(
          eq(boatExternalCalendarEvents.boatId, boatId),
          or(
            and(
              lte(boatExternalCalendarEvents.startTime, startTime),
              gte(boatExternalCalendarEvents.endTime, startTime)
            ),
            and(
              lte(boatExternalCalendarEvents.startTime, endTime),
              gte(boatExternalCalendarEvents.endTime, endTime)
            ),
            and(
              gte(boatExternalCalendarEvents.startTime, startTime),
              lte(boatExternalCalendarEvents.endTime, endTime)
            )
          )
        )
      );

    return [
      ...blockingBookings
        .filter((b) => b.endDateTime) // Filter out null endDateTime
        .map((b) => ({
          type: "booking" as const,
          id: b.id,
          startTime: b.startDateTime,
          endTime: b.endDateTime!,
          reason: `Booked by ${b.customerName}`,
        })),
      ...blockingPeriods.map((b) => ({
        type: "blocking" as const,
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        reason: b.reason || `${b.blockingType}`,
      })),
      ...externalEvents.map((e) => ({
        type: "external" as const,
        id: e.id,
        startTime: e.startTime,
        endTime: e.endTime,
        reason: e.summary || "External calendar",
      })),
    ];
  }
}
