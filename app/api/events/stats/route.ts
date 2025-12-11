import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEventStats } from "@/shared/lib/services/events.service";

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

    const stats = await getEventStats();
    
    return NextResponse.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event stats" },
      { status: 500 }
    );
  }
}
