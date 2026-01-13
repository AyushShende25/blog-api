import { BaseError } from "@/errors/BaseError";

export class ConflictError extends BaseError {
	StatusCode = 409;

	constructor(public message = "Entity already exists") {
		super(message);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
