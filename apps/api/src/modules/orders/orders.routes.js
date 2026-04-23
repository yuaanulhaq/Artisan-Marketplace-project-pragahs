import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { createHttpError } from "../../utils/httpError.js";
import {
  createDispute,
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus
} from "./orders.service.js";

const router = Router();

router.use(requireAuth);

router.get("/", (request, response) => {
  response.json(listOrders(request.user));
});

router.get("/:orderId", (request, response, next) => {
  try {
    const result = getOrderById(request.params.orderId);
    const isBuyer = request.user.role === "buyer" && request.user.id === result.order.buyerId;
    const isRelatedArtisan =
      request.user.role === "artisan" &&
      result.order.items.some((item) => item.artisanId === request.user.id);

    if (request.user.role !== "admin" && !isBuyer && !isRelatedArtisan) {
      throw createHttpError(403, "You do not have access to this order.");
    }

    response.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/checkout", requireRoles("buyer"), async (request, response, next) => {
  try {
    const payload = z
      .object({
        paymentMethod: z.enum(["stripe", "mock"]).default("stripe"),
        shippingAddress: z.object({
          fullName: z.string().min(2),
          line1: z.string().min(4),
          city: z.string().min(2),
          state: z.string().min(2),
          postalCode: z.string().min(4),
          country: z.string().min(2),
          phone: z.string().min(7)
        })
      })
      .parse(request.body);

    response.status(201).json(await createOrder({ buyerId: request.user.id, ...payload }));
  } catch (error) {
    next(error);
  }
});

router.patch("/:orderId/status", requireRoles("artisan", "admin"), (request, response, next) => {
  try {
    const payload = z
      .object({
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
        trackingNumber: z.string().max(80).optional(),
        updateLabel: z.string().min(2).max(140)
      })
      .parse(request.body);

    response.json(updateOrderStatus({ orderId: request.params.orderId, ...payload }));
  } catch (error) {
    next(error);
  }
});

router.post("/:orderId/disputes", requireRoles("buyer"), (request, response, next) => {
  try {
    const payload = z
      .object({
        reason: z.string().min(8).max(1000)
      })
      .parse(request.body);

    response.status(201).json(
      createDispute({
        orderId: request.params.orderId,
        userId: request.user.id,
        reason: payload.reason
      })
    );
  } catch (error) {
    next(error);
  }
});

export default router;
