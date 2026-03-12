import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createEvent, getAllEvents } from "@/features/events/events.service";

export async function GET() {
  try {
    // Admin-only route for all events
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }
    
    const events = await getAllEvents();
    
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin authentication required for creating events
    const session = await auth();
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const eventData = await request.json();
    const result = await createEvent(eventData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
