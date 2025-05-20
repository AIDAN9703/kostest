"use server"

import { eq } from "drizzle-orm";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { hash, compare } from "bcryptjs";
import { signIn } from "@/auth";
import { ActionResponse } from "@/lib/types/types";
import { sendVerificationCode } from "./verification";
import { redirect } from "next/navigation";
import { formatPhoneNumberE164 } from '@/lib/utils/general-utils';
import { SignInData, SignUpData } from "@/lib/validation/validations";
import { checkVerification } from "@/lib/services/twilio";

export const signInAction = async (
  params: SignInData
): Promise<ActionResponse<{ message: string; redirectUrl?: string }>> => {
  const { email, password } = params;

  try {
    // Check if the user exists and if their phone is verified
    const userRecord = await db
      .select({
        id: users.id,
        phoneVerified: users.phoneVerified,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    // If user doesn't exist or password is incorrect, attempt sign in which will fail with appropriate error
    if (userRecord.length === 0) {
      const result = await signIn("credentials", { email, password, redirect: false });
      return { success: false, error: result?.error || "Invalid email or password" };
    }
    
    // Check if the password is correct before proceeding
    const user = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
      
    const isPasswordValid = await compare(password, user[0].password);
    if (!isPasswordValid) {
      return { success: false, error: "Invalid email or password" };
    }
    
    // If the user exists but their phone is not verified, don't sign them in, redirect to verification
    if (!userRecord[0].phoneVerified) {
      const phoneNumber = userRecord[0].phoneNumber || '';
      
      // Send a verification code to the user's phone
      if (phoneNumber) {
        await sendVerificationCode(userRecord[0].id, phoneNumber);
      }
      
      return { 
        success: false, 
        error: "Please verify your phone number before signing in",
        data: {
          message: "Phone verification required",
          redirectUrl: `/verify?phone=${encodeURIComponent(phoneNumber)}&email=${encodeURIComponent(email)}`
        }
      };
    }
    
    // Normal sign in for verified users
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
    // Format the phone number to E.164 format
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
      // Ensure phoneVerified is set to false
      phoneVerified: false
    }).returning({ id: users.id });

    // Send verification code to the user's phone
    if (formattedPhoneNumber && newUser?.id) {
      await sendVerificationCode(newUser.id, formattedPhoneNumber);
    }

    // Don't sign in the user yet - redirect to verification page
    return { 
      success: true, 
      data: { 
        message: "Account created. Please verify your phone number to continue.",
        redirectUrl: `/verify?phone=${encodeURIComponent(formattedPhoneNumber || '')}&email=${encodeURIComponent(email)}`
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
      phoneVerified: true, // Already verified via OTP
      displayName: `${userData.firstName} ${userData.lastName}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "ACTIVE",
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
      
      // Sign the existing user in directly
      try {
        await signIn("credentials-token", {
          userId: existingUser[0].id,
          email: existingUser[0].email,
          redirect: false,
        });
      } catch (signInError) {
        console.error("Error signing in existing user:", signInError);
        // Continue even if sign-in API fails - we still want to return the user
      }
      
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

