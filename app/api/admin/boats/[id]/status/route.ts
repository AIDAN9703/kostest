import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/db";
import { boats } from "@/database/schema-calendar-test";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Verify user is an admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    if (typeof body.active !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid request: 'active' must be a boolean" },
        { status: 400 }
      );
    }
    
    // Update boat status in database
    const result = await db
      .update(boats)
      .set({ 
        active: body.active,
        updatedAt: new Date()
      })
      .where(eq(boats.id, params.id))
      .returning({ id: boats.id, active: boats.active });
    
    if (!result.length) {
      return NextResponse.json(
        { success: false, error: "Boat not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: result[0].id,
        active: result[0].active
      }
    });
    
  } catch (error) {
    console.error("Error updating boat status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 