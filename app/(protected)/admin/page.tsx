import { auth } from "@/auth";
import { boatService } from "@/features/boats/boat.service";
import { userService } from "@/features/users/user.service";
import {
  getDashboardHeadlineMetrics,
  getMyOpenDeals,
  getPipelineSnapshot,
  getRecentDashboardActivity,
  getUnassignedLeads,
  getUpcomingTrips,
} from "@/features/admin/dashboard";
import { AdminDashboardView } from "@/features/admin/dashboard/AdminDashboardView";

export default async function AdminDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(/\s+/)[0] ?? null;
  const adminId = session?.user?.id ?? null;

  const [
    unassignedLeads,
    upcomingTrips,
    myDeals,
    pipeline,
    recentActivity,
    pricingTiers,
    metrics,
    admins,
  ] = await Promise.all([
    getUnassignedLeads(6),
    getUpcomingTrips(30),
    adminId ? getMyOpenDeals(adminId, 6) : Promise.resolve([]),
    getPipelineSnapshot(),
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
      upcomingTrips={upcomingTrips}
      myDeals={myDeals}
      pipeline={pipeline}
      recentActivity={recentActivity}
      metrics={metrics}
      admins={admins}
    />
  );
}
