import { createClient, type RedisClientType } from "redis";
import { env } from "@/config/env";
import Logger from "@/utils/logger";

let client: RedisClientType | null = null;

export const initRedis = async () => {
	if (client) return client;

	Logger.info("Connecting to Redis...");

	client = createClient({ url: env.REDIS_URL });

	client.on("connect", () => {
		console.log("[redis] connected");
	});

	client.on("error", (err) => {
		console.error("[redis] error:", err);
	});

	await client.connect();

	return client;
};

export const redis = (): RedisClientType => {
	if (!client) {
		throw new Error("Redis client not initialized. Call initRedis() first.");
	}
	return client;
};
