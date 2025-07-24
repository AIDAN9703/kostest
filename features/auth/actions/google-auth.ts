"use server";

import { signIn } from "@/auth";

export async function googleSignIn(): Promise<void> {
  // NextAuth signIn with OAuth providers handles redirects internally
  // and doesn't typically throw errors in this context
  await signIn("google", { redirectTo: "/" });
} 