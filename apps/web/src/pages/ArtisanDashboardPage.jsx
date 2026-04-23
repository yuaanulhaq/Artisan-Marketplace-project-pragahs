import { useState } from "react";
import { useTranslation } from "react-i18next";

import DashboardStat from "../components/DashboardStat";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { useAsyncData } from "../hooks/useAsyncData";
import { getAssetUrl, request } from "../lib/api";
import { formatCurrency } from "../lib/format";
import { useAuth } from "../store/AuthContext";

const emptyProduct = {
  name: "",
  description: "",
  category: "pottery",
  region: "",
  price: 0,
  stock: 1,
  materials: "",
  authenticityTag: "",
  leadTimeDays: 7,
  featuredImageUrl: ""
};

const ArtisanDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { user, refreshProfile } = useAuth();
  const [productForm, setProductForm] = useState(emptyProduct);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [storyForm, setStoryForm] = useState({
    story: user?.artisanProfile?.story || "",
    craft: user?.artisanProfile?.craft || "",
    culturalInfo: user?.artisanProfile?.culturalInfo || ""
  });
  const [editingProductId, setEditingProductId] = useState("");
  const [message, setMessage] = useState("");

  const products = useAsyncData(() => request("/products"), [user?.id], { products: [] });
  const analytics = useAsyncData(() => request("/analytics/artisan/me"), [user?.id], {
    summary: { productCount: 0, revenue: 0, orderCount: 0, views: 0 },
    topProducts: [],
    monthlySales: []
  });

  const myProducts = products.data.products.filter((product) => product.artisan?.id === user?.id);

  if (products.loading || analytics.loading) {
    return <LoadingState />;
  }

  const submitStory = async (event) => {
    event.preventDefault();
    await request("/users/artisans/me/story", {
      method: "PATCH",
      body: storyForm
    });
    await refreshProfile();
    setMessage(t("artisan.storySaved"));
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    const method = editingProductId ? "PATCH" : "POST";
    const path = editingProductId ? `/products/${editingProductId}` : "/products";
    const response = await request(path, {
      method,
      body: {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        leadTimeDays: Number(productForm.leadTimeDays)
      }
    });

    const productId = response.product.id;

    if (selectedFiles.length > 0) {
      const formData = new FormData();
      [...selectedFiles].forEach((file) => formData.append("images", file));
      await request(`/products/${productId}/images`, {
        method: "POST",
        body: formData
      });
    }

    setProductForm(emptyProduct);
    setSelectedFiles([]);
    setEditingProductId("");
    setMessage(t("artisan.productSaved"));
    products.reload();
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      region: product.region,
      price: product.price,
      stock: product.stock,
      materials: product.materials,
      authenticityTag: product.authenticityTag,
      leadTimeDays: product.leadTimeDays,
      featuredImageUrl: product.featuredImageUrl || ""
    });
  };

  const removeProduct = async (productId) => {
    await request(`/products/${productId}`, {
      method: "DELETE"
    });
    products.reload();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardStat label={t("artisan.summary.products")} value={analytics.data.summary.productCount} note={t("artisan.summary.productsNote")} />
        <DashboardStat label={t("artisan.summary.revenue")} value={formatCurrency(analytics.data.summary.revenue, i18n.language)} note={t("artisan.summary.revenueNote")} />
        <DashboardStat label={t("artisan.summary.orders")} value={analytics.data.summary.orderCount} note={t("artisan.summary.ordersNote")} />
        <DashboardStat label={t("artisan.summary.views")} value={analytics.data.summary.views} note={t("artisan.summary.viewsNote")} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm" onSubmit={submitStory}>
          <h2 className="font-display text-3xl text-forest">{t("artisan.storyEditor")}</h2>
          <div className="mt-5 grid gap-3">
            <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("artisan.craft")} value={storyForm.craft} onChange={(event) => setStoryForm((current) => ({ ...current, craft: event.target.value }))} />
            <textarea className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("artisan.story")} value={storyForm.story} onChange={(event) => setStoryForm((current) => ({ ...current, story: event.target.value }))} />
            <textarea className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("artisan.culturalInfo")} value={storyForm.culturalInfo} onChange={(event) => setStoryForm((current) => ({ ...current, culturalInfo: event.target.value }))} />
            <button type="submit" className="rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white">
              {t("actions.saveStory")}
            </button>
          </div>
        </form>

        <form className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm" onSubmit={submitProduct}>
          <h2 className="font-display text-3xl text-forest">{editingProductId ? t("artisan.editProduct") : t("artisan.addProduct")}</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input className="rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2" placeholder={t("product.name")} value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} />
            <textarea className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2" placeholder={t("product.description")} value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
            <select className="rounded-2xl border border-stone-200 px-4 py-3" value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}>
              {["pottery", "decor", "textiles", "jewelry", "woodwork", "paintings"].map((category) => (
                <option key={category} value={category}>
                  {t(`categories.${category}`)}
                </option>
              ))}
            </select>
            <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("auth.region")} value={productForm.region} onChange={(event) => setProductForm((current) => ({ ...current, region: event.target.value }))} />
            <input type="number" className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("labels.price")} value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} />
            <input type="number" className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("product.stock")} value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} />
            <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("product.materials")} value={productForm.materials} onChange={(event) => setProductForm((current) => ({ ...current, materials: event.target.value }))} />
            <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("labels.authenticityTag")} value={productForm.authenticityTag} onChange={(event) => setProductForm((current) => ({ ...current, authenticityTag: event.target.value }))} />
            <input type="number" className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("product.leadTimeDays")} value={productForm.leadTimeDays} onChange={(event) => setProductForm((current) => ({ ...current, leadTimeDays: event.target.value }))} />
            <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("product.featuredImageUrl")} value={productForm.featuredImageUrl} onChange={(event) => setProductForm((current) => ({ ...current, featuredImageUrl: event.target.value }))} />
            <input className="rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2" type="file" multiple accept="image/*" onChange={(event) => setSelectedFiles(event.target.files)} />
            <button type="submit" className="rounded-full bg-clay px-5 py-3 text-sm font-semibold text-white md:col-span-2">
              {editingProductId ? t("actions.updateProduct") : t("actions.addProduct")}
            </button>
          </div>
          {message && <p className="mt-4 text-sm text-forest">{message}</p>}
        </form>
      </div>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl text-forest">{t("artisan.productLibrary")}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {myProducts.length === 0 && (
            <EmptyState title={t("artisan.noProductsTitle")} description={t("artisan.noProductsDescription")} />
          )}
          {myProducts.map((product) => (
            <article key={product.id} className="rounded-[2rem] border border-stone-200 p-4">
              <img src={getAssetUrl(product.featuredImageUrl)} alt={product.name} className="h-40 w-full rounded-2xl object-cover" />
              <h3 className="mt-4 font-display text-2xl text-forest">{product.name}</h3>
              <p className="mt-2 text-sm text-stone-600">{product.description}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-stone-700" onClick={() => editProduct(product)}>
                  {t("actions.edit")}
                </button>
                <button type="button" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600" onClick={() => removeProduct(product.id)}>
                  {t("actions.delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-3xl text-forest">{t("artisan.analyticsTitle")}</h2>
        <div className="mt-5 space-y-4">
          {analytics.data.monthlySales.map((entry) => (
            <div key={entry.month}>
              <div className="flex items-center justify-between text-sm text-stone-600">
                <span>{entry.month}</span>
                <span>{formatCurrency(entry.revenue, i18n.language)}</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-sand">
                <div
                  className="h-3 rounded-full bg-clay"
                  style={{
                    width: `${Math.max(12, Math.min(100, (entry.revenue / Math.max(analytics.data.summary.revenue, 1)) * 100))}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArtisanDashboardPage;
