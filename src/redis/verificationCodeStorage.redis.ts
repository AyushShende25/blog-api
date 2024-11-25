import { redisClient } from "@/redis/redisClient";

const generateVerificationKey = (verificationCode: string) => {
  return `verification-code:${verificationCode}`;
};

export const setVerificationCode = async (
  userId: string,
  verificationCode: string,
) => {
  const key = generateVerificationKey(verificationCode);
  await redisClient.set(key, userId, { EX: 60 * 10 });
};

export const getVerificationCode = async (verificationCode: string) => {
  const key = generateVerificationKey(verificationCode);
  return await redisClient.get(key);
};

export const deleteVerificationCode = async (verificationCode: string) => {
  const key = generateVerificationKey(verificationCode);
  await redisClient.del(key);
};
