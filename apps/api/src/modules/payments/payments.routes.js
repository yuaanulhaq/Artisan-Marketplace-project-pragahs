import { Router } from "express";

import { constructStripeEvent } from "../../services/payment.service.js";
import {
  markOrderPaidFromPayment,
  markOrderPaymentFailed
} from "../orders/orders.service.js";

const router = Router();

router.post("/webhook", async (request, response) => {
  try {
    const signature = request.headers["stripe-signature"];
    const event = constructStripeEvent({
      payload: request.body,
      signature
    });

    if (event.type === "checkout.session.completed") {
      await markOrderPaidFromPayment(event.data.object.metadata.orderId, event.data.object.id);
    }

    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
      const orderId = event.data.object.metadata?.orderId;

      if (orderId) {
        await markOrderPaymentFailed(orderId);
      }
    }

    response.json({ received: true });
  } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;
