import { Router } from "express";

import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { addWishlistItem, getWishlist, removeWishlistItem } from "./wishlist.service.js";

const router = Router();

router.use(requireAuth, requireRoles("buyer"));

router.get("/", (request, response) => {
  response.json(getWishlist(request.user.id));
});

router.post("/:productId", (request, response) => {
  response.status(201).json(addWishlistItem({ buyerId: request.user.id, productId: request.params.productId }));
});

router.delete("/:productId", (request, response) => {
  response.json(removeWishlistItem({ buyerId: request.user.id, productId: request.params.productId }));
});

export default router;

