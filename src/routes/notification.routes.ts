import type { FastifyInstance } from "fastify";
import { deleteNotificationController, listNotificationsController } from "@/src/controllers/notification.controller";

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/", listNotificationsController);
  app.delete("/:id", deleteNotificationController);
}
