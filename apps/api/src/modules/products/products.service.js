import { randomUUID } from "node:crypto";

import { db } from "../../db/index.js";
import { createHttpError } from "../../utils/httpError.js";

const getProductImages = (productId) =>
  db
    .prepare(`
      SELECT id, image_url, alt_text, sort_order
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC
    `)
    .all(productId)
    .map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
      altText: image.alt_text
    }));

const mapProductSummary = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  region: row.region,
  price: Number(row.price),
  stock: Number(row.stock),
  materials: row.materials,
  authenticityTag: row.authenticity_tag,
  leadTimeDays: Number(row.lead_time_days),
  featuredImageUrl: row.featured_image_url,
  isFeatured: Boolean(row.is_featured),
  isTrending: Boolean(row.is_trending),
  viewCount: Number(row.view_count),
  averageRating: Number(row.average_rating || 0),
  reviewCount: Number(row.review_count || 0),
  artisan: {
    id: row.artisan_id,
    name: row.artisan_name,
    region: row.artisan_region,
    craft: row.craft,
    isVerifiedArtisan: Boolean(row.is_verified_artisan)
  }
});

const getBaseListSql = () => `
  SELECT
    p.*,
    u.name AS artisan_name,
    u.region AS artisan_region,
    u.is_verified_artisan,
    ap.craft,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS review_count
  FROM products p
  INNER JOIN users u ON u.id = p.artisan_id
  LEFT JOIN artisan_profiles ap ON ap.user_id = u.id
  LEFT JOIN reviews r ON r.product_id = p.id
`;

export const listProducts = (filters) => {
  const clauses = [];
  const values = [];

  if (filters.search) {
    clauses.push("(p.name LIKE ? OR p.description LIKE ? OR u.name LIKE ?)");
    values.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.category) {
    clauses.push("p.category = ?");
    values.push(filters.category);
  }

  if (filters.region) {
    clauses.push("p.region = ?");
    values.push(filters.region);
  }

  if (typeof filters.minPrice === "number") {
    clauses.push("p.price >= ?");
    values.push(filters.minPrice);
  }

  if (typeof filters.maxPrice === "number") {
    clauses.push("p.price <= ?");
    values.push(filters.maxPrice);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const sortMap = {
    newest: "p.created_at DESC",
    priceAsc: "p.price ASC",
    priceDesc: "p.price DESC",
    popular: "p.view_count DESC, average_rating DESC",
    rating: "average_rating DESC, review_count DESC"
  };
  const orderBy = sortMap[filters.sortBy] || sortMap.newest;

  const rows = db
    .prepare(`
      ${getBaseListSql()}
      ${whereClause}
      GROUP BY p.id
      ORDER BY ${orderBy}
    `)
    .all(...values);

  return rows.map((row) => ({
    ...mapProductSummary(row),
    images: getProductImages(row.id)
  }));
};

export const listFeaturedProducts = () =>
  db
    .prepare(`
      ${getBaseListSql()}
      WHERE p.is_featured = 1
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 8
    `)
    .all()
    .map((row) => ({
      ...mapProductSummary(row),
      images: getProductImages(row.id)
    }));

export const listTrendingProducts = () =>
  db
    .prepare(`
      ${getBaseListSql()}
      WHERE p.is_trending = 1
      GROUP BY p.id
      ORDER BY p.view_count DESC, average_rating DESC
      LIMIT 8
    `)
    .all()
    .map((row) => ({
      ...mapProductSummary(row),
      images: getProductImages(row.id)
    }));

export const getProductById = (productId, { incrementViews = true } = {}) => {
  if (incrementViews) {
    db.prepare("UPDATE products SET view_count = view_count + 1 WHERE id = ?").run(productId);
  }

  const row = db
    .prepare(`
      ${getBaseListSql()}
      WHERE p.id = ?
      GROUP BY p.id
    `)
    .get(productId);

  if (!row) {
    throw createHttpError(404, "Product not found.");
  }

  const artisanStory = db
    .prepare(`
      SELECT story, craft, cultural_info, average_rating, total_reviews
      FROM artisan_profiles
      WHERE user_id = ?
    `)
    .get(row.artisan_id);

  const reviews = db
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
      createdAt: review.created_at,
      buyerName: review.buyer_name
    }));

  return {
    product: {
      ...mapProductSummary(row),
      images: getProductImages(productId),
      artisanStory: artisanStory
        ? {
            story: artisanStory.story,
            craft: artisanStory.craft,
            culturalInfo: artisanStory.cultural_info,
            averageRating: Number(artisanStory.average_rating || 0),
            totalReviews: Number(artisanStory.total_reviews || 0)
          }
        : null,
      reviews
    }
  };
};

export const getProductOwner = (productId) => {
  const product = db.prepare("SELECT artisan_id FROM products WHERE id = ?").get(productId);

  if (!product) {
    throw createHttpError(404, "Product not found.");
  }

  return product.artisan_id;
};

export const createProduct = ({ artisanId, payload }) => {
  const id = randomUUID();
  const timestamp = new Date().toISOString();

  db.prepare(`
    INSERT INTO products (
      id, artisan_id, name, description, category, region, price, stock,
      materials, authenticity_tag, lead_time_days, featured_image_url,
      is_featured, is_trending, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
  `).run(
    id,
    artisanId,
    payload.name,
    payload.description,
    payload.category,
    payload.region,
    payload.price,
    payload.stock,
    payload.materials || "",
    payload.authenticityTag || "",
    payload.leadTimeDays || 7,
    payload.featuredImageUrl || null,
    timestamp,
    timestamp
  );

  return getProductById(id, { incrementViews: false });
};

export const updateProduct = ({ productId, payload }) => {
  const current = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);

  if (!current) {
    throw createHttpError(404, "Product not found.");
  }

  db.prepare(`
    UPDATE products
    SET
      name = ?,
      description = ?,
      category = ?,
      region = ?,
      price = ?,
      stock = ?,
      materials = ?,
      authenticity_tag = ?,
      lead_time_days = ?,
      featured_image_url = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    payload.name ?? current.name,
    payload.description ?? current.description,
    payload.category ?? current.category,
    payload.region ?? current.region,
    payload.price ?? current.price,
    payload.stock ?? current.stock,
    payload.materials ?? current.materials,
    payload.authenticityTag ?? current.authenticity_tag,
    payload.leadTimeDays ?? current.lead_time_days,
    payload.featuredImageUrl ?? current.featured_image_url,
    new Date().toISOString(),
    productId
  );

  return getProductById(productId, { incrementViews: false });
};

export const deleteProduct = (productId) => {
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(productId);

  if (result.changes === 0) {
    throw createHttpError(404, "Product not found.");
  }
};

export const addProductImages = ({ productId, files }) => {
  const imageStatement = db.prepare(`
    INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const existingCount = db
    .prepare("SELECT COUNT(*) AS count FROM product_images WHERE product_id = ?")
    .get(productId).count;

  files.forEach((file, index) => {
    const relativePath = `/uploads/products/${file.filename}`;

    imageStatement.run(
      randomUUID(),
      productId,
      relativePath,
      file.originalname,
      existingCount + index
    );

    if (index === 0) {
      db.prepare(`
        UPDATE products
        SET featured_image_url = COALESCE(featured_image_url, ?), updated_at = ?
        WHERE id = ?
      `).run(relativePath, new Date().toISOString(), productId);
    }
  });

  return getProductById(productId, { incrementViews: false });
};

