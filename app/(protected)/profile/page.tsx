import { redirect } from "next/navigation";
import { requireAuth } from "@/shared/lib/utils/auth-utils";
import { getUserStats } from "@/features/profile/actions/profile-actions";
import { userService } from "@/features/users/user.service";
import { ProfileClient } from "@/features/profile/components/ProfileClient";
import type { ProfileStats } from "@/features/profile/profile.api";

export default async function ProfilePage() {
  // Require authentication - middleware already protects this route
  const session = await requireAuth();

  // Fetch initial data in server component (SSR)
  const user = await userService.getUserById(session.user.id);

  if (!user) {
    redirect("/sign-up");
  }

  const statsResult = await getUserStats();

  // Handle stats error gracefully
  if (statsResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Welcome back!
          </h1>
          <p className="text-gray-600 mt-1">
            We're having trouble loading your stats. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Transform stats to match ProfileStats type
  const stats: ProfileStats = {
    totalBookings: statsResult.totalBookings ?? 0,
    completedBookings: statsResult.completedBookings ?? 0,
    upcomingBookings: statsResult.upcomingBookings ?? 0,
    totalSpent: statsResult.totalSpent ?? 0,
    loyaltyPoints: statsResult.loyaltyPoints ?? 0,
  };

  // Pass initial data to client component (React Query handles caching/refetching)
  return <ProfileClient initialUser={user} initialStats={stats} />;
}
