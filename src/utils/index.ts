import bcrypt from "bcrypt";

import { env } from "@/config/env";

export const hashPassword = async (rawPassword: string) => {
	return await bcrypt.hash(rawPassword, env.SALT_ROUNDS);
};

export const generateVerificationCode = () => {
	return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};
