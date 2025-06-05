import "dotenv/config";

import app from "@/app";
import { env } from "@/config/env";
import Logger from "@/utils/logger";

process.on("uncaughtException", (err) => {
  Logger.error("UNCAUGHT EXCEPTION! 💥 Shutting Down...");
  Logger.error(err);
  process.exit(1);
});

const server = app.listen(env.PORT, () => {
  Logger.info(`API running on port ${env.PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("UNHANDLED REJECTION! 💥 Shutting Down...");
  Logger.error(reason);
  Logger.error(promise);
  server.close(() => {
    Logger.info("Server closed due to an unhandled rejection.");
    process.exit(1);
  });
});
