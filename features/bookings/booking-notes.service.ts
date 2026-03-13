/**
 * Booking notes & contact logging — stored as booking_event (append-only).
 * booking_admin_note retained for reads until fully deprecated.
 */

import { db } from "@/database/db";
import { bookingAdminNotes, bookingEvents, users } from "@/database/schema";
import { eq, and, desc } from "drizzle-orm";
import type { BookingAdminNote, AdminNoteType } from "@/database/types";
import { bookingEventsService } from "@/features/bookings/booking-events.service";
import { BOOKING_EVENT_TYPES } from "@/features/bookings/booking-events.constants";

export interface CreateNoteInput {
  bookingId: string;
  adminUserId: string;
  noteType?: AdminNoteType;
  content: string;
}

export interface NoteWithAdmin extends BookingAdminNote {
  adminFirstName: string | null;
  adminLastName: string | null;
  adminEmail: string | null;
}

export class BookingNotesService {
  async addNote(input: CreateNoteInput): Promise<void> {
    await bookingEventsService.logNote({
      bookingId: input.bookingId,
      actorId: input.adminUserId,
      content: input.content,
      noteType: input.noteType ?? "GENERAL",
    });
  }

  async getNotesForBooking(bookingId: string): Promise<BookingAdminNote[]> {
    return db
      .select()
      .from(bookingAdminNotes)
      .where(eq(bookingAdminNotes.bookingId, bookingId))
      .orderBy(desc(bookingAdminNotes.createdAt));
  }

  async getNotesWithAdminInfo(bookingId: string): Promise<NoteWithAdmin[]> {
    const notes = await db
      .select({
        id: bookingAdminNotes.id,
        bookingId: bookingAdminNotes.bookingId,
        adminUserId: bookingAdminNotes.adminUserId,
        noteType: bookingAdminNotes.noteType,
        content: bookingAdminNotes.content,
        createdAt: bookingAdminNotes.createdAt,
        adminFirstName: users.firstName,
        adminLastName: users.lastName,
        adminEmail: users.email,
      })
      .from(bookingAdminNotes)
      .leftJoin(users, eq(bookingAdminNotes.adminUserId, users.id))
      .where(eq(bookingAdminNotes.bookingId, bookingId))
      .orderBy(desc(bookingAdminNotes.createdAt));

    return notes.map((note) => ({
      id: note.id,
      bookingId: note.bookingId,
      adminUserId: note.adminUserId,
      noteType: note.noteType,
      content: note.content,
      createdAt: note.createdAt,
      adminFirstName: note.adminFirstName,
      adminLastName: note.adminLastName,
      adminEmail: note.adminEmail,
    }));
  }

  async getNoteById(noteId: string): Promise<BookingAdminNote | null> {
    const [note] = await db
      .select()
      .from(bookingAdminNotes)
      .where(eq(bookingAdminNotes.id, noteId))
      .limit(1);

    return note ?? null;
  }

  async deleteNote(noteId: string): Promise<void> {
    await db.delete(bookingAdminNotes).where(eq(bookingAdminNotes.id, noteId));
  }

  async markAsContacted(
    bookingId: string,
    adminUserId: string,
    details?: string
  ): Promise<void> {
    await bookingEventsService.logContact({
      bookingId,
      actorId: adminUserId,
      contactMethod: "OTHER",
      content: details ?? "Customer contacted",
    });
  }

  async addFollowUp(
    bookingId: string,
    adminUserId: string,
    content: string
  ): Promise<void> {
    await bookingEventsService.logNote({
      bookingId,
      actorId: adminUserId,
      content,
      noteType: "FOLLOW_UP",
    });
  }

  async addIssue(
    bookingId: string,
    adminUserId: string,
    content: string
  ): Promise<void> {
    await bookingEventsService.logNote({
      bookingId,
      actorId: adminUserId,
      content,
      noteType: "ISSUE",
    });
  }

  /** True if any contact event or legacy CONTACTED admin note */
  async hasBeenContacted(bookingId: string): Promise<boolean> {
    const [ev] = await db
      .select({ id: bookingEvents.id })
      .from(bookingEvents)
      .where(
        and(
          eq(bookingEvents.bookingId, bookingId),
          eq(bookingEvents.eventType, BOOKING_EVENT_TYPES.CONTACT_LOGGED)
        )
      )
      .limit(1);
    if (ev) return true;
    const [note] = await db
      .select()
      .from(bookingAdminNotes)
      .where(
        and(
          eq(bookingAdminNotes.bookingId, bookingId),
          eq(bookingAdminNotes.noteType, "CONTACTED")
        )
      )
      .limit(1);
    return !!note;
  }

  async getFirstContactedDate(bookingId: string): Promise<Date | null> {
    const [fromEvents] = await db
      .select({ createdAt: bookingEvents.createdAt })
      .from(bookingEvents)
      .where(
        and(
          eq(bookingEvents.bookingId, bookingId),
          eq(bookingEvents.eventType, BOOKING_EVENT_TYPES.CONTACT_LOGGED)
        )
      )
      .orderBy(bookingEvents.createdAt)
      .limit(1);
    const [fromNotes] = await db
      .select({ createdAt: bookingAdminNotes.createdAt })
      .from(bookingAdminNotes)
      .where(
        and(
          eq(bookingAdminNotes.bookingId, bookingId),
          eq(bookingAdminNotes.noteType, "CONTACTED")
        )
      )
      .orderBy(bookingAdminNotes.createdAt)
      .limit(1);
    const a = fromEvents?.createdAt?.getTime() ?? Infinity;
    const b = fromNotes?.createdAt?.getTime() ?? Infinity;
    const min = Math.min(a, b);
    if (min === Infinity) return null;
    return new Date(min);
  }
}

export const bookingNotesService = new BookingNotesService();
