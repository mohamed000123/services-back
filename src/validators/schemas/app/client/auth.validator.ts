import { body, ValidationChain } from "express-validator";

export const signupValidator: ValidationChain[] = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email must be a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  // TODO: missing some validations to check strong password
  body("phone")
    .notEmpty()
    .withMessage("phone number is required")
    .isMobilePhone("any")
    .withMessage("invalid phone number"),
  body("otp")
    .notEmpty()
    .withMessage("otp is required")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 4, max: 4 })
    .withMessage("OTP must be 4 characters long"),
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isString()
    .withMessage("Full name must be a string"),
];
