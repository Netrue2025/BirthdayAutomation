import path from "node:path";
import { mkdir } from "node:fs/promises";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import fastify, { type FastifyInstance } from "fastify";
import staticPlugin from "@fastify/static";
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

  await mkdir(path.join(process.cwd(), "uploads"), { recursive: true });

  await app.register(staticPlugin, {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
    decorateReply: false
  });

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
          message: "Database request failed"
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
