import type { FastifyRequest } from "fastify";
import { getSettings, updateSettings } from "@/src/services/settings.service";
import { updateSettingsSchema } from "@/src/validators/settings.validator";
import { ok } from "@/src/utils/response";
import type { AppSettings } from "@prisma/client";

export async function getSettingsController() {
  return ok(serializeSettings(await getSettings()));
}

export async function updateSettingsController(request: FastifyRequest) {
  const body = updateSettingsSchema.parse(request.body);
  return ok(serializeSettings(await updateSettings(body)));
}

function serializeSettings(settings: AppSettings) {
  const { telegramBotToken, ...safeSettings } = settings;

  return {
    ...safeSettings,
    telegramBotTokenConfigured: Boolean(telegramBotToken)
  };
}
