import type { FastifyInstance } from "fastify";
import { getSettingsController, updateSettingsController } from "@/src/controllers/settings.controller";

export async function settingsRoutes(app: FastifyInstance) {
  app.get("/", getSettingsController);
  app.put("/", updateSettingsController);
  app.patch("/", updateSettingsController);
}
