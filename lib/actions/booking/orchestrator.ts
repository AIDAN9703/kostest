"use server";

import { InitialBookingDetails } from "@/lib/validation/validations";
import { sendOtpToPhoneNumber } from "../auth/verification";
import { checkVerification } from "@/lib/services/twilio";
import { auth } from "@/auth";
import { createBookingRequest, createInstantBooking } from "@/lib/actions/booking";
import { formatPhoneNumberE164 } from '@/lib/utils/general-utils';

/**
 * Starts the initial booking process and checks user authentication status
 * This is the first step in the multi-step booking flow
 */
export async function initiateBookingProcess(
  initialDetails: InitialBookingDetails,
  boatId: string
) {
  // Check if the user is already authenticated
  const session = await auth();
  
  // If user is authenticated and phone verified, they can skip to the final step
  if (session?.user?.id && session?.user?.phoneVerified) {
    return {
      success: true,
      data: {
        stepComplete: true,
        user: session.user,
        nextStep: "fullForm",
        initialDetails
      }
    };
  }
  
  // If user is authenticated but phone not verified, they need to verify phone
  if (session?.user?.id && !session?.user?.phoneVerified) {
    return {
      success: true,
      data: {
        stepComplete: true,
        user: session.user,
        nextStep: "phoneInput",
        initialDetails,
        message: "Please verify your phone number to continue"
      }
    };
  }
  
  // If user is not authenticated, they need to start from phone input
  return {
    success: true,
    data: {
      stepComplete: true,
      nextStep: "phoneInput",
      initialDetails,
      message: "Please enter your phone number to continue"
    }
  };
}

/**
 * Handles the phone number submission step
 * Sends an OTP to the provided phone number
 */
export async function handlePhoneNumberStep(phoneNumber: string) {
  try {
    // Send the verification code using Twilio
    const result = await sendOtpToPhoneNumber(phoneNumber);
    
    if (result.success) {
      return {
        success: true,
        data: {
          message: "Verification code sent successfully"
        }
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to send verification code"
      };
    }
  } catch (error) {
    console.error("Error in handlePhoneNumberStep:", error);
    return {
      success: false,
      error: "Failed to send verification code"
    };
  }
}

/**
 * Handles the OTP verification step
 * Verifies the OTP but doesn't create a user
 */
export async function handleOtpVerificationStep(
  phoneNumber: string,
  otp: string
) {
  try {
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Verify the OTP with Twilio
    const result = await checkVerification(formattedPhoneNumber, otp);
    
    if (result.success) {
      // Just return success with the phone number
      // User creation will happen after the complete account modal
      return {
        success: true,
        data: {
          user: { phoneNumber: formattedPhoneNumber, phoneVerified: true },
          message: "Phone verification successful"
        }
      };
    } else {
      return {
        success: false,
        error: "Invalid verification code"
      };
    }
  } catch (error) {
    console.error("Error in handleOtpVerificationStep:", error);
    return {
      success: false,
      error: "Failed to verify code"
    };
  }
}

/**
 * Finalizes the booking with complete user data and booking details
 */
export async function finalizeBooking(
  fullBookingData: any,
  bookingType: "REQUEST" | "INSTANT",
  boatId: string
) {
  try {
    // Call the appropriate booking action based on booking type
    const serverAction = bookingType === "REQUEST" 
      ? createBookingRequest 
      : createInstantBooking;
    
    // Add boatId to the booking data
    const bookingData = {
      ...fullBookingData,
      boatId
    };
    
    // Call the server action to create the booking
    return await serverAction(bookingData);
  } catch (error) {
    console.error("Error in finalizeBooking:", error);
    return {
      success: false,
      error: "Failed to create booking"
    };
  }
} 