import { apiRequest } from "@/services/api-client";
import type { ChurchSettings, TemplateId } from "@/types";

type ApiSettings = {
  churchName: string;
  churchLogo?: string | null;
  logoUrl?: string | null;
  defaultTemplateId: TemplateId;
  notificationTime: string;
  telegramEnabled: boolean;
  telegramBotTokenConfigured?: boolean;
  telegramChatId?: string | null;
  defaultBirthdayMessage: string;
};

export async function fetchSettings() {
  const response = await apiRequest<ApiSettings>("/api/settings");
  return mapApiSettings(response.data);
}

export async function saveSettings(settings: Partial<ChurchSettings>) {
  const response = await apiRequest<ApiSettings>("/api/settings", {
    method: "PATCH",
    body: JSON.stringify({
      churchName: settings.churchName,
      churchLogo: settings.churchLogo,
      defaultTemplateId: settings.defaultTemplate,
      notificationTime: settings.notificationTime,
      defaultBirthdayMessage: settings.defaultMessage
    })
  });

  return mapApiSettings(response.data);
}

function mapApiSettings(settings: ApiSettings): ChurchSettings {
  return {
    churchName: settings.churchName,
    churchLogo: settings.churchLogo || initials(settings.churchName),
    defaultTemplate: settings.defaultTemplateId,
    notificationTime: settings.notificationTime,
    defaultMessage: settings.defaultBirthdayMessage,
    telegramConnected: settings.telegramEnabled && Boolean(settings.telegramBotTokenConfigured || settings.telegramChatId)
  };
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
