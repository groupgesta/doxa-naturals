"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LOW_STOCK, money } from "../../data/products";
import { useNow } from "../../lib/now";
import {
  isRevenue,
  STATUS_LABEL,
  useOrders,
  type Order,
} from "../../lib/orders";
import { useProducts } from "../../lib/store";

const DAY = 864e5;
const fmtDay = (t: number) =>
  new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function Overview() {
  const now = useNow();
  const orders = useOrders();
  const products = useProducts();
  const [days, setDays] = useState<7 | 30>(30);

  const data = useMemo(() => {
    if (now === null) return null;
    const from = now - days * DAY;
    const prevFrom = from - days * DAY;
    const inPeriod = (o: Order) => o.createdAt >= from;
    const inPrev = (o: Order) => o.createdAt >= prevFrom && o.createdAt < from;

    const paid = orders.filter((o) => isRevenue(o) && inPeriod(o));
    const prevPaid = orders.filter((o) => isRevenue(o) && inPrev(o));
    const revenue = paid.reduce((s, o) => s + o.total, 0);
    const prevRevenue = prevPaid.reduce((s, o) => s + o.total, 0);
    const placed = orders.filter((o) => o.status !== "cancelled" && inPeriod(o));
    const awaiting = orders
      .filter((o) => o.status === "new" || o.status === "confirmed")
      .reduce((s, o) => s + o.total, 0);

    // One bucket per local calendar day, oldest first.
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const today = midnight.getTime();
    const series = Array.from({ length: days }, (_, i) => {
      const start = today - (days - 1 - i) * DAY;
      const total = paid
        .filter((o) => o.createdAt >= start && o.createdAt < start + DAY)
        .reduce((s, o) => s + o.total, 0);
      return { start, total };
    });

    const sellers = new Map<string, { units: number; revenue: number }>();
    for (const o of placed)
      for (const it of o.items) {
        const cur = sellers.get(it.name) ?? { units: 0, revenue: 0 };
        cur.units += it.qty;
        cur.revenue += it.qty * it.price;
        sellers.set(it.name, cur);
      }
    const top = [...sellers.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      revenue,
      delta: prevRevenue ? (revenue - prevRevenue) / prevRevenue : null,
      placedCount: placed.length,
      avg: paid.length ? revenue / paid.length : 0,
      awaiting,
      series,
      top,
    };
  }, [now, orders, days]);

  const alerts = products.filter((p) => p.stock <= LOW_STOCK);
  const fresh = orders.filter((o) => o.status === "new");
  const recent = orders.slice(0, 5);

  return (
    <>
      <div className="admin-head">
        <div>
          <div className="kicker">Overview</div>
          <h1>How the shop is doing</h1>
        </div>
        <div className="chips" role="group" aria-label="Period">
          {([7, 30] as const).map((d) => (
            <button
              key={d}
              className={days === d ? "chip on" : "chip"}
              aria-pressed={days === d}
              onClick={() => setDays(d)}
            >
              Last {d} days
            </button>
          ))}
        </div>
      </div>

      {!data ? (
        <p className="table-empty">Loading…</p>
      ) : (
        <>
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Revenue</span>
              <strong>{money(data.revenue)}</strong>
              <small>
                {data.delta === null
                  ? "Paid orders, no earlier period to compare"
                  : `${data.delta >= 0 ? "▲" : "▼"} ${Math.abs(
                      Math.round(data.delta * 100),
                    )}% vs previous ${days} days`}
              </small>
            </div>
            <div className="stat">
              <span className="stat-label">Orders</span>
              <strong>{data.placedCount}</strong>
              <small>Excluding cancelled</small>
            </div>
            <div className="stat">
              <span className="stat-label">Average order</span>
              <strong>{money(Math.round(data.avg))}</strong>
              <small>Paid orders only</small>
            </div>
            <div className={`stat${data.awaiting ? " warn" : ""}`}>
              <span className="stat-label">Awaiting payment</span>
              <strong>{money(data.awaiting)}</strong>
              <small>New and confirmed orders</small>
            </div>
          </div>

          <div className="panels">
            <section className="panel wide">
              <h2>Revenue per day</h2>
              <RevenueChart series={data.series} />
            </section>

            <section className="panel">
              <h2>Top sellers</h2>
              {data.top.length ? (
                <ul className="sellers">
                  {data.top.map((t) => (
                    <li key={t.name}>
                      <div className="bars-row">
                        <span>{t.name}</span>
                        <strong>{money(t.revenue)}</strong>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${(t.revenue / data.top[0].revenue) * 100}%`,
                          }}
                        />
                      </div>
                      <small>{t.units} sold</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No orders in this period.</p>
              )}
            </section>

            <section className="panel">
              <h2>Needs attention</h2>
              <ul className="alerts">
                {fresh.length > 0 && (
                  <li>
                    <span>
                      <b>{fresh.length}</b> new{" "}
                      {fresh.length === 1 ? "order" : "orders"} to confirm
                    </span>
                    <Link href="/admin/orders">Review</Link>
                  </li>
                )}
                {alerts.map((p) => (
                  <li key={p.id}>
                    <span>
                      {p.name}:{" "}
                      <b>{p.stock <= 0 ? "sold out" : `${p.stock} left`}</b>
                    </span>
                    <Link href="/admin/products">Restock</Link>
                  </li>
                ))}
                {!fresh.length && !alerts.length && (
                  <li className="muted">Nothing needs attention.</li>
                )}
              </ul>
            </section>

            <section className="panel wide">
              <div className="panel-head">
                <h2>Recent orders</h2>
                <Link className="text-btn" href="/admin/orders">
                  All orders
                </Link>
              </div>
              {recent.length ? (
                <ul className="recent">
                  {recent.map((o) => (
                    <li key={o.id}>
                      <span className="recent-id">#{o.number}</span>
                      <span className="recent-name">{o.customer}</span>
                      <span className="recent-date">{fmtDay(o.createdAt)}</span>
                      <span className={`pill s-${o.status}`}>
                        {STATUS_LABEL[o.status]}
                      </span>
                      <strong>{money(o.total)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">
                  No orders yet. Add one from the Orders tab when a customer
                  messages you on WhatsApp.
                </p>
              )}
            </section>
          </div>

          <p className="admin-foot">
            Revenue counts orders marked Paid or Collected. Demo orders are
            saved in this browser only.
          </p>
        </>
      )}
    </>
  );
}

function RevenueChart({ series }: { series: { start: number; total: number }[] }) {
  const W = 640;
  const H = 200;
  const padL = 48;
  const padB = 24;
  const padT = 10;
  const max = Math.max(1, ...series.map((s) => s.total));
  // Round the top of the axis to a clean number.
  const mag = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / mag) * mag;
  const innerW = W - padL;
  const innerH = H - padB - padT;
  const bw = innerW / series.length;
  const ticks = [0, top / 2, top];
  const every = series.length > 14 ? Math.ceil(series.length / 6) : 1;

  return (
    <svg
      className="chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Revenue per day"
    >
      {ticks.map((t) => {
        const y = padT + innerH - (t / top) * innerH;
        return (
          <g key={t}>
            <line x1={padL} x2={W} y1={y} y2={y} className="grid-line" />
            <text x={padL - 8} y={y + 4} textAnchor="end" className="axis">
              {t >= 1000 ? `${t / 1000}k` : t}
            </text>
          </g>
        );
      })}
      {series.map((s, i) => {
        const h = (s.total / top) * innerH;
        return (
          <g key={s.start}>
            <rect
              x={padL + i * bw + bw * 0.15}
              y={padT + innerH - h}
              width={bw * 0.7}
              height={Math.max(h, s.total ? 2 : 0)}
              rx={2}
              className="bar"
            >
              <title>
                {fmtDay(s.start)}: {money(s.total)}
              </title>
            </rect>
            {i % every === 0 && (
              <text
                x={padL + i * bw + bw / 2}
                y={H - 6}
                textAnchor="middle"
                className="axis"
              >
                {fmtDay(s.start)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
