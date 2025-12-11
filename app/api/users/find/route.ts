import { NextRequest } from "next/server";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { apiSuccess, apiError } from "@/shared/lib/utils/api-helpers";

// Add dynamic configuration for Next.js 15
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    
    if (!email) {
      return apiError("Email is required", 400);
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
      return apiError("User not found", 404);
    }
    
    return apiSuccess(userRecord[0]);
    
  } catch (error) {
    console.error("Error finding user:", error);
    return apiError("Failed to find user");
  }
}
