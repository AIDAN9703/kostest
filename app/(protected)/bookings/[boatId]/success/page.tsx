import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { bookingService } from "@/features/bookings/services/booking.service";
import BookingRequestSuccess from "@/features/bookings/components/BookingRequestSuccess";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ boatId: string }>;
  searchParams: Promise<{ bookingId?: string; type?: string }>;
};

export default async function BookingRequestSuccessPage({ searchParams }: Props) {
  const { bookingId } = await searchParams;
  const session = await auth();

  if (!bookingId || !session?.user?.id) {
    redirect("/profile/bookings");
  }

  const booking = await bookingService.getBookingById(bookingId);

  // Ownership guard — only the customer who made the request can see it.
  if (!booking || booking.userId !== session.user.id) {
    redirect("/profile/bookings");
  }

  const hours =
    booking.startDateTime && booking.endDateTime
      ? Math.max(
          1,
          Math.round(
            (new Date(booking.endDateTime).getTime() -
              new Date(booking.startDateTime).getTime()) /
              (1000 * 60 * 60)
          )
        )
      : null;

  return (
    <BookingRequestSuccess
      booking={{
        id: booking.id,
        boatName: booking.boatName ?? null,
        boatCategory: booking.boatCategory ?? null,
        boatMainImage: booking.boatMainImage ?? null,
        boatTimezone: (booking.boatTimezone as string | null) ?? null,
        startDateTime: booking.startDateTime
          ? new Date(booking.startDateTime).toISOString()
          : null,
        hours,
        numberOfPassengers: booking.numberOfPassengers,
        basePriceCents: booking.basePriceCents ?? null,
        cleaningFeeCents: booking.cleaningFeeCents ?? null,
        serviceFeeCents: booking.serviceFeeCents ?? null,
        totalAmountCents: booking.totalAmountCents ?? null,
        currency: booking.currency ?? "USD",
        addOns: (booking.addOns ?? []).map((a) => ({
          name: a.name,
          quantity: a.quantity,
          total: a.total,
          isComplimentary: a.isComplimentary,
        })),
      }}
    />
  );
}
