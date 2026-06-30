import { auth } from "@/auth";
import { boatService } from "@/features/boats/boat.service";
import {
  getDashboardHeadlineMetrics,
  getFollowUpInquiries,
  getPendingBookingRequests,
  getRecentDashboardActivity,
  getWeeksBookings,
} from "@/features/admin/dashboard";
import { AdminDashboardView } from "@/features/admin/dashboard/AdminDashboardView";

export default async function AdminDashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(/\s+/)[0] ?? null;

  const [
    followUps,
    weeksBookings,
    pendingBookings,
    pricingTiers,
    metrics,
    recentActivity,
  ] = await Promise.all([
    getFollowUpInquiries(5),
    getWeeksBookings(),
    getPendingBookingRequests(),
    boatService.getAllActivePricingTiers(),
    getDashboardHeadlineMetrics(),
    getRecentDashboardActivity(12),
  ]);

  return (
    <AdminDashboardView
      firstName={firstName}
      pricingTiers={pricingTiers}
      followUps={followUps}
      weeksBookings={weeksBookings}
      pendingBookings={pendingBookings}
      metrics={metrics}
      recentActivity={recentActivity}
    />
  );
}
