import type { FastifyReply, FastifyRequest } from "fastify";
import { createMemberSchema, memberListQuerySchema, updateMemberSchema } from "@/src/validators/member.validator";
import { createMember, deleteMember, getMemberById, listMembers, updateMember } from "@/src/services/member.service";
import { deleted, ok } from "@/src/utils/response";

export async function listMembersController(request: FastifyRequest) {
  const query = memberListQuerySchema.parse(request.query);
  const result = await listMembers(query);
  return ok(result.items, result.meta);
}

export async function getMemberController(request: FastifyRequest) {
  const { id } = request.params as { id: string };
  return ok(await getMemberById(id));
}

export async function createMemberController(request: FastifyRequest, reply: FastifyReply) {
  const body = createMemberSchema.parse(request.body);
  const member = await createMember(body);
  return reply.code(201).send(ok(member));
}

export async function updateMemberController(request: FastifyRequest) {
  const { id } = request.params as { id: string };
  const body = updateMemberSchema.parse(request.body);
  return ok(await updateMember(id, body));
}

export async function deleteMemberController(request: FastifyRequest) {
  const { id } = request.params as { id: string };
  await deleteMember(id);
  return deleted();
}
