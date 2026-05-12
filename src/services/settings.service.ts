import { prisma } from "@/src/database/prisma";
import { env } from "@/src/config/env";
import type { UpdateSettingsInput } from "@/src/validators/settings.validator";

const defaultSettingsId = "default";

export async function getSettings() {
  return prisma.appSettings.upsert({
    where: { id: defaultSettingsId },
    create: {
      id: defaultSettingsId,
      timezone: env.TIMEZONE,
      telegramBotToken: env.TELEGRAM_BOT_TOKEN || null,
      telegramChatId: env.TELEGRAM_CHAT_ID || null,
      telegramEnabled: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID)
    },
    update: {}
  });
}

export async function updateSettings(input: UpdateSettingsInput) {
  await getSettings();

  return prisma.appSettings.update({
    where: { id: defaultSettingsId },
    data: {
      ...input,
      logoUrl: input.logoUrl === undefined ? undefined : input.logoUrl || null,
      telegramBotToken:
        input.telegramBotToken === undefined ? undefined : input.telegramBotToken || null,
      telegramChatId: input.telegramChatId === undefined ? undefined : input.telegramChatId || null
    }
  });
}
