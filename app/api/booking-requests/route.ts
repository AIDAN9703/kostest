import { NextResponse } from "next/server";
import { createBookingRequest, getBookingRequest, updateBookingRequestStatus } from "@/lib/actions/booking-requests";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const data = await req.json();

    // Add user ID if authenticated
    if (session?.user?.id) {
      data.userId = session.user.id;
    }

    const result = await createBookingRequest(data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in POST /api/booking-requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking request ID is required" },
        { status: 400 }
      );
    }

    const result = await getBookingRequest(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/booking-requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    
    // Only allow admin users to update booking requests
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const data = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Booking request ID is required" },
        { status: 400 }
      );
    }

    const result = await updateBookingRequestStatus(id, data.status, data.reviewNotes);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in PATCH /api/booking-requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 