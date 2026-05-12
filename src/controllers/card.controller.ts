import type { FastifyRequest } from "fastify";
import { generateBirthdayCard } from "@/src/services/image.service";
import { generateCardSchema } from "@/src/validators/card.validator";
import { ok } from "@/src/utils/response";

export async function generateCardController(request: FastifyRequest) {
  const body = generateCardSchema.parse(request.body);
  return ok(await generateBirthdayCard(body));
}
