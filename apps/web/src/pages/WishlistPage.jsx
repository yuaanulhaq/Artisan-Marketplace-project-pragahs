import { useTranslation } from "react-i18next";

import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { useAsyncData } from "../hooks/useAsyncData";
import { getAssetUrl, request } from "../lib/api";
import { formatCurrency } from "../lib/format";

const WishlistPage = () => {
  const { t, i18n } = useTranslation();
  const wishlist = useAsyncData(() => request("/wishlist"), [], { items: [] });

  const addToCart = async (productId) => {
    await request("/cart/items", {
      method: "POST",
      body: { productId, quantity: 1 }
    });
  };

  const remove = async (productId) => {
    await request(`/wishlist/${productId}`, {
      method: "DELETE"
    });
    wishlist.reload();
  };

  if (wishlist.loading) {
    return <LoadingState />;
  }

  if (wishlist.data.items.length === 0) {
    return <EmptyState title={t("wishlist.emptyTitle")} description={t("wishlist.emptyDescription")} />;
  }

  return (
    <div className="space-y-4">
      {wishlist.data.items.map((item) => (
        <article key={item.id} className="flex flex-col gap-4 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:flex-row">
          <img src={getAssetUrl(item.product.featuredImageUrl)} alt={item.product.name} className="h-32 w-full rounded-2xl object-cover sm:w-36" />
          <div className="flex-1">
            <h2 className="font-display text-2xl text-forest">{item.product.name}</h2>
            <p className="mt-2 text-sm text-stone-500">{item.product.region}</p>
            <p className="mt-4 font-semibold text-clay">{formatCurrency(item.product.price, i18n.language)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white" onClick={() => addToCart(item.product.id)}>
              {t("actions.addToCart")}
            </button>
            <button type="button" className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-stone-700" onClick={() => remove(item.product.id)}>
              {t("actions.remove")}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default WishlistPage;

