import type { FastifyInstance } from "fastify";
import { birthdayRoutes } from "@/src/routes/birthday.routes";
import { cardRoutes } from "@/src/routes/card.routes";
import { dashboardRoutes } from "@/src/routes/dashboard.routes";
import { memberRoutes } from "@/src/routes/member.routes";
import { notificationRoutes } from "@/src/routes/notification.routes";
import { settingsRoutes } from "@/src/routes/settings.routes";
import { templateRoutes } from "@/src/routes/template.routes";
import { uploadRoutes } from "@/src/routes/upload.routes";
import { whatsappRoutes } from "@/src/routes/whatsapp.routes";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    success: true,
    data: {
      status: "ok",
      service: "BirthdayFlow API",
      timestamp: new Date().toISOString()
    }
  }));

  await app.register(memberRoutes, { prefix: "/api/members" });
  await app.register(notificationRoutes, { prefix: "/api/notifications" });
  await app.register(templateRoutes, { prefix: "/api/templates" });
  await app.register(settingsRoutes, { prefix: "/api/settings" });
  await app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  await app.register(birthdayRoutes, { prefix: "/api/birthdays" });
  await app.register(cardRoutes, { prefix: "/api/cards" });
  await app.register(whatsappRoutes, { prefix: "/api/whatsapp" });
  await app.register(uploadRoutes, { prefix: "/api/uploads" });
}
