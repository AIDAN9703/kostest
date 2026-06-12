import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { appSettings } from "@/database/schema";
import {
  DEFAULT_APP_SETTINGS,
  bpsToRate,
} from "@/features/app-settings/app-settings.config";
import type { AppSettings } from "@/features/app-settings/app-settings.types";
import type { UpdateAppSettingsInput } from "@/features/app-settings/app-settings.validation";

const SETTINGS_ROW_ID = 1;

function toAppSettings(row: {
  serviceFeeBps: number;
  bookingHoldMinutes: number;
  updatedAt: Date | null;
}): AppSettings {
  return {
    serviceFeeBps: row.serviceFeeBps,
    serviceFeeRate: bpsToRate(row.serviceFeeBps),
    bookingHoldMinutes: row.bookingHoldMinutes,
    updatedAt: row.updatedAt,
  };
}

/**
 * Read global app settings (server-only). Deduplicated per request via React
 * cache, so pricing paths that call this multiple times hit the DB once.
 * Falls back to defaults until the admin saves the row for the first time.
 */
export const getAppSettings = cache(async (): Promise<AppSettings> => {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.id, SETTINGS_ROW_ID))
    .limit(1);

  return toAppSettings(row ?? { ...DEFAULT_APP_SETTINGS, updatedAt: null });
});

/** Upsert the singleton settings row. */
export async function saveAppSettings(
  input: UpdateAppSettingsInput,
  updatedByUserId: string
): Promise<AppSettings> {
  const [row] = await db
    .insert(appSettings)
    .values({
      id: SETTINGS_ROW_ID,
      serviceFeeBps: input.serviceFeeBps,
      bookingHoldMinutes: input.bookingHoldMinutes,
      updatedBy: updatedByUserId,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        serviceFeeBps: input.serviceFeeBps,
        bookingHoldMinutes: input.bookingHoldMinutes,
        updatedBy: updatedByUserId,
        updatedAt: new Date(),
      },
    })
    .returning();

  return toAppSettings(row);
}
