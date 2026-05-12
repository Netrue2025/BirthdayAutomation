import type { FastifyReply, FastifyRequest } from "fastify";
import sharp from "sharp";
import { env } from "@/src/config/env";
import { buildMemberImageFilename, MEMBER_IMAGES_BUCKET, validateMemberImage } from "@/lib/supabase/storage";
import { badRequest } from "@/src/utils/http-error";
import { ok } from "@/src/utils/response";
import { savePublicFile } from "@/src/services/storage.service";

export async function uploadProfileImageController(request: FastifyRequest, reply: FastifyReply) {
  const file = await request.file();
  if (!file) {
    throw badRequest("No file uploaded");
  }

  const source = await file.toBuffer();
  const validation = validateMemberImage({
    name: file.filename,
    size: source.length,
    type: file.mimetype
  });

  if (!validation.valid) {
    throw badRequest(validation.message);
  }

  const buffer = await sharp(source)
    .rotate()
    .resize(800, 800, { fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();
  const imageUrl = await savePublicFile(
    MEMBER_IMAGES_BUCKET,
    buildMemberImageFilename({ name: file.filename, type: "image/webp" }),
    buffer,
    {
      bucket: env.SUPABASE_MEMBER_IMAGES_BUCKET,
      contentType: "image/webp",
      objectPrefix: ""
    }
  );

  return reply.code(201).send(ok({ imageUrl }));
}
