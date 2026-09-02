import { auth } from "@/auth";
import { boatService } from "@/features/boats/boat.service";
import { userService } from "@/features/users/user.service";
import {
  getAdminWorkload,
  getFleetLeaders,
  getLeadIntake,
  getRecentActivity,
  getRevenueTrend,
  getUpcomingTrips,
} from "@/features/admin/dashboard";
import { AdminDashboardView } from "@/features/admin/dashboard/AdminDashboardView";

export default async function AdminDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(/\s+/)[0] ?? null;

  const [
    upcomingTrips,
    pricingTiers,
    trend,
    intake,
    leaders,
    workload,
    activity,
    admins,
  ] = await Promise.all([
    getUpcomingTrips(30),
    boatService.getAllActivePricingTiers(),
    getRevenueTrend(12),
    getLeadIntake(30),
    getFleetLeaders(5),
    getAdminWorkload(),
    getRecentActivity(20),
    userService.getAdmins(),
  ]);

  return (
    <AdminDashboardView
      firstName={firstName}
      pricingTiers={pricingTiers}
      upcomingTrips={upcomingTrips}
      trend={trend}
      intake={intake}
      leaders={leaders}
      workload={workload}
      activity={activity}
      admins={admins}
    />
  );
}
