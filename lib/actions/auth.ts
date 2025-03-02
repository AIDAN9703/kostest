"use server"

import { eq } from "drizzle-orm";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { signIn } from "@/auth";
import { ActionResponse } from "@/types/types";

export const signInAction = async (
  params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse<{ message: string }>> => {
  const { email, password } = params;

  try {
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
): Promise<ActionResponse<{ message: string }>> => {
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
    await db.insert(users).values({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      birthday: new Date(birthday),
    });

    const signInResult = await signInAction({ email, password });
    if (!signInResult.success) {
      return { success: false, error: "User created but failed to sign in" };
    }

    return { success: true, data: { message: "User created successfully" } };
  } catch (error) {
    return { success: false, error: "Failed to create user" };
  }
};

