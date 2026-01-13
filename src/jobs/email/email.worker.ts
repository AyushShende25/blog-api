import { Worker } from "bullmq";
import { redisConnection } from "@/jobs/config";
import { processEmailJob } from "@/jobs/email/email.processor";
import { EMAIL_QUEUE } from "@/jobs/email/email.queue";
import type { EmailJobData } from "@/jobs/email/email.types";
import Logger from "@/utils/logger";

export const startEmailWorker = () => {
	const worker = new Worker<EmailJobData>(EMAIL_QUEUE, processEmailJob, {
		connection: redisConnection,
		concurrency: 5,
		limiter: {
			max: 10, // max 10 emails per second
			duration: 1000,
		},
	});

	worker.on("completed", (job) => {
		Logger.info(`Job ${job.id} completed`, {
			jobId: job.id,
			type: job.name,
		});
	});

	worker.on("failed", (job, err) => {
		Logger.error("Email job failed", {
			jobId: job?.id,
			type: job?.name,
			error: err.message,
		});
	});

	return worker;
};
