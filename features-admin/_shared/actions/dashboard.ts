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

export type DailyPoint = { date: string; value: number };

// Per-day bookings (last N days)
export const getDailyBookings = cache(async (days: number): Promise<DailyPoint[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${bookings.createdAt})::date`.as('date'),
      value: sql<number>`count(*)`.as('value'),
    })
    .from(bookings)
    .where(gte(bookings.createdAt, startDate))
    .groupBy(sql`date_trunc('day', ${bookings.createdAt})::date`)
    .orderBy(sql`date_trunc('day', ${bookings.createdAt})::date`);

  // Fill gaps with zeros to keep chart smooth
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(String(r.date), Number(r.value)));

  const out: DailyPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, value: map.get(key) ?? 0 });
  }
  return out;
});

// Per-day revenue (last N days)
export const getDailyRevenue = cache(async (days: number): Promise<DailyPoint[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${bookings.createdAt})::date`.as('date'),
      value: sql<number>`coalesce(sum(${bookings.totalAmount}), 0)`.as('value'),
    })
    .from(bookings)
    .where(gte(bookings.createdAt, startDate))
    .groupBy(sql`date_trunc('day', ${bookings.createdAt})::date`)
    .orderBy(sql`date_trunc('day', ${bookings.createdAt})::date`);

  const map = new Map<string, number>();
  rows.forEach((r) => map.set(String(r.date), Number(r.value)));

  const out: DailyPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, value: map.get(key) ?? 0 });
  }
  return out;
});

