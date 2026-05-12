import cron from "node-cron";
import type { FastifyInstance } from "fastify";
import { env } from "@/src/config/env";
import { scanTodayBirthdays, scanUpcomingBirthdays } from "@/src/services/birthday.service";
import { getSettings } from "@/src/services/settings.service";
import { sendTelegramNotification } from "@/src/services/telegram.service";
import { currentTimeInTimezone, formatDateOnly, nowInTimezone } from "@/src/utils/date";

const everyMinute = "* * * * *";

export function registerBirthdayJobs(app: FastifyInstance) {
  cron.schedule(
    everyMinute,
    async () => {
      try {
        const settings = await getSettings();
        const currentTime = currentTimeInTimezone(settings.timezone);

        if (currentTime < settings.notificationTime) {
          return;
        }

        const runKey = `${formatDateOnly(nowInTimezone(settings.timezone))}-${settings.notificationTime}`;
        if (app.schedulerState?.lastBirthdayRunKey === runKey) {
          return;
        }

        app.schedulerState = { ...app.schedulerState, lastBirthdayRunKey: runKey };
        app.log.info({ notificationTime: settings.notificationTime, timezone: settings.timezone }, "Running scheduled birthday notifications");

        const [todayResult, upcomingResult] = await Promise.all([
          scanTodayBirthdays({ forceSend: true, delayMs: 6_000 }),
          scanUpcomingBirthdays(env.UPCOMING_REMINDER_DAYS)
        ]);

        if (todayResult.count + upcomingResult.count === 0) {
          await sendTelegramNotification({
            text: `BirthdayFlow checked at ${settings.notificationTime}. No birthdays are due today or within the next ${env.UPCOMING_REMINDER_DAYS} day${env.UPCOMING_REMINDER_DAYS === 1 ? "" : "s"}.`,
            replyMarkup: {
              inline_keyboard: [[{ text: "Open dashboard", url: env.APP_BASE_URL }]]
            }
          });
        }

        app.log.info(
          { todayCount: todayResult.count, upcomingCount: upcomingResult.count },
          "Scheduled birthday notifications completed"
        );
      } catch (error) {
        app.log.error(error, "Scheduled birthday notifications failed");
      }
    },
    {
      timezone: env.TIMEZONE
    }
  );
}

declare module "fastify" {
  interface FastifyInstance {
    schedulerState?: {
      lastBirthdayRunKey?: string;
    };
  }
}
