import { z } from "zod";

export const updateAppSettingsSchema = z.object({
  serviceFeeBps: z
    .number()
    .int("Service fee must be a whole number of basis points")
    .min(0, "Service fee cannot be negative")
    .max(2_000, "Service fee cannot exceed 20%"),
  bookingHoldMinutes: z
    .number()
    .int("Hold time must be whole minutes")
    .min(1, "Hold time must be at least 1 minute")
    .max(1_440, "Hold time cannot exceed 24 hours"),
});

export type UpdateAppSettingsInput = z.infer<typeof updateAppSettingsSchema>;
