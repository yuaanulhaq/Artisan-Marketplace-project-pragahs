import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRoles } from "../../middleware/auth.js";
import {
  getAdminOverview,
  listDisputes,
  listPendingArtisans,
  listProductsForAdmin,
  listUsers,
  resolveDispute,
  reviewArtisan,
  updateProductFlags
} from "./admin.service.js";

const router = Router();

router.use(requireAuth, requireRoles("admin"));

router.get("/overview", (_request, response) => {
  response.json(getAdminOverview());
});

router.get("/artisans/pending", (_request, response) => {
  response.json(listPendingArtisans());
});

router.post("/artisans/:artisanId/review", (request, response, next) => {
  try {
    const payload = z
      .object({
        decision: z.enum(["approve", "reject"]),
        notes: z.string().max(1000).optional()
      })
      .parse(request.body);

    response.json(reviewArtisan({ artisanId: request.params.artisanId, ...payload }));
  } catch (error) {
    next(error);
  }
});

router.get("/users", (_request, response) => {
  response.json(listUsers());
});

router.get("/products", (_request, response) => {
  response.json(listProductsForAdmin());
});

router.patch("/products/:productId/flags", (request, response, next) => {
  try {
    const payload = z
      .object({
        isFeatured: z.boolean(),
        isTrending: z.boolean()
      })
      .parse(request.body);

    response.json(updateProductFlags({ productId: request.params.productId, ...payload }));
  } catch (error) {
    next(error);
  }
});

router.get("/disputes", (_request, response) => {
  response.json(listDisputes());
});

router.patch("/disputes/:disputeId", (request, response, next) => {
  try {
    const payload = z
      .object({
        status: z.enum(["open", "resolved", "closed"]),
        resolutionNotes: z.string().min(4).max(1000)
      })
      .parse(request.body);

    response.json(resolveDispute({ disputeId: request.params.disputeId, ...payload }));
  } catch (error) {
    next(error);
  }
});

export default router;

