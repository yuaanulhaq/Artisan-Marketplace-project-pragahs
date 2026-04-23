import { HttpError } from "../utils/httpError.js";

export const errorHandler = (error, _request, response, _next) => {
  const status = error instanceof HttpError ? error.status : 500;
  const message =
    error instanceof HttpError ? error.message : "Internal server error.";

  response.status(status).json({
    message,
    details: error instanceof HttpError ? error.details : null
  });
};

