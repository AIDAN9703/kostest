/**
 * Booking Group Service
 * Manages grouping of related bookings (e.g., same party, multiple boats)
 */

import { db } from "@/database/db";
import { bookingGroups, bookings } from "@/database/schema";
import { eq, desc } from "drizzle-orm";

export interface CreateBookingGroupInput {
  name?: string | null;
  notes?: string | null;
  createdById?: string | null;
}

export interface BookingGroupWithBookings {
  id: string;
  name: string | null;
  notes: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  bookingIds: string[];
}

export const bookingGroupService = {
  async create(input: CreateBookingGroupInput) {
    const [group] = await db
      .insert(bookingGroups)
      .values({
        name: input.name ?? null,
        notes: input.notes ?? null,
        createdById: input.createdById ?? null,
      })
      .returning();
    return group;
  },

  async getById(id: string) {
    const [group] = await db
      .select()
      .from(bookingGroups)
      .where(eq(bookingGroups.id, id))
      .limit(1);
    return group ?? null;
  },

  async getWithBookings(id: string): Promise<BookingGroupWithBookings | null> {
    const group = await this.getById(id);
    if (!group) return null;

    const groupBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.bookingGroupId, id))
      .orderBy(bookings.startDateTime);

    return {
      ...group,
      bookingIds: groupBookings.map((b) => b.id),
    };
  },

  async getBookingsByGroupId(groupId: string) {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.bookingGroupId, groupId))
      .orderBy(bookings.startDateTime);
  },

  async update(id: string, updates: Partial<CreateBookingGroupInput>) {
    const [updated] = await db
      .update(bookingGroups)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(bookingGroups.id, id))
      .returning();
    return updated ?? null;
  },
};
