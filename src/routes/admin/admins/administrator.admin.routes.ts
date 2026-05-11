import { Router } from "express";
import adminController from "@/controllers/admin/admins/administrator.admin.controller";
import {
  crateAdminSchema,
  updateAdminSchema,
} from "@/validators/schemas/admin/admin.validator";
import { validateRequest } from "@/middlewares/validateRequest";

const administratorAdminRouter: Router = Router();

administratorAdminRouter.get("/", adminController.get);
administratorAdminRouter.get("/:id", adminController.getById);
administratorAdminRouter.post(
  "/",
  crateAdminSchema,
  validateRequest,
  adminController.create
);
administratorAdminRouter.put(
  "/:id",
  updateAdminSchema,
  validateRequest,
  adminController.update
);
administratorAdminRouter.patch(
  "/:id/password",
  adminController.updatePassword
);
administratorAdminRouter.patch(
  "/:id/restore",
  adminController.restore
);
administratorAdminRouter.delete("/:id", adminController.delete);

export default administratorAdminRouter;
