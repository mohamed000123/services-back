import { Router } from "express";
import clientController from "@/controllers/app/client/client.controller";
import { changePasswordValidator } from "@/validators/common/auth.validator";
import { validateRequest } from "@/middlewares/validateRequest";
import { updateFirebaseTokenValidator } from "@/validators/schemas/app/common/firebaseToken.validator";

const clientRoutes: Router = Router();

clientRoutes.get("/me", clientController.getMe);

clientRoutes.post(
  "/change-password",
  changePasswordValidator,
  validateRequest,
  clientController.changePassword,
);

// Firebase token management
clientRoutes.post(
  "/firebase-token",
  updateFirebaseTokenValidator,
  validateRequest,
  clientController.updateFirebaseToken,
);

clientRoutes.delete(
  "/firebase-token",
  clientController.deleteFirebaseToken,
);

clientRoutes.delete("/delete-account", clientController.deleteAccount);

export default clientRoutes;
