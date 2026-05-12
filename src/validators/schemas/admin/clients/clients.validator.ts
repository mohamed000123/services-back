import { body, param, query, ValidationChain } from "express-validator";

export const listClientsQuery: ValidationChain[] = [
  query("search").optional().isString(),
  query("searchBy").optional().isIn(["fullName", "email"]),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const clientIdParam: ValidationChain[] = [param("id").isUUID()];

export const createClientSchema: ValidationChain[] = [
  body("phone").trim().notEmpty().isLength({ max: 128 }),
  body("email").trim().isEmail(),
  body("fullName").trim().notEmpty().isLength({ max: 128 }),
  body("password").isLength({ min: 8 }).withMessage("Password min 8 chars"),
];

export const updateClientSchema: ValidationChain[] = [
  param("id").isUUID(),
  body("phone").optional().trim().notEmpty(),
  body("email").optional().trim().isEmail(),
  body("fullName").optional().trim().notEmpty(),
];

export const patchClientPasswordSchema: ValidationChain[] = [
  param("id").isUUID(),
  body("password").isLength({ min: 8 }),
];
