import { Queue } from "bullmq";

import { defaultQueueOptions, redisConnection } from "@/config/queue";
import Logger from "@/utils/logger";
import type { EmailJobData, EmailJobType } from "@modules/auth/auth.types";

export const emailQueueName = "emailQueue";

export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueueOptions,
});

export const addEmailToQueue = async (
  jobType: EmailJobType,
  jobData: EmailJobData,
) => {
  await emailQueue.add(jobType, jobData);
};

emailQueue.on("error", (err) => {
  Logger.error(err);
});
