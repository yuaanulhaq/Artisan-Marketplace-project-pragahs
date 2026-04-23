import { db } from "../../db/index.js";
import { createHttpError } from "../../utils/httpError.js";

const mapArtisan = (row) => ({
  id: row.id,
  name: row.name,
  region: row.region,
  preferredLanguage: row.preferred_language,
  isVerifiedArtisan: Boolean(row.is_verified_artisan),
  story: row.story || "",
  craft: row.craft || "",
  culturalInfo: row.cultural_info || "",
  averageRating: Number(row.average_rating || 0),
  totalReviews: Number(row.total_reviews || 0)
});

export const listFeaturedArtisans = () =>
  db
    .prepare(`
      SELECT
        u.*,
        ap.story,
        ap.craft,
        ap.cultural_info,
        ap.average_rating,
        ap.total_reviews
      FROM users u
      INNER JOIN artisan_profiles ap ON ap.user_id = u.id
      WHERE u.role = 'artisan' AND u.is_verified_artisan = 1
      ORDER BY ap.average_rating DESC, ap.total_reviews DESC, u.created_at DESC
      LIMIT 6
    `)
    .all()
    .map(mapArtisan);

export const getArtisanById = (artisanId) => {
  const artisan = db
    .prepare(`
      SELECT
        u.*,
        ap.story,
        ap.craft,
        ap.cultural_info,
        ap.average_rating,
        ap.total_reviews
      FROM users u
      INNER JOIN artisan_profiles ap ON ap.user_id = u.id
      WHERE u.id = ? AND u.role = 'artisan'
    `)
    .get(artisanId);

  if (!artisan) {
    throw createHttpError(404, "Artisan not found.");
  }

  const products = db
    .prepare(`
      SELECT id, name, price, category, region, featured_image_url, stock
      FROM products
      WHERE artisan_id = ?
      ORDER BY is_featured DESC, created_at DESC
    `)
    .all(artisanId)
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      category: product.category,
      region: product.region,
      featuredImageUrl: product.featured_image_url,
      inStock: product.stock > 0
    }));

  return {
    artisan: mapArtisan(artisan),
    products
  };
};

export const updateArtisanStory = ({ userId, story, craft, culturalInfo }) => {
  const exists = db
    .prepare("SELECT user_id FROM artisan_profiles WHERE user_id = ?")
    .get(userId);

  if (!exists) {
    throw createHttpError(404, "Artisan profile not found.");
  }

  db.prepare(`
    UPDATE artisan_profiles
    SET story = ?, craft = ?, cultural_info = ?, updated_at = ?
    WHERE user_id = ?
  `).run(story, craft, culturalInfo, new Date().toISOString(), userId);

  return getArtisanById(userId);
};

