"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "@/shared/lib/utils/auth-utils";
import { type ActionResponse } from "@/shared/lib/types/types";
import { saveAppSettings } from "@/features/app-settings/app-settings.service";
import { updateAppSettingsSchema } from "@/features/app-settings/app-settings.validation";
import type { AppSettings } from "@/features/app-settings/app-settings.types";

export async function updateAppSettings(
  raw: unknown
): Promise<ActionResponse<AppSettings>> {
  const adminAuth = await getAdminSession();
  if (adminAuth.error !== undefined) {
    return { success: false, error: adminAuth.error };
  }

  const parsed = updateAppSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const settings = await saveAppSettings(
      parsed.data,
      adminAuth.session.user.id
    );
    revalidatePath("/admin/settings");
    return { success: true, data: settings };
  } catch (error) {
    console.error("Error updating app settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
