import type { ConnectionOptions, DefaultJobOptions } from "bullmq";

import { env } from "@/config/env";

export const redisConnection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};

export const defaultQueueOptions: DefaultJobOptions = {
  removeOnComplete: {
    age: 60 * 60,
    count: 20,
  },
  removeOnFail: false,
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 3000,
  },
};
