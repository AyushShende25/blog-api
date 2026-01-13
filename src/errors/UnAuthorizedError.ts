import { BaseError } from "@/errors/BaseError";

export class UnAuthorizedError extends BaseError {
	StatusCode = 401;

	constructor(public message = "Unauthorized") {
		super(message);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
