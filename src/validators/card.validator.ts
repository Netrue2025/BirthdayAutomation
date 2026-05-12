import { z } from "zod";

export const generateCardSchema = z.object({
  memberId: z.string().min(1),
  templateId: z.string().min(2).default("elegant"),
  message: z.string().trim().max(500).optional(),
  force: z.boolean().default(false)
});

export type GenerateCardInput = z.infer<typeof generateCardSchema>;
