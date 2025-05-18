import type { Job } from "bullmq";

import Email from "@/jobs/email/email.service";
import type { EmailJobData } from "@/jobs/email/email.types";
import Logger from "@/utils/logger";

export const processEmailJob = async (job: Job<EmailJobData>) => {
  Logger.info(`Processing ${job.name} email job`, { jobId: job.id });

  const { email, username, emailVerificationCode, resetLink } = job.data;

  const emailService = new Email({ username, to: email });

  try {
    if (job.name === "verification") {
      await emailService.sendVerificationCode(emailVerificationCode as string);
    } else if (job.name === "welcome") {
      await emailService.sendWelcome();
    } else {
      throw new Error(`Unknown job type: ${job.name}`);
    }
    Logger.info("Email sent successfully", { jobId: job.id, type: job.name });
    return { success: true };
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (error: any) {
    Logger.error(`Failed to send email: ${error.message}`, {
      jobId: job.id,
      type: job.name,
      error: error.message,
    });
    throw error;
  }
};
