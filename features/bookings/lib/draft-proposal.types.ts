/**
 * Types for the public draft booking proposal page.
 * Used when customers open the SMS/link to view and accept their charter proposal.
 */

export interface DraftProposalAddOn {
  name: string;
  description?: string | null;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface DraftProposalBooking {
  id: string;
  boatId: string;
  boatName: string;
  boatMainImage: string | null;
  /** This boat's IANA zone — trip times always render boat-local. */
  timezone: string | null;
  /** Per-boat trip window — shown when it differs from the lead booking's. */
  startDateTime: Date | null;
  endDateTime: Date | null;
  /** Charter base price only (cents) */
  basePriceCents: number;
  /** Cleaning fee (cents) */
  cleaningFeeCents: number;
  /** 3.5% card processing fee (cents) */
  serviceFeeCents: number;
  /** Total for this booking (cents) */
  totalCents: number;
  addOns: DraftProposalAddOn[] | null;
}

export interface DraftProposalData {
  /** Latest admin edit across the party — the page's freshness stamp. */
  updatedAt: Date | null;
  id: string;
  customerName: string;
  customerEmail: string;
  startDateTime: Date;
  endDateTime: Date | null;
  numberOfPassengers: number;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  /** Lead boat's IANA zone — Trip Details renders boat-local, not viewer-local. */
  timezone: string | null;
  allowPayment: boolean;
  paymentType: "DEPOSIT_ONLY" | "FULL_PAYMENT" | null;
  acceptedAt: Date | null;
  totalPaidCents: number;
  depositAmountCents: number | null;
  totalAmountCents: number;
  bookings: DraftProposalBooking[];
}
