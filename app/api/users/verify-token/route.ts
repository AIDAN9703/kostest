import { NextRequest, NextResponse } from "next/server";
import { findUserByEmailAndToken } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // Get email and token from URL search params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: "Email and token are required" },
        { status: 400 }
      );
    }

    // Find user with matching email and token
    const user = await findUserByEmailAndToken(email, token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 