import { BirthdayEventStatus } from "@prisma/client";
import { env } from "@/src/config/env";
import { prisma } from "@/src/database/prisma";
import { findTodayBirthdays, findUpcomingBirthdays } from "@/src/services/member.service";
import { getSettings } from "@/src/services/settings.service";
import { generateBirthdayCard } from "@/src/services/image.service";
import { sendTelegramNotification } from "@/src/services/telegram.service";
import { buildBirthdayWhatsappLink } from "@/src/services/whatsapp.service";
import { daysUntilBirthday, nextBirthday, nowInTimezone } from "@/src/utils/date";

type TodayBirthdayScanOptions = {
  forceSend?: boolean;
  delayMs?: number;
};

export async function scanTodayBirthdays(options: TodayBirthdayScanOptions = {}) {
  const [settings, members] = await Promise.all([getSettings(), findTodayBirthdays()]);
  const today = nowInTimezone(settings.timezone);
  const results = [];
  const delayMs = options.delayMs ?? 6_000;

  for (const [index, member] of members.entries()) {
    try {
      const message = settings.defaultBirthdayMessage;
      const whatsappUrl = buildBirthdayWhatsappLink(member.phoneNumber, member.fullName, message);
      const event = await prisma.birthdayEvent.upsert({
        where: {
          memberId_eventDate: {
            memberId: member.id,
            eventDate: today
          }
        },
        create: {
          memberId: member.id,
          eventDate: today,
          status: BirthdayEventStatus.PENDING,
          templateId: settings.defaultTemplateId,
          greetingMessage: message,
          whatsappUrl
        },
        update: {
          templateId: settings.defaultTemplateId,
          greetingMessage: message,
          whatsappUrl
        }
      });

      if (!options.forceSend) {
        const existingNotification = await findExistingNotification(event.id);
        if (existingNotification) {
          results.push({ member, event, notification: existingNotification, skipped: true });
          continue;
        }
      }

      const card = await generateBirthdayCard({
        memberId: member.id,
        templateId: settings.defaultTemplateId,
        message,
        force: false
      });
      const updatedEvent = await prisma.birthdayEvent.update({
        where: { id: event.id },
        data: {
          status: BirthdayEventStatus.CARD_READY,
          cardImageUrl: card.imageUrl
        }
      });

      const notification = await sendTelegramNotification({
        eventId: event.id,
        imageUrl: card.imageUrl,
        text: `Today is ${member.fullName}'s birthday.\n\n${message}`,
        replyMarkup: {
          inline_keyboard: [
            [{ text: "View greeting", url: `${env.APP_BASE_URL}?member=${member.id}&template=${updatedEvent.templateId ?? settings.defaultTemplateId}` }],
            [{ text: "Open dashboard", url: env.APP_BASE_URL }]
          ]
        }
      });

      await prisma.birthdayEvent.update({
        where: { id: event.id },
        data: {
          status: eventStatusFromNotification(notification.status)
        }
      });

      results.push({ member, event: updatedEvent, notification });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown birthday scan error";
      const failedEvent = await prisma.birthdayEvent.upsert({
        where: {
          memberId_eventDate: {
            memberId: member.id,
            eventDate: today
          }
        },
        create: {
          memberId: member.id,
          eventDate: today,
          status: BirthdayEventStatus.FAILED,
          templateId: settings.defaultTemplateId,
          greetingMessage: settings.defaultBirthdayMessage,
          whatsappUrl: buildBirthdayWhatsappLink(member.phoneNumber, member.fullName, settings.defaultBirthdayMessage),
          metadata: { error: errorMessage }
        },
        update: {
          status: BirthdayEventStatus.FAILED,
          metadata: { error: errorMessage }
        }
      });
      const notification = await prisma.notificationLog.create({
        data: {
          eventId: failedEvent.id,
          channel: "SYSTEM",
          recipient: "dashboard",
          message: `Birthday notification failed for ${member.fullName}: ${errorMessage}`,
          status: "FAILED",
          attempts: 0,
          errorMessage
        }
      });

      results.push({ member, event: failedEvent, notification });
    }

    if (index < members.length - 1) {
      await wait(delayMs);
    }
  }

  return {
    scannedAt: new Date().toISOString(),
    count: results.length,
    results
  };
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scanUpcomingBirthdays(days = env.UPCOMING_REMINDER_DAYS) {
  const [settings, members] = await Promise.all([getSettings(), findUpcomingBirthdays(days)]);
  const today = nowInTimezone(settings.timezone);
  const results = [];

  for (const member of members) {
    const eventDate = nextBirthday(member.dateOfBirth, today);
    const distance = daysUntilBirthday(member.dateOfBirth, today);
    const event = await prisma.birthdayEvent.upsert({
      where: {
        memberId_eventDate: {
          memberId: member.id,
          eventDate
        }
      },
      create: {
        memberId: member.id,
        eventDate,
        status: BirthdayEventStatus.PENDING,
        templateId: settings.defaultTemplateId,
        greetingMessage: settings.defaultBirthdayMessage,
        whatsappUrl: buildBirthdayWhatsappLink(member.phoneNumber, member.fullName, settings.defaultBirthdayMessage),
        metadata: { reminderType: "upcoming", daysUntilBirthday: distance }
      },
      update: {
        metadata: { reminderType: "upcoming", daysUntilBirthday: distance }
      }
    });

    const existingNotification = await findExistingNotification(event.id);
    if (existingNotification) {
      results.push({ member, event, notification: existingNotification, skipped: true });
      continue;
    }

    const notification = await sendTelegramNotification({
      eventId: event.id,
      text: `${member.fullName}'s birthday is in ${distance} day${distance === 1 ? "" : "s"}.`,
      replyMarkup: {
        inline_keyboard: [[{ text: "Open dashboard", url: env.APP_BASE_URL }]]
      }
    });

    await prisma.birthdayEvent.update({
      where: { id: event.id },
      data: {
        status: eventStatusFromNotification(notification.status)
      }
    });

    results.push({ member, event, notification });
  }

  return {
    scannedAt: new Date().toISOString(),
    count: results.length,
    results
  };
}

async function findExistingNotification(eventId: string) {
  return prisma.notificationLog.findFirst({
    where: {
      eventId,
      channel: "TELEGRAM",
      status: "SENT"
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

function eventStatusFromNotification(status: string) {
  if (status === "SENT") return BirthdayEventStatus.NOTIFIED;
  if (status === "SKIPPED") return BirthdayEventStatus.SKIPPED;
  return BirthdayEventStatus.FAILED;
}
