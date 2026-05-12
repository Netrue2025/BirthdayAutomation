import { prisma } from "@/src/database/prisma";
import { paginationMeta, paginationParams } from "@/src/utils/pagination";

export async function listNotificationLogs(page = 1, limit = 30) {
  const { skip, take } = paginationParams(page, limit);
  const [items, total] = await prisma.$transaction([
    prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        event: {
          include: {
            member: true
          }
        }
      }
    }),
    prisma.notificationLog.count()
  ]);

  return {
    items,
    meta: paginationMeta(page, limit, total)
  };
}

export async function deleteNotificationLog(id: string) {
  await prisma.notificationLog.deleteMany({ where: { id } });
}
