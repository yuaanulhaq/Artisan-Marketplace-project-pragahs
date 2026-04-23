import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { verificationUpload } from "../../middleware/upload.js";
import { createHttpError } from "../../utils/httpError.js";
import {
  getUserById,
  login,
  signup,
  submitArtisanVerification
} from "./auth.service.js";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["artisan", "buyer"]),
  region: z.string().max(80).optional(),
  preferredLanguage: z.enum(["en", "hi", "ur"]).default("en"),
  story: z.string().max(1200).optional(),
  craft: z.string().max(120).optional(),
  culturalInfo: z.string().max(1200).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const router = Router();

router.post("/signup", async (request, response, next) => {
  try {
    const payload = signupSchema.parse(request.body);
    const result = await signup(payload);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const payload = loginSchema.parse(request.body);
    const result = await login(payload);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (request, response) => {
  response.json({
    user: getUserById(request.user.id)
  });
});

router.post(
  "/verification",
  requireAuth,
  requireRoles("artisan"),
  verificationUpload.single("idDocument"),
  (request, response, next) => {
    try {
      if (!request.file) {
        throw createHttpError(400, "Please upload an ID document.");
      }

      const relativePath = `/uploads/verification/${request.file.filename}`;
      const user = submitArtisanVerification({
        userId: request.user.id,
        filePath: relativePath
      });

      response.json({
        user
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

