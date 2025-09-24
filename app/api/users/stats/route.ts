import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq, count, sql, and, gte } from "drizzle-orm";

export async function GET() {
  try {
    // Admin authentication required for stats
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Calculate start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get all stats in parallel
    const [
      totalUsersResult,
      activeUsersResult,
      adminUsersResult,
      newUsersThisMonthResult,
    ] = await Promise.all([
      // Total users
      db.select({ count: count() }).from(users),
      
      // Active users
      db.select({ count: count() })
        .from(users)
        .where(eq(users.status, 'ACTIVE')),
      
      // Admin users
      db.select({ count: count() })
        .from(users)
        .where(eq(users.role, 'ADMIN')),
      
      // New users this month
      db.select({ count: count() })
        .from(users)
        .where(gte(users.createdAt, startOfMonth)),
    ]);

    const stats = {
      totalUsers: totalUsersResult[0].count,
      activeUsers: activeUsersResult[0].count,
      adminUsers: adminUsersResult[0].count,
      newUsersThisMonth: newUsersThisMonthResult[0].count,
    };
    
    return NextResponse.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}

