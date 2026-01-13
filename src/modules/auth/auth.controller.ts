import {
	forgotPasswordSchema,
	loginSchema,
	resetPasswordSchema,
	signupSchema,
	verifyEmailSchema,
} from "@modules/auth/auth.schema";
import {
	forgotPasswordService,
	loginService,
	logoutAllService,
	logoutService,
	refreshTokensService,
	resetPasswordService,
	signupService,
	verifyEmailService,
} from "@modules/auth/auth.service";
import { signAccessToken } from "@modules/auth/auth.utils";
import type { Request, Response } from "express";
import { RolePermissions } from "@/authorization/role-permissions";
import { env } from "@/config/env";
import { UnAuthorizedError } from "@/errors";
import { refreshTokenStore } from "@/store/refresh-token.store";

export const signupHandler = async (req: Request, res: Response) => {
	const { username, email, password } = signupSchema.parse(req.body);

	await signupService({ username, email, password });

	res.status(201).json({
		message:
			"User registered successfully. Check your email to verify your account.",
	});
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
	const { token } = verifyEmailSchema.parse(req.query);

	await verifyEmailService({ token });

	res.status(200).json({
		message: "Email verified successfully",
	});
};

export const loginHandler = async (req: Request, res: Response) => {
	const { email, password } = loginSchema.parse(req.body);
	const { userId, role } = await loginService({ email, password });

	const permissions = RolePermissions[role];
	const accessToken = signAccessToken(userId, role, permissions);

	const refreshTokenId = refreshTokenStore.generateTokenId();
	await refreshTokenStore.store(userId, refreshTokenId);

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
		path: "/auth/refresh",
		maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000,
	});

	res.status(200).json({ message: "User login success" });
};

export const refreshTokensHandler = async (req: Request, res: Response) => {
	const refreshTokenId = req.cookies?.refresh_token;
	if (!refreshTokenId) {
		throw new UnAuthorizedError("Missing refresh token");
	}
	const { newRefreshTokenId, userId, role } =
		await refreshTokensService(refreshTokenId);

	const permissions = RolePermissions[role];
	const accessToken = signAccessToken(userId, role, permissions);

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
		path: "/auth/refresh",
		maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000,
	});

	res.status(200).json({ message: "new tokens generation successfull" });
};

export const logoutHandler = async (req: Request, res: Response) => {
	await logoutService(req.cookies?.refresh_token);

	res.clearCookie("access_token");
	res.clearCookie("refresh_token", { path: "/auth/refresh" });

	res.status(204).send();
};

export const logoutAllHandler = async (req: Request, res: Response) => {
	// biome-ignore lint/style/noNonNullAssertion: <authenticate middleware applied>
	await logoutAllService(req.user!.id);

	res.clearCookie("access_token");
	res.clearCookie("refresh_token", { path: "/auth/refresh" });

	res.status(204).send();
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
	const { email } = forgotPasswordSchema.parse(req.body);

	await forgotPasswordService({ email });

	res.status(200).json({
		message: "If the email exists, a reset link has been sent",
	});
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
	const { token, password } = resetPasswordSchema.parse(req.body);

	await resetPasswordService({ token, password });

	res.status(200).json({
		message: "Password updated successfully",
	});
};
