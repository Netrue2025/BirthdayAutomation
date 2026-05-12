import type { FastifyRequest } from "fastify";
import { whatsappQuerySchema } from "@/src/validators/whatsapp.validator";
import { createWhatsappUrl } from "@/src/utils/phone";
import { ok } from "@/src/utils/response";

export async function whatsappLinkController(request: FastifyRequest) {
  const query = whatsappQuerySchema.parse(request.query);
  return ok({
    url: createWhatsappUrl(query.phoneNumber, query.message)
  });
}
