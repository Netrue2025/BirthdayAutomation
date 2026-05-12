import type { FastifyInstance } from "fastify";
import {
  createMemberController,
  deleteMemberController,
  getMemberController,
  listMembersController,
  updateMemberController
} from "@/src/controllers/member.controller";

export async function memberRoutes(app: FastifyInstance) {
  app.get("/", listMembersController);
  app.post("/", createMemberController);
  app.get("/:id", getMemberController);
  app.patch("/:id", updateMemberController);
  app.delete("/:id", deleteMemberController);
}
