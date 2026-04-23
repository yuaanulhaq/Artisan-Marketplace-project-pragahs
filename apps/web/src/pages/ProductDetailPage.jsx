import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { useAsyncData } from "../hooks/useAsyncData";
import { getAssetUrl, request } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";
import { useAuth } from "../store/AuthContext";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [statusMessage, setStatusMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const detail = useAsyncData(() => request(`/products/${productId}`), [productId], null);

  const addToCart = async () => {
    await request("/cart/items", {
      method: "POST",
      body: { productId, quantity: 1 }
    });
    setStatusMessage(t("product.addedToCart"));
  };

  const addToWishlist = async () => {
    await request(`/wishlist/${productId}`, {
      method: "POST"
    });
    setStatusMessage(t("product.addedToWishlist"));
  };

  const submitReview = async (event) => {
    event.preventDefault();
    await request(`/reviews/product/${productId}`, {
      method: "POST",
      body: {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment
      }
    });
    setReviewForm({ rating: 5, comment: "" });
    setStatusMessage(t("product.reviewSaved"));
    detail.reload();
  };

  if (detail.loading) {
    return <LoadingState />;
  }

  if (!detail.data?.product) {
    return <EmptyState title={t("states.noProducts")} description={t("states.noProductsDescription")} />;
  }

  const { product } = detail.data;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <img
            src={getAssetUrl(product.featuredImageUrl)}
            alt={product.name}
            className="h-[420px] w-full rounded-[2rem] object-cover shadow-lg"
          />
          <div className="grid grid-cols-3 gap-3">
            {product.images.map((image) => (
              <img
                key={image.id}
                loading="lazy"
                src={getAssetUrl(image.imageUrl)}
                alt={image.altText}
                className="h-28 w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay">
            {t(`categories.${product.category}`, product.category)}
          </p>
          <h1 className="mt-3 font-display text-4xl text-forest">{product.name}</h1>
          <p className="mt-4 text-sm leading-7 text-stone-600">{product.description}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{t("labels.price")}</p>
              <p className="mt-2 font-semibold text-clay">{formatCurrency(product.price, i18n.language)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{t("labels.authenticityTag")}</p>
              <p className="mt-2 text-sm text-stone-700">{product.authenticityTag}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{t("labels.region")}</p>
              <p className="mt-2 text-sm text-stone-700">{product.region}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">{t("labels.rating")}</p>
              <p className="mt-2 text-sm text-stone-700">{product.averageRating.toFixed(1)}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {user?.role === "buyer" && (
              <>
                <button type="button" className="rounded-full bg-clay px-5 py-3 text-sm font-semibold text-white" onClick={addToCart}>
                  {t("actions.addToCart")}
                </button>
                <button type="button" className="rounded-full bg-sand px-5 py-3 text-sm font-semibold text-stone-700" onClick={addToWishlist}>
                  {t("actions.addToWishlist")}
                </button>
              </>
            )}
          </div>

          {statusMessage && <p className="mt-4 text-sm text-forest">{statusMessage}</p>}

          <div className="mt-8 rounded-[2rem] bg-sand/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay">{t("product.artisanStory")}</p>
            <h2 className="mt-3 font-display text-2xl text-forest">{product.artisan.name}</h2>
            <p className="mt-2 text-sm text-stone-500">{product.artisanStory?.craft}</p>
            <p className="mt-4 text-sm leading-7 text-stone-600">{product.artisanStory?.story}</p>
            <p className="mt-4 text-sm leading-7 text-stone-600">{product.artisanStory?.culturalInfo}</p>
          </div>
        </div>
      </div>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl text-forest">{t("reviews.title")}</h2>
        <div className="mt-6 space-y-4">
          {product.reviews.length === 0 && (
            <EmptyState title={t("reviews.emptyTitle")} description={t("reviews.emptyDescription")} />
          )}
          {product.reviews.map((review) => (
            <article key={review.id} className="rounded-2xl bg-sand/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-forest">{review.buyerName}</p>
                <p className="text-sm text-stone-500">{formatDate(review.createdAt, i18n.language)}</p>
              </div>
              <p className="mt-2 text-sm text-clay">{t("labels.rating")}: {review.rating}</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{review.comment}</p>
            </article>
          ))}
        </div>

        {user?.role === "buyer" && (
          <form className="mt-6 grid gap-4 rounded-[2rem] bg-[#f8f2e7] p-5" onSubmit={submitReview}>
            <h3 className="font-display text-2xl text-forest">{t("reviews.addTitle")}</h3>
            <select
              className="rounded-2xl border border-stone-200 px-4 py-3"
              value={reviewForm.rating}
              onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <textarea
              className="min-h-32 rounded-2xl border border-stone-200 px-4 py-3"
              placeholder={t("reviews.commentPlaceholder")}
              value={reviewForm.comment}
              onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
            />
            <button type="submit" className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white">
              {t("actions.submitReview")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;

