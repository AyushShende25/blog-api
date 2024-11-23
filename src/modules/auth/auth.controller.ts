import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type { SignupInput } from "@modules/auth/auth.schema";
import { signupService } from "@modules/auth/auth.service";

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
