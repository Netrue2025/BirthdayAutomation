import type { FastifyReply, FastifyRequest } from "fastify";

export type FastifyHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<unknown>;

export function asyncHandler(handler: FastifyHandler) {
  return async (request: FastifyRequest, reply: FastifyReply) => handler(request, reply);
}
