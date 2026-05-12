import { Router } from "express";
import authAdminController from "@/controllers/admin/admins/auth.admin.controller";
import { validateRequest } from "@/middlewares/validateRequest";
import { loginWithEmailValidator } from "@/validators/common/auth.validator";
import { adminGuard } from "@/middlewares/adminGuard";

const authAdminRouter: Router = Router();

authAdminRouter.get("/me", adminGuard, authAdminController.me);

authAdminRouter.post(
  "/login",
  loginWithEmailValidator,
  validateRequest,
  authAdminController.login
);

authAdminRouter.post("/logout", authAdminController.logout);

export default authAdminRouter;
