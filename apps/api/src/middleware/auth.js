import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { db } from "../db/index.js";
import { createHttpError } from "../utils/httpError.js";

const attachUser = (request) => {
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = db
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
      .get(payload.sub);

    return user || null;
  } catch {
    return null;
  }
};

export const optionalAuth = (request, _response, next) => {
  request.user = attachUser(request);
  next();
};

export const requireAuth = (request, _response, next) => {
  request.user = attachUser(request);

  if (!request.user) {
    next(createHttpError(401, "Authentication required."));
    return;
  }

  next();
};

export const requireRoles = (...roles) => (request, _response, next) => {
  if (!request.user) {
    next(createHttpError(401, "Authentication required."));
    return;
  }

  if (!roles.includes(request.user.role)) {
    next(createHttpError(403, "You do not have permission to access this resource."));
    return;
  }

  next();
};

export const requireVerifiedArtisan = (request, _response, next) => {
  if (!request.user || request.user.role !== "artisan") {
    next(createHttpError(403, "Artisan access required."));
    return;
  }

  if (!request.user.is_verified_artisan) {
    next(createHttpError(403, "Your artisan profile must be approved before managing products."));
    return;
  }

  next();
};

