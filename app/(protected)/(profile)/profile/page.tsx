import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getUserStats } from "@/features/profile/actions/profile-actions";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    redirect("/sign-in");
  }

  const statsResult = await getUserStats();

  if (
    statsResult.error ||
    statsResult.loyaltyPoints === undefined ||
    statsResult.totalBookings === undefined
  ) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            We're having trouble loading your stats. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const stats = statsResult;
  const firstName =
    user.firstName ||
    user.displayName?.split(" ")[0] ||
    user.username ||
    "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Your profile overview and account summary.
        </p>
      </div>

      {/* Loyalty Points */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-5xl font-bold text-primary">
            {stats.loyaltyPoints.toLocaleString()}
          </span>
          <div className="text-right">
            <span className="text-lg font-medium text-gray-900">
              Loyalty Points
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              Earn 1 point for every $1 spent on completed charters
            </p>
          </div>
        </div>
        {stats.loyaltyPoints > 0 && stats.loyaltyPoints < 100 && (
          <p className="text-sm text-gray-600">
            {100 - stats.loyaltyPoints} more points until your first reward
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Booking Statistics
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Bookings</span>
            <span className="text-lg font-semibold text-gray-900">
              {stats.totalBookings}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="text-lg font-semibold text-gray-900">
              {stats.completedBookings}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Upcoming</span>
            <span className="text-lg font-semibold text-gray-900">
              {stats.upcomingBookings}
            </span>
          </div>
          {stats.totalSpent > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">Total Spent</span>
              <span className="text-lg font-semibold text-gray-900">
                $
                {stats.totalSpent.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-4 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Links</h3>
        <div className="space-y-2">
          <Link
            href="/profile/bookings"
            className="block text-sm text-primary hover:underline"
          >
            View all bookings
          </Link>
          {stats.upcomingBookings > 0 && (
            <Link
              href="/profile/bookings"
              className="block text-sm text-primary hover:underline"
            >
              View upcoming bookings
            </Link>
          )}
          <Link
            href="/profile/favorites"
            className="block text-sm text-primary hover:underline"
          >
            View favorites
          </Link>
          <Link
            href="/boats"
            className="block text-sm text-primary hover:underline"
          >
            Browse boats
          </Link>
        </div>
      </div>
    </div>
  );
}
