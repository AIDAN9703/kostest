/**
 * Single-field admin booking updates: validation + row patch + audit snapshot.
 * Keeps booking.service thin — apply logic lives here in one place.
 */

import * as z from "zod";
import { toDateOrNull } from "@/shared/lib/utils/date-helpers";
import type { BookingDetails } from "@/features/bookings/booking.types";

export const bookingSingleFieldUpdateSchema = z.discriminatedUnion("field", [
  z.object({
    field: z.literal("customerName"),
    value: z.string().min(1, "Customer name is required"),
  }),
  z.object({
    field: z.literal("customerEmail"),
    value: z.string().email("Invalid email"),
  }),
  z.object({
    field: z.literal("customerPhone"),
    value: z.string().min(1, "Phone is required"),
  }),
  z.object({
    field: z.literal("numberOfPassengers"),
    value: z.number().int().min(1, "At least one passenger"),
  }),
  z.object({
    field: z.literal("needsCaptain"),
    value: z.boolean(),
  }),
  z.object({
    field: z.literal("pickupLocation"),
    value: z.union([z.string(), z.null()]),
  }),
  z.object({
    field: z.literal("dropoffLocation"),
    value: z.union([z.string(), z.null()]),
  }),
  z.object({
    field: z.literal("startDateTime"),
    value: z.string().datetime({ offset: true }),
  }),
  z.object({
    field: z.literal("endDateTime"),
    value: z.union([z.string().datetime({ offset: true }), z.null()]),
  }),
  z.object({
    field: z.literal("boatId"),
    value: z.string().uuid("Invalid boat"),
  }),
]);

export type BookingSingleFieldUpdate = z.infer<typeof bookingSingleFieldUpdateSchema>;

export type BookingSingleEditableField = BookingSingleFieldUpdate["field"];

/** Drizzle `.set()` payload for `booking` table columns only (no updatedAt). */
export function bookingRowPatchFromSingleFieldUpdate(
  update: BookingSingleFieldUpdate
): Record<string, unknown> {
  if (update.field === "boatId") {
    throw new Error("boatId is handled in BookingService.applyBoatIdChange");
  }
  switch (update.field) {
    case "customerName":
      return { customerName: update.value };
    case "customerEmail":
      return { customerEmail: update.value };
    case "customerPhone":
      return { customerPhone: update.value.trim() };
    case "numberOfPassengers":
      return { numberOfPassengers: update.value };
    case "needsCaptain":
      return { needsCaptain: update.value };
    case "pickupLocation": {
      const v =
        typeof update.value === "string" ? update.value.trim() || null : update.value;
      return { pickupLocation: v };
    }
    case "dropoffLocation": {
      const v =
        typeof update.value === "string" ? update.value.trim() || null : update.value;
      return { dropoffLocation: v };
    }
    case "startDateTime": {
      const d = toDateOrNull(update.value);
      if (!d) throw new Error("Invalid start date/time");
      return { startDateTime: d };
    }
    case "endDateTime":
      return {
        endDateTime: update.value === null ? null : toDateOrNull(update.value),
      };
  }
}

export function auditSnapshotForBookingField(
  field: BookingSingleEditableField,
  booking: BookingDetails
): unknown {
  switch (field) {
    case "customerName":
      return booking.customerName;
    case "customerEmail":
      return booking.customerEmail;
    case "customerPhone":
      return booking.customerPhone;
    case "numberOfPassengers":
      return booking.numberOfPassengers;
    case "needsCaptain":
      return booking.needsCaptain ?? false;
    case "pickupLocation":
      return booking.pickupLocation;
    case "dropoffLocation":
      return booking.dropoffLocation;
    case "startDateTime":
      return booking.startDateTime instanceof Date
        ? booking.startDateTime.toISOString()
        : String(booking.startDateTime);
    case "endDateTime":
      return booking.endDateTime == null
        ? null
        : booking.endDateTime instanceof Date
          ? booking.endDateTime.toISOString()
          : String(booking.endDateTime);
    case "boatId":
      return {
        boatId: booking.boatId,
        boatName: booking.boatName ?? null,
      };
  }
}
