import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { env } from "@/src/config/env";
import { HttpError } from "@/src/utils/http-error";

const uploadRoot = path.join(process.cwd(), "uploads");
let supabaseClient: SupabaseClient | null = null;
const verifiedBuckets = new Set<string>();

type SavePublicFileOptions = {
  bucket?: string;
  contentType?: string;
  objectPrefix?: string;
};

export async function savePublicFile(folder: string, filename: string, buffer: Buffer, options: SavePublicFileOptions = {}) {
  const safeFolder = folder.replace(/[^\w-]/g, "");
  const safeFilename = filename.replace(/[^\w.-]/g, "-");
  const objectPath =
    options.objectPrefix === ""
      ? safeFilename
      : `${(options.objectPrefix ?? safeFolder).replace(/[^\w/-]/g, "")}/${safeFilename}`;
  const bucket = options.bucket ?? env.SUPABASE_STORAGE_BUCKET;
  const contentType = options.contentType ?? contentTypeFromPath(objectPath);

  if (hasSupabaseStorageConfig(bucket)) {
    return saveSupabaseFile(bucket, objectPath, buffer, contentType);
  }

  if (env.SUPABASE_URL && !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(
      503,
      "Supabase Storage is configured but SUPABASE_SERVICE_ROLE_KEY is missing",
      "STORAGE_NOT_CONFIGURED"
    );
  }

  const directory = path.join(uploadRoot, safeFolder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, safeFilename), buffer);

  return `${env.PUBLIC_UPLOAD_BASE_URL}/${safeFolder}/${safeFilename}`;
}

function hasSupabaseStorageConfig(bucket: string) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && bucket);
}

async function saveSupabaseFile(bucket: string, objectPath: string, buffer: Buffer, contentType: string) {
  const client = getSupabaseClient();
  await ensureBucketExists(client, bucket);

  const { error } = await client.storage
    .from(bucket)
    .upload(objectPath, buffer, {
      cacheControl: "31536000",
      contentType,
      upsert: false
    });

  if (error) {
    throw mapSupabaseStorageError(error.message);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

async function ensureBucketExists(client: SupabaseClient, bucket: string) {
  if (verifiedBuckets.has(bucket)) return;

  const { error } = await client.storage.getBucket(bucket);
  if (!error) {
    verifiedBuckets.add(bucket);
    return;
  }

  if (!/not found|does not exist/i.test(error.message)) {
    throw mapSupabaseStorageError(error.message);
  }

  const { error: createError } = await client.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  });

  if (createError) {
    throw mapSupabaseStorageError(createError.message);
  }

  verifiedBuckets.add(bucket);
}

function mapSupabaseStorageError(message: string) {
  if (/row-level security|policy|permission|not authorized|unauthorized/i.test(message)) {
    return new HttpError(
      403,
      "Image upload is blocked by Supabase Storage permissions. Check the member-images bucket policies.",
      "STORAGE_PERMISSION_DENIED",
      { supabaseMessage: message }
    );
  }

  if (/not found|does not exist|bucket/i.test(message)) {
    return new HttpError(
      503,
      "The member image storage bucket is missing or unavailable.",
      "STORAGE_BUCKET_UNAVAILABLE",
      { supabaseMessage: message }
    );
  }

  return new HttpError(
    502,
    "Supabase Storage could not save the image. Please try again.",
    "STORAGE_UPLOAD_FAILED",
    { supabaseMessage: message }
  );
}

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        transport: WebSocket as never
      }
    });
  }

  return supabaseClient;
}

function contentTypeFromPath(objectPath: string) {
  if (objectPath.endsWith(".webp")) return "image/webp";
  if (objectPath.endsWith(".png")) return "image/png";
  if (objectPath.endsWith(".jpg") || objectPath.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}
