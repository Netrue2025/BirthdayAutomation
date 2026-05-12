import type { FastifyInstance } from "fastify";
import { uploadProfileImageController } from "@/src/controllers/upload.controller";

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/profile-image", uploadProfileImageController);
}
