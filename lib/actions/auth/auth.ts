"use server"

import { eq } from "drizzle-orm";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { hash, compare } from "bcryptjs";
import { signIn } from "@/auth";
import { ActionResponse } from "@/types/types";
import { sendVerificationCode } from "./verification";
import { redirect } from "next/navigation";
import { formatPhoneNumberE164 } from '@/lib/utils';

export const signInAction = async (
  params: Pick<AuthCredentials, "email" | "password">
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
      
      // Create a temporary verification token and store it in the database
      const verificationToken = crypto.randomUUID();
      
      // Store the token with the user's email (you would need to add this field to your schema)
      await db
        .update(users)
        .set({ 
          verificationToken,
          verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
        })
        .where(eq(users.id, userRecord[0].id));
      
      return { 
        success: false, 
        error: "Please verify your phone number before signing in",
        data: {
          message: "Phone verification required",
          redirectUrl: `/verify?phone=${encodeURIComponent(phoneNumber)}&email=${encodeURIComponent(email)}&token=${verificationToken}`
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
  params: AuthCredentials
): Promise<ActionResponse<{ message: string; redirectUrl?: string }>> => {
  const { firstName, lastName, username, email, password, phoneNumber, birthday } = params;

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
    
    // Create a verification token
    const verificationToken = crypto.randomUUID();
    
    // Insert the new user
    const [newUser] = await db.insert(users).values({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      phoneNumber: formattedPhoneNumber,
      birthday: new Date(birthday),
      // Ensure phoneVerified is set to false
      phoneVerified: false,
      // Add verification token
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
    }).returning({ id: users.id });

    // Send verification code to the user's phone
    if (formattedPhoneNumber && newUser?.id) {
      await sendVerificationCode(newUser.id, formattedPhoneNumber);
    }

    // Don't sign in the user yet - redirect to verification page with token
    return { 
      success: true, 
      data: { 
        message: "Account created. Please verify your phone number to continue.",
        redirectUrl: `/verify?phone=${encodeURIComponent(formattedPhoneNumber || '')}&email=${encodeURIComponent(email)}&token=${verificationToken}`
      } 
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
};

