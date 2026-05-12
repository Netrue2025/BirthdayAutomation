import { BirthdayEventStatus } from "@prisma/client";
import { prisma } from "@/src/database/prisma";
import { env } from "@/src/config/env";
import { findTodayBirthdays, findUpcomingBirthdays } from "@/src/services/member.service";

export async function getDashboardAnalytics() {
  const [todayBirthdays, upcomingBirthdays, totalMembers, sentGreetingsCount] = await Promise.all([
    findTodayBirthdays(),
    findUpcomingBirthdays(env.UPCOMING_REMINDER_DAYS),
    prisma.member.count(),
    prisma.birthdayEvent.count({
      where: { status: BirthdayEventStatus.SENT }
    })
  ]);

  return {
    todayBirthdays,
    upcomingBirthdays,
    counts: {
      totalMembers,
      todayBirthdays: todayBirthdays.length,
      upcomingBirthdays: upcomingBirthdays.length,
      sentGreetings: sentGreetingsCount
    }
  };
}
