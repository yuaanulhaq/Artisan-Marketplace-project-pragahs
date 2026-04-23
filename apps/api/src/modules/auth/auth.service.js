import { randomUUID } from "node:crypto";

import { db, withTransaction } from "../../db/index.js";
import { createNotification } from "../../services/notification.service.js";
import { comparePassword, hashPassword, signToken } from "../../utils/auth.js";
import { createHttpError } from "../../utils/httpError.js";

const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  region: row.region,
  preferredLanguage: row.preferred_language,
  avatarUrl: row.avatar_url,
  isVerifiedArtisan: Boolean(row.is_verified_artisan),
  status: row.status,
  createdAt: row.created_at,
  artisanProfile:
    row.role === "artisan"
      ? {
          story: row.story || "",
          craft: row.craft || "",
          culturalInfo: row.cultural_info || "",
          idDocumentUrl: row.id_document_url,
          verificationStatus: row.verification_status || "pending",
          averageRating: Number(row.average_rating || 0),
          totalReviews: Number(row.total_reviews || 0),
          approvalNotes: row.approval_notes
        }
      : null
});

export const getUserById = (userId) => {
  const row = db
    .prepare(`
      SELECT
        u.*,
        ap.story,
        ap.craft,
        ap.cultural_info,
        ap.id_document_url,
        ap.verification_status,
        ap.average_rating,
        ap.total_reviews,
        ap.approval_notes
      FROM users u
      LEFT JOIN artisan_profiles ap ON ap.user_id = u.id
      WHERE u.id = ?
    `)
    .get(userId);

  return row ? mapUser(row) : null;
};

export const signup = async (input) => {
  const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(input.email);

  if (existingUser) {
    throw createHttpError(409, "An account with this email already exists.");
  }

  const timestamp = new Date().toISOString();
  const userId = randomUUID();
  const passwordHash = await hashPassword(input.password);

  withTransaction(() => {
    db.prepare(`
      INSERT INTO users (
        id, name, email, password_hash, role, region, preferred_language,
        is_verified_artisan, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      input.name,
      input.email.toLowerCase(),
      passwordHash,
      input.role,
      input.region || "",
      input.preferredLanguage || "en",
      input.role === "artisan" ? 0 : 0,
      timestamp,
      timestamp
    );

    if (input.role === "artisan") {
      db.prepare(`
        INSERT INTO artisan_profiles (
          user_id, story, craft, cultural_info, verification_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
      `).run(
        userId,
        input.story || "",
        input.craft || "",
        input.culturalInfo || "",
        timestamp,
        timestamp
      );
    }
  });

  const user = getUserById(userId);
  const token = signToken(user);

  createNotification({
    userId,
    type: "welcome",
    title: "Welcome to Artisan Marketplace",
    message:
      input.role === "artisan"
        ? "Complete verification to begin selling your handmade products."
        : "Your buyer account is ready. Explore featured artisans and trending crafts.",
    link: input.role === "artisan" ? "/account/verification" : "/marketplace"
  });

  return { token, user };
};

export const login = async ({ email, password }) => {
  const row = db
    .prepare(`
      SELECT
        u.*,
        ap.story,
        ap.craft,
        ap.cultural_info,
        ap.id_document_url,
        ap.verification_status,
        ap.average_rating,
        ap.total_reviews,
        ap.approval_notes
      FROM users u
      LEFT JOIN artisan_profiles ap ON ap.user_id = u.id
      WHERE u.email = ?
    `)
    .get(email.toLowerCase());

  if (!row) {
    throw createHttpError(401, "Invalid email or password.");
  }

  const isValid = await comparePassword(password, row.password_hash);

  if (!isValid) {
    throw createHttpError(401, "Invalid email or password.");
  }

  const user = mapUser(row);
  const token = signToken(user);

  return { token, user };
};

export const submitArtisanVerification = ({ userId, filePath }) => {
  const timestamp = new Date().toISOString();

  db.prepare(`
    UPDATE artisan_profiles
    SET id_document_url = ?, verification_status = 'pending', updated_at = ?
    WHERE user_id = ?
  `).run(filePath, timestamp, userId);

  db.prepare(`
    UPDATE users
    SET updated_at = ?
    WHERE id = ?
  `).run(timestamp, userId);

  const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();

  admins.forEach((admin) => {
    createNotification({
      userId: admin.id,
      type: "verification",
      title: "New artisan verification submitted",
      message: "An artisan uploaded identity documents and is awaiting approval.",
      link: "/admin/artisans"
    });
  });

  return getUserById(userId);
};
