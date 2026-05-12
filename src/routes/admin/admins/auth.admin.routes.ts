import { Router } from "express";
import authAdminController from "@/controllers/admin/admins/auth.admin.controller";
import { validateRequest } from "@/middlewares/validateRequest";
import {
  loginWithEmailValidator,
  refreshTokenValidator,
} from "@/validators/common/auth.validator";
import { adminGuard } from "@/middlewares/adminGuard";

const authAdminRouter: Router = Router();

authAdminRouter.get("/me", adminGuard, authAdminController.me);

authAdminRouter.post(
  "/login",
  loginWithEmailValidator,
  validateRequest,
  authAdminController.login,
);

authAdminRouter.post(
  "/refresh-token",
  refreshTokenValidator,
  validateRequest,
  authAdminController.refreshToken,
);

authAdminRouter.post("/logout", adminGuard, authAdminController.logout);

export default authAdminRouter;
