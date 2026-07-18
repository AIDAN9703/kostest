import { notFound } from "next/navigation";
import { bookingService } from "@/features/bookings/services/booking.service";
import PublicDraftBookingClient from "@/features/bookings/components/PublicDraftBookingClient";
import type { DraftProposalData } from "@/features/bookings/lib/draft-proposal.types";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function PublicDraftBookingPage({ params }: Props) {
  const { token } = await params;
  const raw = await bookingService.getDraftBookingsForPublicDisplay(token);

  if (!raw) {
    notFound();
  }

  const data: DraftProposalData = {
    id: raw.id,
    customerName: raw.customerName,
    customerEmail: raw.customerEmail,
    startDateTime: raw.startDateTime,
    endDateTime: raw.endDateTime,
    numberOfPassengers: raw.numberOfPassengers ?? 1,
    pickupLocation: raw.pickupLocation,
    dropoffLocation: raw.dropoffLocation,
    allowPayment: raw.allowPayment,
    paymentType: raw.paymentType,
    acceptedAt: raw.acceptedAt,
    depositAmountCents: raw.depositAmountCents ?? null,
    totalAmountCents: raw.totalAmountCents ?? 0,
    bookings: raw.bookings,
  };

  return <PublicDraftBookingClient data={data} publicToken={token} />;
}
