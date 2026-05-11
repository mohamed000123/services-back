import { body, ValidationChain } from "express-validator";

export const crateAdminSchema: ValidationChain[] = [
  body("data.fullName").notEmpty().withMessage("Full name is required"),
  body("data.email").isEmail().withMessage("Valid email is required"),
  body("data.password")
    .isLength({ min: 20 })
    .withMessage("Password must be at least 20 characters long"),
  body("data.confirm_password")
    .isLength({ min: 20 })
    .withMessage("Confirm password must be at least 20 characters long"),
];

export const updateAdminSchema: ValidationChain[] = [
  body("data.fullName").notEmpty().withMessage("Full name is required"),
  body("data.email").isEmail().withMessage("Valid email is required"),
  body("data.role")
    .optional()
    .isIn(["SUPER_ADMIN", "ADMIN"])
    .withMessage("role must be SUPER_ADMIN or ADMIN"),
];

export const updateAdminSelfSchema: ValidationChain[] = [
  body("data.fullName").notEmpty().withMessage("Full name is required"),
  body("data.email").isEmail().withMessage("Valid email is required"),
  body("data.password")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Password must be at least 20 characters long"),
  body("data.confirm_password")
    .isLength({ min: 20 })
    .optional()
    .withMessage("Confirm password must be at least 20 characters long"),
];
