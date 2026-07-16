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
    unassignedLeads,
    weeksBookings,
    pendingBookings,
    followUps,
    recentActivity,
    pricingTiers,
    metrics,
    admins,
  ] = await Promise.all([
    getUnassignedLeads(10),
    getWeeksBookings(),
    getPendingBookingRequests(),
    getFollowUpInquiries(6),
    getRecentDashboardActivity(8),
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
      followUps={followUps}
      recentActivity={recentActivity}
      metrics={metrics}
      admins={admins}
    />
  );
}
