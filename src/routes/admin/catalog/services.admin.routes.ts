import { Router } from "express";
import servicesAdminController from "@/controllers/admin/catalog/services.admin.controller";
import { validateRequest } from "@/middlewares/validateRequest";
import {
  createServiceSchema,
  listServiceQuery,
  serviceIdParam,
  updateServiceSchema,
} from "@/validators/schemas/admin/catalog/service.validator";

const router: Router = Router();

router.get(
  "/",
  listServiceQuery,
  validateRequest,
  servicesAdminController.list,
);
router.post(
  "/",
  createServiceSchema,
  validateRequest,
  servicesAdminController.create,
);
router.get(
  "/:id",
  serviceIdParam,
  validateRequest,
  servicesAdminController.getById,
);
router.put(
  "/:id",
  updateServiceSchema,
  validateRequest,
  servicesAdminController.update,
);
router.delete(
  "/:id",
  serviceIdParam,
  validateRequest,
  servicesAdminController.remove,
);
router.patch(
  "/:id/restore",
  serviceIdParam,
  validateRequest,
  servicesAdminController.restore,
);

export default router;
