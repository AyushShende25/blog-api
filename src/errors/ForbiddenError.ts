import { BaseError } from "@/errors/BaseError";

export class ForbiddenError extends BaseError {
	StatusCode = 403;

	constructor(public message = "forbidden access") {
		super(message);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
