import { NextFunction, Request, Response } from "express";
import { Result, ValidationError, validationResult } from "express-validator";

/**
 * @module validateRequest
 * @description
 * Express middleware to handle validation results from `express-validator`.
 *
 * This middleware checks the request for validation errors produced by previous
 * `express-validator` middlewares. If any validation errors are found, it responds
 * with a 400 Bad Request status and a JSON object containing the array of errors.
 * If there are no validation errors, the request proceeds to the next middleware
 * or route handler.
 *
 * @param {Request} req - Express request object, expected to have been validated by `express-validator`.
 * @param {Response} res - Express response object, used to send a 400 response if validation fails.
 * @param {NextFunction} next - Express next middleware function.
 *
 * @returns {void} Calls `next()` if validation passes, or sends a 400 response with errors if validation fails.
 *
 * @example
 * // Usage in an Express route with express-validator
 * import { body } from "express-validator";
 * app.post(
 *   '/user',
 *   [
 *     body('email').isEmail(),
 *     body('password').isLength({ min: 6 }),
 *     validateRequest
 *   ],
 *   (req, res) => {
 *     res.send('User created!');
 *   }
 * );
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: Result<ValidationError> = validationResult(req);

  if (!errors.isEmpty()) {
    // Return the response with errors in case validation fails
    res.status(400).json({ errors: errors.array() });
    return; // Ensure we stop execution here
  }

  // If validation passes, proceed to the next middleware or route handler
  return next();
};
