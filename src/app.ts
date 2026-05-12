import path from "node:path";
import { mkdir, readFile } from "node:fs/promises";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import fastify, { type FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { allowedOrigins, env } from "@/src/config/env";
import { registerRoutes } from "@/src/routes";
import { HttpError } from "@/src/utils/http-error";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug"
    },
    bodyLimit: 1_000_000
  });

  app.addContentTypeParser("application/x-www-form-urlencoded", { parseAs: "string" }, (_request, body, done) => {
    done(null, body ? Object.fromEntries(new URLSearchParams(String(body))) : {});
  });

  await app.register(helmet, {
    global: true
  });

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed"), false);
    },
    credentials: true
  });

  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute"
  });

  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1
    }
  });

  if (!process.env.VERCEL) {
    const uploadRoot = path.join(process.cwd(), "uploads");
    await mkdir(uploadRoot, { recursive: true });

    app.get("/uploads/*", async (request, reply) => {
      const params = request.params as { "*": string };
      const filePath = path.resolve(uploadRoot, params["*"]);

      if (!filePath.startsWith(uploadRoot)) {
        return reply.code(404).send();
      }

      const file = await readFile(filePath);
      return reply.type(contentTypeFromPath(filePath)).send(file);
    });
  }

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof ZodError) {
      return reply.code(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request payload",
          details: error.flatten()
        }
      });
    }

    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return reply.code(400).send({
        success: false,
        error: {
          code: error.code,
          message: databaseErrorMessage(error),
          details: error.meta
        }
      });
    }

    if (error instanceof Prisma.PrismaClientInitializationError || error instanceof Prisma.PrismaClientRustPanicError) {
      return reply.code(500).send({
        success: false,
        error: {
          code: "DATABASE_CONNECTION_ERROR",
          message: databaseConnectionMessage(error)
        }
      });
    }

    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error && typeof error.statusCode === "number"
        ? error.statusCode
        : 500;
    const message = error instanceof Error ? error.message : "Unknown server error";

    return reply.code(statusCode).send({
      success: false,
      error: {
        code: statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR",
        message: env.NODE_ENV === "production" ? "Something went wrong" : message
      }
    });
  });

  await registerRoutes(app);

  return app;
}

function databaseErrorMessage(error: Prisma.PrismaClientKnownRequestError) {
  if (error.code === "P2022") {
    return "Database schema is missing a required column. Run Prisma migrations on the deployed database.";
  }

  if (error.code === "P2024") {
    return "Database connection pool timed out. Check the deployed DATABASE_URL connection_limit setting.";
  }

  return error.message || "Database request failed";
}

function databaseConnectionMessage(error: Error) {
  if (/ssl|tls|certificate/i.test(error.message)) {
    return "Database SSL connection failed. Use sslmode=require in DATABASE_URL.";
  }

  if (/authentication|password|credentials/i.test(error.message)) {
    return "Database authentication failed. Check DATABASE_URL in Vercel Environment Variables.";
  }

  return error.message || "Database connection failed. Check DATABASE_URL in Vercel Environment Variables.";
}

function contentTypeFromPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".webp") return "image/webp";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";

  return "application/octet-stream";
}
