import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { scanTodayBirthdays, scanUpcomingBirthdays } from "@/src/services/birthday.service";
import { ok } from "@/src/utils/response";

const scanQuerySchema = z.object({
  mode: z.enum(["today", "upcoming"]).default("today"),
  days: z.coerce.number().int().positive().max(366).optional(),
  force: z
    .preprocess((value) => value === true || value === "true" || value === "1" || value === 1, z.boolean())
    .default(false)
});

export async function birthdayScanController(request: FastifyRequest) {
  const query = scanQuerySchema.parse(request.query);
  const result = query.mode === "today" ? await scanTodayBirthdays({ forceSend: query.force }) : await scanUpcomingBirthdays(query.days);
  return ok(result);
}
