import { NextResponse } from "next/server";
import { getActiveEvents } from "@/features/events/events.service";

export async function GET() {
  try {
    const activeEvents = await getActiveEvents();
    
    return NextResponse.json({ 
      success: true, 
      events: activeEvents 
    });
  } catch (error) {
    console.error("Error fetching active events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch active events" },
      { status: 500 }
    );
  }
}
