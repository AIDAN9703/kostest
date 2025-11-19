import { bookingService } from "@/features/bookings/booking.service";
import { notFound } from "next/navigation";
import { BookingDetailsClient } from "./BookingDetailsClient";

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailsPage({
  params,
}: BookingDetailsPageProps) {
  const { id } = await params;
  const booking = await bookingService.getBookingById(id);

  if (!booking) {
    notFound();
  }

  return <BookingDetailsClient initialBooking={booking} />;
}
