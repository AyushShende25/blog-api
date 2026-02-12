import { initJobs, shutdownWorkers } from "@/jobs";
import Logger from "@/libs/logger";

Logger.info("Starting worker process...");

initJobs();

let shuttingDown = false;

const shutdown = async (signal: string) => {
	if (shuttingDown) return;
	shuttingDown = true;
	Logger.warn(`Worker process received ${signal}, shutting down...`);

	try {
		await shutdownWorkers();
		Logger.info("All workers shut down successfully");
		process.exit(0);
	} catch (err) {
		Logger.error("Error during worker shutdown", err as Error);
		process.exit(1);
	}
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
