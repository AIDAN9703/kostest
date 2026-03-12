"use server";

import { signOut } from "@/auth";

export async function signOutAction(): Promise<void> {
  // NextAuth signOut doesn't throw errors in most cases, it just redirects
  // So we don't need to wrap it in try/catch which was causing issues
  await signOut({ redirectTo: "/" });
} 