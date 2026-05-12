import type { FastifyInstance } from "fastify";
import { whatsappLinkController } from "@/src/controllers/whatsapp.controller";

export async function whatsappRoutes(app: FastifyInstance) {
  app.get("/link", whatsappLinkController);
}
