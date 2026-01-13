import crypto from "node:crypto";
import { env } from "@/config/env";
import { redis } from "@/libs/redis";

const refreshTokenKey = (tokenId: string) => `refresh-token:${tokenId}`;

const activeTokensKey = (userId: string) => `active-refresh-tokens:${userId}`;

export const refreshTokenStore = {
	generateTokenId() {
		return crypto.randomUUID();
	},

	async store(
		tokenId: string,
		userId: string,
		ttlSeconds = env.REFRESH_TOKEN_TTL_SECONDS,
	) {
		await redis().set(refreshTokenKey(tokenId), userId, {
			expiration: { type: "EX", value: ttlSeconds },
		});
		await redis().sAdd(activeTokensKey(userId), tokenId);
		await redis().expire(activeTokensKey(userId), ttlSeconds);
	},

	async validate(tokenId: string): Promise<string | null> {
		return redis().get(refreshTokenKey(tokenId));
	},

	async revoke(tokenId: string) {
		const userId = await redis().get(refreshTokenKey(tokenId));
		if (userId) {
			await redis().sRem(activeTokensKey(userId), tokenId);
		}
		await redis().del(refreshTokenKey(tokenId));
	},

	async revokeAll(userId: string) {
		const tokens = await redis().sMembers(activeTokensKey(userId));
		if (tokens.length) {
			await redis().del(tokens.map(refreshTokenKey));
		}
		await redis().del(activeTokensKey(userId));
	},
};
