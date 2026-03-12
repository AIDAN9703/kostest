import { notFound } from "next/navigation";
import { bookingService } from "@/features/bookings/booking.service";
import PublicDraftBookingClient from "@/features/bookings/components/PublicDraftBookingClient";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function PublicDraftBookingPage({ params }: Props) {
  const { token } = await params;
  const data = await bookingService.getDraftBookingsForPublicDisplay(token);

  if (!data) {
    notFound();
  }

  return (
    <PublicDraftBookingClient
      data={{
        id: data.id,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        numberOfPassengers: data.numberOfPassengers,
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.dropoffLocation,
        allowPayment: data.allowPayment,
        paymentType: data.paymentType,
        acceptedAt: data.acceptedAt,
        bookings: data.bookings,
      }}
      publicToken={token}
    />
  );
}
