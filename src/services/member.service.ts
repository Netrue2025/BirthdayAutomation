import { Prisma } from "@prisma/client";
import { prisma } from "@/src/database/prisma";
import { notFound } from "@/src/utils/http-error";
import { daysUntilBirthday, hasBirthdayToday, nowInTimezone, parseDateOnly } from "@/src/utils/date";
import { paginationMeta, paginationParams } from "@/src/utils/pagination";
import { sanitizePhoneNumber } from "@/src/utils/phone";
import type { CreateMemberInput, MemberListQuery, UpdateMemberInput } from "@/src/validators/member.validator";
import { getSettings } from "@/src/services/settings.service";

export async function createMember(input: CreateMemberInput) {
  return prisma.member.create({
    data: {
      fullName: input.fullName,
      phoneNumber: sanitizePhoneNumber(input.phoneNumber),
      dateOfBirth: parseDateOnly(input.dateOfBirth),
      imageUrl: input.imageUrl || null,
      churchGroup: input.churchGroup || null
    }
  });
}

export async function updateMember(id: string, input: UpdateMemberInput) {
  await getMemberById(id);

  return prisma.member.update({
    where: { id },
    data: {
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.phoneNumber !== undefined ? { phoneNumber: sanitizePhoneNumber(input.phoneNumber) } : {}),
      ...(input.dateOfBirth !== undefined ? { dateOfBirth: parseDateOnly(input.dateOfBirth) } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl || null } : {}),
      ...(input.churchGroup !== undefined ? { churchGroup: input.churchGroup || null } : {})
    }
  });
}

export async function deleteMember(id: string) {
  await getMemberById(id);

  await prisma.$transaction(async (tx) => {
    const events = await tx.birthdayEvent.findMany({
      where: { memberId: id },
      select: { id: true }
    });
    const eventIds = events.map((event) => event.id);

    if (eventIds.length > 0) {
      await tx.notificationLog.deleteMany({
        where: {
          eventId: {
            in: eventIds
          }
        }
      });
    }

    await tx.birthdayEvent.deleteMany({ where: { memberId: id } });
    await tx.generatedCard.deleteMany({ where: { memberId: id } });
    await tx.member.delete({ where: { id } });
  });
}

export async function getMemberById(id: string) {
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) {
    throw notFound("Member not found");
  }

  return member;
}

export async function listMembers(query: MemberListQuery) {
  const settings = await getSettings();
  const today = nowInTimezone(settings.timezone);
  const where: Prisma.MemberWhereInput = {
    ...(query.search
      ? {
          OR: [
            { fullName: { contains: query.search, mode: "insensitive" } },
            { phoneNumber: { contains: query.search } },
            { churchGroup: { contains: query.search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(query.churchGroup ? { churchGroup: { equals: query.churchGroup, mode: "insensitive" } } : {})
  };

  if (query.birthday === "all") {
    const { skip, take } = paginationParams(query.page, query.limit);
    const [items, total] = await prisma.$transaction([
      prisma.member.findMany({
        where,
        orderBy: [{ fullName: "asc" }],
        skip,
        take
      }),
      prisma.member.count({ where })
    ]);

    return {
      items,
      meta: paginationMeta(query.page, query.limit, total)
    };
  }

  const candidates = await prisma.member.findMany({
    where,
    orderBy: [{ fullName: "asc" }]
  });

  const filtered = candidates
    .filter((member) => {
      if (query.birthday === "today") {
        return hasBirthdayToday(member.dateOfBirth, today);
      }
      const days = daysUntilBirthday(member.dateOfBirth, today);
      return days > 0 && days <= query.upcomingDays;
    })
    .sort((a, b) => daysUntilBirthday(a.dateOfBirth, today) - daysUntilBirthday(b.dateOfBirth, today));

  const start = (query.page - 1) * query.limit;
  const items = filtered.slice(start, start + query.limit);

  return {
    items,
    meta: paginationMeta(query.page, query.limit, filtered.length)
  };
}

export async function findTodayBirthdays() {
  const settings = await getSettings();
  const today = nowInTimezone(settings.timezone);
  const members = await prisma.member.findMany({ orderBy: { fullName: "asc" } });
  return members.filter((member) => hasBirthdayToday(member.dateOfBirth, today));
}

export async function findUpcomingBirthdays(days: number) {
  const settings = await getSettings();
  const today = nowInTimezone(settings.timezone);
  const members = await prisma.member.findMany({ orderBy: { fullName: "asc" } });
  return members
    .filter((member) => {
      const distance = daysUntilBirthday(member.dateOfBirth, today);
      return distance > 0 && distance <= days;
    })
    .sort((a, b) => daysUntilBirthday(a.dateOfBirth, today) - daysUntilBirthday(b.dateOfBirth, today));
}
