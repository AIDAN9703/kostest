"use server"

import { db } from "@/database/db";
import { users } from "@/database/schema"; 
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/shared/lib/types/types";
import { sendVerification, checkVerification } from "@/shared/lib/services/twilio.service";
import { formatPhoneNumberE164 } from '@/shared/lib/utils/general-utils';
import { auth } from "@/auth";

/**
 * AUTHENTICATED USER FUNCTIONS
 * These are for logged-in users who want to add/verify their phone numbers
 */

/**
 * Sends verification code to authenticated user's phone number
 * Used in profile settings when users want to add/update their phone
 */
export const sendVerificationCodeToUser = async (
  phoneNumber: string
): Promise<ActionResponse<{ message: string }>> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

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

/**
 * Verifies phone code for authenticated user and updates their profile
 * Used in profile settings after user enters verification code
 */
export const verifyUserPhoneCode = async (
  phoneNumber: string,
  code: string
): Promise<ActionResponse<{ message: string }>> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Format the phone number to E.164 format
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Call Twilio Verify API to check the code
    const twilioResponse = await checkVerification(formattedPhoneNumber, code);
    
    if (!twilioResponse.success) {
      return { 
        success: false, 
        error: twilioResponse.error || "Invalid verification code" 
      };
    }
    
    // Update user's phone number and verification status
    await db
      .update(users)
      .set({ 
        phoneNumber: formattedPhoneNumber,
        phoneVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id));
    
    return { 
      success: true, 
      data: { 
        message: "Phone number verified and updated successfully" 
      } 
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
 * GUEST/BOOKING FUNCTIONS  
 * These are for non-authenticated users during the booking flow
 */

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

/**
 * Verifies a phone code for guest users (without userId)
 * This is used for the booking flow when a user is not logged in
 */
export const verifyGuestPhoneCode = async (
  phoneNumber: string,
  code: string
): Promise<ActionResponse<{ message: string }>> => {
  try {
    // Format the phone number to E.164 format
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Call Twilio Verify API to check the code
    const twilioResponse = await checkVerification(formattedPhoneNumber, code);
    
    if (!twilioResponse.success) {
      return { 
        success: false, 
        error: twilioResponse.error || "Invalid verification code" 
      };
    }
    
    return { 
      success: true, 
      data: { 
        message: "Phone number verified successfully" 
      } 
    };
  } catch (error) {
    console.error("Error verifying guest phone:", error);
    return { 
      success: false, 
      error: "Failed to verify phone number" 
    };
  }
}; 