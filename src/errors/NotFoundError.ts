import { StatusCodes } from "http-status-codes";

import { BaseError } from "@/errors/BaseError";

export class NotFoundError extends BaseError {
	StatusCode = StatusCodes.NOT_FOUND;

	constructor(public message = "Resource not found") {
		super(message);
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
