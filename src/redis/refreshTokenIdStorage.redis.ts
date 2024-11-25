import { redisClient } from "@/redis/redisClient";

function generateKey(userId: string): string {
  return `user:${userId}`;
}

export async function insert(userId: string, tokenId: string): Promise<void> {
  await redisClient.set(generateKey(userId), tokenId);
}

export async function validate(
  userId: string,
  tokenId: string,
): Promise<boolean> {
  const storedId = await redisClient.get(generateKey(userId));
  return storedId === tokenId;
}

export async function invalidate(userId: string): Promise<void> {
  await redisClient.del(generateKey(userId));
}
