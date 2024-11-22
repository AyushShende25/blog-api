import { StatusCodes } from "http-status-codes";
import type { ZodIssue } from "zod";

import { BaseError } from "@/errors/BaseError";

export class RequestValidationError extends BaseError {
	StatusCode = StatusCodes.UNPROCESSABLE_ENTITY;

	constructor(public issues: ZodIssue[]) {
		super("Invalid request parameters");
		Object.setPrototypeOf(this, RequestValidationError.prototype);
	}

	serializeErrors() {
		return this.issues.map((issue) => {
			const field = issue.path.map((p) => p.toString()).join(".");
			return { message: issue.message, field };
		});
	}
}
