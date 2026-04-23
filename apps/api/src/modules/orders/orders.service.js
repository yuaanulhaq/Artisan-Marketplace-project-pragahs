import { randomUUID } from "node:crypto";

import { db, withTransaction } from "../../db/index.js";
import { createNotification } from "../../services/notification.service.js";
import {
  createStripeCheckoutSession,
  isStripeEnabled
} from "../../services/payment.service.js";
import { parseJson } from "../../utils/json.js";
import { createHttpError } from "../../utils/httpError.js";

const mapOrder = (row) => ({
  id: row.id,
  buyerId: row.buyer_id,
  status: row.status,
  paymentProvider: row.payment_provider,
  paymentReference: row.payment_reference,
  paymentStatus: row.payment_status,
  totalAmount: Number(row.total_amount),
  shippingAddress: parseJson(row.shipping_address, {}),
  trackingNumber: row.tracking_number,
  trackingUpdates: parseJson(row.tracking_updates, []),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const getOrderItems = (orderId) =>
  db
    .prepare(`
      SELECT
        oi.id,
        oi.artisan_id,
        oi.quantity,
        oi.unit_price,
        p.id AS product_id,
        p.name,
        p.featured_image_url,
        u.name AS artisan_name
      FROM order_items oi
      INNER JOIN products p ON p.id = oi.product_id
      INNER JOIN users u ON u.id = oi.artisan_id
      WHERE oi.order_id = ?
    `)
    .all(orderId)
    .map((item) => ({
      id: item.id,
      artisanId: item.artisan_id,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      product: {
        id: item.product_id,
        name: item.name,
        featuredImageUrl: item.featured_image_url,
        artisanName: item.artisan_name
      }
    }));

export const listOrders = (user) => {
  let rows = [];

  if (user.role === "admin") {
    rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  } else if (user.role === "artisan") {
    rows = db
      .prepare(`
        SELECT DISTINCT o.*
        FROM orders o
        INNER JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.artisan_id = ?
        ORDER BY o.created_at DESC
      `)
      .all(user.id);
  } else {
    rows = db.prepare("SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC").all(user.id);
  }

  return {
    orders: rows.map((row) => ({
      ...mapOrder(row),
      items: getOrderItems(row.id)
    }))
  };
};

export const createOrder = async ({ buyerId, shippingAddress, paymentMethod }) => {
  const cartItems = db
    .prepare(`
      SELECT
        ci.product_id,
        ci.quantity,
        p.artisan_id,
        p.name,
        p.price,
        p.stock
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      WHERE ci.buyer_id = ?
    `)
    .all(buyerId);

  if (cartItems.length === 0) {
    throw createHttpError(400, "Your cart is empty.");
  }

  cartItems.forEach((item) => {
    if (item.quantity > item.stock) {
      throw createHttpError(400, `${item.name} is no longer available in the requested quantity.`);
    }
  });

  const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * Number(item.price), 0);
  const orderId = randomUUID();
  const timestamp = new Date().toISOString();
  const useStripe = paymentMethod === "stripe" && isStripeEnabled();
  const trackingUpdates = JSON.stringify([
    {
      label: useStripe ? "Awaiting payment confirmation" : "Order received",
      timestamp
    }
  ]);

  withTransaction(() => {
    db.prepare(`
      INSERT INTO orders (
        id, buyer_id, status, payment_provider, payment_status,
        total_amount, shipping_address, tracking_updates, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      buyerId,
      useStripe ? "pending" : "processing",
      useStripe ? "stripe" : "mock-secure",
      useStripe ? "pending" : "paid",
      totalAmount,
      JSON.stringify(shippingAddress),
      trackingUpdates,
      timestamp,
      timestamp
    );

    const orderItemStatement = db.prepare(`
      INSERT INTO order_items (id, order_id, product_id, artisan_id, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const reduceStockStatement = db.prepare(`
      UPDATE products
      SET stock = stock - ?, is_trending = 1, updated_at = ?
      WHERE id = ?
    `);

    const deleteCartStatement = db.prepare("DELETE FROM cart_items WHERE buyer_id = ?");

    cartItems.forEach((item) => {
      orderItemStatement.run(
        randomUUID(),
        orderId,
        item.product_id,
        item.artisan_id,
        item.quantity,
        item.price
      );

      reduceStockStatement.run(item.quantity, timestamp, item.product_id);
    });

    deleteCartStatement.run(buyerId);
  });

  let payment = {
    provider: useStripe ? "stripe" : "mock-secure",
    mode: useStripe ? "redirect" : "demo"
  };

  if (useStripe) {
    const session = await createStripeCheckoutSession({
      orderId,
      items: cartItems
    });

    db.prepare(`
      UPDATE orders
      SET payment_reference = ?, updated_at = ?
      WHERE id = ?
    `).run(session.id, new Date().toISOString(), orderId);

    payment = {
      provider: "stripe",
      mode: "redirect",
      checkoutUrl: session.url
    };
  } else {
    await markOrderPaidFromPayment(orderId, "mock-secure");
  }

  return {
    ...getOrderById(orderId),
    payment
  };
};

export const getOrderById = (orderId) => {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);

  if (!row) {
    throw createHttpError(404, "Order not found.");
  }

  return {
    order: {
      ...mapOrder(row),
      items: getOrderItems(orderId)
    }
  };
};

export const updateOrderStatus = ({ orderId, status, trackingNumber, updateLabel }) => {
  const current = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);

  if (!current) {
    throw createHttpError(404, "Order not found.");
  }

  const trackingUpdates = parseJson(current.tracking_updates, []);
  trackingUpdates.unshift({
    label: updateLabel,
    timestamp: new Date().toISOString()
  });

  db.prepare(`
    UPDATE orders
    SET status = ?, tracking_number = ?, tracking_updates = ?, updated_at = ?
    WHERE id = ?
  `).run(
    status,
    trackingNumber || current.tracking_number,
    JSON.stringify(trackingUpdates),
    new Date().toISOString(),
    orderId
  );

  createNotification({
    userId: current.buyer_id,
    type: "tracking",
    title: "Order update",
    message: updateLabel,
    link: `/orders/${orderId}`
  });

  return getOrderById(orderId);
};

export const createDispute = ({ orderId, userId, reason }) => {
  const order = db.prepare("SELECT buyer_id FROM orders WHERE id = ?").get(orderId);

  if (!order) {
    throw createHttpError(404, "Order not found.");
  }

  db.prepare(`
    INSERT INTO disputes (id, order_id, raised_by, reason, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'open', ?, ?)
  `).run(randomUUID(), orderId, userId, reason, new Date().toISOString(), new Date().toISOString());

  db.prepare(`
    UPDATE orders
    SET status = 'pending', updated_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), orderId);

  return {
    message: "Dispute created successfully."
  };
};

export const markOrderPaidFromPayment = async (orderId, paymentReference) => {
  const current = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);

  if (!current || current.payment_status === "paid") {
    return current ? getOrderById(orderId) : null;
  }

  const trackingUpdates = parseJson(current.tracking_updates, []);
  trackingUpdates.unshift({
    label: "Payment confirmed",
    timestamp: new Date().toISOString()
  });

  db.prepare(`
    UPDATE orders
    SET status = 'processing',
        payment_status = 'paid',
        payment_reference = ?,
        tracking_updates = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    paymentReference || current.payment_reference,
    JSON.stringify(trackingUpdates),
    new Date().toISOString(),
    orderId
  );

  const orderItems = db
    .prepare("SELECT DISTINCT artisan_id FROM order_items WHERE order_id = ?")
    .all(orderId);

  orderItems.forEach((item) => {
    createNotification({
      userId: item.artisan_id,
      type: "order",
      title: "New order received",
      message: "A paid order includes one of your products and is ready for fulfillment.",
      link: `/orders/${orderId}`
    });
  });

  createNotification({
    userId: current.buyer_id,
    type: "order",
    title: "Payment confirmed",
    message: "Your payment was received and artisans are preparing your order.",
    link: `/orders/${orderId}`
  });

  return getOrderById(orderId);
};

export const markOrderPaymentFailed = async (orderId) => {
  const current = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);

  if (!current) {
    return null;
  }

  const trackingUpdates = parseJson(current.tracking_updates, []);
  trackingUpdates.unshift({
    label: "Payment was not completed",
    timestamp: new Date().toISOString()
  });

  db.prepare(`
    UPDATE orders
    SET payment_status = 'failed',
        tracking_updates = ?,
        updated_at = ?
    WHERE id = ?
  `).run(JSON.stringify(trackingUpdates), new Date().toISOString(), orderId);

  createNotification({
    userId: current.buyer_id,
    type: "payment",
    title: "Payment incomplete",
    message: "Your order is waiting for a completed payment. Please try checkout again.",
    link: "/cart"
  });

  return getOrderById(orderId);
};
