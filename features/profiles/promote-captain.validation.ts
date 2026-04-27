import * as z from "zod";

/** Admin "promote to captain" modal — core compliance + contact fields. */
export const promoteCaptainFormSchema = z.object({
  uscgLicensed: z.boolean(),
  licenseType: z.string().max(120).optional().nullable(),
  licenseNumber: z.string().max(120).optional().nullable(),
  licenseExpiry: z.string().optional().nullable(),
  emergencyContactName: z.string().max(200).optional().nullable(),
  emergencyContactPhone: z.string().max(50).optional().nullable(),
  yearsExperience: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(0).max(80).optional()
  ),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  adminNotes: z.string().max(2000).optional().nullable(),
});

export type PromoteCaptainFormInput = z.infer<typeof promoteCaptainFormSchema>;
