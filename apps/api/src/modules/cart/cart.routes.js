import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { getCart, removeCartItem, upsertCartItem } from "./cart.service.js";

const router = Router();

router.use(requireAuth, requireRoles("buyer"));

router.get("/", (request, response) => {
  response.json(getCart(request.user.id));
});

router.post("/items", (request, response, next) => {
  try {
    const payload = z
      .object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(25)
      })
      .parse(request.body);

    response.status(201).json(upsertCartItem({ buyerId: request.user.id, ...payload }));
  } catch (error) {
    next(error);
  }
});

router.patch("/items/:productId", (request, response, next) => {
  try {
    const payload = z
      .object({
        quantity: z.number().int().min(1).max(25)
      })
      .parse(request.body);

    response.json(
      upsertCartItem({
        buyerId: request.user.id,
        productId: request.params.productId,
        quantity: payload.quantity
      })
    );
  } catch (error) {
    next(error);
  }
});

router.delete("/items/:productId", (request, response) => {
  response.json(removeCartItem({ buyerId: request.user.id, productId: request.params.productId }));
});

export default router;

