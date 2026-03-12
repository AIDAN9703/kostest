/**
 * Booking Status Service
 * 
 * Business logic layer for booking status transitions.
 * Uses direct database access (no repository layer).
 * 
 * Every status change creates a history entry for full traceability.
 */

import { db } from '@/database/db';
import { bookings, bookingStatusHistory } from '@/database/schema';
import { eq, desc } from 'drizzle-orm';
import type { BookingStatus, BookingStatusHistory } from '@/database/types';

// ============================================================================
// TYPES
// ============================================================================

export interface StatusTransitionInput {
  bookingId: string;
  newStatus: BookingStatus;
  changedByUserId?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedByUserId: string | null;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// ============================================================================
// STATUS TRANSITION RULES
// ============================================================================

/**
 * Valid status transitions
 * Maps current status to array of valid next statuses
 */
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: ['PENDING'],
  // Request flow
  PENDING: ['APPROVED', 'DENIED', 'EXPIRED', 'CANCELLED'],
  APPROVED: ['CONFIRMED', 'EXPIRED', 'CANCELLED'],
  
  // Instant book flow
  CONFIRMED: ['COMPLETED', 'CANCELLED', 'REFUNDED'],
  
  // Terminal states
  DENIED: [], // Cannot transition from denied
  CANCELLED: ['REFUNDED'], // Can only refund after cancel
  COMPLETED: ['REFUNDED'], // Can refund after completion
  EXPIRED: [], // Cannot transition from expired
  REFUNDED: [], // Final state
};

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  fromStatus: BookingStatus,
  toStatus: BookingStatus
): boolean {
  const validNextStatuses = VALID_TRANSITIONS[fromStatus] ?? [];
  return validNextStatuses.includes(toStatus);
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class BookingStatusService {
  /**
   * Get current status of a booking
   */
  async getCurrentStatus(bookingId: string): Promise<BookingStatus | null> {
    const [booking] = await db
      .select({ bookingStatus: bookings.bookingStatus })
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);
    
    return booking?.bookingStatus ?? null;
  }

  /**
   * Transition booking to a new status
   * Creates history entry and updates booking status
   * 
   * @throws Error if transition is invalid
   */
  async transitionStatus(input: StatusTransitionInput): Promise<BookingStatusHistory> {
    const { bookingId, newStatus, changedByUserId, reason, metadata } = input;

    // Get current status
    const currentStatus = await this.getCurrentStatus(bookingId);
    if (currentStatus === null) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Validate transition
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      throw new Error(
        `Invalid status transition: ${currentStatus} → ${newStatus}. ` +
        `Valid transitions from ${currentStatus}: ${VALID_TRANSITIONS[currentStatus].join(', ') || 'none'}`
      );
    }

    // Update booking status
    await db
      .update(bookings)
      .set({ 
        bookingStatus: newStatus,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId));

    // Create history entry
    const [historyEntry] = await db
      .insert(bookingStatusHistory)
      .values({
        bookingId,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedByUserId: changedByUserId ?? null,
        reason: reason ?? null,
        metadata: metadata ?? null,
      })
      .returning();

    return historyEntry;
  }

  /**
   * Force set status without validation (for system operations)
   * Use with caution - bypasses transition rules
   */
  async forceSetStatus(
    bookingId: string,
    newStatus: BookingStatus,
    reason: string = 'System override'
  ): Promise<BookingStatusHistory> {
    const currentStatus = await this.getCurrentStatus(bookingId);
    if (currentStatus === null) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    await db
      .update(bookings)
      .set({ 
        bookingStatus: newStatus,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId));

    const [historyEntry] = await db
      .insert(bookingStatusHistory)
      .values({
        bookingId,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedByUserId: null,
        reason,
        metadata: { forced: true },
      })
      .returning();

    return historyEntry;
  }

  /**
   * Create initial status history entry for a new booking
   * Called when booking is first created
   */
  async createInitialHistory(
    bookingId: string,
    initialStatus: BookingStatus,
    createdByUserId?: string | null
  ): Promise<BookingStatusHistory> {
    const [historyEntry] = await db
      .insert(bookingStatusHistory)
      .values({
        bookingId,
        fromStatus: null,
        toStatus: initialStatus,
        changedByUserId: createdByUserId ?? null,
        reason: 'Booking created',
      })
      .returning();

    return historyEntry;
  }

  /**
   * Get full status history for a booking
   */
  async getStatusHistory(bookingId: string): Promise<StatusHistoryEntry[]> {
    const history = await db
      .select()
      .from(bookingStatusHistory)
      .where(eq(bookingStatusHistory.bookingId, bookingId))
      .orderBy(desc(bookingStatusHistory.createdAt));

    return history.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      changedByUserId: h.changedByUserId,
      reason: h.reason,
      metadata: h.metadata as Record<string, unknown> | null,
      createdAt: h.createdAt,
    }));
  }

  /**
   * Get the most recent status change for a booking
   */
  async getLatestStatusChange(bookingId: string): Promise<StatusHistoryEntry | null> {
    const [entry] = await db
      .select()
      .from(bookingStatusHistory)
      .where(eq(bookingStatusHistory.bookingId, bookingId))
      .orderBy(desc(bookingStatusHistory.createdAt))
      .limit(1);

    if (!entry) return null;

    return {
      id: entry.id,
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      changedByUserId: entry.changedByUserId,
      reason: entry.reason,
      metadata: entry.metadata as Record<string, unknown> | null,
      createdAt: entry.createdAt,
    };
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR COMMON TRANSITIONS
  // ============================================================================

  /**
   * Approve a pending booking request
   */
  async approve(bookingId: string, adminId: string, reason?: string): Promise<BookingStatusHistory> {
    return this.transitionStatus({
      bookingId,
      newStatus: 'APPROVED',
      changedByUserId: adminId,
      reason: reason ?? 'Booking request approved',
    });
  }

  /**
   * Deny a pending booking request
   */
  async deny(bookingId: string, adminId: string, reason: string): Promise<BookingStatusHistory> {
    return this.transitionStatus({
      bookingId,
      newStatus: 'DENIED',
      changedByUserId: adminId,
      reason,
    });
  }

  /**
   * Confirm a booking (payment received)
   */
  async confirm(bookingId: string, reason?: string): Promise<BookingStatusHistory> {
    return this.transitionStatus({
      bookingId,
      newStatus: 'CONFIRMED',
      reason: reason ?? 'Payment received',
    });
  }

  /**
   * Mark booking as completed
   */
  async complete(bookingId: string, adminId?: string): Promise<BookingStatusHistory> {
    return this.transitionStatus({
      bookingId,
      newStatus: 'COMPLETED',
      changedByUserId: adminId,
      reason: 'Charter completed',
    });
  }

  /**
   * Cancel a booking
   */
  async cancel(
    bookingId: string,
    cancelledByUserId: string,
    reason: string
  ): Promise<BookingStatusHistory> {
    return this.transitionStatus({
      bookingId,
      newStatus: 'CANCELLED',
      changedByUserId: cancelledByUserId,
      reason,
    });
  }

  /**
   * Mark booking as expired
   */
  async expire(bookingId: string, reason?: string): Promise<BookingStatusHistory> {
    return this.transitionStatus({
      bookingId,
      newStatus: 'EXPIRED',
      reason: reason ?? 'Booking expired',
    });
  }

  /**
   * Mark booking as refunded
   */
  async refund(bookingId: string, adminId: string, reason?: string): Promise<BookingStatusHistory> {
    return this.transitionStatus({
      bookingId,
      newStatus: 'REFUNDED',
      changedByUserId: adminId,
      reason: reason ?? 'Payment refunded',
    });
  }
}

// Export singleton instance
export const bookingStatusService = new BookingStatusService();
