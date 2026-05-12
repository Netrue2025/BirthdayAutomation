const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.member.count();
    console.log(`COUNT=${count}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`ERR=${message.split("\n").slice(-1)[0]}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main();
