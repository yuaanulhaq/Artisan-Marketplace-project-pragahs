import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRoles } from "../../middleware/auth.js";
import {
  getArtisanById,
  listFeaturedArtisans,
  updateArtisanStory
} from "./users.service.js";

const router = Router();

router.get("/artisans/featured", (_request, response) => {
  response.json({
    artisans: listFeaturedArtisans()
  });
});

router.get("/artisans/:artisanId", (request, response, next) => {
  try {
    response.json(getArtisanById(request.params.artisanId));
  } catch (error) {
    next(error);
  }
});

router.patch("/artisans/me/story", requireAuth, requireRoles("artisan"), (request, response, next) => {
  try {
    const payload = z
      .object({
        story: z.string().max(1200),
        craft: z.string().max(120),
        culturalInfo: z.string().max(1200)
      })
      .parse(request.body);

    response.json(updateArtisanStory({ userId: request.user.id, ...payload }));
  } catch (error) {
    next(error);
  }
});

export default router;

