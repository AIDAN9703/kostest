"use server"

import { eq } from "drizzle-orm";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { hash, compare } from "bcryptjs";
import { signIn } from "@/auth";
import { ActionResponse } from "@/shared/types/types";
import { formatPhoneNumberE164 } from '@/shared/utils/general-utils';
import { SignInData, SignUpData } from "@/features/_validation/validations";
import { checkVerification } from "@/shared/services/twilio.service";

export const signInAction = async (
  params: SignInData
): Promise<ActionResponse<{ message: string; redirectUrl?: string }>> => {
  const { email, password } = params;

  try {
    // Simple sign in - no phone verification checks
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      return { success: false, error: result.error };
    }

    return { success: true, data: { message: "User signed in successfully" } };
  } catch (error) {
    console.log(error, "Error signing in with credentials");
    return { success: false, error: "Failed to sign in" };
  }
};

export const signUpAction = async (
  params: SignUpData
): Promise<ActionResponse<{ message: string; redirectUrl?: string }>> => {
  const { firstName, lastName, email, password, phoneNumber, birthday } = params;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  const hashedPassword = await hash(password, 10);

  try {
    // Format the phone number to E.164 format (optional)
    const formattedPhoneNumber = phoneNumber ? formatPhoneNumberE164(phoneNumber) : null;
    
    // Auto-generate username from email (same logic as in OAuth flow)
    const username = email.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
    
    // Insert the new user
    const [newUser] = await db.insert(users).values({
      firstName,
      lastName,
      username, // Auto-generated username
      email,
      password: hashedPassword,
      phoneNumber: formattedPhoneNumber,
      birthday: new Date(birthday),
      // phoneVerified defaults to false in schema - no need to set explicitly
    }).returning({ id: users.id });

    // Sign in the user immediately after account creation
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { 
      success: true, 
      data: { 
        message: "Account created and signed in successfully!",
        redirectUrl: "/" 
      } 
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
};

/**
 * Creates a new user in the booking flow with all required fields
 * This is an internal function used by handlePhoneAndOtpForBooking
 */
async function createUserFromBookingFlow(
  phoneNumber: string,
  userData: { firstName: string; lastName: string; email: string; password: string }
): Promise<ActionResponse<{ user: any; message: string }>> {
  try {
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);
      
    if (existingEmail.length > 0) {
      return {
        success: false,
        error: "An account with this email already exists"
      };
    }
    
    // Generate a username from email
    const username = userData.email.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
    
    // Hash the password
    const hashedPassword = await hash(userData.password, 10);
    
    // Create the new user with full details
    const [newUser] = await db.insert(users).values({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      username,
      password: hashedPassword,
      phoneNumber: formattedPhoneNumber,
      phoneVerified: true, // Already verified via OTP (only non-default we need)
      displayName: `${userData.firstName} ${userData.lastName}`,
      // createdAt, updatedAt, status all have defaults in schema
    }).returning();
    
    if (!newUser) {
      return {
        success: false,
        error: "Failed to create user account"
      };
    }
    
    // Attempt to sign the user in
    try {
      await signIn("credentials", {
        email: userData.email,
        password: userData.password,
        redirect: false,
      });
    } catch (signInError) {
      // Log but continue if sign-in fails
      console.error("Error signing in new user:", signInError);
    }
    
    return {
      success: true,
      data: { 
        user: newUser,
        message: "User account created successfully"
      }
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: "Failed to create user account"
    };
  }
}

/**
 * Process for verifying phone OTP in the booking flow
 * This version only verifies the phone number and returns the verification result
 * It does not create a temporary user - that happens after the account modal collects info
 */
export const handlePhoneAndOtpForBooking = async (
  phoneNumber: string,
  otp: string,
): Promise<ActionResponse<{ user?: any; message: string; existingUser?: boolean; }>> => {
  try {
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Step 1: Verify the OTP using the Twilio service
    const checkResult = await checkVerification(formattedPhoneNumber, otp);
    
    if (!checkResult.success) {
      return { 
        success: false, 
        error: "Invalid verification code" 
      };
    }
    
    // Step 2: Check if a user with this phone number already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, formattedPhoneNumber))
      .limit(1);
    
    if (existingUser.length > 0) {
      // Update phone verification status if not already verified
      if (!existingUser[0].phoneVerified) {
        await db
          .update(users)
          .set({ 
            phoneVerified: true,
            updatedAt: new Date()
          })
          .where(eq(users.id, existingUser[0].id));
      }
      
      // Note: We don't automatically sign in existing users in the booking flow
      // They should sign in through the normal auth process for security
      
      return {
        success: true,
        data: {
          user: existingUser[0],
          message: "Successfully verified and signed in",
          existingUser: true
        }
      };
    } 
    
    // For new users, just return success with the phone number
    // The actual user creation will happen after the complete account modal
    return {
      success: true,
      data: {
        user: { phoneNumber: formattedPhoneNumber, phoneVerified: true },
        message: "Phone verified. Please complete your account.",
        existingUser: false
      }
    };
  } catch (error) {
    console.error("Error in handlePhoneAndOtpForBooking:", error);
    return {
      success: false,
      error: "Failed to process phone verification"
    };
  }
};

/**
 * Completes the user account after phone verification in the booking flow
 * This replaces the minimal account logic with proper user creation
 */
export const completeUserAccountAfterVerification = async (
  phoneNumber: string,
  userData: { firstName: string; lastName: string; email: string; password: string }
): Promise<ActionResponse<{ user: any; message: string }>> => {
  try {
    const formattedPhoneNumber = formatPhoneNumberE164(phoneNumber);
    
    // Check if a user with this phone number already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, formattedPhoneNumber))
      .limit(1);
    
    if (existingUser.length > 0) {
      // Return the existing user
      return { 
        success: true, 
        data: { 
          user: existingUser[0],
          message: "User already exists with this phone number"
        } 
      };
    }
    
    // Create a new user with the provided information
    return await createUserFromBookingFlow(phoneNumber, userData);
  } catch (error) {
    console.error("Error completing user account:", error);
    return {
      success: false,
      error: "Failed to create user account"
    };
  }
};

