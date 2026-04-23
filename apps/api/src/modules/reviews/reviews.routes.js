import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { createReview, listReviewsForProduct } from "./reviews.service.js";

const router = Router();

router.get("/product/:productId", (request, response) => {
  response.json(listReviewsForProduct(request.params.productId));
});

router.post("/product/:productId", requireAuth, requireRoles("buyer"), (request, response, next) => {
  try {
    const payload = z
      .object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).default("")
      })
      .parse(request.body);

    response.status(201).json(
      createReview({
        productId: request.params.productId,
        buyerId: request.user.id,
        ...payload
      })
    );
  } catch (error) {
    next(error);
  }
});

export default router;

