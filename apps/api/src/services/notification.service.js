import { randomUUID } from "node:crypto";

import { db } from "../db/index.js";

export const createNotification = ({
  userId,
  type,
  title,
  message,
  link = null
}) => {
  db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), userId, type, title, message, link, new Date().toISOString());
};

