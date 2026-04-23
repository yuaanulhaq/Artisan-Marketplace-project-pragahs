import { randomUUID } from "node:crypto";

import { db } from "../../db/index.js";
import { createNotification } from "../../services/notification.service.js";
import { createHttpError } from "../../utils/httpError.js";

const recalculateArtisanRating = (artisanId) => {
  const aggregate = db
    .prepare(`
      SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS total_reviews
      FROM reviews
      WHERE artisan_id = ?
    `)
    .get(artisanId);

  db.prepare(`
    UPDATE artisan_profiles
    SET average_rating = ?, total_reviews = ?, updated_at = ?
    WHERE user_id = ?
  `).run(
    Number(aggregate.average_rating || 0).toFixed(2),
    Number(aggregate.total_reviews || 0),
    new Date().toISOString(),
    artisanId
  );
};

export const listReviewsForProduct = (productId) => ({
  reviews: db
    .prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name AS buyer_name
      FROM reviews r
      INNER JOIN users u ON u.id = r.buyer_id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `)
    .all(productId)
    .map((review) => ({
      id: review.id,
      rating: Number(review.rating),
      comment: review.comment,
      buyerName: review.buyer_name,
      createdAt: review.created_at
    }))
});

export const createReview = ({ productId, buyerId, rating, comment }) => {
  const product = db.prepare("SELECT artisan_id FROM products WHERE id = ?").get(productId);

  if (!product) {
    throw createHttpError(404, "Product not found.");
  }

  const hasPurchased = db
    .prepare(`
      SELECT oi.id
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = ? AND o.buyer_id = ? AND o.status != 'cancelled'
      LIMIT 1
    `)
    .get(productId, buyerId);

  if (!hasPurchased) {
    throw createHttpError(403, "You can only review products you have ordered.");
  }

  db.prepare(`
    INSERT INTO reviews (id, product_id, buyer_id, artisan_id, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), productId, buyerId, product.artisan_id, rating, comment, new Date().toISOString());

  recalculateArtisanRating(product.artisan_id);

  createNotification({
    userId: product.artisan_id,
    type: "review",
    title: "New product review",
    message: "A buyer shared a new review on one of your products.",
    link: `/products/${productId}`
  });

  return listReviewsForProduct(productId);
};

