import "express-async-errors";
import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./logger";
import { prisma } from "./prisma";

async function main() {
  // Fail fast if the DB is unreachable.
  await prisma.$connect();
  const app = createApp();
  app.listen(config.port, () => {
    logger.info(`Nibbles & Naps API listening on port ${config.port}`, { env: config.nodeEnv });
  });
}

main().catch((err) => {
  logger.error("Failed to start server", { message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
