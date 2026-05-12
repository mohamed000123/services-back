import { Router } from "express";
import clientsAdminController from "@/controllers/admin/clients/clients.admin.controller";
import { validateRequest } from "@/middlewares/validateRequest";
import {
  clientIdParam,
  createClientSchema,
  listClientsQuery,
  patchClientPasswordSchema,
  updateClientSchema,
} from "@/validators/schemas/admin/clients/clients.validator";

const router: Router = Router();

router.get("/", listClientsQuery, validateRequest, clientsAdminController.list);
router.get(
  "/:id",
  clientIdParam,
  validateRequest,
  clientsAdminController.getById,
);
router.post(
  "/",
  createClientSchema,
  validateRequest,
  clientsAdminController.create,
);
router.put(
  "/:id",
  updateClientSchema,
  validateRequest,
  clientsAdminController.update,
);
router.patch(
  "/:id/password",
  patchClientPasswordSchema,
  validateRequest,
  clientsAdminController.patchPassword,
);
router.delete(
  "/:id",
  clientIdParam,
  validateRequest,
  clientsAdminController.remove,
);

export default router;
