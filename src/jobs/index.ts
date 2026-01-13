import type { Worker } from "bullmq";
import { startEmailWorker } from "@/jobs/email/email.worker";
import Logger from "@/utils/logger";

const workers: Worker[] = [];

const registerWorkers = () => {
	workers.push(startEmailWorker());
};

export const shutdownWorkers = async () => {
	await Promise.all(workers.map((worker) => worker.close()));
};

export const initJobs = () => {
	Logger.info("Initializing job workers...");
	registerWorkers();
	Logger.info(`${workers.length} worker(s) initialized`);
};
