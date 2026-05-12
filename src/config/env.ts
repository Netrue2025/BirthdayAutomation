import { z } from "zod";

const optionalUrl = z.string().url().or(z.literal(""));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4000),
  APP_BASE_URL: optionalUrl.default("http://localhost:3000"),
  API_BASE_URL: optionalUrl.default("http://localhost:4000"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000,http://localhost:4000"),
  DATABASE_URL: z.string().min(1),
  TIMEZONE: z.string().default("Africa/Lagos"),
  CRON_ENABLED: z.coerce.boolean().default(true),
  CRON_DAILY_SCHEDULE: z.string().default("0 8 * * *"),
  CRON_UPCOMING_SCHEDULE: z.string().default("15 8 * * *"),
  UPCOMING_REMINDER_DAYS: z.coerce.number().int().positive().default(7),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(""),
  TELEGRAM_CHAT_ID: z.string().optional().default(""),
  PUBLIC_UPLOAD_BASE_URL: optionalUrl.default("http://localhost:4000/uploads"),
  CARD_CACHE_TTL_DAYS: z.coerce.number().int().positive().default(30),
  SUPABASE_URL: z.string().url().or(z.literal("")).default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().default("uploads"),
  SUPABASE_MEMBER_IMAGES_BUCKET: z.string().default("member-images"),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default("")
});

const parsedEnv = envSchema.parse(process.env);

function inferDeploymentBaseUrl() {
  if (parsedEnv.API_BASE_URL) return parsedEnv.API_BASE_URL;
  if (parsedEnv.APP_BASE_URL) return parsedEnv.APP_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:4000";
}

const normalizedApiBaseUrl = inferDeploymentBaseUrl();
const normalizedAppBaseUrl = parsedEnv.APP_BASE_URL || normalizedApiBaseUrl;

function withRequiredPostgresSsl(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    const isPostgres = url.protocol === "postgresql:" || url.protocol === "postgres:";
    const isSupabase = url.hostname.includes("supabase.com") || url.hostname.includes("pooler.supabase.com");

    if (isPostgres && isSupabase && url.searchParams.get("sslmode") !== "require") {
      url.searchParams.set("sslmode", "require");
      return url.toString();
    }
  } catch {
    return databaseUrl;
  }

  return databaseUrl;
}

function normalizeUploadBaseUrl(publicUploadBaseUrl: string) {
  if (!publicUploadBaseUrl) {
    return `${normalizedApiBaseUrl}/uploads`;
  }

  if (publicUploadBaseUrl.includes("supabase.com/dashboard")) {
    return `${normalizedApiBaseUrl}/uploads`;
  }

  try {
    const url = new URL(publicUploadBaseUrl);
    if (url.hostname.endsWith(".supabase.co") && !url.pathname.includes("/storage/v1/object/public/")) {
      return `${normalizedApiBaseUrl}/uploads`;
    }
  } catch {
    return `${normalizedApiBaseUrl}/uploads`;
  }

  return publicUploadBaseUrl;
}

const normalizedDatabaseUrl = withRequiredPostgresSsl(parsedEnv.DATABASE_URL);
const inferredSupabaseUrl =
  parsedEnv.SUPABASE_URL ||
  (() => {
    try {
      const url = new URL(parsedEnv.PUBLIC_UPLOAD_BASE_URL);
      return url.hostname.endsWith(".supabase.co") ? `${url.protocol}//${url.hostname}` : "";
    } catch {
      return "";
    }
  })();

process.env.DATABASE_URL = normalizedDatabaseUrl;

export const env = {
  ...parsedEnv,
  APP_BASE_URL: normalizedAppBaseUrl,
  API_BASE_URL: normalizedApiBaseUrl,
  DATABASE_URL: normalizedDatabaseUrl,
  SUPABASE_URL: inferredSupabaseUrl,
  PUBLIC_UPLOAD_BASE_URL: normalizeUploadBaseUrl(parsedEnv.PUBLIC_UPLOAD_BASE_URL)
};

export const allowedOrigins = env.ALLOWED_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
