import { z } from "zod";

export const SupportContactSchema = z.object({
  type: z.enum(["email", "phone", "website"]),
  value: z.string().min(1),
});

export type SupportContact = z.infer<typeof SupportContactSchema>;
