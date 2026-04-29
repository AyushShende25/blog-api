import {
	forgotPasswordSchema,
	loginSchema,
	resetPasswordSchema,
	signupSchema,
	tokenParamsSchema,
} from "@modules/auth/auth.schema";
import {
	forgotPassword,
	login,
	logout,
	logoutAll,
	refreshTokens,
	resetPassword,
	signup,
	verifyEmail,
} from "@modules/auth/auth.service";
import { signAccessToken } from "@modules/auth/auth.utils";
import type { Request, Response } from "express";
import { RolePermissions } from "@/authorization/role-permissions";
import { env } from "@/config/env";
import { UnAuthorizedError } from "@/errors";
import { refreshTokenStore } from "@/store/refresh-token.store";

export const signupController = async (req: Request, res: Response) => {
	const { username, email, password } = signupSchema.parse(req.body);

	await signup({ username, email, password });

	res.status(201).json({
		message:
			"User registered successfully. Check your email to verify your account.",
	});
};

export const verifyEmailController = async (req: Request, res: Response) => {
	const { token } = tokenParamsSchema.parse(req.query);

	await verifyEmail(token);

	res.status(200).json({
		message: "Email verified successfully",
	});
};

export const loginController = async (req: Request, res: Response) => {
	const { email, password } = loginSchema.parse(req.body);
	const { userId, role } = await login({ email, password });

	const permissions = RolePermissions[role];
	const accessToken = signAccessToken({ userId, role, permissions });

	const refreshTokenId = refreshTokenStore.generateTokenId();
	await refreshTokenStore.store({ tokenId: refreshTokenId, userId });

	res.cookie("access_token", accessToken, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: env.JWT_ACCESS_TOKEN_TTL_SECONDS * 1000,
	});

	res.cookie("refresh_token", refreshTokenId, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000,
	});

	res.status(200).json({ message: "User login success" });
};

export const refreshTokensController = async (req: Request, res: Response) => {
	const refreshTokenId = req.cookies?.refresh_token;
	if (!refreshTokenId) {
		throw new UnAuthorizedError("Missing refresh token");
	}
	const { newRefreshTokenId, userId, role } =
		await refreshTokens(refreshTokenId);

	const permissions = RolePermissions[role];
	const accessToken = signAccessToken({ userId, role, permissions });

	res.cookie("access_token", accessToken, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: env.JWT_ACCESS_TOKEN_TTL_SECONDS * 1000,
	});

	res.cookie("refresh_token", newRefreshTokenId, {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000,
	});

	res.status(200).json({ message: "new tokens generation successfull" });
};

export const logoutController = async (req: Request, res: Response) => {
	await logout(req.cookies?.refresh_token);

	res.clearCookie("access_token");
	res.clearCookie("refresh_token");

	res.status(204).end();
};

export const logoutAllController = async (req: Request, res: Response) => {
	await logoutAll(req.user!.id);

	res.clearCookie("access_token");
	res.clearCookie("refresh_token");

	res.status(204).end();
};

export const forgotPasswordController = async (req: Request, res: Response) => {
	const { email } = forgotPasswordSchema.parse(req.body);

	await forgotPassword(email);

	res.status(200).json({
		message: "If the email exists, a reset link has been sent",
	});
};

export const resetPasswordController = async (req: Request, res: Response) => {
	const { password } = resetPasswordSchema.parse(req.body);
	const { token } = tokenParamsSchema.parse(req.query);
	await resetPassword({ token, newPassword: password });

	res.status(200).json({
		message: "Password updated successfully",
	});
};
