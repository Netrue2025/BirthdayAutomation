import "dotenv/config";
import { buildApp } from "@/src/app";
import { env } from "@/src/config/env";
import { prisma } from "@/src/database/prisma";
import { registerBirthdayJobs } from "@/src/jobs/birthday.jobs";

async function start() {
  const app = await buildApp();

  if (env.CRON_ENABLED) {
    registerBirthdayJobs(app);
  }

  const shutdown = async () => {
    app.log.info("Shutting down BirthdayFlow API");
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await app.listen({
    host: env.HOST,
    port: env.PORT
  });
}

start().catch((error) => {
  // Keep bootstrap failures visible in container logs.
  console.error(error);
  process.exit(1);
});
