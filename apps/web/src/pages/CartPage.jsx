import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DashboardStat from "../components/DashboardStat";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { useAsyncData } from "../hooks/useAsyncData";
import { getAssetUrl, request } from "../lib/api";
import { formatCurrency } from "../lib/format";

const defaultAddress = {
  fullName: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  phone: ""
};

const CartPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const cart = useAsyncData(() => request("/cart"), [], { items: [], total: 0 });
  const [address, setAddress] = useState(defaultAddress);
  const [message, setMessage] = useState("");

  const updateQuantity = async (productId, quantity) => {
    await request(`/cart/items/${productId}`, {
      method: "PATCH",
      body: { quantity: Number(quantity) }
    });
    cart.reload();
  };

  const removeItem = async (productId) => {
    await request(`/cart/items/${productId}`, {
      method: "DELETE"
    });
    cart.reload();
  };

  const checkout = async (event) => {
    event.preventDefault();
    const response = await request("/orders/checkout", {
      method: "POST",
      body: {
        paymentMethod: "stripe",
        shippingAddress: address
      }
    });

    if (response.payment?.checkoutUrl) {
      setMessage(t("cart.redirecting"));
      window.location.assign(response.payment.checkoutUrl);
      return;
    }

    setMessage(`${t("cart.demoFallback")} #${response.order.id}`);
    cart.reload();
    navigate("/orders");
  };

  if (cart.loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardStat label={t("cart.items")} value={cart.data.items.length} note={t("cart.itemsNote")} />
        <DashboardStat label={t("cart.total")} value={formatCurrency(cart.data.total, i18n.language)} note={t("cart.totalNote")} />
        <DashboardStat label={t("cart.checkoutTitle")} value={t("cart.secure")} note={t("cart.checkoutNote")} />
      </div>

      {cart.data.items.length === 0 ? (
        <EmptyState title={t("cart.emptyTitle")} description={t("cart.emptyDescription")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-4">
            {cart.data.items.map((item) => (
              <article key={item.id} className="flex flex-col gap-4 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm sm:flex-row">
                <img src={getAssetUrl(item.product.featuredImageUrl)} alt={item.product.name} className="h-32 w-full rounded-2xl object-cover sm:w-36" />
                <div className="flex-1">
                  <h2 className="font-display text-2xl text-forest">{item.product.name}</h2>
                  <p className="mt-2 text-sm text-stone-500">{item.product.artisanName}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      className="w-24 rounded-2xl border border-stone-200 px-4 py-2"
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.product.id, event.target.value)}
                    />
                    <button type="button" className="text-sm text-red-600" onClick={() => removeItem(item.product.id)}>
                      {t("actions.remove")}
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold text-clay">{formatCurrency(item.lineTotal, i18n.language)}</div>
              </article>
            ))}
          </div>

          <form className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm" onSubmit={checkout}>
            <h2 className="font-display text-3xl text-forest">{t("cart.checkoutTitle")}</h2>
            <div className="mt-5 grid gap-3">
              {Object.entries(address).map(([key, value]) => (
                <input
                  key={key}
                  className="rounded-2xl border border-stone-200 px-4 py-3"
                  placeholder={t(`checkout.${key}`)}
                  value={value}
                  onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))}
                />
              ))}
            </div>
            {message && <p className="mt-4 text-sm text-forest">{message}</p>}
            <button type="submit" className="mt-5 rounded-full bg-clay px-5 py-3 text-sm font-semibold text-white">
              {t("actions.placeOrder")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CartPage;
