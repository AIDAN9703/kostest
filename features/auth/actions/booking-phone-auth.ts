"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { signIn } from "@/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { sendOtpToPhoneNumber, verifyGuestPhoneCode } from "@/features/auth/actions/verification";
import { createPhoneBookingProof } from "@/shared/lib/auth/phone-booking-proof";
import { ActionResponse } from "@/shared/lib/types/types";
import { formatPhoneNumberE164 } from "@/shared/lib/utils/general-utils";
import { checkVerification } from "@/shared/lib/services/twilio.service";

export async function sendBookingPhoneCode(
  phoneNumber: string,
): Promise<ActionResponse<{ message: string }>> {
  if (!phoneNumber.trim()) {
    return { success: false, error: "Enter your phone number" };
  }
  return sendOtpToPhoneNumber(phoneNumber);
}

export async function verifyBookingPhoneCode(
  phoneNumber: string,
  code: string,
): Promise<
  ActionResponse<{
    existingUser: boolean;
    message: string;
    proof?: string;
  }>
> {
  if (!phoneNumber.trim() || !code.trim()) {
    return { success: false, error: "Enter your phone number and code" };
  }

  const verifyResult = await verifyGuestPhoneCode(phoneNumber, code);
  if (!verifyResult.success) {
    return { success: false, error: verifyResult.error ?? "Invalid code" };
  }

  const formattedPhone = formatPhoneNumberE164(phoneNumber);
  const existing = await db
    .select({
      id: users.id,
      phoneVerified: users.phoneVerified,
    })
    .from(users)
    .where(eq(users.phoneNumber, formattedPhone))
    .limit(1);

  if (existing.length > 0) {
    if (!existing[0].phoneVerified) {
      await db
        .update(users)
        .set({ phoneVerified: true, updatedAt: new Date() })
        .where(eq(users.id, existing[0].id));
    }

    const proof = createPhoneBookingProof(existing[0].id, formattedPhone);
    const signInResult = await signIn("phone-booking", {
      proof,
      redirect: false,
    });

    if (signInResult && "error" in signInResult && signInResult.error) {
      return { success: false, error: "Could not sign you in. Try email instead." };
    }

    return {
      success: true,
      data: {
        existingUser: true,
        message: "Signed in successfully",
      },
    };
  }

  return {
    success: true,
    data: {
      existingUser: false,
      message: "Phone verified",
    },
  };
}

export async function completeBookingPhoneProfile(
  phoneNumber: string,
  code: string,
  profile: { firstName: string; lastName: string; email: string },
): Promise<ActionResponse<{ message: string }>> {
  const formattedPhone = formatPhoneNumberE164(phoneNumber);
  const firstName = profile.firstName.trim();
  const lastName = profile.lastName.trim();
  const email = profile.email.trim().toLowerCase();

  if (!firstName || !lastName || !email) {
    return { success: false, error: "Please fill in all fields" };
  }

  const checkResult = await checkVerification(formattedPhone, code.trim());
  if (!checkResult.success) {
    return { success: false, error: "Code expired or invalid. Request a new code." };
  }

  const existingPhone = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phoneNumber, formattedPhone))
    .limit(1);

  if (existingPhone.length > 0) {
    const proof = createPhoneBookingProof(existingPhone[0].id, formattedPhone);
    await signIn("phone-booking", { proof, redirect: false });
    return { success: true, data: { message: "Signed in successfully" } };
  }

  const existingEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingEmail.length > 0) {
    return {
      success: false,
      error: "An account with this email already exists. Sign in with email instead.",
    };
  }

  const generatedPassword = randomUUID();
  const hashedPassword = await hash(generatedPassword, 10);
  const username = `${email.split("@")[0]}_${Math.floor(Math.random() * 10000)}`;

  try {
    await db.insert(users).values({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      phoneNumber: formattedPhone,
      phoneVerified: true,
    });
  } catch (error) {
    console.error("completeBookingPhoneProfile:", error);
    return { success: false, error: "Could not create your account" };
  }

  const signInResult = await signIn("credentials", {
    email,
    password: generatedPassword,
    redirect: false,
  });

  if (signInResult && "error" in signInResult && signInResult.error) {
    return { success: false, error: "Account created but sign-in failed. Try signing in." };
  }

  return {
    success: true,
    data: { message: "You're all set!" },
  };
}
