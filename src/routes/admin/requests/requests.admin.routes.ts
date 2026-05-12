import { Router } from "express";
import requestsAdminController from "@/controllers/admin/requests/requests.admin.controller";
import { validateRequest } from "@/middlewares/validateRequest";
import {
  listRequestsAdminQuery,
  patchRequestAssignSchema,
  patchRequestStatusSchema,
  requestIdAdminParam,
} from "@/validators/schemas/admin/requests/requests.validator";

const router: Router = Router();

router.get("/stats", requestsAdminController.stats);
router.get(
  "/",
  listRequestsAdminQuery,
  validateRequest,
  requestsAdminController.list,
);
router.get(
  "/:id",
  requestIdAdminParam,
  validateRequest,
  requestsAdminController.getById,
);
router.patch(
  "/:id/status",
  patchRequestStatusSchema,
  validateRequest,
  requestsAdminController.patchStatus,
);
router.patch(
  "/:id/assign",
  patchRequestAssignSchema,
  validateRequest,
  requestsAdminController.patchAssign,
);

export default router;
