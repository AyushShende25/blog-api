import { StatusCodes } from "http-status-codes";

import { BaseError } from "@/errors/BaseError";

export class ForbiddenError extends BaseError {
	StatusCode = StatusCodes.FORBIDDEN;

	constructor(public message = "forbidden access") {
		super(message);
		Object.setPrototypeOf(this, ForbiddenError.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
