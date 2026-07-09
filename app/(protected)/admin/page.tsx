import { auth } from "@/auth";
import { boatService } from "@/features/boats/boat.service";
import { userService } from "@/features/users/user.service";
import {
  getDashboardHeadlineMetrics,
  getPendingBookingRequests,
  getUnassignedLeads,
  getWeeksBookings,
} from "@/features/admin/dashboard";
import { AdminDashboardView } from "@/features/admin/dashboard/AdminDashboardView";

export default async function AdminDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(/\s+/)[0] ?? null;

  const [
    unassignedLeads,
    weeksBookings,
    pendingBookings,
    pricingTiers,
    metrics,
    admins,
  ] = await Promise.all([
    getUnassignedLeads(8),
    getWeeksBookings(),
    getPendingBookingRequests(),
    boatService.getAllActivePricingTiers(),
    getDashboardHeadlineMetrics(),
    userService.getAdmins(),
  ]);

  return (
    <AdminDashboardView
      firstName={firstName}
      pricingTiers={pricingTiers}
      unassignedLeads={unassignedLeads}
      weeksBookings={weeksBookings}
      pendingBookings={pendingBookings}
      metrics={metrics}
      admins={admins}
    />
  );
}
