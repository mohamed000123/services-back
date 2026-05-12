import { Router } from "express";
import authClientController from "@/controllers/app/client/auth.client.controller";
import clientController from "@/controllers/app/client/client.controller";
import {
  loginWithEmailValidator,
  loginWithOtpValidator,
  generateOtpValidator,
  forgetPasswordValidator,
  refreshTokenValidator,
} from "@/validators/common/auth.validator";
import { signupValidator } from "@/validators/schemas/app/client/auth.validator";
import { clientGuard } from "@/middlewares/clientGuard";
import { validateRequest } from "@/middlewares/validateRequest";
// import { otpRateLimiter } from "@/middlewares/otpRateLimiter";

const authClientRouter: Router = Router();

authClientRouter.post(
  "/signup",
  signupValidator,
  validateRequest,
  authClientController.signup,
);

authClientRouter.post(
  "/login/otp",
  loginWithOtpValidator,
  validateRequest,
  authClientController.loginWithOtp,
);

authClientRouter.post(
  "/login/email",
  loginWithEmailValidator,
  validateRequest,
  authClientController.loginWithEmail,
);

authClientRouter.post(
  "/forget-password",
  forgetPasswordValidator,
  validateRequest,
  clientController.forgetPassword,
);

authClientRouter.post(
  "/generate-otp",
  generateOtpValidator,
  validateRequest,
  // otpRateLimiter,
  authClientController.generateOtp,
);

authClientRouter.post(
  "/refresh-token",
  refreshTokenValidator,
  validateRequest,
  authClientController.refreshToken,
);

authClientRouter.post(
  "/logout",
  clientGuard,
  validateRequest,
  authClientController.logout,
);

export default authClientRouter;
