import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

import { env } from "../config/env.js";
import { createSchema } from "./schema.js";

const now = () => new Date().toISOString();

const seedCatalogMedia = {
  "Hand Painted Blue Pottery Vase": {
    featuredImageUrl: "/uploads/seeds/blue-vase.svg",
    gallery: ["/uploads/seeds/blue-vase.svg", "/uploads/seeds/blue-vase-detail.svg"]
  },
  "Lotus Motif Dessert Plate Set": {
    featuredImageUrl: "/uploads/seeds/lotus-plates.svg",
    gallery: ["/uploads/seeds/lotus-plates.svg", "/uploads/seeds/lotus-plates-detail.svg"]
  },
  "Mini Spice Jar Trio": {
    featuredImageUrl: "/uploads/seeds/spice-jars.svg",
    gallery: ["/uploads/seeds/spice-jars.svg", "/uploads/seeds/spice-jars-detail.svg"]
  }
};

export const db = new DatabaseSync(env.databasePath);

db.exec("PRAGMA foreign_keys = ON;");
createSchema(db);

export const withTransaction = (work) => {
  db.exec("BEGIN");

  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};

const seedDatabase = () => {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;

  if (userCount > 0) {
    return;
  }

  withTransaction(() => {
    const passwordHash = bcrypt.hashSync("Password@123", 10);
    const timestamp = now();

    const adminId = randomUUID();
    const artisanId = randomUUID();
    const pendingArtisanId = randomUUID();
    const buyerId = randomUUID();

    const userStatement = db.prepare(`
      INSERT INTO users (
        id, name, email, password_hash, role, region, preferred_language,
        is_verified_artisan, created_at, updated_at
      ) VALUES (
        @id, @name, @email, @passwordHash, @role, @region, @preferredLanguage,
        @isVerifiedArtisan, @createdAt, @updatedAt
      )
    `);

    userStatement.run({
      id: adminId,
      name: "Marketplace Admin",
      email: "admin@artisanmarket.local",
      passwordHash,
      role: "admin",
      region: "National",
      preferredLanguage: "en",
      isVerifiedArtisan: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    userStatement.run({
      id: artisanId,
      name: "Aarav Kumhar",
      email: "artisan@artisanmarket.local",
      passwordHash,
      role: "artisan",
      region: "Jaipur",
      preferredLanguage: "hi",
      isVerifiedArtisan: 1,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    userStatement.run({
      id: pendingArtisanId,
      name: "Sana Weaver",
      email: "pending@artisanmarket.local",
      passwordHash,
      role: "artisan",
      region: "Lucknow",
      preferredLanguage: "ur",
      isVerifiedArtisan: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    userStatement.run({
      id: buyerId,
      name: "Neha Buyer",
      email: "buyer@artisanmarket.local",
      passwordHash,
      role: "buyer",
      region: "Delhi",
      preferredLanguage: "en",
      isVerifiedArtisan: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    const artisanProfileStatement = db.prepare(`
      INSERT INTO artisan_profiles (
        user_id, story, craft, cultural_info, verification_status,
        average_rating, total_reviews, created_at, updated_at
      ) VALUES (
        @userId, @story, @craft, @culturalInfo, @verificationStatus,
        @averageRating, @totalReviews, @createdAt, @updatedAt
      )
    `);

    artisanProfileStatement.run({
      userId: artisanId,
      story:
        "A third-generation potter shaping blue pottery with mineral glazes and hand-finished forms.",
      craft: "Blue Pottery",
      culturalInfo:
        "Inspired by Jaipur's court craft traditions, each piece is painted by hand and kiln-fired in small batches.",
      verificationStatus: "approved",
      averageRating: 4.8,
      totalReviews: 12,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    artisanProfileStatement.run({
      userId: pendingArtisanId,
      story:
        "An emerging textile artisan documenting chikankari motifs passed down through her family.",
      craft: "Embroidery",
      culturalInfo:
        "Traditional hand embroidery from Lucknow with floral storytelling and lightweight cotton bases.",
      verificationStatus: "pending",
      averageRating: 0,
      totalReviews: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    const products = [
      {
        id: randomUUID(),
        artisanId,
        name: "Hand Painted Blue Pottery Vase",
        description:
          "A wheel-thrown decorative vase with cobalt floral work and natural glaze finishing.",
        category: "pottery",
        region: "Jaipur",
        price: 1850,
        stock: 8,
        materials: "Quartz, clay, natural pigments",
        authenticityTag: "Jaipur Blue Pottery",
        leadTimeDays: 5,
        featuredImageUrl: "/uploads/seeds/blue-vase.jpg",
        isFeatured: 1,
        isTrending: 1
      },
      {
        id: randomUUID(),
        artisanId,
        name: "Lotus Motif Dessert Plate Set",
        description:
          "Set of hand-painted dessert plates designed for festive gatherings and gifting.",
        category: "decor",
        region: "Jaipur",
        price: 2650,
        stock: 5,
        materials: "Ceramic blend, food-safe glaze",
        authenticityTag: "Handcrafted Festival Collection",
        leadTimeDays: 7,
        featuredImageUrl: "/uploads/seeds/plate-set.jpg",
        isFeatured: 1,
        isTrending: 0
      },
      {
        id: randomUUID(),
        artisanId,
        name: "Mini Spice Jar Trio",
        description:
          "Compact countertop jars with matching lids and painted geometric trims.",
        category: "pottery",
        region: "Jaipur",
        price: 1499,
        stock: 14,
        materials: "Ceramic, mineral color wash",
        authenticityTag: "Kitchen Heritage Collection",
        leadTimeDays: 4,
        featuredImageUrl: "/uploads/seeds/spice-jars.jpg",
        isFeatured: 0,
        isTrending: 1
      }
    ];

    const productStatement = db.prepare(`
      INSERT INTO products (
        id, artisan_id, name, description, category, region, price, stock,
        materials, authenticity_tag, lead_time_days, featured_image_url,
        is_featured, is_trending, created_at, updated_at
      ) VALUES (
        @id, @artisanId, @name, @description, @category, @region, @price, @stock,
        @materials, @authenticityTag, @leadTimeDays, @featuredImageUrl,
        @isFeatured, @isTrending, @createdAt, @updatedAt
      )
    `);

    const imageStatement = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order)
      VALUES (@id, @productId, @imageUrl, @altText, @sortOrder)
    `);

    for (const [index, product] of products.entries()) {
      productStatement.run({
        ...product,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      imageStatement.run({
        id: randomUUID(),
        productId: product.id,
        imageUrl: product.featuredImageUrl,
        altText: product.name,
        sortOrder: index
      });
    }

    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      artisanId,
      "system",
      "Welcome to the marketplace",
      "Your artisan profile is live and ready to receive orders.",
      "/artisan/dashboard",
      timestamp
    );

    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      pendingArtisanId,
      "verification",
      "Verification pending",
      "Upload your ID to complete artisan verification for selling approval.",
      "/account/verification",
      timestamp
    );

    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      buyerId,
      "welcome",
      "Discover local artisans",
      "Browse featured pottery, textiles, and cultural craft collections.",
      "/marketplace",
      timestamp
    );
  });
};

seedDatabase();

const syncSeedCatalogMedia = () => {
  withTransaction(() => {
    const selectProductStatement = db.prepare("SELECT id FROM products WHERE name = ?");
    const updateProductStatement = db.prepare(`
      UPDATE products
      SET featured_image_url = ?, updated_at = ?
      WHERE id = ?
    `);
    const deleteImagesStatement = db.prepare("DELETE FROM product_images WHERE product_id = ?");
    const insertImageStatement = db.prepare(`
      INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const [productName, media] of Object.entries(seedCatalogMedia)) {
      const product = selectProductStatement.get(productName);

      if (!product) {
        continue;
      }

      updateProductStatement.run(media.featuredImageUrl, now(), product.id);
      deleteImagesStatement.run(product.id);

      media.gallery.forEach((imageUrl, index) => {
        insertImageStatement.run(randomUUID(), product.id, imageUrl, productName, index);
      });
    }
  });
};

syncSeedCatalogMedia();
