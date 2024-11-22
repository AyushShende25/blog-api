import type { StatusCodes } from "http-status-codes";

export abstract class BaseError extends Error {
	abstract StatusCode: StatusCodes;

	constructor(public message: string) {
		super(message);
		Object.setPrototypeOf(this, BaseError.prototype);
	}
	abstract serializeErrors(): { message: string; field?: string }[];
}
