import type { FastifyInstance } from "fastify";
import { birthdayScanController } from "@/src/controllers/birthday.controller";

export async function birthdayRoutes(app: FastifyInstance) {
  app.post("/scan", birthdayScanController);
}
