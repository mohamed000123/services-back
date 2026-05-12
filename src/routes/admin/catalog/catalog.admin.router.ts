import { Router } from "express";
import categoriesAdminRouter from "./categories.admin.routes";
import servicesAdminRouter from "./services.admin.routes";

const catalogAdminRouter: Router = Router();

catalogAdminRouter.use("/categories", categoriesAdminRouter);
catalogAdminRouter.use("/services", servicesAdminRouter);

export default catalogAdminRouter;
