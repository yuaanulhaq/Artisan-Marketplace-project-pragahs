import { useTranslation } from "react-i18next";

import { request } from "../lib/api";
import { formatDate } from "../lib/format";
import { useAsyncData } from "../hooks/useAsyncData";
import { useAuth } from "../store/AuthContext";

const NotificationPanel = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data, loading, reload } = useAsyncData(
    async () => (user ? request("/notifications") : { notifications: [] }),
    [user?.id],
    { notifications: [] }
  );

  if (!user) {
    return null;
  }

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl text-forest">{t("notifications.title")}</h3>
        <button
          type="button"
          className="text-sm text-clay"
          onClick={reload}
        >
          {t("actions.refresh")}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading && <p className="text-sm text-stone-500">{t("states.loading")}</p>}
        {!loading && data.notifications.length === 0 && (
          <p className="text-sm text-stone-500">{t("notifications.empty")}</p>
        )}
        {data.notifications.slice(0, 5).map((notification) => (
          <div key={notification.id} className="rounded-2xl bg-sand/60 p-4">
            <p className="font-semibold text-forest">{notification.title}</p>
            <p className="mt-2 text-sm leading-6 text-stone-600">{notification.message}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">
              {formatDate(notification.createdAt, i18n.language)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;

