import { Router } from "express";

import adminRoutes from "../modules/admin/admin.routes.js";
import analyticsRoutes from "../modules/analytics/analytics.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import cartRoutes from "../modules/cart/cart.routes.js";
import notificationsRoutes from "../modules/notifications/notifications.routes.js";
import ordersRoutes from "../modules/orders/orders.routes.js";
import productsRoutes from "../modules/products/products.routes.js";
import reviewsRoutes from "../modules/reviews/reviews.routes.js";
import usersRoutes from "../modules/users/users.routes.js";
import wishlistRoutes from "../modules/wishlist/wishlist.routes.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json({
    name: "artisan-marketplace-api",
    version: "1.0.0"
  });
});

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", ordersRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);

export default router;

