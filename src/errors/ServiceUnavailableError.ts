import { StatusCodes } from "http-status-codes";

import { BaseError } from "@/errors/BaseError";

export class ServiceUnavailableError extends BaseError {
  StatusCode = StatusCodes.SERVICE_UNAVAILABLE;

  constructor(public message = "Service Unavailable") {
    super(message);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
