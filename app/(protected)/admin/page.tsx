import { auth } from "@/auth";
import { boatService } from "@/features/boats/boat.service";
import { userService } from "@/features/users/user.service";
import {
  getDashboardHeadlineMetrics,
  getFollowUpInquiries,
  getPendingBookingRequests,
  getRecentDashboardActivity,
  getUnassignedLeads,
  getWeeksBookings,
} from "@/features/admin/dashboard";
import { AdminDashboardView } from "@/features/admin/dashboard/AdminDashboardView";

export default async function AdminDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(/\s+/)[0] ?? null;

  const [
    followUps,
    unassignedLeads,
    weeksBookings,
    pendingBookings,
    pricingTiers,
    metrics,
    recentActivity,
    admins,
  ] = await Promise.all([
    getFollowUpInquiries(5),
    getUnassignedLeads(8),
    getWeeksBookings(),
    getPendingBookingRequests(),
    boatService.getAllActivePricingTiers(),
    getDashboardHeadlineMetrics(),
    getRecentDashboardActivity(12),
    userService.getAdmins(),
  ]);

  return (
    <AdminDashboardView
      firstName={firstName}
      pricingTiers={pricingTiers}
      followUps={followUps}
      unassignedLeads={unassignedLeads}
      weeksBookings={weeksBookings}
      pendingBookings={pendingBookings}
      metrics={metrics}
      recentActivity={recentActivity}
      admins={admins}
    />
  );
}
