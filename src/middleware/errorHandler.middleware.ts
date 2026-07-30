import type {
	ErrorRequestHandler,
	NextFunction,
	Request,
	Response,
} from "express";
import { ZodError } from "zod";
import { env } from "@/config/env";
import { BaseError } from "@/errors";
import Logger from "@/libs/logger";

export const errorHandler: ErrorRequestHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (err instanceof ZodError) {
		return res.status(422).json(
			err.issues.map((issue) => ({
				message: issue.message,
				...(issue.path.length > 0 && { path: issue.path.join(".") }),
			})),
		);
	}
	if (err instanceof BaseError) {
		return res.status(err.StatusCode).json(err.serializeErrors());
	}

	Logger.error(`Error:${err}`);

	if (env.NODE_ENV === "production") {
		return res.status(500).json([{ message: "Something went wrong" }]);
	}

	return res.status(500).json({
		message: err.message,
		stack: err.stack,
	});
};
