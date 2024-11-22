import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import { StatusCodes } from "http-status-codes";

import { env } from "@/config/env";
import { BaseError } from "@/errors";
import Logger from "@/utils/logger";

export const errorHandler: ErrorRequestHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (err instanceof BaseError) {
		res.status(err.StatusCode).json({ errors: err.serializeErrors() });
		return;
	}

	env.NODE_ENV === "development" && Logger.error(err);
	res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
		errors: [{ message: "Something went wrong" }],
	});
};
