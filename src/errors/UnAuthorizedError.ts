import { StatusCodes } from "http-status-codes";

import { BaseError } from "@/errors/BaseError";

export class UnAuthorizedError extends BaseError {
	StatusCode = StatusCodes.UNAUTHORIZED;

	constructor(public message = "Unauthorized") {
		super(message);

		Object.setPrototypeOf(this, UnAuthorizedError.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
