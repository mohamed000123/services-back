/**
 * Base class for custom errors used throughout the application.
 * Contains a status code and a message describing the error.
 */
export class CustomError {
  public statusCode: number;
  public message: string;
  public details?: Record<string, unknown>;

  /**
   * Constructs a new CustomError instance.
   * @param message - The error message.
   * @param statusCode - The HTTP status code associated with the error.
   */
  constructor(
    message: string = "An unexpected error occurred",
    statusCode: number = 500,
    details?: Record<string, unknown>,
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Represents an error for unprocessable entities (HTTP 422).
 * Contains an array of underlying errors.
 */
export class UnprocessableError extends CustomError {
  public errors: CustomError[];

  /**
   * Constructs a new UnprocessableError instance.
   * @param errors - An array of CustomError instances representing validation or processing errors.
   * @param message - The error message.
   */
  constructor(errors: CustomError[], message: string = "Unprocessable Entity") {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Represents a not found error (HTTP 404).
 */
export class NotFoundError extends CustomError {
  /**
   * Constructs a new NotFoundError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Represents a no content error (HTTP 204).
 */
export class NoContent extends CustomError {
  /**
   * Constructs a new NoContent instance.
   * @param message - The error message.
   */
  constructor(message: string = "No content found") {
    super(message, 204);
  }
}

/**
 * Represents a duplicate entry error (HTTP 409).
 */
export class DuplicateError extends CustomError {
  /**
   * Constructs a new DuplicateError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Duplicate entry") {
    super(message, 409);
  }
}

/**
 * Represents a validation error (HTTP 400).
 */
export class ValidationError extends CustomError {
  /**
   * Constructs a new ValidationError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Validation failed") {
    super(message, 400);
  }
}

/**
 * Represents an unauthorized request error (HTTP 402).
 */
export class UnauthorizedError extends CustomError {
  /**
   * Constructs a new UnauthorizedError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Unauthorized") {
    super(message, 402);
  }
}
export class ExpiredRefreshTokenError extends CustomError {
  /**
   * Constructs a new ExpiredRefreshTokenError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Invalid or expired refresh token") {
    super(message, 401);
  }
}

/**
 * Represents a forbidden request error (HTTP 403).
 */
export class ForbiddenError extends CustomError {
  /**
   * Constructs a new ForbiddenError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

/**
 * Represents a not acceptable error (HTTP 406).
 */
export class NotAcceptableError extends CustomError {
  /**
   * Constructs a new NotAcceptableError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Not Acceptable") {
    super(message, 406);
  }
}

/**
 * Represents a too many requests error (HTTP 429).
 */
export class TooManyRequestsError extends CustomError {
  /**
   * Constructs a new TooManyRequestsError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Too many requests") {
    super(message, 429);
  }
}

/**
 * Represents a password setup required error (HTTP 403).
 */
export class PasswordSetupRequiredError extends CustomError {
  /**
   * Constructs a new PasswordSetupRequiredError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Please set your password first.") {
    super(message, 403, { requiresPasswordSetup: true });
  }
}

/**
 * Represents a generic server error (HTTP 500).
 */
export class ServerError extends CustomError {
  /**
   * Constructs a new ServerError instance.
   * @param message - The error message.
   */
  constructor(message: string = "Something went wrong, Please try again.") {
    super(message, 500);
  }
}
