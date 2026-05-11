import { adminCorsOptions } from "@/config/cors";
import cors from "cors";
import { Router } from "express";
import { adminGuard } from "@/middlewares/adminGuard";
import { superAdminGuard } from "@/middlewares/superAdminGuard";

import administratorAdminRouter from "./admins/administrator.admin.routes";
import authAdminRouter from "./admins/auth.admin.routes";
import adminSelfRouter from "./admins/admin-self.admin.routes";

export const adminRouter: Router = Router();

adminRouter.use(cors(adminCorsOptions));

adminRouter.use("/auth", authAdminRouter);

adminRouter.use(adminGuard);

// Management routes: SUPER_ADMIN only. `/admin/auth/login` & `/admin/auth/logout` are public; `/admin/auth/me` uses route-level `adminGuard` (any role).
adminRouter.use("/administrators", superAdminGuard, administratorAdminRouter);
adminRouter.use("/self", superAdminGuard, adminSelfRouter);

export default adminRouter;
