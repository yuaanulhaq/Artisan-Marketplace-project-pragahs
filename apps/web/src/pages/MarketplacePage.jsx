import { useDeferredValue, useState } from "react";
import { useTranslation } from "react-i18next";

import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProductCard from "../components/ProductCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { request } from "../lib/api";

const MarketplacePage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    region: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest"
  });

  const deferredSearch = useDeferredValue(filters.search);
  const queryString = (() => {
    const params = new URLSearchParams();
    const payload = { ...filters, search: deferredSearch };
    Object.entries(payload).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    return params.toString();
  })();

  const catalog = useAsyncData(
    () => request(`/products${queryString ? `?${queryString}` : ""}`),
    [queryString],
    { products: [] }
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-4xl text-forest">{t("marketplace.title")}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">{t("marketplace.description")}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            className="rounded-2xl border border-stone-200 px-4 py-3"
            placeholder={t("marketplace.filters.search")}
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />
          <select
            className="rounded-2xl border border-stone-200 px-4 py-3"
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
          >
            <option value="">{t("marketplace.filters.allCategories")}</option>
            {["pottery", "decor", "textiles", "jewelry", "woodwork", "paintings"].map((category) => (
              <option key={category} value={category}>
                {t(`categories.${category}`)}
              </option>
            ))}
          </select>
          <input
            className="rounded-2xl border border-stone-200 px-4 py-3"
            placeholder={t("marketplace.filters.region")}
            value={filters.region}
            onChange={(event) => setFilters((current) => ({ ...current, region: event.target.value }))}
          />
          <input
            className="rounded-2xl border border-stone-200 px-4 py-3"
            placeholder={t("marketplace.filters.minPrice")}
            value={filters.minPrice}
            onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))}
          />
          <select
            className="rounded-2xl border border-stone-200 px-4 py-3"
            value={filters.sortBy}
            onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value }))}
          >
            <option value="newest">{t("marketplace.sort.newest")}</option>
            <option value="popular">{t("marketplace.sort.popular")}</option>
            <option value="rating">{t("marketplace.sort.rating")}</option>
            <option value="priceAsc">{t("marketplace.sort.priceAsc")}</option>
            <option value="priceDesc">{t("marketplace.sort.priceDesc")}</option>
          </select>
        </div>
      </div>

      {catalog.loading && <LoadingState />}
      {!catalog.loading && catalog.data.products.length === 0 && (
        <EmptyState title={t("states.noProducts")} description={t("states.noProductsDescription")} />
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {catalog.data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default MarketplacePage;
