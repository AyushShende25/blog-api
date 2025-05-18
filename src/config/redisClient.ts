import { type RedisClientType, createClient } from "redis";

import { env } from "@/config/env";
import Logger from "@/utils/logger";

let redisClient: RedisClientType;

async function initializeRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: env.REDIS_URL });
    redisClient.on("error", (error) => {
      Logger.error(error);
    });
    redisClient.on("connect", () => {
      Logger.info("Redis connected");
    });
    await redisClient.connect();
  }
  return redisClient;
}

(async () => {
  await initializeRedisClient();
})();

export { redisClient };
