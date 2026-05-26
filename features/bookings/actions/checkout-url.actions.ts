"use server";

import { auth } from "@/auth";
import { getOrCreateCheckoutUrl } from "@/features/bookings/actions/stripe-checkout";

/**
 * Admin-only thin wrapper around {@link getOrCreateCheckoutUrl} so it can be
 * invoked from a client component button. The underlying function is a regular
 * module (not a server action) because it's also called from other server-side
 * code paths (approval workflow, etc.).
 */
export async function getOrCreateCheckoutUrlAction(bookingId: string) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return { success: false as const, error: "Admin access required" };
    }
    const url = await getOrCreateCheckoutUrl(bookingId);
    return { success: true as const, url };
  } catch (error) {
    console.error("Failed to get/create checkout URL:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to create checkout link",
    };
  }
}
