import { BaseError } from "@/errors/BaseError";

export class NotFoundError extends BaseError {
	StatusCode = 404;

	constructor(public message = "Resource not found") {
		super(message);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
