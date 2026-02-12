import bcrypt from "bcryptjs";
import type { Role } from "generated/prisma/enums";
import jwt from "jsonwebtoken";
import type { Permission } from "@/authorization/permissions";
import { env } from "@/config/env";
import type { AccessTokenPayload } from "./auth.types";

export const hashPassword = async (rawPassword: string) => {
	const salt = await bcrypt.genSalt(env.SALT_ROUNDS);
	return await bcrypt.hash(rawPassword, salt);
};

export const verifyPassword = async (
	inputPassword: string,
	storedPassword: string,
) => {
	return await bcrypt.compare(inputPassword, storedPassword);
};

export const signAccessToken = ({
	role,
	userId,
	permissions,
}: {
	userId: string;
	role: Role;
	permissions: Permission[];
}) => {
	const payload: AccessTokenPayload = {
		sub: userId,
		role,
		permissions,
	};

	return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
		expiresIn: env.JWT_ACCESS_TOKEN_TTL_SECONDS,
	});
};
