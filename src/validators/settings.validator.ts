import { z } from "zod";

export const updateSettingsSchema = z.object({
  churchName: z.string().trim().min(2).max(120).optional(),
  churchLogo: z.string().trim().min(1).max(3).optional(),
  logoUrl: z.string().url().optional().nullable(),
  defaultTemplateId: z.string().trim().min(2).max(40).optional(),
  notificationTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  telegramBotToken: z.string().trim().optional().nullable(),
  telegramChatId: z.string().trim().optional().nullable(),
  telegramEnabled: z.boolean().optional(),
  defaultBirthdayMessage: z.string().trim().min(5).max(500).optional(),
  timezone: z.string().trim().min(3).max(80).optional()
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
