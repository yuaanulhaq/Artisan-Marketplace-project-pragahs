import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./LanguageSwitcher";
import NotificationPanel from "./NotificationPanel";
import { useAuth } from "../store/AuthContext";

const AppShell = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const navigation = [
    { to: "/", label: t("navigation.home") },
    { to: "/marketplace", label: t("navigation.marketplace") },
    { to: "/cart", label: t("navigation.cart") },
    { to: "/wishlist", label: t("navigation.wishlist") },
    { to: "/orders", label: t("navigation.orders") }
  ];

  if (user?.role === "artisan") {
    navigation.push({ to: "/artisan", label: t("navigation.artisanDashboard") });
  }

  if (user?.role === "admin") {
    navigation.push({ to: "/admin", label: t("navigation.adminPanel") });
  }

  return (
    <div className="min-h-screen bg-[#f6ead1] text-stone-900">
      <div className="hero-overlay" />
      <header className="sticky top-0 z-20 border-b border-white/40 bg-[#f6ead1]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-clay">{t("branding.eyebrow")}</p>
            <NavLink to="/" className="mt-2 block font-display text-3xl text-forest">
              {t("branding.name")}
            </NavLink>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition ${
                    isActive ? "bg-clay text-white" : "bg-white text-stone-700 hover:bg-sand"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <>
                <span className="rounded-full bg-white px-4 py-2 text-sm text-stone-700 shadow-sm">
                  {user.name}
                </span>
                <button
                  type="button"
                  className="rounded-full bg-forest px-4 py-2 text-sm text-white"
                  onClick={logout}
                >
                  {t("actions.logout")}
                </button>
              </>
            ) : (
              <>
                <NavLink className="rounded-full bg-white px-4 py-2 text-sm text-stone-700 shadow-sm" to="/login">
                  {t("actions.login")}
                </NavLink>
                <NavLink className="rounded-full bg-clay px-4 py-2 text-sm text-white" to="/signup">
                  {t("actions.signup")}
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main
        className={`mx-auto max-w-7xl gap-8 px-4 py-8 lg:px-8 ${
          isHomePage ? "flex flex-col" : "grid lg:grid-cols-[minmax(0,1fr)_320px]"
        }`}
      >
        <div className="space-y-8">
          <Outlet />
        </div>
        <aside className={isHomePage ? "grid gap-6 md:grid-cols-2" : "space-y-6"}>
          <NotificationPanel />
          <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay">
              {t("support.title")}
            </p>
            <h3 className="mt-3 font-display text-2xl text-forest">{t("support.subtitle")}</h3>
            <p className="mt-3 text-sm leading-7 text-stone-600">{t("support.description")}</p>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AppShell;
