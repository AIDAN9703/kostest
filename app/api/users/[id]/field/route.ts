import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
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
    const { field, value } = await request.json();
    
    // Validate field and value
    if (!field || value === undefined) {
      return NextResponse.json(
        { success: false, error: "Field and value are required" },
        { status: 400 }
      );
    }

    // Only allow updating specific fields
    const allowedFields = ['role', 'status'];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: "Field not allowed for update" },
        { status: 400 }
      );
    }

    // Update the user field
    const [updatedUser] = await db
      .update(users)
      .set({ 
        [field]: value,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user field:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user field" },
      { status: 500 }
    );
  }
}

