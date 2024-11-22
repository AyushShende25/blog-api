import { StatusCodes } from "http-status-codes";

import { BaseError } from "@/errors/BaseError";

export class BadRequestError extends BaseError {
	StatusCode = StatusCodes.BAD_REQUEST;

	constructor(public message: string) {
		super(message);
		Object.setPrototypeOf(this, BadRequestError.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
