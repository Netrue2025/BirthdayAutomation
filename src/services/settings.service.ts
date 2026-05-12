import { Prisma } from "@prisma/client";
import { prisma } from "@/src/database/prisma";
import { env } from "@/src/config/env";
import type { UpdateSettingsInput } from "@/src/validators/settings.validator";

const defaultSettingsId = "default";

export async function getSettings() {
  try {
    return await upsertSettings();
  } catch (error) {
    if (isMissingColumnError(error, "churchLogo")) {
      await prisma.$executeRaw`ALTER TABLE "AppSettings" ADD COLUMN IF NOT EXISTS "churchLogo" TEXT NOT NULL DEFAULT 'RJ'`;
      return upsertSettings();
    }

    throw error;
  }
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

function upsertSettings() {
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

function isMissingColumnError(error: unknown, column: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2022" &&
    JSON.stringify(error.meta ?? {}).includes(column)
  );
}
