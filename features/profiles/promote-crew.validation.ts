import * as z from "zod";

export const promoteCrewFormSchema = z.object({
  adminNotes: z.string().max(2000).optional().nullable(),
});

export type PromoteCrewFormInput = z.infer<typeof promoteCrewFormSchema>;
