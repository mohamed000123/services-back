import { Router } from "express";
import requestsClientController from "@/controllers/app/client/requests.client.controller";
import { validateRequest } from "@/middlewares/validateRequest";
import requestCreateLimiter from "@/config/requestCreateLimiter";
import {
  createRequestClientSchema,
  listRequestsClientQuery,
  requestIdClientParam,
} from "@/validators/schemas/admin/requests/requests.validator";

const router: Router = Router();

router.post(
  "/requests",
  requestCreateLimiter,
  createRequestClientSchema,
  validateRequest,
  requestsClientController.create,
);
router.get(
  "/requests",
  listRequestsClientQuery,
  validateRequest,
  requestsClientController.listMine,
);
router.get(
  "/requests/:id",
  requestIdClientParam,
  validateRequest,
  requestsClientController.getMine,
);
router.patch(
  "/requests/:id/cancel",
  requestIdClientParam,
  validateRequest,
  requestsClientController.cancelMine,
);

export default router;
