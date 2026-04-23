import { Router } from "express";

import { requireAuth } from "../../middleware/auth.js";
import { listNotifications, markNotificationRead } from "./notifications.service.js";

const router = Router();

router.use(requireAuth);

router.get("/", (request, response) => {
  response.json(listNotifications(request.user.id));
});

router.patch("/:notificationId/read", (request, response) => {
  response.json(
    markNotificationRead({
      userId: request.user.id,
      notificationId: request.params.notificationId
    })
  );
});

export default router;

