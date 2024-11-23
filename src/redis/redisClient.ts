import { type RedisClientType, createClient } from "redis";

import Logger from "@/utils/logger";

let redisClient: RedisClientType;

async function initializeRedisClient() {
	if (!redisClient) {
		redisClient = createClient();
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