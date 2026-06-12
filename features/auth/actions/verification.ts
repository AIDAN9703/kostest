"use server";

import { ActionResponse } from "@/shared/lib/types/types";
import { sendVerification, checkVerification } from "@/shared/lib/services/twilio.service";
import { formatPhoneNumberE164 } from "@/shared/lib/utils/general-utils";
import { checkRateLimit, getClientIp } from "@/shared/lib/utils/rate-limit";

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

    // SMS costs real money — throttle per phone number and per caller IP.
    const ip = await getClientIp();
    const perPhone = checkRateLimit(`otp-send:phone:${formattedPhoneNumber}`, {
      limit: 3,
      windowMs: 10 * 60 * 1000,
    });
    const perIp = checkRateLimit(`otp-send:ip:${ip}`, {
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (!perPhone.allowed || !perIp.allowed) {
      return {
        success: false,
        error: "Too many verification attempts. Please try again in a few minutes.",
      };
    }

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

    // Throttle brute-force code guessing (Twilio also caps check attempts).
    const check = checkRateLimit(`otp-check:phone:${formattedPhoneNumber}`, {
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (!check.allowed) {
      return {
        success: false,
        error: "Too many attempts. Please request a new code in a few minutes.",
      };
    }

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