import { Router } from "express";
import categoriesAdminController from "@/controllers/admin/catalog/categories.admin.controller";
import { validateRequest } from "@/middlewares/validateRequest";
import {
  categoryIdParam,
  createCategorySchema,
  listCategoryQuery,
  updateCategorySchema,
} from "@/validators/schemas/admin/catalog/category.validator";

const router: Router = Router();

router.get(
  "/",
  listCategoryQuery,
  validateRequest,
  categoriesAdminController.list,
);
router.post(
  "/",
  createCategorySchema,
  validateRequest,
  categoriesAdminController.create,
);
router.put(
  "/:id",
  updateCategorySchema,
  validateRequest,
  categoriesAdminController.update,
);
router.delete(
  "/:id",
  categoryIdParam,
  validateRequest,
  categoriesAdminController.remove,
);
router.patch(
  "/:id/restore",
  categoryIdParam,
  validateRequest,
  categoriesAdminController.restore,
);

export default router;
