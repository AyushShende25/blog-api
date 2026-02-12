import type { LoginInput, SignupInput } from "@modules/auth/auth.schema";
import { hashPassword, verifyPassword } from "@modules/auth/auth.utils";
import { UserStatus } from "generated/prisma/enums";
import { env } from "@/config/env";
import { BadRequestError, ConflictError, UnAuthorizedError } from "@/errors";
import { addEmailJob } from "@/jobs/email/email.queue";
import { db } from "@/libs/db";
import { refreshTokenStore } from "@/store/refresh-token.store";

export const signup = async (signupInput: SignupInput) => {
	const { username, email, password } = signupInput;

	const existingUserByEmail = await db.user.findUnique({
		where: { email },
	});
	if (existingUserByEmail) {
		throw new ConflictError("email already in use");
	}

	const existingUserByUsername = await db.user.findUnique({
		where: { username },
	});

	if (existingUserByUsername) {
		throw new ConflictError("username already taken");
	}

	const hashedPassword = await hashPassword(password);

	const user = await db.user.create({
		data: { username, email, password: hashedPassword },
	});

	const verificationToken = crypto.randomUUID();
	await db.verificationToken.create({
		data: {
			id: verificationToken,
			userId: user.id,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hr
		},
	});

	await addEmailJob("verification", {
		type: "verification",
		email,
		username,
		code: verificationToken,
	});

	return { userId: user.id };
};

export const verifyEmail = async (token: string) => {
	const verificationToken = await db.verificationToken.findFirst({
		where: {
			id: token,
			expiresAt: { gt: new Date() },
		},
	});
	if (!verificationToken) {
		throw new BadRequestError("Invalid or expired verification token");
	}

	const user = await db.user.update({
		where: { id: verificationToken.userId, deletedAt: null },
		data: { isVerified: true },
	});
	if (!user) {
		throw new BadRequestError("Invalid token");
	}

	await db.verificationToken.deleteMany({
		where: { userId: user.id },
	});

	await addEmailJob("welcome", {
		type: "welcome",
		email: user.email,
		username: user.username,
	});
};

export const login = async (loginInput: LoginInput) => {
	const { email, password } = loginInput;

	const existingUser = await db.user.findFirst({
		where: { email, deletedAt: null },
	});

	if (!existingUser) {
		throw new UnAuthorizedError("Invalid Credentials");
	}
	if (!existingUser.isVerified) {
		throw new BadRequestError("Email not verified");
	}
	if (existingUser.status !== UserStatus.ACTIVE) {
		throw new UnAuthorizedError("Account is not active");
	}
	const isPasswordValid = await verifyPassword(password, existingUser.password);

	if (!isPasswordValid) {
		throw new UnAuthorizedError("Invalid credentials");
	}

	return {
		userId: existingUser.id,
		role: existingUser.role,
	};
};

export const refreshTokens = async (refreshTokenId: string) => {
	const userId = await refreshTokenStore.validate(refreshTokenId);

	if (!userId) {
		throw new UnAuthorizedError("Invalid refresh token");
	}

	const user = await db.user.findFirst({
		where: { id: userId, deletedAt: null },
		select: { role: true, status: true },
	});
	if (!user) {
		throw new UnAuthorizedError("User does not exist");
	}
	if (user.status !== UserStatus.ACTIVE) {
		throw new UnAuthorizedError("Account is not active");
	}

	await refreshTokenStore.revoke(refreshTokenId);

	const newRefreshTokenId = refreshTokenStore.generateTokenId();
	await refreshTokenStore.store({ tokenId: newRefreshTokenId, userId });

	return {
		userId,
		role: user.role,
		newRefreshTokenId,
	};
};

export const logout = async (refreshTokenId?: string) => {
	if (refreshTokenId) {
		await refreshTokenStore.revoke(refreshTokenId);
	}
};

export const logoutAll = async (userId: string) => {
	await refreshTokenStore.revokeAll(userId);
};

export const forgotPassword = async (email: string) => {
	const user = await db.user.findFirst({
		where: { email, deletedAt: null },
	});
	if (!user || !user.isVerified || user.status !== UserStatus.ACTIVE) {
		return;
	}

	const token = crypto.randomUUID();

	await db.passwordResetToken.deleteMany({
		where: { userId: user.id },
	});

	await db.passwordResetToken.create({
		data: {
			id: token,
			userId: user.id,
			expiresAt: new Date(Date.now() + env.RESET_TOKEN_TTL_MS),
		},
	});

	await addEmailJob("password-reset", {
		type: "password-reset",
		email,
		username: user.username,
		resetLink: `${env.CLIENT_URL}/reset-password?token=${token}`,
	});
};

export const resetPassword = async ({
	token,
	newPassword,
}: {
	token: string;
	newPassword: string;
}) => {
	const resetToken = await db.passwordResetToken.findFirst({
		where: {
			id: token,
			expiresAt: { gt: new Date() },
		},
	});
	if (!resetToken) {
		throw new BadRequestError("Invalid or expired reset token");
	}

	const hashedPassword = await hashPassword(newPassword);
	const user = await db.user.update({
		where: { id: resetToken.userId },
		data: { password: hashedPassword },
	});

	await db.passwordResetToken.deleteMany({
		where: { userId: resetToken.userId },
	});

	await addEmailJob("reset-success", {
		type: "reset-success",
		email: user.email,
		username: user.username,
	});
};
