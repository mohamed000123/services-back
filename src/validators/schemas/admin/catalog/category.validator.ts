import { body, param, query, ValidationChain } from "express-validator";

export const createCategorySchema: ValidationChain[] = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 128 })
    .withMessage("Name too long"),
];

export const updateCategorySchema: ValidationChain[] = [
  param("id").isUUID().withMessage("Invalid id"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ max: 128 }),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
];

export const listCategoryQuery: ValidationChain[] = [
  query("search").optional().isString(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("includeDeleted").optional().isBoolean().toBoolean(),
];

export const categoryIdParam: ValidationChain[] = [
  param("id").isUUID().withMessage("Invalid id"),
];
