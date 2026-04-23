export class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export const createHttpError = (status, message, details = null) =>
  new HttpError(status, message, details);

