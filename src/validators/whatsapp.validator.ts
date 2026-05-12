import { z } from "zod";

export const whatsappQuerySchema = z.object({
  phoneNumber: z.string().min(7),
  message: z.string().max(500).optional()
});
