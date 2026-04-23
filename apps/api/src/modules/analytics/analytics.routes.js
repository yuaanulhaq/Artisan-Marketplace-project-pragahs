import { Router } from "express";

import { requireAuth, requireRoles } from "../../middleware/auth.js";
import { getArtisanAnalytics } from "./analytics.service.js";

const router = Router();

router.get("/artisan/me", requireAuth, requireRoles("artisan", "admin"), (request, response) => {
  response.json(getArtisanAnalytics(request.user.id));
});

export default router;

