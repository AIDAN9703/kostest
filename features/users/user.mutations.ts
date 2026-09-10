/**
 * Users Mutations (Server Actions) - CUD Operations Only
 */

"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { User } from "@/database/types";
import { ActionResponse } from "@/shared/lib/types/types";
import {
  CreateUserInput,
  UpdateUserInput,
  type QuickCreateUserInput,
} from "@/features/users/user.validation";
import { userService } from "@/features/users/user.service";

function toErrorString(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Generate a secure random password that meets validation requirements */
function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const num = "23456789";
  const special = "!@#$%";
  const pick = (s: string) => s[randomBytes(1)[0] % s.length];
  return `Temp${pick(upper)}${pick(lower)}${pick(num)}${pick(special)}${randomBytes(4).toString("hex")}`;
}

/** Derive unique username from email (e.g. johndoe_a1b2c3) */
function deriveUsername(email: string): string {
  const base =
    email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 20) || "user";
  const suffix = randomBytes(3).toString("hex");
  return `${base}_${suffix}`;
}

/**
 * Quick-create user from minimal fields (e.g. the booking composer).
 * Auto-generates username and temp password.
 */
export async function createUserQuick(
  data: QuickCreateUserInput
): Promise<ActionResponse<{ user: User }>> {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: "You are not authorized to create a user" };
  }

  try {
    const userData: CreateUserInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber ?? null,
      username: deriveUsername(data.email),
      password: generateTempPassword(),
      status: "ACTIVE",
      isAdmin: false,
      authProvider: "EMAIL",
      emailVerified: false,
      phoneVerified: false,
      identityVerified: false,
    };
    const newUser = await userService.createUser(userData);
    revalidatePath("/admin/users");
    return { success: true, data: { user: newUser } };
  } catch (error) {
    const msg = toErrorString(error);
    if (/duplicate|unique|already exists/i.test(msg)) {
      return { success: false, error: "A user with this email already exists." };
    }
    return { success: false, error: msg };
  }
}

/**
 * Create new user
 */
export async function createUser(
  userData: CreateUserInput
): Promise<ActionResponse<{ user: User }>> {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return { success: false, error: "You are not authorized to create a user" };
  }

  try {
    const newUser = await userService.createUser(userData);

    revalidatePath("/admin/users");
    return { success: true, data: { user: newUser } };
  } catch (error) {
    return { success: false, error: toErrorString(error) };
  }
}

/**
 * Update user (partial updates allowed)
 * Since all fields in UpdateUserInput are optional, we can pass partial updates
 */
export async function updateUser(
  id: string,
  updates: Partial<UpdateUserInput>
): Promise<ActionResponse<{ user: User }>> {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return { success: false, error: "You are not authorized to update this user" };
  }

  try {
    const updatedUser = await userService.updateUser(id, updates);

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);
    return { success: true, data: { user: updatedUser } };
  } catch (error) {
    return { success: false, error: toErrorString(error) };
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<ActionResponse<{ message: string }>> {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return { success: false, error: "You are not authorized to delete this user" };
  }

  try {
    await userService.deleteUser(id);
    revalidatePath("/admin/users");
    return { success: true, data: { message: "User deleted successfully" } };
  } catch (error) {
    return { success: false, error: toErrorString(error) };
  }
}
