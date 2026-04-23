import { db } from "../../db/index.js";

export const listNotifications = (userId) => ({
  notifications: db
    .prepare(`
      SELECT id, type, title, message, link, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `)
    .all(userId)
    .map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      isRead: Boolean(notification.is_read),
      createdAt: notification.created_at
    }))
});

export const markNotificationRead = ({ userId, notificationId }) => {
  db.prepare(`
    UPDATE notifications
    SET is_read = 1
    WHERE id = ? AND user_id = ?
  `).run(notificationId, userId);

  return listNotifications(userId);
};

