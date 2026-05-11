import { Router } from "express";
import AdminSelfAdminController from "@/controllers/admin/admins/admin-self.admin.controller";

const adminSelfRouter: Router = Router();

adminSelfRouter.get("/", AdminSelfAdminController.get);

adminSelfRouter.put("/", AdminSelfAdminController.update);

export default adminSelfRouter;
