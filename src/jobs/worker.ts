import "dotenv/config";
import { Worker } from "bullmq";

import { redisConnection } from "@/config/queue";
import { processEmailJob } from "@/jobs/email/email.processor";
import { emailQueueName } from "@/jobs/email/email.queue";
import Logger from "@/utils/logger";

const workers = new Map();

const startEmailWorker = () => {
  const worker = new Worker(emailQueueName, processEmailJob, {
    connection: redisConnection,
  });

  // Event handlers
  worker.on("error", (err) => {
    Logger.error(`Worker error: ${err.message}`, { stack: err.stack });
  });

  worker.on("failed", (job, err) => {
    Logger.error(`Job ${job?.id} failed: ${err.message}`, {
      jobId: job?.id,
      jobName: job?.name,
      attempt: job?.attemptsMade,
    });
  });

  worker.on("completed", (job) => {
    Logger.info(`Job ${job.id} completed`, {
      jobId: job.id,
      jobName: job.name,
    });
  });

  workers.set(emailQueueName, worker);
  return worker;
};

const startAllWorkers = () => {
  startEmailWorker();
  Logger.info("All job workers started");
};

const shutdown = async () => {
  Logger.warn("Shutting down workers...");

  const closingPromises = [];
  for (const [name, worker] of workers.entries()) {
    Logger.warn(`Closing ${name} worker...`);
    closingPromises.push(worker.close());
  }

  await Promise.all(closingPromises);
  Logger.warn("All workers closed");
  process.exit(0);
};

// graceful shutdown
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start all workers when this file is executed directly
if (require.main === module) {
  Logger.info("Starting worker processes...");
  startAllWorkers();
}

export { startAllWorkers, startEmailWorker, workers };
