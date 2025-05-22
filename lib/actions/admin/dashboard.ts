'use server'

import { db } from '@/database/db'
import { users, boats, bookings } from '@/database/schema'
import { count, gte, lte, and, sum, sql } from 'drizzle-orm'
import { cache } from 'react'

export interface DashboardStats {
  totalUsers: number;
  totalBoats: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  comparisonStats: {
    usersTrend: { value: number; isPositive: boolean };
    boatsTrend: { value: number; isPositive: boolean };
    bookingsTrend: { value: number; isPositive: boolean };
    revenueTrend: { value: number; isPositive: boolean };
  }
}

// Cache the dashboard stats for 5 minutes
export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Execute all queries concurrently for better performance
  const [
    totalUsersResult,
    totalBoatsResult,
    currentMonthStats,
    lastMonthStats
  ] = await Promise.all([
    // Total users count
    db.select({ count: count() }).from(users),
    
    // Total boats count
    db.select({ count: count() }).from(boats),
    
    // Current month stats
    db.select({
      bookingsCount: count(),
      revenue: sum(bookings.totalAmount)
    })
    .from(bookings)
    .where(gte(bookings.createdAt, startOfMonth)),
    
    // Last month stats
    db.select({
      bookingsCount: count(),
      revenue: sum(bookings.totalAmount)
    })
    .from(bookings)
    .where(
      and(
        gte(bookings.createdAt, startOfLastMonth),
        lte(bookings.createdAt, endOfLastMonth)
      )
    )
  ]);

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 100, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: change,
      isPositive: change >= 0
    };
  };

  const currentBookings = Number(currentMonthStats[0]?.bookingsCount) || 0;
  const lastMonthBookings = Number(lastMonthStats[0]?.bookingsCount) || 0;
  const currentRevenue = Number(currentMonthStats[0]?.revenue) || 0;
  const lastMonthRevenue = Number(lastMonthStats[0]?.revenue) || 0;

  return {
    totalUsers: Number(totalUsersResult[0]?.count) || 0,
    totalBoats: Number(totalBoatsResult[0]?.count) || 0,
    bookingsThisMonth: currentBookings,
    revenueThisMonth: currentRevenue,
    comparisonStats: {
      usersTrend: calculateTrend(Number(totalUsersResult[0]?.count) || 0, Number(totalUsersResult[0]?.count) || 0),
      boatsTrend: calculateTrend(Number(totalBoatsResult[0]?.count) || 0, Number(totalBoatsResult[0]?.count) || 0),
      bookingsTrend: calculateTrend(currentBookings, lastMonthBookings),
      revenueTrend: calculateTrend(currentRevenue, lastMonthRevenue)
    }
  };
}); 