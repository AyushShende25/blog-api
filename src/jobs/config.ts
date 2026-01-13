import type { ConnectionOptions, DefaultJobOptions } from "bullmq";
import { env } from "@/config/env";

export const redisConnection: ConnectionOptions = {
	url: env.REDIS_URL,
};

export const defaultJobOptions: DefaultJobOptions = {
	removeOnComplete: {
		age: 60 * 60,
		count: 20,
	},
	removeOnFail: {
		age: 7 * 24 * 60 * 60,
		count: 1000,
	},
	attempts: 3,
	backoff: {
		type: "exponential",
		delay: 3000,
	},
};
