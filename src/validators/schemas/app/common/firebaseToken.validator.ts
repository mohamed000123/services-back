import { body, ValidationChain } from "express-validator";

export const updateFirebaseTokenValidator: ValidationChain[] = [
  body("firebaseToken")
    .notEmpty()
    .withMessage("Firebase token is required")
    .bail()
    .isString()
    .withMessage("Firebase token must be a string"),
];
