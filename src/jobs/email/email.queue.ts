import { Queue } from "bullmq";

import { defaultQueueOptions, redisConnection } from "@/config/queue";
import type { EmailJobData, EmailJobType } from "@/jobs/email/email.types";
import Logger from "@/utils/logger";

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
