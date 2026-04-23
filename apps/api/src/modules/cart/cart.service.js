import { randomUUID } from "node:crypto";

import { db } from "../../db/index.js";
import { createHttpError } from "../../utils/httpError.js";

export const getCart = (buyerId) => {
  const items = db
    .prepare(`
      SELECT
        ci.id,
        ci.quantity,
        p.id AS product_id,
        p.name,
        p.price,
        p.stock,
        p.featured_image_url,
        u.name AS artisan_name
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      INNER JOIN users u ON u.id = p.artisan_id
      WHERE ci.buyer_id = ?
      ORDER BY ci.created_at DESC
    `)
    .all(buyerId)
    .map((item) => ({
      id: item.id,
      quantity: Number(item.quantity),
      product: {
        id: item.product_id,
        name: item.name,
        price: Number(item.price),
        stock: Number(item.stock),
        featuredImageUrl: item.featured_image_url,
        artisanName: item.artisan_name
      },
      lineTotal: Number(item.quantity) * Number(item.price)
    }));

  return {
    items,
    total: items.reduce((sum, item) => sum + item.lineTotal, 0)
  };
};

export const upsertCartItem = ({ buyerId, productId, quantity }) => {
  const product = db.prepare("SELECT id, stock FROM products WHERE id = ?").get(productId);

  if (!product) {
    throw createHttpError(404, "Product not found.");
  }

  if (quantity > product.stock) {
    throw createHttpError(400, "Requested quantity exceeds available stock.");
  }

  const existing = db
    .prepare("SELECT id FROM cart_items WHERE buyer_id = ? AND product_id = ?")
    .get(buyerId, productId);

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(quantity, existing.id);
  } else {
    db.prepare(`
      INSERT INTO cart_items (id, buyer_id, product_id, quantity, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(randomUUID(), buyerId, productId, quantity, new Date().toISOString());
  }

  return getCart(buyerId);
};

export const removeCartItem = ({ buyerId, productId }) => {
  db.prepare("DELETE FROM cart_items WHERE buyer_id = ? AND product_id = ?").run(buyerId, productId);
  return getCart(buyerId);
};

