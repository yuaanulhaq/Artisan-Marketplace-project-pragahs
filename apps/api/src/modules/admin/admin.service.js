import { db } from "../../db/index.js";
import { createNotification } from "../../services/notification.service.js";
import { createHttpError } from "../../utils/httpError.js";

export const getAdminOverview = () => ({
  totals: {
    users: db.prepare("SELECT COUNT(*) AS count FROM users").get().count,
    artisans: db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'artisan'").get().count,
    buyers: db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'buyer'").get().count,
    products: db.prepare("SELECT COUNT(*) AS count FROM products").get().count,
    pendingArtisans: db
      .prepare("SELECT COUNT(*) AS count FROM artisan_profiles WHERE verification_status = 'pending'")
      .get().count,
    openDisputes: db.prepare("SELECT COUNT(*) AS count FROM disputes WHERE status = 'open'").get().count
  }
});

export const listPendingArtisans = () => ({
  artisans: db
    .prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.region,
        ap.story,
        ap.craft,
        ap.cultural_info,
        ap.id_document_url,
        ap.verification_status,
        ap.created_at
      FROM users u
      INNER JOIN artisan_profiles ap ON ap.user_id = u.id
      WHERE ap.verification_status = 'pending'
      ORDER BY ap.created_at ASC
    `)
    .all()
    .map((artisan) => ({
      id: artisan.id,
      name: artisan.name,
      email: artisan.email,
      region: artisan.region,
      story: artisan.story,
      craft: artisan.craft,
      culturalInfo: artisan.cultural_info,
      idDocumentUrl: artisan.id_document_url,
      verificationStatus: artisan.verification_status,
      createdAt: artisan.created_at
    }))
});

export const reviewArtisan = ({ artisanId, decision, notes }) => {
  const artisan = db
    .prepare(`
      SELECT u.id, u.name
      FROM users u
      INNER JOIN artisan_profiles ap ON ap.user_id = u.id
      WHERE u.id = ? AND u.role = 'artisan'
    `)
    .get(artisanId);

  if (!artisan) {
    throw createHttpError(404, "Artisan not found.");
  }

  const status = decision === "approve" ? "approved" : "rejected";
  const verified = decision === "approve" ? 1 : 0;

  db.prepare(`
    UPDATE artisan_profiles
    SET verification_status = ?, approval_notes = ?, updated_at = ?
    WHERE user_id = ?
  `).run(status, notes || null, new Date().toISOString(), artisanId);

  db.prepare(`
    UPDATE users
    SET is_verified_artisan = ?, updated_at = ?
    WHERE id = ?
  `).run(verified, new Date().toISOString(), artisanId);

  createNotification({
    userId: artisanId,
    type: "verification",
    title: decision === "approve" ? "Artisan approved" : "Verification update",
    message:
      decision === "approve"
        ? "Your artisan account is verified and you can now publish products."
        : "Your verification needs attention. Please review the admin notes and resubmit.",
    link: "/account/verification"
  });

  return listPendingArtisans();
};

export const listUsers = () => ({
  users: db
    .prepare(`
      SELECT id, name, email, role, region, preferred_language, is_verified_artisan, status, created_at
      FROM users
      ORDER BY created_at DESC
    `)
    .all()
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      region: user.region,
      preferredLanguage: user.preferred_language,
      isVerifiedArtisan: Boolean(user.is_verified_artisan),
      status: user.status,
      createdAt: user.created_at
    }))
});

export const listProductsForAdmin = () => ({
  products: db
    .prepare(`
      SELECT p.id, p.name, p.category, p.price, p.is_featured, p.is_trending, u.name AS artisan_name
      FROM products p
      INNER JOIN users u ON u.id = p.artisan_id
      ORDER BY p.created_at DESC
    `)
    .all()
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      isFeatured: Boolean(product.is_featured),
      isTrending: Boolean(product.is_trending),
      artisanName: product.artisan_name
    }))
});

export const updateProductFlags = ({ productId, isFeatured, isTrending }) => {
  db.prepare(`
    UPDATE products
    SET is_featured = ?, is_trending = ?, updated_at = ?
    WHERE id = ?
  `).run(isFeatured ? 1 : 0, isTrending ? 1 : 0, new Date().toISOString(), productId);

  return listProductsForAdmin();
};

export const listDisputes = () => ({
  disputes: db
    .prepare(`
      SELECT
        d.id,
        d.order_id,
        d.reason,
        d.status,
        d.resolution_notes,
        d.created_at,
        u.name AS raised_by_name
      FROM disputes d
      INNER JOIN users u ON u.id = d.raised_by
      ORDER BY d.created_at DESC
    `)
    .all()
    .map((dispute) => ({
      id: dispute.id,
      orderId: dispute.order_id,
      reason: dispute.reason,
      status: dispute.status,
      resolutionNotes: dispute.resolution_notes,
      raisedByName: dispute.raised_by_name,
      createdAt: dispute.created_at
    }))
});

export const resolveDispute = ({ disputeId, status, resolutionNotes }) => {
  const dispute = db.prepare("SELECT raised_by FROM disputes WHERE id = ?").get(disputeId);

  if (!dispute) {
    throw createHttpError(404, "Dispute not found.");
  }

  db.prepare(`
    UPDATE disputes
    SET status = ?, resolution_notes = ?, updated_at = ?
    WHERE id = ?
  `).run(status, resolutionNotes, new Date().toISOString(), disputeId);

  createNotification({
    userId: dispute.raised_by,
    type: "dispute",
    title: "Dispute updated",
    message: "An admin reviewed your dispute and added a resolution update.",
    link: "/orders"
  });

  return listDisputes();
};

