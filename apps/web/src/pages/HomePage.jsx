import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { getAssetUrl, request } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";

const HomePage = () => {
  const { t } = useTranslation();
  const featuredArtisans = useAsyncData(() => request("/users/artisans/featured"), [], { artisans: [] });
  const trendingProducts = useAsyncData(() => request("/products/trending"), [], { products: [] });
  const trustKeys = ["trust", "story", "reach", "payments"];
  const categoryKeys = ["pottery", "textiles", "decor"];
  const processKeys = ["discover", "connect", "deliver"];
  const heroMetrics = [
    {
      value: t("home.metrics.artisansValue"),
      label: t("home.metrics.artisansLabel")
    },
    {
      value: t("home.metrics.regionsValue"),
      label: t("home.metrics.regionsLabel")
    },
    {
      value: t("home.metrics.verifiedValue"),
      label: t("home.metrics.verifiedLabel")
    }
  ];
  const categoryArtwork = {
    pottery: "/uploads/seeds/blue-vase.svg",
    textiles: "/uploads/seeds/market-hero.svg",
    decor: "/uploads/seeds/lotus-plates.svg"
  };

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2.8rem] border border-[#d8b98a]/60 bg-[linear-gradient(135deg,#fff8ea_0%,#f4e2c2_48%,#d4af84_100%)] shadow-[0_40px_120px_-55px_rgba(88,53,24,0.55)]">
        <div className="grid gap-8 px-7 py-8 sm:px-10 sm:py-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-clay">{t("home.heroEyebrow")}</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.02] text-forest sm:text-6xl xl:text-[4.5rem]">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
              {t("home.heroDescription")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/marketplace"
                className="rounded-full bg-forest px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-lg shadow-forest/20"
              >
                {t("actions.shopNow")}
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-white/60 bg-white/80 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-stone-700 backdrop-blur"
              >
                {t("actions.joinMarketplace")}
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.8rem] border border-white/60 bg-white/75 px-5 py-4 shadow-lg shadow-white/20 backdrop-blur"
                >
                  <p className="font-display text-3xl text-forest">{metric.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="relative overflow-hidden rounded-[2.4rem] border border-white/50 bg-[#fbf5e8]/80 p-4 shadow-2xl shadow-clay/15 backdrop-blur">
              <img
                src={getAssetUrl("/uploads/seeds/market-hero.svg")}
                alt={t("home.heroImageAlt")}
                className="h-[420px] w-full rounded-[2rem] object-cover object-center"
              />
              <div className="absolute inset-x-9 bottom-9 rounded-[1.8rem] border border-white/40 bg-stone-950/75 p-5 text-white shadow-2xl backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8c2a6]">
                  {t("home.heroPanelEyebrow")}
                </p>
                <h2 className="mt-3 font-display text-3xl leading-tight">{t("home.heroPanelTitle")}</h2>
                <p className="mt-3 text-sm leading-7 text-stone-200">{t("home.heroPanelDescription")}</p>
                <div className="mt-4 space-y-2">
                  {["verification", "storytelling", "fulfillment"].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-stone-100">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#d9b280]" />
                      <span>{t(`home.heroPanelItems.${item}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle
          eyebrow={t("home.promiseEyebrow")}
          title={t("home.promiseTitle")}
          description={t("home.promiseDescription")}
        />
        <div className="grid gap-4 lg:grid-cols-4">
          {trustKeys.map((key, index) => (
            <div
              key={key}
              className="rounded-[2rem] border border-stone-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-45px_rgba(76,45,20,0.55)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-clay">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-display text-3xl text-forest">{t(`home.cards.${key}.title`)}</h3>
              <p className="mt-4 text-sm leading-7 text-stone-600">{t(`home.cards.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle
          eyebrow={t("home.collectionEyebrow")}
          title={t("home.collectionTitle")}
          description={t("home.collectionDescription")}
        />
        <div className="grid gap-5 xl:grid-cols-3">
          {categoryKeys.map((key) => (
            <article
              key={key}
              className="group overflow-hidden rounded-[2.2rem] border border-stone-200/80 bg-white shadow-[0_24px_80px_-48px_rgba(76,45,20,0.6)]"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={getAssetUrl(categoryArtwork[key])}
                  alt={t(`home.collectionCards.${key}.title`)}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-clay">
                  {t(`categories.${key}`)}
                </p>
                <h3 className="mt-3 font-display text-3xl text-forest">
                  {t(`home.collectionCards.${key}.title`)}
                </h3>
                <p className="mt-4 text-sm leading-7 text-stone-600">
                  {t(`home.collectionCards.${key}.description`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle
          eyebrow={t("home.featuredArtisansEyebrow")}
          title={t("home.featuredArtisansTitle")}
          description={t("home.featuredArtisansDescription")}
        />
        {featuredArtisans.loading && <LoadingState />}
        {!featuredArtisans.loading && featuredArtisans.data.artisans.length === 0 && (
          <EmptyState title={t("states.noArtisans")} description={t("states.noArtisansDescription")} />
        )}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredArtisans.data.artisans.map((artisan) => (
            <article
              key={artisan.id}
              className="overflow-hidden rounded-[2.2rem] border border-stone-200/80 bg-white shadow-[0_24px_80px_-48px_rgba(76,45,20,0.6)]"
            >
              <div className="rounded-b-[2rem] bg-[linear-gradient(135deg,#365f4d_0%,#214133_60%,#172a21_100%)] px-6 py-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d9bf9d]">{artisan.craft}</p>
                    <h3 className="mt-3 font-display text-3xl">{artisan.name}</h3>
                  </div>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/90">
                    {t("badges.verified")}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/70">{artisan.region}</p>
              </div>
              <div className="p-6">
                <p className="text-sm leading-7 text-stone-600">{artisan.story}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    {t("labels.rating")}: {artisan.averageRating.toFixed(1)}
                  </span>
                  <Link
                    to={`/marketplace?artisan=${artisan.id}`}
                    className="inline-flex rounded-full border border-clay/20 px-4 py-2 text-sm font-semibold text-clay transition hover:border-clay hover:bg-clay hover:text-white"
                  >
                    {t("actions.viewProfile")}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.6rem] bg-[linear-gradient(140deg,#1d3228_0%,#274739_55%,#325745_100%)] px-6 py-8 text-white shadow-[0_34px_110px_-55px_rgba(18,31,25,0.8)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d9bf9d]">{t("home.trendingEyebrow")}</p>
            <h2 className="mt-3 font-display text-4xl text-white">{t("home.trendingTitle")}</h2>
            <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">{t("home.trendingDescription")}</p>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/70">{t("home.trendingNote")}</p>
        </div>
        {trendingProducts.loading && <LoadingState />}
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {trendingProducts.data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle
          eyebrow={t("home.processEyebrow")}
          title={t("home.processTitle")}
          description={t("home.processDescription")}
        />
        <div className="grid gap-5 xl:grid-cols-3">
          {processKeys.map((key, index) => (
            <article
              key={key}
              className="rounded-[2.2rem] border border-stone-200/80 bg-white px-6 py-7 shadow-[0_20px_70px_-50px_rgba(76,45,20,0.55)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-clay">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-display text-3xl text-forest">{t(`home.process.steps.${key}.title`)}</h3>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                {t(`home.process.steps.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.6rem] border border-[#dcc39b] bg-[linear-gradient(135deg,#fff8ea_0%,#f3dfbb_52%,#e0c092_100%)] px-7 py-8 shadow-[0_30px_100px_-55px_rgba(76,45,20,0.65)] sm:px-10 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-clay">{t("home.ctaEyebrow")}</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-forest sm:text-5xl">
              {t("home.ctaTitle")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-stone-700">{t("home.ctaDescription")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/marketplace" className="rounded-full bg-forest px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white">
              {t("actions.shopNow")}
            </Link>
            <Link to="/signup" className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-stone-700">
              {t("actions.joinMarketplace")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
