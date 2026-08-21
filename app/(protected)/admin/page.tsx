import { auth } from "@/auth";
import { boatService } from "@/features/boats/boat.service";
import { userService } from "@/features/users/user.service";
import {
  getFleetLeaders,
  getMyOpenDeals,
  getRevenueTrend,
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
    pricingTiers,
    trend,
    leaders,
    admins,
  ] = await Promise.all([
    getUnassignedLeads(6),
    getUpcomingTrips(30),
    adminId ? getMyOpenDeals(adminId, 6) : Promise.resolve([]),
    boatService.getAllActivePricingTiers(),
    getRevenueTrend(12),
    getFleetLeaders(5),
    userService.getAdmins(),
  ]);

  return (
    <AdminDashboardView
      firstName={firstName}
      pricingTiers={pricingTiers}
      unassignedLeads={unassignedLeads}
      upcomingTrips={upcomingTrips}
      myDeals={myDeals}
      trend={trend}
      leaders={leaders}
      admins={admins}
    />
  );
}
