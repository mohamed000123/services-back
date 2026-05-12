import { body, param, query, ValidationChain } from "express-validator";

const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export const createRequestClientSchema: ValidationChain[] = [
  body("serviceId").isUUID().withMessage("serviceId required"),
  body("notes").optional().isString().isLength({ max: 2000 }),
];

export const listRequestsClientQuery: ValidationChain[] = [
  query("status").optional().isIn(statuses),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const requestIdClientParam: ValidationChain[] = [
  param("id").isUUID(),
];

export const listRequestsAdminQuery: ValidationChain[] = [
  query("status").optional().isIn(statuses),
  query("clientId").optional().isUUID(),
  query("serviceId").optional().isUUID(),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("sort").optional().isIn(["asc", "desc"]),
];

export const requestIdAdminParam: ValidationChain[] = [param("id").isUUID()];

export const patchRequestStatusSchema: ValidationChain[] = [
  param("id").isUUID(),
  body("status").isIn(statuses),
  body("note").optional().isString().isLength({ max: 500 }),
];

export const patchRequestAssignSchema: ValidationChain[] = [
  param("id").isUUID(),
  body("adminId")
    .optional({ nullable: true })
    .custom((value: unknown) => {
      if (value === null || value === undefined) {return true;}
      if (typeof value === "string" && value.length === 36) {return true;}
      throw new Error("adminId must be UUID or null");
    }),
];
