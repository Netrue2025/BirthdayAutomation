import { z } from "zod";
import { paginationSchema } from "@/src/utils/pagination";

export const createMemberSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phoneNumber: z.string().trim().min(7).max(30),
  dateOfBirth: z.string().trim().min(10).max(30),
  imageUrl: z.string().url().optional().or(z.literal("")),
  churchGroup: z.string().trim().max(80).optional().or(z.literal(""))
});

export const updateMemberSchema = createMemberSchema.partial();

export const memberListQuerySchema = paginationSchema.extend({
  search: z.string().trim().optional(),
  birthday: z.enum(["all", "today", "upcoming"]).default("all"),
  upcomingDays: z.coerce.number().int().positive().max(366).default(30),
  churchGroup: z.string().trim().optional()
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type MemberListQuery = z.infer<typeof memberListQuerySchema>;
