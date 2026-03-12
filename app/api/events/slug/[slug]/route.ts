import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug } from "@/features/events/events.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const event = await getEventBySlug(slug);
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      event 
    });
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
