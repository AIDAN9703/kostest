import { NextRequest, NextResponse } from "next/server";
import { findUserByEmailAndToken, clearUserVerificationToken } from "@/lib/utils";
import { signIn } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

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

    // Clear the verification token
    await clearUserVerificationToken(user.id);

    // Sign in the user using the credentials-token provider
    const result = await signIn("credentials-token", {
      userId: user.id,
      email: user.email,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User signed in successfully",
    });
  } catch (error) {
    console.error("Error signing in with token:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 