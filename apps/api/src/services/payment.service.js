import Stripe from "stripe";

import { env } from "../config/env.js";

let stripeClient = null;

const getStripeClient = () => {
  if (!env.stripeSecretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }

  return stripeClient;
};

export const isStripeEnabled = () => Boolean(getStripeClient());

export const createStripeCheckoutSession = async ({ orderId, items }) => {
  const stripe = getStripeClient();

  if (!stripe) {
    return null;
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${env.clientUrl}/orders?payment=success&order=${orderId}`,
    cancel_url: `${env.clientUrl}/cart?payment=cancelled&order=${orderId}`,
    metadata: {
      orderId
    },
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: env.stripeCurrency,
        product_data: {
          name: item.name
        },
        unit_amount: Math.round(Number(item.price) * 100)
      }
    }))
  });
};

export const constructStripeEvent = ({ payload, signature }) => {
  const stripe = getStripeClient();

  if (!stripe || !env.stripeWebhookSecret) {
    throw new Error("Stripe webhook configuration is incomplete.");
  }

  return stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
};

