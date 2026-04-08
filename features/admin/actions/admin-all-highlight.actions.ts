"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { bookings, generalInquiries } from "@/database/schema";
import { isAdminAllHighlightId, type AdminAllHighlightId } from "@/features/admin/adminAllRowHighlight";
import { getAdminSession } from "@/shared/lib/utils/auth-utils";

export async function setAdminAllRowHighlight(
  kind: "booking" | "inquiry",
  id: string,
  highlight: AdminAllHighlightId | null
) {
  try {
    const authResult = await getAdminSession();
    if (authResult.error) return { success: false as const, error: authResult.error };
    if (!id?.trim()) return { success: false as const, error: "ID is required" };

    if (highlight != null && !isAdminAllHighlightId(highlight)) {
      return { success: false as const, error: "Invalid highlight" };
    }

    const value = highlight;

    if (kind === "booking") {
      await db
        .update(bookings)
        .set({
          adminAllRowHighlight: value,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, id));
      revalidatePath("/admin/all");
      revalidatePath(`/admin/bookings/${id}`);
    } else {
      await db
        .update(generalInquiries)
        .set({ adminAllRowHighlight: value, updatedAt: new Date() })
        .where(eq(generalInquiries.id, id));
      revalidatePath("/admin/all");
      revalidatePath(`/admin/inquiries/${id}`);
    }

    return { success: true as const };
  } catch (error) {
    console.error("setAdminAllRowHighlight:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update highlight",
    };
  }
}
