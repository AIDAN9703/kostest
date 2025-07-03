import { auth } from "@/auth";
import { db } from "@/database/db";
import { users, bookings, boats } from "@/database/schema";
import { eq, count, sum, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import QuickActions from "@/components/profile/QuickActions";
export default async function ProfilePage() {
  // Get session - auth already checked by middleware
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/sign-in');
  }
  
  // Fetch full user data directly from database
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  
  const user = userData[0];
  
  if (!user) {
    redirect('/sign-in');
  }

  // Calculate real stats from the database
  const [
    totalBookingsResult,
    totalBoatsListedResult,
    // For favorites, we'd need a favorites table - using placeholder for now
    // For hours on water, we'd need to calculate from completed bookings - using placeholder
  ] = await Promise.all([
    // Total bookings for this user
    db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.userId, user.id)),
    
    // Total boats listed (if user is a boat owner)
    db
      .select({ count: count() })
      .from(boats)
      .where(eq(boats.ownerId, user.id)),
  ]);

  // Extract the actual numbers
  const totalBookings = totalBookingsResult[0]?.count || 0;
  const totalBoatsListed = totalBoatsListedResult[0]?.count || 0;

  // Use existing user table stats where available, fallback to calculated values
  const stats = {
    totalBookings: user.totalBookings || totalBookings,
    favoriteBoats: 0, // This would need a favorites table
    hoursOnWater: 0, // This would need to be calculated from completed bookings
    loyaltyPoints: 0, // This would need a loyalty points system or user field
    totalBoatsListed: user.totalBoatsListed || totalBoatsListed,
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <ProfileHeader user={user} />

      {/* Stats Overview */}
      <ProfileStats stats={stats} />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
} 