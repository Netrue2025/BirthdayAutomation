import type { FastifyInstance } from "fastify";
import { generateCardController } from "@/src/controllers/card.controller";

export async function cardRoutes(app: FastifyInstance) {
  app.post("/generate", generateCardController);
}
