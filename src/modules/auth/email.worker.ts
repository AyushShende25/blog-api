import { type Job, Worker } from "bullmq";

import { redisConnection } from "@/config/queue";
import { emailQueueName } from "@/modules/auth/email.producer";
import Email from "@/utils/emailService";
import Logger from "@/utils/logger";
import type { EmailJobData } from "@modules/auth/auth.types";

export const queueWorker = new Worker(
  emailQueueName,
  async (job: Job<EmailJobData>) => {
    const { email, username, emailVerificationCode } = job.data;

    const emailService = new Email({ username, to: email });

    if (job.name === "verification") {
      await emailService.sendVerificationCode(emailVerificationCode as string);
    } else if (job.name === "welcome") {
      await emailService.sendWelcome();
    }
  },
  {
    connection: redisConnection,
  },
);

queueWorker.on("error", (err) => {
  Logger.error(err);
});
