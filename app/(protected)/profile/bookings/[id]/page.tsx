import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { db } from "@/database/db";
import { bookings, boats, bookingPricing } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCentsAsCurrency } from "@/shared/lib/utils/money-utils";
import { parseDateTimeInBoatTimezone } from "@/shared/lib/utils/date-helpers";
import { format } from "date-fns";
import ProfileBookingDetail from "@/features/profile/components/ProfileBookingDetail";

export default async function ProfileBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { id } = await params;

  const [row] = await db
    .select({
      id: bookings.id,
      bookingStatus: bookings.bookingStatus,
      startDateTime: bookings.startDateTime,
      endDateTime: bookings.endDateTime,
      numberOfPassengers: bookings.numberOfPassengers,
      needsCaptain: bookings.needsCaptain,
      pickupLocation: bookings.pickupLocation,
      boatId: bookings.boatId,
      boatName: boats.name,
      boatCategory: boats.category,
      boatMainImage: boats.mainImage,
      totalAmountCents: bookingPricing.totalAmountCents,
      depositAmountCents: bookingPricing.depositAmountCents,
    })
    .from(bookings)
    .leftJoin(bookingPricing, eq(bookings.id, bookingPricing.bookingId))
    .leftJoin(boats, eq(bookings.boatId, boats.id))
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
    .limit(1);

  if (!row) notFound();

  const { date: startDate } = parseDateTimeInBoatTimezone(row.startDateTime);
  const start =
    row.startDateTime instanceof Date
      ? row.startDateTime
      : row.startDateTime
        ? new Date(row.startDateTime)
        : null;
  const end =
    row.endDateTime instanceof Date
      ? row.endDateTime
      : row.endDateTime
        ? new Date(row.endDateTime)
        : null;
  const duration =
    start && end
      ? Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
      : 0;

  const statusMap: Record<string, string> = {
    DRAFT: "Pending",
    PENDING: "Pending",
    APPROVED: "Approved",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
  };

  return (
    <div className="space-y-6">
      <Link
        href="/profile/bookings"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>
      <ProfileBookingDetail
        booking={{
          id: row.id,
          bookingStatus: row.bookingStatus,
          boatId: row.boatId,
          boatName: row.boatName || "Unknown",
          boatType: row.boatCategory || "Yacht",
          boatMainImage: row.boatMainImage,
          date: startDate ? format(startDate, "EEEE, MMMM d, yyyy") : "No date",
          duration,
          location: row.pickupLocation || "Marina",
          guests: row.numberOfPassengers,
          captain: row.needsCaptain,
          totalAmountCents: row.totalAmountCents ? Number(row.totalAmountCents) : 0,
          depositAmountCents: row.depositAmountCents ? Number(row.depositAmountCents) : null,
          status: statusMap[row.bookingStatus] || "Pending",
        }}
      />
    </div>
  );
}
