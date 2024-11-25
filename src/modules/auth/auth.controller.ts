import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type { SignupInput, VerifyEmailInput } from "@modules/auth/auth.schema";
import { signupService, verifyEmailService } from "@modules/auth/auth.service";

export const signupHandler = async (
	req: Request<{}, {}, SignupInput>,
	res: Response,
) => {
	await signupService(req.body);
	res.status(StatusCodes.CREATED).json({
		message:
			"User registered successfully. Check your email to verify your account.",
	});
};

export const verifyEmailHandler = async (
	req: Request<{}, {}, VerifyEmailInput>,
	res: Response,
) => {
	await verifyEmailService(req.body);
	res.status(StatusCodes.OK).json({
		message: "Email successfully verified. You can now log in.",
	});
};
