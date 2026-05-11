import { Response } from "express";
import logger from "@/config/logger";
import { CustomError, UnprocessableError } from "./customError";

/**
 * Handles errors thrown in the application and sends appropriate HTTP responses.
 * Logs unexpected errors and formats known custom errors for the client.
 *
 * @param err - The error object thrown in the application.
 * @param res - The Express response object used to send the HTTP response.
 */
export const errorHandler = (err: unknown, res: Response): void => {
  if (err instanceof CustomError) {
    const response: {
      message: string;
      errors?: CustomError[];
    } & Record<string, unknown> = {
      message: err.message,
    };

    if (err instanceof UnprocessableError) {
      response.errors = err.errors;
    }
    if (err.details) {
      Object.assign(response, err.details);
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // eslint-disable-next-line no-console
  console.log(err);
  logger.error("An unexpected error occurred:", err);
  res.status(500).json({ error: "An unexpected error occurred" });
  return;
};
