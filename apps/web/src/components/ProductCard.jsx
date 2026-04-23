import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { formatCurrency } from "../lib/format";
import { getAssetUrl } from "../lib/api";

const ProductCard = ({ product }) => {
  const { t, i18n } = useTranslation();
  const imageUrl = product.featuredImageUrl
    ? getAssetUrl(product.featuredImageUrl)
    : getAssetUrl("/uploads/seeds/product-fallback.svg");

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-stone-200/90 bg-white shadow-[0_24px_80px_-40px_rgba(78,48,22,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_-42px_rgba(78,48,22,0.55)]">
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden">
        <img
          loading="lazy"
          src={imageUrl}
          alt={product.name}
          className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-stone-950/65 via-stone-950/15 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full border border-white/60 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-700 backdrop-blur">
            {t(`categories.${product.category}`, product.category)}
          </span>
          <span className="rounded-full bg-forest/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
            {product.artisan?.isVerifiedArtisan ? t("badges.verified") : t("badges.pending")}
          </span>
        </div>
      </Link>

      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              to={`/products/${product.id}`}
              className="block font-display text-[1.7rem] leading-tight text-forest transition group-hover:text-clay"
            >
              {product.name}
            </Link>
            <p className="mt-2 text-sm text-stone-500">
              {product.artisan?.name} • {product.region}
            </p>
          </div>
          <span className="rounded-2xl bg-sand px-3 py-2 text-right text-xs font-semibold leading-5 text-stone-700">
            {formatCurrency(product.price, i18n.language)}
          </span>
        </div>

        <p className="text-sm leading-7 text-stone-600">{product.description}</p>

        <div className="grid gap-3 rounded-[1.6rem] bg-[#f8f3ea] p-4 text-sm text-stone-600">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              {t("product.materials")}
            </span>
            <span className="text-right">{product.materials}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              {t("labels.authenticityTag")}
            </span>
            <span className="text-right">{product.authenticityTag}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-1">
          <span className="text-xs uppercase tracking-[0.25em] text-stone-500">
            {t("labels.rating")}: {product.averageRating?.toFixed?.(1) || "0.0"}
          </span>
          <Link
            to={`/products/${product.id}`}
            className="rounded-full border border-clay/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay transition hover:border-clay hover:bg-clay hover:text-white"
          >
            {t("actions.shopNow")}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
