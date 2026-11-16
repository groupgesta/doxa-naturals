"use client";

import { useMemo, useState } from "react";
import { money } from "../../../data/products";
import {
  deleteOrder,
  isRevenue,
  setOrderStatus,
  STATUS_LABEL,
  STATUS_ORDER,
  resetOrders,
  useOrders,
  type Order,
  type OrderStatus,
} from "../../../lib/orders";
import { useProducts } from "../../../lib/store";
import OrderDialog from "./OrderDialog";

type Filter = "all" | OrderStatus;

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  new: { to: "confirmed", label: "Confirm" },
  confirmed: { to: "paid", label: "Mark paid" },
  paid: { to: "collected", label: "Mark collected" },
  cancelled: { to: "new", label: "Reopen" },
};

const fmt = (t: number) =>
  new Date(t).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function waLink(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (!d) return null;
  return `https://wa.me/${d.length === 8 ? "230" + d : d}`;
}

export default function OrdersView() {
  const orders = useOrders();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "all" || o.status === filter) &&
        (!q ||
          o.customer.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          String(o.number).includes(q)),
    );
  }, [orders, filter, query]);

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="kicker">Orders</div>
          <h1>Customer orders</h1>
        </div>
        <button className="btn" onClick={() => setAdding(true)}>
          + New order
        </button>
      </div>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter orders">
          {(["all", ...STATUS_ORDER] as Filter[]).map((key) => (
            <button
              key={key}
              className={filter === key ? "chip on" : "chip"}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {key === "all" ? "All" : STATUS_LABEL[key]}
              <span className="chip-count">{counts[key] ?? 0}</span>
            </button>
          ))}
        </div>
        <input
          className="search"
          type="search"
          placeholder="Search name, phone or #"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search orders"
        />
      </div>

      <div className="orders">
        {visible.length ? (
          visible.map((o) => (
            <OrderRow
              key={o.id}
              order={o}
              expanded={open === o.id}
              onToggle={() => setOpen(open === o.id ? null : o.id)}
            />
          ))
        ) : (
          <p className="table-empty">
            {orders.length
              ? "No orders match this filter."
              : "No orders yet. When a customer messages you on WhatsApp, add the order here."}
          </p>
        )}
      </div>

      <p className="admin-foot">
        Confirming an order takes its items out of stock. Cancelling or
        deleting it puts them back. Demo orders are saved in this browser only.{" "}
        <button
          className="text-btn"
          onClick={() => {
            if (confirm("Reset orders to the demo data?")) resetOrders();
          }}
        >
          Reset demo orders
        </button>
      </p>

      {adding && <OrderDialog onClose={() => setAdding(false)} />}
    </>
  );
}

function OrderRow({
  order: o,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const products = useProducts();
  const [confirming, setConfirming] = useState(false);
  const next = NEXT[o.status];
  const wa = waLink(o.phone);
  const units = o.items.reduce((s, i) => s + i.qty, 0);

  // Only meaningful before stock has been taken out.
  const short = o.stockDeducted
    ? []
    : o.items.filter((i) => {
        const p = products.find((x) => x.id === i.productId);
        return !p || p.stock < i.qty;
      });

  return (
    <article className={`order${expanded ? " open" : ""}`}>
      <button
        className="order-summary"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="o-num">#{o.number}</span>
        <span className="o-who">
          <strong>{o.customer}</strong>
          <small>
            {fmt(o.createdAt)} · {units} {units === 1 ? "item" : "items"} ·{" "}
            {o.pickup}
          </small>
        </span>
        <span className={`pill s-${o.status}`}>{STATUS_LABEL[o.status]}</span>
        <strong className="o-total">{money(o.total)}</strong>
        <span className="o-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {expanded && (
        <div className="order-detail">
          <ul className="o-items">
            {o.items.map((i) => (
              <li key={i.productId + i.name}>
                <span>
                  {i.qty} × {i.name} <small>({i.size})</small>
                </span>
                <span>{money(i.qty * i.price)}</span>
              </li>
            ))}
            <li className="o-sum">
              <span>Total</span>
              <span>{money(o.total)}</span>
            </li>
          </ul>

          <div className="o-meta">
            <span>
              Phone: {o.phone || "not given"}
              {wa && (
                <>
                  {" · "}
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    WhatsApp ↗
                  </a>
                </>
              )}
            </span>
            {o.note && <span>Note: {o.note}</span>}
            {isRevenue(o) && <span>Counted in revenue.</span>}
          </div>

          {short.length > 0 && (
            <p className="form-error">
              Not enough stock for {short.map((i) => i.name).join(", ")}.
              Confirming will set it to 0.
            </p>
          )}

          <div className="o-actions">
            {next && (
              <button
                className="btn small"
                onClick={() => setOrderStatus(o.id, next.to)}
              >
                {next.label}
              </button>
            )}
            {(o.status === "new" ||
              o.status === "confirmed" ||
              o.status === "paid") && (
              <button
                className="btn secondary small"
                onClick={() => setOrderStatus(o.id, "cancelled")}
              >
                Cancel order
              </button>
            )}
            <label className="o-select">
              Status
              <select
                value={o.status}
                onChange={(e) =>
                  setOrderStatus(o.id, e.target.value as OrderStatus)
                }
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            {confirming ? (
              <>
                <button
                  className="text-btn danger"
                  onClick={() => deleteOrder(o.id)}
                >
                  Confirm delete
                </button>
                <button
                  className="text-btn"
                  onClick={() => setConfirming(false)}
                >
                  Keep
                </button>
              </>
            ) : (
              <button
                className="text-btn danger"
                onClick={() => setConfirming(true)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
