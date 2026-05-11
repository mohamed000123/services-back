import { body, ValidationChain } from "express-validator";

export const loginWithEmailValidator: ValidationChain[] = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Email must be a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .bail()
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .bail()
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .bail()
    .matches(/^(?=.*\d)/)
    .withMessage("Password must contain at least one number"),
];

export const loginWithOtpValidator: ValidationChain[] = [
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .bail()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),

  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .bail()
    .isNumeric()
    .withMessage("OTP must contain only numbers")
    .bail()
    .isLength({ min: 4, max: 4 })
    .withMessage("OTP must be exactly 4 digits"),
];

export const generateOtpValidator: ValidationChain[] = [
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
];

export const changePasswordValidator: ValidationChain[] = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required")
    .isString(),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*\d)/)
    .withMessage("Password must contain at least one number"),
];

export const forgetPasswordValidator: ValidationChain[] = [
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isNumeric()
    .withMessage("OTP must contain only numbers")
    .isLength({ min: 4, max: 4 })
    .withMessage("OTP must be exactly 4 digits"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*\d)/)
    .withMessage("Password must contain at least one number"),
];

export const refreshTokenValidator: ValidationChain[] = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
    .bail()
    .isString()
    .withMessage("Refresh token must be a string"),
];
