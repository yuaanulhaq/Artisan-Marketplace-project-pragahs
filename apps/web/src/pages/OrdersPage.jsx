import { useState } from "react";
import { useTranslation } from "react-i18next";

import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { useAsyncData } from "../hooks/useAsyncData";
import { formatCurrency, formatDate } from "../lib/format";
import { request } from "../lib/api";
import { useAuth } from "../store/AuthContext";

const OrdersPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const orders = useAsyncData(() => request("/orders"), [], { orders: [] });
  const [disputeReasons, setDisputeReasons] = useState({});

  const updateStatus = async (orderId, status) => {
    await request(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: {
        status,
        updateLabel: t(`orderUpdates.${status}`),
        trackingNumber: status === "shipped" ? `TRK-${orderId.slice(0, 8)}` : ""
      }
    });
    orders.reload();
  };

  const createDispute = async (orderId) => {
    await request(`/orders/${orderId}/disputes`, {
      method: "POST",
      body: {
        reason: disputeReasons[orderId] || t("orders.defaultDisputeReason")
      }
    });
    orders.reload();
  };

  if (orders.loading) {
    return <LoadingState />;
  }

  if (orders.data.orders.length === 0) {
    return <EmptyState title={t("orders.emptyTitle")} description={t("orders.emptyDescription")} />;
  }

  return (
    <div className="space-y-5">
      {orders.data.orders.map((order) => (
        <article key={order.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay">{t("orders.orderId")}</p>
              <h2 className="mt-2 font-display text-3xl text-forest">#{order.id.slice(0, 8)}</h2>
              <p className="mt-3 text-sm text-stone-500">{formatDate(order.createdAt, i18n.language)}</p>
            </div>
            <div className="rounded-full bg-sand px-4 py-2 text-sm text-stone-700">{t(`status.${order.status}`)}</div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-2xl bg-sand/60 p-4">
                <p className="font-semibold text-forest">{item.product.name}</p>
                <p className="mt-2 text-sm text-stone-500">{item.product.artisanName}</p>
                <p className="mt-3 text-sm text-stone-700">
                  {item.quantity} x {formatCurrency(item.unitPrice, i18n.language)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="font-semibold text-clay">{formatCurrency(order.totalAmount, i18n.language)}</span>
            {user?.role !== "buyer" && (
              <>
                <button type="button" className="rounded-full bg-forest px-4 py-2 text-sm text-white" onClick={() => updateStatus(order.id, "shipped")}>
                  {t("actions.markShipped")}
                </button>
                <button type="button" className="rounded-full bg-clay px-4 py-2 text-sm text-white" onClick={() => updateStatus(order.id, "delivered")}>
                  {t("actions.markDelivered")}
                </button>
              </>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-stone-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay">{t("orders.tracking")}</p>
            <div className="mt-4 space-y-3">
              {order.trackingUpdates.map((entry, index) => (
                <div key={`${order.id}-${index}`} className="text-sm text-stone-600">
                  <span className="font-semibold text-forest">{entry.label}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(entry.timestamp, i18n.language)}</span>
                </div>
              ))}
            </div>
          </div>

          {user?.role === "buyer" && (
            <div className="mt-5 grid gap-3 rounded-2xl bg-[#f8f2e7] p-4">
              <input
                className="rounded-2xl border border-stone-200 px-4 py-3"
                placeholder={t("orders.disputePlaceholder")}
                value={disputeReasons[order.id] || ""}
                onChange={(event) =>
                  setDisputeReasons((current) => ({
                    ...current,
                    [order.id]: event.target.value
                  }))
                }
              />
              <button type="button" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700" onClick={() => createDispute(order.id)}>
                {t("actions.raiseDispute")}
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

export default OrdersPage;

