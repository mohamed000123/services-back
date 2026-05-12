import { body, param, query, ValidationChain } from "express-validator";

export const createServiceSchema: ValidationChain[] = [
  body("name").trim().notEmpty().isLength({ max: 128 }),
  body("description").optional().isString().isLength({ max: 512 }),
  body("price").isFloat({ gt: 0 }).withMessage("price must be positive"),
  body("categoryId").isUUID().withMessage("categoryId required"),
  body("isActive").optional().isBoolean(),
];

export const updateServiceSchema: ValidationChain[] = [
  param("id").isUUID(),
  body("name").optional().trim().notEmpty().isLength({ max: 128 }),
  body("description").optional().isString().isLength({ max: 512 }),
  body("price").optional().isFloat({ gt: 0 }),
  body("categoryId").optional().isUUID(),
  body("isActive").optional().isBoolean(),
];

export const listServiceQuery: ValidationChain[] = [
  query("categoryId").optional().isUUID(),
  query("search").optional().isString(),
  query("isActive").optional().isBoolean().toBoolean(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("includeDeleted").optional().isBoolean().toBoolean(),
];

export const serviceIdParam: ValidationChain[] = [param("id").isUUID()];
