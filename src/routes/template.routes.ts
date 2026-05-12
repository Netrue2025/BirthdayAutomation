import type { FastifyInstance } from "fastify";
import { listTemplatesController } from "@/src/controllers/template.controller";

export async function templateRoutes(app: FastifyInstance) {
  app.get("/", listTemplatesController);
}
