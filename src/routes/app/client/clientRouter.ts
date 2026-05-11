// TODO: need to rename this file to client.routes.ts
import { Router } from "express";

import authClientRouter from "./auth.client.routes";
import clientRoutes from "./client.routes";
import { clientGuard } from "@/middlewares/clientGuard";

export const clientRouter: Router = Router();

clientRouter.use("/auth", authClientRouter);
clientRouter.use("/", clientGuard, clientRoutes);

export default clientRouter;
