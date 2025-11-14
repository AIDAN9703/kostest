import { auth } from "@/auth";
import { db } from "@/database/db";
import { bookings, boats } from "@/database/schema";
import { eq, desc } from "drizzle-orm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { BookingCard } from "@/features/profile/components/BookingCard";
import { CalendarDays } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { parseDateTimeInBoatTimezone } from "@/shared/utils/date-helpers";
import { format } from "date-fns";
import { ProfileBooking } from "@/shared/types/booking.types";

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
  totalAmount: number;
  pickupLocation: string | null;
}): ProfileBooking {
  // Parse dates in boat's timezone
  const { date: startDate, time: startTime } = parseDateTimeInBoatTimezone(
    dbBooking.startDateTime
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
    boatName: dbBooking.boatName || "Unknown Boat",
    boatType: dbBooking.boatCategory || "Yacht",
    date: startDate ? format(startDate, "EEEE, MMMM d, yyyy") : "No date",
    duration: duration,
    location: dbBooking.pickupLocation || "Marina",
    guests: dbBooking.numberOfPassengers,
    captain: dbBooking.needsCaptain,
    price: dbBooking.totalAmount || 0,
    status: getBookingDisplayStatus(dbBooking.bookingStatus),
    image: dbBooking.boatMainImage || "/images/boats/yacht1.jpg",
  };
}

// Map database status to display status
function getBookingDisplayStatus(dbStatus: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "pending",
    APPROVED: "approved", // Changed: APPROVED should show as "approved", not "confirmed"
    AWAITING_PAYMENT: "pending",
    CONFIRMED: "confirmed", // Only CONFIRMED shows as "confirmed"
    DENIED: "cancelled",
    EXPIRED: "cancelled",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
    REFUNDED: "cancelled",
  };
  return statusMap[dbStatus] || "pending";
}

// Empty state component
const EmptyBookingsState = ({
  message,
  actionText,
}: {
  message: string;
  actionText: string;
}) => (
  <div className="py-12 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
      <CalendarDays className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-base font-medium text-gray-900">{actionText}</h3>
    <p className="text-sm text-gray-500 max-w-md mt-1 mb-4">{message}</p>
    <Button className="bg-primary text-white" size="sm" asChild>
      <Link href="/boats">Browse Boats</Link>
    </Button>
  </div>
);

export default async function BookingsPage() {
  // Auth is handled by layout, just get session for user data
  const session = await auth();

  // Session is guaranteed to exist due to protected layout
  const userId = session?.user?.id;
  if (!userId) return null;

  // Fetch all bookings for the user with boat information
  const userBookingsData = await db
    .select({
      // Booking fields
      id: bookings.id,
      bookingStatus: bookings.bookingStatus,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      numberOfPassengers: bookings.numberOfPassengers,
      needsCaptain: bookings.needsCaptain,
      totalAmount: bookings.totalAmount,
      pickupLocation: bookings.pickupLocation,
      createdAt: bookings.createdAt,

      // Boat information
      boatName: boats.name,
      boatCategory: boats.category,
      boatMainImage: boats.mainImage,
    })
    .from(bookings)
    .leftJoin(boats, eq(bookings.boatId, boats.id))
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.startDateTime));

  // Transform bookings to match BookingCard interface
  const allBookings: ProfileBooking[] = userBookingsData.map(transformBooking);

  // Categorize bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = allBookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    return (
      bookingDate >= today && ["confirmed", "pending"].includes(booking.status)
    );
  });

  const pastBookings = allBookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    return bookingDate < today || booking.status === "completed";
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs sm:text-sm">
            Past ({pastBookings.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({allBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingBookings.length > 0 ? (
            <div className="space-y-6">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyBookingsState
              actionText="No upcoming bookings"
              message="You don't have any upcoming boat reservations. Browse boats and book your next adventure!"
            />
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastBookings.length > 0 ? (
            <div className="space-y-6">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyBookingsState
              actionText="No past bookings"
              message="You don't have any past boat reservations. Book your first boat adventure!"
            />
          )}
        </TabsContent>

        <TabsContent value="all">
          {allBookings.length > 0 ? (
            <div className="space-y-6">
              {allBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyBookingsState
              actionText="No bookings found"
              message="You haven't made any boat reservations yet. Start exploring available boats!"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
