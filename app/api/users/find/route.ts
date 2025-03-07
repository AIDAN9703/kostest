import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }
    
    // Find the user by email
    const userRecord = await db
      .select({
        id: users.id,
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (userRecord.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Return the user data
    return NextResponse.json({
      success: true,
      user: userRecord[0],
    });
  } catch (error) {
    console.error("Error finding user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to find user" },
      { status: 500 }
    );
  }
} 