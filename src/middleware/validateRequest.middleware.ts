import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

import { RequestValidationError } from "@/errors";

export const validate =
	<T>(schema: ZodSchema<T>) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		try {
			await schema.parseAsync({
				params: req.params,
				query: req.query,
				body: req.body,
			});
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				throw new RequestValidationError(error.issues);
			}
			next(error);
		}
	};
