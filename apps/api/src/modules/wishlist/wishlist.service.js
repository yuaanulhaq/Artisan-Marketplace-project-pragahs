import { randomUUID } from "node:crypto";

import { db } from "../../db/index.js";

export const getWishlist = (buyerId) => ({
  items: db
    .prepare(`
      SELECT
        wi.id,
        p.id AS product_id,
        p.name,
        p.price,
        p.category,
        p.region,
        p.featured_image_url
      FROM wishlist_items wi
      INNER JOIN products p ON p.id = wi.product_id
      WHERE wi.buyer_id = ?
      ORDER BY wi.created_at DESC
    `)
    .all(buyerId)
    .map((item) => ({
      id: item.id,
      product: {
        id: item.product_id,
        name: item.name,
        price: Number(item.price),
        category: item.category,
        region: item.region,
        featuredImageUrl: item.featured_image_url
      }
    }))
});

export const addWishlistItem = ({ buyerId, productId }) => {
  db.prepare(`
    INSERT OR IGNORE INTO wishlist_items (id, buyer_id, product_id, created_at)
    VALUES (?, ?, ?, ?)
  `).run(randomUUID(), buyerId, productId, new Date().toISOString());

  return getWishlist(buyerId);
};

export const removeWishlistItem = ({ buyerId, productId }) => {
  db.prepare("DELETE FROM wishlist_items WHERE buyer_id = ? AND product_id = ?").run(
    buyerId,
    productId
  );

  return getWishlist(buyerId);
};

