import { Queue } from "bullmq";
import { defaultJobOptions, redisConnection } from "@/jobs/config";
import type { EmailJobData, EmailJobType } from "@/jobs/email/email.types";

export const EMAIL_QUEUE = "email";

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE, {
	connection: redisConnection,
	defaultJobOptions,
});

export const addEmailJob = (type: EmailJobType, data: EmailJobData) =>
	emailQueue.add(type, data);
