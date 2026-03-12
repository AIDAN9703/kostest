/**
 * Booking Notes Service
 * 
 * Business logic layer for admin notes.
 * Uses direct database access (no repository layer).
 */

import { db } from '@/database/db';
import { bookingAdminNotes, users } from '@/database/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { BookingAdminNote, AdminNoteType } from '@/database/types';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class BookingNotesService {
  /**
   * Add a note to a booking
   */
  async addNote(input: CreateNoteInput): Promise<BookingAdminNote> {
    const [note] = await db
      .insert(bookingAdminNotes)
      .values({
        bookingId: input.bookingId,
        adminUserId: input.adminUserId,
        noteType: input.noteType ?? 'GENERAL',
        content: input.content,
      })
      .returning();
    
    return note;
  }

  /**
   * Get all notes for a booking
   */
  async getNotesForBooking(bookingId: string): Promise<BookingAdminNote[]> {
    return db
      .select()
      .from(bookingAdminNotes)
      .where(eq(bookingAdminNotes.bookingId, bookingId))
      .orderBy(desc(bookingAdminNotes.createdAt));
  }

  /**
   * Get all notes for a booking with admin user info
   */
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

    return notes.map(note => ({
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

  /**
   * Get a single note by ID
   */
  async getNoteById(noteId: string): Promise<BookingAdminNote | null> {
    const [note] = await db
      .select()
      .from(bookingAdminNotes)
      .where(eq(bookingAdminNotes.id, noteId))
      .limit(1);
    
    return note ?? null;
  }

  /**
   * Delete a note (admin only, typically the author)
   */
  async deleteNote(noteId: string): Promise<void> {
    await db
      .delete(bookingAdminNotes)
      .where(eq(bookingAdminNotes.id, noteId));
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  /**
   * Add a "contacted" note - when admin contacts the customer
   */
  async markAsContacted(
    bookingId: string,
    adminUserId: string,
    details?: string
  ): Promise<BookingAdminNote> {
    return this.addNote({
      bookingId,
      adminUserId,
      noteType: 'CONTACTED',
      content: details ?? 'Customer contacted',
    });
  }

  /**
   * Add a follow-up note
   */
  async addFollowUp(
    bookingId: string,
    adminUserId: string,
    content: string
  ): Promise<BookingAdminNote> {
    return this.addNote({
      bookingId,
      adminUserId,
      noteType: 'FOLLOW_UP',
      content,
    });
  }

  /**
   * Add an issue note
   */
  async addIssue(
    bookingId: string,
    adminUserId: string,
    content: string
  ): Promise<BookingAdminNote> {
    return this.addNote({
      bookingId,
      adminUserId,
      noteType: 'ISSUE',
      content,
    });
  }

  /**
   * Check if booking has been marked as contacted
   */
  async hasBeenContacted(bookingId: string): Promise<boolean> {
    const [note] = await db
      .select()
      .from(bookingAdminNotes)
      .where(and(
        eq(bookingAdminNotes.bookingId, bookingId),
        eq(bookingAdminNotes.noteType, 'CONTACTED')
      ))
      .limit(1);
    
    return !!note;
  }

  /**
   * Get the first contacted date for a booking
   */
  async getFirstContactedDate(bookingId: string): Promise<Date | null> {
    const [note] = await db
      .select()
      .from(bookingAdminNotes)
      .where(and(
        eq(bookingAdminNotes.bookingId, bookingId),
        eq(bookingAdminNotes.noteType, 'CONTACTED')
      ))
      .orderBy(bookingAdminNotes.createdAt)
      .limit(1);
    
    return note?.createdAt ?? null;
  }
}

// Export singleton instance
export const bookingNotesService = new BookingNotesService();
