import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEventById, updateEvent, deleteEvent } from "@/shared/lib/services/events.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const event = await getEventById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin authentication required
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const eventData = await request.json();
    const result = await updateEvent({ ...eventData, id: eventId });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin authentication required
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const eventId = parseInt(id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const result = await deleteEvent(eventId);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
