import { useTranslation } from "react-i18next";

import DashboardStat from "../components/DashboardStat";
import LoadingState from "../components/LoadingState";
import { useAsyncData } from "../hooks/useAsyncData";
import { request } from "../lib/api";

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const overview = useAsyncData(() => request("/admin/overview"), [], { totals: {} });
  const pending = useAsyncData(() => request("/admin/artisans/pending"), [], { artisans: [] });
  const users = useAsyncData(() => request("/admin/users"), [], { users: [] });
  const products = useAsyncData(() => request("/admin/products"), [], { products: [] });
  const disputes = useAsyncData(() => request("/admin/disputes"), [], { disputes: [] });

  if (overview.loading || pending.loading || users.loading || products.loading || disputes.loading) {
    return <LoadingState />;
  }

  const reviewArtisan = async (artisanId, decision) => {
    await request(`/admin/artisans/${artisanId}/review`, {
      method: "POST",
      body: {
        decision,
        notes: decision === "reject" ? t("admin.rejectionNote") : t("admin.approvalNote")
      }
    });
    pending.reload();
    overview.reload();
  };

  const updateFlags = async (productId, isFeatured, isTrending) => {
    await request(`/admin/products/${productId}/flags`, {
      method: "PATCH",
      body: { isFeatured, isTrending }
    });
    products.reload();
  };

  const resolveDispute = async (disputeId) => {
    await request(`/admin/disputes/${disputeId}`, {
      method: "PATCH",
      body: {
        status: "resolved",
        resolutionNotes: t("admin.resolutionNote")
      }
    });
    disputes.reload();
    overview.reload();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <DashboardStat label={t("admin.overview.users")} value={overview.data.totals.users || 0} note={t("admin.notes.users")} />
        <DashboardStat label={t("admin.overview.artisans")} value={overview.data.totals.artisans || 0} note={t("admin.notes.artisans")} />
        <DashboardStat label={t("admin.overview.buyers")} value={overview.data.totals.buyers || 0} note={t("admin.notes.buyers")} />
        <DashboardStat label={t("admin.overview.products")} value={overview.data.totals.products || 0} note={t("admin.notes.products")} />
        <DashboardStat label={t("admin.overview.pending")} value={overview.data.totals.pendingArtisans || 0} note={t("admin.notes.pending")} />
        <DashboardStat label={t("admin.overview.disputes")} value={overview.data.totals.openDisputes || 0} note={t("admin.notes.disputes")} />
      </div>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl text-forest">{t("admin.pendingArtisans")}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {pending.data.artisans.map((artisan) => (
            <article key={artisan.id} className="rounded-[2rem] border border-stone-200 p-5">
              <h3 className="font-display text-2xl text-forest">{artisan.name}</h3>
              <p className="mt-2 text-sm text-stone-500">{artisan.email}</p>
              <p className="mt-4 text-sm leading-7 text-stone-600">{artisan.story}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="rounded-full bg-forest px-4 py-2 text-sm text-white" onClick={() => reviewArtisan(artisan.id, "approve")}>
                  {t("actions.approve")}
                </button>
                <button type="button" className="rounded-full bg-sand px-4 py-2 text-sm text-stone-700" onClick={() => reviewArtisan(artisan.id, "reject")}>
                  {t("actions.reject")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl text-forest">{t("admin.manageProducts")}</h2>
        <div className="mt-5 space-y-4">
          {products.data.products.map((product) => (
            <div key={product.id} className="flex flex-col gap-4 rounded-2xl border border-stone-200 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-forest">{product.name}</p>
                <p className="mt-1 text-sm text-stone-500">{product.artisanName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-full bg-sand px-4 py-2 text-sm text-stone-700" onClick={() => updateFlags(product.id, !product.isFeatured, product.isTrending)}>
                  {product.isFeatured ? t("actions.unfeature") : t("actions.feature")}
                </button>
                <button type="button" className="rounded-full bg-clay px-4 py-2 text-sm text-white" onClick={() => updateFlags(product.id, product.isFeatured, !product.isTrending)}>
                  {product.isTrending ? t("actions.untrend") : t("actions.trend")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl text-forest">{t("admin.disputesTitle")}</h2>
        <div className="mt-5 space-y-4">
          {disputes.data.disputes.map((dispute) => (
            <div key={dispute.id} className="rounded-2xl border border-stone-200 p-4">
              <p className="font-semibold text-forest">{dispute.raisedByName}</p>
              <p className="mt-2 text-sm leading-7 text-stone-600">{dispute.reason}</p>
              <button type="button" className="mt-4 rounded-full bg-forest px-4 py-2 text-sm text-white" onClick={() => resolveDispute(dispute.id)}>
                {t("actions.resolve")}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl text-forest">{t("admin.usersTitle")}</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="pb-3">{t("auth.name")}</th>
                <th className="pb-3">{t("auth.email")}</th>
                <th className="pb-3">{t("labels.role")}</th>
                <th className="pb-3">{t("labels.region")}</th>
              </tr>
            </thead>
            <tbody>
              {users.data.users.map((entry) => (
                <tr key={entry.id} className="border-t border-stone-100">
                  <td className="py-3">{entry.name}</td>
                  <td className="py-3">{entry.email}</td>
                  <td className="py-3">{t(`roles.${entry.role}`)}</td>
                  <td className="py-3">{entry.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;

