"use server"

import { db } from "@/database/db";
import { verifications, users } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { ActionResponse } from "@/lib/types/types";
import { sendVerification, checkVerification } from "@/lib/services/twilio";
import { formatPhoneNumberE164 } from '@/lib/utils/general-utils';
import { signIn } from "@/auth";
import { randomUUID } from 'crypto';
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

/**
 * Comprehensive server action that handles OTP verification and sign-in in one step
 * This consolidates multiple API routes and verification steps into a single action
 */
export const verifyOtpAndSignIn = async (
  email: string,
  verificationCode: string // The OTP code entered by user
): Promise<ActionResponse<{ message: string; redirectUrl?: string }>> => {
  try {
    // Find the user by email
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (user.length === 0) {
      return { 
        success: false, 
        error: "User not found. Please try signing in again.",
        data: { 
          message: "Invalid user", 
          redirectUrl: "/sign-in" 
        }
      };
    }
    
    // Step 2: Verify the OTP code
    const result = await verifyPhoneCode(
      user[0].id,
      user[0].phoneNumber || "",
      verificationCode
    );
    
    if (!result.success) {
      return { 
        success: false, 
        error: result.error || "Failed to verify code",
      };
    }
    
    // Step 3: Sign in the user
    try {
      await signIn("credentials-token", {
        userId: user[0].id,
        email: user[0].email,
        redirect: false,
      });
      
      return { 
        success: true, 
        data: { 
          message: "Phone verified and signed in successfully",
          redirectUrl: "/"
        } 
      };
    } catch (signInError) {
      console.error("Error signing in after verification:", signInError);
      return { 
        success: true, 
        data: { 
          message: "Phone verified successfully, but automatic sign-in failed. Please sign in manually.",
          redirectUrl: "/sign-in" 
        } 
      };
    }
  } catch (error) {
    console.error("Error in verifyOtpAndSignIn:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred",
    };
  }
};

/**
 * Resend verification code with email validation
 * This allows resending from the verification page without requiring a session
 */
export const resendVerificationCode = async (
  email: string
): Promise<ActionResponse<{ message: string }>> => {
  try {
    // Find user by email
    const user = await db
      .select({
        id: users.id,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (user.length === 0) {
      return { 
        success: false, 
        error: "User not found. Please try signing in again.",
        data: { message: "Invalid user" }
      };
    }
    
    // Send verification code
    if (!user[0].phoneNumber) {
      return { 
        success: false, 
        error: "No phone number associated with this account",
        data: { message: "Missing phone number" }
      };
    }
    
    const result = await sendVerificationCode(user[0].id, user[0].phoneNumber);
    return result;
  } catch (error) {
    console.error("Error resending verification code:", error);
    return { 
      success: false, 
      error: "Failed to resend verification code",
      data: { message: "System error" }
    };
  }
};

/**
 * Sends a verification code to a phone number without requiring a userId
 * This is used for the booking flow when a user is not logged in
 */
export const sendOtpToPhoneNumber = async (
  phoneNumber: string
): Promise<ActionResponse<{ message: string }>> => {
  try {
    // Format the phone number to E.164 format
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Call Twilio Verify API to send verification code
    const twilioResponse = await sendVerification(formattedPhoneNumber, 'sms');
    
    if (!twilioResponse.success) {
      console.error("Twilio error:", twilioResponse.error);
      return { 
        success: false, 
        error: twilioResponse.error || "Failed to send verification code" 
      };
    }
    
    return { 
      success: true, 
      data: { 
        message: "Verification code sent successfully"
      } 
    };
  } catch (error) {
    console.error("Error sending verification code:", error);
    return { 
      success: false, 
      error: "Failed to send verification code" 
    };
  }
}; 