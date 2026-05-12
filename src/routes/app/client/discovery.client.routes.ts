import { Router } from "express";
import { query, param } from "express-validator";
import discoveryClientController from "@/controllers/app/client/discovery.client.controller";
import { validateRequest } from "@/middlewares/validateRequest";

const router: Router = Router();

const listQuery = [
  query("search").optional().isString(),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const listServicesQuery = [
  ...listQuery,
  query("categoryId").optional().isUUID(),
];

router.get(
  "/categories",
  listQuery,
  validateRequest,
  discoveryClientController.listCategories,
);
router.get(
  "/services",
  listServicesQuery,
  validateRequest,
  discoveryClientController.listServices,
);
router.get(
  "/services/:id",
  [param("id").isUUID()],
  validateRequest,
  discoveryClientController.getServiceById,
);

export default router;
