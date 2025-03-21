"use server"

import { db } from "@/database/db";
import { verifications, users } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { ActionResponse } from "@/types/types";
import { sendVerification, checkVerification } from "@/lib/services/twilio";
import { formatPhoneNumberE164 } from '@/lib/utils';

/**
 * Sends a verification code to the user's phone number using Twilio Verify API
 */
export const sendVerificationCode = async (
  userId: string,
  phoneNumber: string
): Promise<ActionResponse<{ message: string }>> => {
  try {
    // Format the phone number to E.164 format
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Check if there's an existing verification for this user and phone
    const existingVerification = await db
      .select()
      .from(verifications)
      .where(
        and(
          eq(verifications.userId, userId),
          eq(verifications.phoneNumber, formattedPhoneNumber),
          eq(verifications.type, "PHONE")
        )
      );
    
    // Call Twilio Verify API to send verification code
    const twilioResponse = await sendVerification(formattedPhoneNumber, 'sms');
    
    if (!twilioResponse.success) {
      console.error("Twilio error:", twilioResponse.error);
      return { 
        success: false, 
        error: twilioResponse.error || "Failed to send verification code" 
      };
    }
    
    // Update or create verification record in database
    if (existingVerification.length > 0) {
      // Update the existing verification
      await db
        .update(verifications)
        .set({
          attempts: 0,
          expiresAt,
          updatedAt: new Date(),
          twilioStatus: 'pending',
          twilioSid: twilioResponse.sid
        })
        .where(eq(verifications.id, existingVerification[0].id));
    } else {
      // Create a new verification
      await db.insert(verifications).values({
        userId,
        phoneNumber: formattedPhoneNumber,
        type: "PHONE",
        channel: "SMS",
        code: "", // We don't store the code anymore as Twilio handles it
        status: "PENDING",
        expiresAt,
        twilioStatus: 'pending',
        twilioSid: twilioResponse.sid
      });
    }
    
    return { 
      success: true, 
      data: { message: "Verification code sent successfully" } 
    };
  } catch (error) {
    console.error("Error sending verification code:", error);
    return { 
      success: false, 
      error: "Failed to send verification code" 
    };
  }
};

/**
 * Verifies a code sent to the user's phone using Twilio Verify API
 */
export const verifyPhoneCode = async (
  userId: string,
  phoneNumber: string,
  code: string
): Promise<ActionResponse<{ message: string }>> => {
  try {
    // Format the phone number to E.164 format
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Find the verification record
    const verificationRecords = await db
      .select()
      .from(verifications)
      .where(
        and(
          eq(verifications.userId, userId),
          eq(verifications.phoneNumber, formattedPhoneNumber),
          eq(verifications.type, "PHONE"),
          eq(verifications.status, "PENDING")
        )
      );
    
    if (verificationRecords.length === 0) {
      return { 
        success: false, 
        error: "No pending verification found for this phone number" 
      };
    }
    
    const verification = verificationRecords[0];
    
    // Check if verification has expired
    if (new Date() > verification.expiresAt) {
      await db
        .update(verifications)
        .set({ status: "EXPIRED" })
        .where(eq(verifications.id, verification.id));
      
      return { 
        success: false, 
        error: "Verification code has expired. Please request a new one." 
      };
    }
    
    // Call Twilio Verify API to check the code
    const twilioResponse = await checkVerification(formattedPhoneNumber, code);
    
    // Increment attempts
    await db
      .update(verifications)
      .set({ 
        attempts: verification.attempts + 1,
        updatedAt: new Date()
      })
      .where(eq(verifications.id, verification.id));
    
    // Check if verification was successful
    if (!twilioResponse.success) {
      // Check if max attempts reached
      if (verification.attempts >= verification.maxAttempts) {
        return { 
          success: false, 
          error: "Maximum verification attempts reached. Please request a new code." 
        };
      }
      
      return { 
        success: false, 
        error: twilioResponse.error || "Invalid verification code" 
      };
    }
    
    // Update verification status
    await db
      .update(verifications)
      .set({ 
        status: "PASSED",
        verifiedAt: new Date(),
        updatedAt: new Date(),
        twilioStatus: twilioResponse.status || 'approved'
      })
      .where(eq(verifications.id, verification.id));
    
    // Update user's phone verification status
    await db
      .update(users)
      .set({ 
        phoneVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    return { 
      success: true, 
      data: { message: "Phone number verified successfully" } 
    };
  } catch (error) {
    console.error("Error verifying phone:", error);
    return { 
      success: false, 
      error: "Failed to verify phone number" 
    };
  }
}; 