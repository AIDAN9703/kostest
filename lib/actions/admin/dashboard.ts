'use server'

import { db } from '@/database/db'
import { users, boats, bookings } from '@/database/schema'
import { count, gte, lte, and, sum, sql } from 'drizzle-orm'

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

/**
 * Get dashboard statistics for the admin dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  // Get current month start and end dates
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  // Get previous month start and end dates for comparison
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  
  try {
    // Get total users count
    const [{ value: totalUsers }] = await db
      .select({ value: count() })
      .from(users);
    
    // Get users created last month for comparison
    const [{ value: lastMonthUsers }] = await db
      .select({ value: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, prevMonthStart),
          lte(users.createdAt, prevMonthEnd)
        )
      );
    
    // Get users created this month
    const [{ value: thisMonthUsers }] = await db
      .select({ value: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, currentMonthStart),
          lte(users.createdAt, currentMonthEnd)
        )
      );
    
    // Calculate user growth trend
    const usersTrend = lastMonthUsers > 0 
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
      : 0;
    
    // Get total boats count
    const [{ value: totalBoats }] = await db
      .select({ value: count() })
      .from(boats);
    
    // Get boats created last month
    const [{ value: lastMonthBoats }] = await db
      .select({ value: count() })
      .from(boats)
      .where(
        and(
          gte(boats.createdAt, prevMonthStart),
          lte(boats.createdAt, prevMonthEnd)
        )
      );
    
    // Get boats created this month
    const [{ value: thisMonthBoats }] = await db
      .select({ value: count() })
      .from(boats)
      .where(
        and(
          gte(boats.createdAt, currentMonthStart),
          lte(boats.createdAt, currentMonthEnd)
        )
      );
    
    // Calculate boat growth trend
    const boatsTrend = lastMonthBoats > 0 
      ? ((thisMonthBoats - lastMonthBoats) / lastMonthBoats) * 100 
      : 0;
    
    // Get bookings this month
    const [{ value: bookingsThisMonth }] = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          gte(bookings.createdAt, currentMonthStart),
          lte(bookings.createdAt, currentMonthEnd)
        )
      );
    
    // Get bookings last month for comparison
    const [{ value: bookingsLastMonth }] = await db
      .select({ value: count() })
      .from(bookings)
      .where(
        and(
          gte(bookings.createdAt, prevMonthStart),
          lte(bookings.createdAt, prevMonthEnd)
        )
      );
    
    // Calculate bookings growth trend
    const bookingsTrend = bookingsLastMonth > 0 
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100 
      : 0;
    
    // Get revenue this month
    const [{ total: revenueThisMonth = 0 }] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)` 
      })
      .from(bookings)
      .where(
        and(
          gte(bookings.createdAt, currentMonthStart),
          lte(bookings.createdAt, currentMonthEnd),
          sql`${bookings.paymentStatus} = 'PAID'`
        )
      );
    
    // Get revenue last month for comparison
    const [{ total: revenueLastMonth = 0 }] = await db
      .select({ 
        total: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)` 
      })
      .from(bookings)
      .where(
        and(
          gte(bookings.createdAt, prevMonthStart),
          lte(bookings.createdAt, prevMonthEnd),
          sql`${bookings.paymentStatus} = 'PAID'`
        )
      );
    
    // Calculate revenue growth trend
    const revenueTrend = revenueLastMonth > 0 
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
      : 0;
    
    return {
      totalUsers,
      totalBoats,
      bookingsThisMonth,
      revenueThisMonth,
      comparisonStats: {
        usersTrend: { 
          value: Math.round(usersTrend * 10) / 10, 
          isPositive: usersTrend >= 0
        },
        boatsTrend: { 
          value: Math.round(boatsTrend * 10) / 10, 
          isPositive: boatsTrend >= 0
        },
        bookingsTrend: { 
          value: Math.round(bookingsTrend * 10) / 10, 
          isPositive: bookingsTrend >= 0
        },
        revenueTrend: { 
          value: Math.round(revenueTrend * 10) / 10, 
          isPositive: revenueTrend >= 0
        }
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    
    // Return default values if error occurs
    return {
      totalUsers: 0,
      totalBoats: 0,
      bookingsThisMonth: 0,
      revenueThisMonth: 0,
      comparisonStats: {
        usersTrend: { value: 0, isPositive: true },
        boatsTrend: { value: 0, isPositive: true },
        bookingsTrend: { value: 0, isPositive: true },
        revenueTrend: { value: 0, isPositive: true }
      }
    };
  }
} 