import { Router } from "express";
import { z } from "zod";

import {
  requireAuth,
  requireRoles,
  requireVerifiedArtisan
} from "../../middleware/auth.js";
import { productImageUpload } from "../../middleware/upload.js";
import { createHttpError } from "../../utils/httpError.js";
import {
  addProductImages,
  createProduct,
  deleteProduct,
  getProductById,
  getProductOwner,
  listFeaturedProducts,
  listProducts,
  listTrendingProducts,
  updateProduct
} from "./products.service.js";

const createSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(50),
  region: z.string().min(2).max(80),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  materials: z.string().max(300).optional(),
  authenticityTag: z.string().max(120).optional(),
  leadTimeDays: z.number().int().min(1).max(60).optional(),
  featuredImageUrl: z.string().max(255).optional()
});

const updateSchema = createSchema.partial();

const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(["newest", "priceAsc", "priceDesc", "popular", "rating"]).optional()
});

const router = Router();

router.get("/", (request, response, next) => {
  try {
    const filters = searchSchema.parse(request.query);
    response.json({
      products: listProducts(filters)
    });
  } catch (error) {
    next(error);
  }
});

router.get("/featured", (_request, response) => {
  response.json({
    products: listFeaturedProducts()
  });
});

router.get("/trending", (_request, response) => {
  response.json({
    products: listTrendingProducts()
  });
});

router.get("/:productId", (request, response, next) => {
  try {
    response.json(getProductById(request.params.productId));
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireRoles("artisan"), requireVerifiedArtisan, (request, response, next) => {
  try {
    const payload = createSchema.parse(request.body);
    response.status(201).json(createProduct({ artisanId: request.user.id, payload }));
  } catch (error) {
    next(error);
  }
});

router.patch("/:productId", requireAuth, requireRoles("artisan", "admin"), (request, response, next) => {
  try {
    if (request.user.role !== "admin" && getProductOwner(request.params.productId) !== request.user.id) {
      throw createHttpError(403, "You can only update your own products.");
    }

    const payload = updateSchema.parse(request.body);
    response.json(updateProduct({ productId: request.params.productId, payload }));
  } catch (error) {
    next(error);
  }
});

router.delete("/:productId", requireAuth, requireRoles("artisan", "admin"), (request, response, next) => {
  try {
    if (request.user.role !== "admin" && getProductOwner(request.params.productId) !== request.user.id) {
      throw createHttpError(403, "You can only delete your own products.");
    }

    deleteProduct(request.params.productId);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:productId/images",
  requireAuth,
  requireRoles("artisan", "admin"),
  productImageUpload.array("images", 5),
  (request, response, next) => {
    try {
      if (request.user.role !== "admin" && getProductOwner(request.params.productId) !== request.user.id) {
        throw createHttpError(403, "You can only manage images for your own products.");
      }

      if (!request.files || request.files.length === 0) {
        throw createHttpError(400, "Please upload at least one product image.");
      }

      response.json(
        addProductImages({
          productId: request.params.productId,
          files: request.files
        })
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;

