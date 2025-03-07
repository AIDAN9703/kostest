import { NextRequest, NextResponse } from "next/server";
import { db } from "@/database/db";
import { verifications, verificationStatusEnum, users } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { formatPhoneNumberE164 } from '@/lib/utils';

/**
 * Twilio webhook handler for verification status updates
 * 
 * This endpoint receives callbacks from Twilio when verification statuses change.
 * It updates our database records accordingly.
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the request body as form data (Twilio sends form data)
    const formData = await req.formData();
    
    // Extract the verification data
    const verificationSid = formData.get('VerificationSid') as string;
    const to = formData.get('To') as string;
    const status = formData.get('Status') as string;
    
    // Validate required fields
    if (!verificationSid || !to || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Format the phone number to ensure consistent matching
    const formattedPhoneNumber = formatPhoneNumberE164(to);
    
    // Map Twilio status to our status enum
    const statusMap: Record<string, typeof verificationStatusEnum.enumValues[number]> = {
      'pending': 'PENDING',
      'approved': 'PASSED',
      'canceled': 'FAILED',
      'failed': 'FAILED',
    };
    
    // Find the verification record
    const verificationRecords = await db
      .select()
      .from(verifications)
      .where(
        and(
          eq(verifications.phoneNumber, formattedPhoneNumber),
          eq(verifications.twilioSid, verificationSid)
        )
      );
    
    if (verificationRecords.length === 0) {
      return NextResponse.json(
        { success: false, error: "Verification record not found" },
        { status: 404 }
      );
    }
    
    const verification = verificationRecords[0];
    
    // Update the verification status
    await db
      .update(verifications)
      .set({
        twilioStatus: status,
        status: statusMap[status.toLowerCase()] || verification.status,
        updatedAt: new Date(),
        ...(status.toLowerCase() === 'approved' ? { verifiedAt: new Date() } : {})
      })
      .where(eq(verifications.id, verification.id));
    
    // If the verification is approved, update the user's phone verification status
    if (status.toLowerCase() === 'approved') {
      await db
        .update(users)
        .set({
          phoneVerified: true,
          updatedAt: new Date()
        })
        .where(eq(users.id, verification.userId));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

/**
 * Twilio webhook handler for GET requests (for testing)
 */
export async function GET() {
  return NextResponse.json({ message: "Twilio webhook endpoint is working" });
} 