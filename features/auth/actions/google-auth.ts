"use server";

import { signIn } from "@/auth";

export async function googleSignIn(formData?: FormData): Promise<void> {
  const callbackUrl = (formData?.get("callbackUrl") as string) || "/";
  await signIn("google", { redirectTo: callbackUrl });
}