import { auth } from "@/auth";
import { db } from "@/database/db";
import { bookings, boats, bookingPricing } from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import { centsToDollars } from "@/shared/lib/utils/money-utils";
import { BookingCard } from "@/features/profile/components/BookingCard";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import { format } from "date-fns";
import { ProfileBooking } from "@/features/bookings/booking.types";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import Image from "next/image";

// Transform database booking to BookingCard format
function transformBooking(dbBooking: {
  id: string;
  startDateTime: Date | string | null;
  endDateTime: Date | string | null;
  boatName: string | null;
  boatCategory: string | null;
  boatMainImage: string | null;
  bookingStatus: string;
  numberOfPassengers: number;
  needsCaptain: boolean | null;
  totalAmountCents: number | null;
  pickupLocation: string | null;
}): ProfileBooking {
  // Parse dates in boat's timezone
  const { date: startDate, time: startTime } = parseDateTimeInBoatTimezone(
    dbBooking.startDateTime,
  );
  const { time: endTime } = parseDateTimeInBoatTimezone(dbBooking.endDateTime);

  // Calculate duration
  const start =
    dbBooking.startDateTime instanceof Date
      ? dbBooking.startDateTime
      : dbBooking.startDateTime
        ? new Date(dbBooking.startDateTime)
        : null;
  const end =
    dbBooking.endDateTime instanceof Date
      ? dbBooking.endDateTime
      : dbBooking.endDateTime
        ? new Date(dbBooking.endDateTime)
        : null;

  const duration =
    start && end
      ? Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
      : 0;

  return {
    id: dbBooking.id,
    bookingStatus: dbBooking.bookingStatus,
    boatName: dbBooking.boatName || "Unknown Boat",
    boatType: dbBooking.boatCategory || "Yacht",
    date: startDate ? format(startDate, "EEEE, MMMM d, yyyy") : "No date",
    duration: duration,
    location: dbBooking.pickupLocation || "Marina",
    guests: dbBooking.numberOfPassengers,
    captain: dbBooking.needsCaptain,
    price: centsToDollars(dbBooking.totalAmountCents ?? 0),
    status: getBookingDisplayStatus(dbBooking.bookingStatus),
    image: dbBooking.boatMainImage || "/images/boats/yacht1.jpg",
  };
}

// Map database status to display status
function getBookingDisplayStatus(dbStatus: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: "pending",
    PENDING: "pending",
    APPROVED: "approved",
    CONFIRMED: "confirmed",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
  };
  return statusMap[dbStatus] || "pending";
}

// Empty state component
const EmptyBookingsState = () => (
  <div className="md:bg-white md:rounded-3xl md:p-12 md:shadow-sm md:border md:border-gray-200">
    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
      {/* Image */}
      <div className="flex-shrink-0 w-full md:w-64 max-w-xs">
        <div className="relative md:left-1/3 aspect-[9/16] rounded-2xl overflow-hidden bg-white">
          <Image
            src="/images/example-search-profile-bookings-page.png"
            alt="Mobile view of search page"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 256px"
          />
          {/* Top fade gradient */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
          {/* Bottom fade gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 text-center px-4">
        <h2 className="text-xl md:text-2xl font-bold mb-2">No bookings yet</h2>
        <p className="max-w-lg mx-auto text-sm md:text-base text-muted-foreground mb-4">
          Start planning your next adventure on the water. Browse our selection
          of charters to find the perfect experience for you.
        </p>
        <Button
          className="bg-primary text-white hover:bg-primary/90 rounded-lg w-full md:w-auto"
          asChild
        >
          <Link href="/boats/search">Browse boats</Link>
        </Button>
      </div>
    </div>
  </div>
);

export default async function BookingsPage() {
  // Auth is handled by layout, just get session for user data
  const session = await auth();

  // Session is guaranteed to exist due to protected layout
  const userId = session?.user?.id;
  if (!userId) return null;

  // Fetch all bookings for the user with boat information and pricing
  const userBookingsData = await db
    .select({
      // Booking fields
      id: bookings.id,
      bookingStatus: bookings.bookingStatus,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      numberOfPassengers: bookings.numberOfPassengers,
      needsCaptain: bookings.needsCaptain,
      pickupLocation: bookings.pickupLocation,
      createdAt: bookings.createdAt,

      // Pricing from booking_pricing
      totalAmountCents: bookingPricing.totalAmountCents,

      // Boat information
      boatName: boats.name,
      boatCategory: boats.category,
      boatMainImage: boats.mainImage,
    })
    .from(bookings)
    .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
    .leftJoin(boats, eq(bookings.boatId, boats.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.startDateTime));

  // Transform bookings to match BookingCard interface
  const allBookings: ProfileBooking[] = userBookingsData.map(transformBooking);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          My bookings
        </h1>
      </div>

      {allBookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <EmptyBookingsState />
      )}
    </div>
  );
}
