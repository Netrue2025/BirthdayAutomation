import type { FastifyRequest } from "fastify";
import { paginationSchema } from "@/src/utils/pagination";
import { deleteNotificationLog, listNotificationLogs } from "@/src/services/notification.service";
import { deleted, ok } from "@/src/utils/response";

export async function listNotificationsController(request: FastifyRequest) {
  const query = paginationSchema.parse(request.query);
  const result = await listNotificationLogs(query.page, query.limit);

  return ok(result.items, result.meta);
}

export async function deleteNotificationController(request: FastifyRequest) {
  const { id } = request.params as { id: string };
  await deleteNotificationLog(id);
  return deleted();
}
