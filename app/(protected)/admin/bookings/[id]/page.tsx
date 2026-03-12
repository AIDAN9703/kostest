import { bookingService } from "@/features/bookings/booking.service";
import { bookingOpsService } from "@/features/bookings/booking-ops.service";
import { notFound } from "next/navigation";
import { AdminBookingProfileHeader } from "@/features/bookings/components/admin/AdminBookingProfileHeader";
import { AdminBookingDetailsCard } from "@/features/bookings/components/admin/AdminBookingDetailsCard";
import { AdminBookingPaymentCard } from "@/features/bookings/components/admin/AdminBookingPaymentCard";
import { AdminBookingOpsCard } from "@/features/bookings/components/admin/AdminBookingOpsCard";
import { AdminBookingCustomerCard } from "@/features/bookings/components/admin/AdminBookingCustomerCard";
import { AdminBookingBoatCard } from "@/features/bookings/components/admin/AdminBookingBoatCard";
import { AdminAssignmentCard } from "@/features/bookings/components/admin/AdminAssignmentCard";

interface BookingDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailsPage({
  params,
}: BookingDetailsPageProps) {
  const { id } = await params;
  const [booking, ops] = await Promise.all([
    bookingService.getBookingById(id),
    bookingOpsService.getByBookingId(id),
  ]);

  if (!booking) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:px-6">
      <AdminBookingProfileHeader booking={booking} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AdminBookingDetailsCard booking={booking} />
          <AdminBookingPaymentCard booking={booking} />
          <AdminBookingOpsCard bookingId={id} ops={ops} />
        </div>
        <div className="space-y-6">
          <AdminBookingCustomerCard booking={booking} />
          <AdminBookingBoatCard booking={booking} />
          <AdminAssignmentCard
            assignedAdminId={booking.assignedAdminId}
            assignedAdminFirstName={booking.assignedAdminFirstName}
            assignedAdminLastName={booking.assignedAdminLastName}
            assignedAdminEmail={booking.assignedAdminEmail}
          />
        </div>
      </div>
    </div>
  );
}
