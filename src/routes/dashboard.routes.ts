import type { FastifyInstance } from "fastify";
import { dashboardController } from "@/src/controllers/dashboard.controller";

export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/", dashboardController);
}
