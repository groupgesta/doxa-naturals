"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { money } from "../../../data/products";
import {
  addOrder,
  PICKUPS,
  STATUS_LABEL,
  STATUS_ORDER,
  type OrderStatus,
} from "../../../lib/orders";
import { useProducts } from "../../../lib/store";

type Line = { key: number; productId: string; qty: number };

export default function OrderDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const products = useProducts();
  const [lines, setLines] = useState<Line[]>([
    { key: 0, productId: "", qty: 1 },
  ]);
  const [error, setError] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  const priceOf = (id: string) => products.find((p) => p.id === id)?.price ?? 0;
  const total = lines.reduce((s, l) => s + priceOf(l.productId) * l.qty, 0);

  const setLine = (key: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const customer = String(f.get("customer") ?? "").trim();
    if (!customer) return setError("Enter the customer's name.");

    const chosen = lines.filter((l) => l.productId);
    if (!chosen.length) return setError("Add at least one product.");
    if (chosen.some((l) => !Number.isInteger(l.qty) || l.qty < 1))
      return setError("Quantities must be whole numbers, 1 or more.");

    // Merge duplicate products into one line.
    const merged = new Map<string, number>();
    for (const l of chosen)
      merged.set(l.productId, (merged.get(l.productId) ?? 0) + l.qty);
    const items = [...merged.entries()].map(([productId, qty]) => {
      const p = products.find((x) => x.id === productId)!;
      return { productId, name: p.name, size: p.size, price: p.price, qty };
    });

    const ok = addOrder({
      customer,
      phone: String(f.get("phone") ?? "").trim(),
      pickup: String(f.get("pickup")),
      note: String(f.get("note") ?? "").trim(),
      status: String(f.get("status")) as OrderStatus,
      items,
    });
    if (!ok) return setError("Storage is full. Delete some old orders first.");
    ref.current?.close();
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="dialog-head">
          <h2>New order</h2>
          <button
            type="button"
            className="x"
            aria-label="Close"
            onClick={() => ref.current?.close()}
          >
            ×
          </button>
        </div>

        <div className="dialog-body">
          <div className="row2 two">
            <label className="field">
              <span>Customer</span>
              <input name="customer" autoComplete="off" required />
            </label>
            <label className="field">
              <span>Phone</span>
              <input name="phone" inputMode="tel" placeholder="5xxx xxxx" />
            </label>
          </div>

          <div className="field">
            <span>Products</span>
            <div className="lines">
              {lines.map((l) => (
                <div className="line" key={l.key}>
                  <select
                    aria-label="Product"
                    value={l.productId}
                    onChange={(e) =>
                      setLine(l.key, { productId: e.target.value })
                    }
                  >
                    <option value="">Choose a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.size}) · {money(p.price)} · {p.stock} in
                        stock
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="Quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={l.qty}
                    onChange={(e) =>
                      setLine(l.key, { qty: Number(e.target.value) })
                    }
                  />
                  {lines.length > 1 && (
                    <button
                      type="button"
                      className="x small"
                      aria-label="Remove line"
                      onClick={() =>
                        setLines((ls) => ls.filter((x) => x.key !== l.key))
                      }
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="text-btn add-line"
              onClick={() =>
                setLines((ls) => [
                  ...ls,
                  { key: Date.now(), productId: "", qty: 1 },
                ])
              }
            >
              + Add another product
            </button>
          </div>

          <div className="row2 two">
            <label className="field">
              <span>Collection point</span>
              <select name="pickup" defaultValue={PICKUPS[0]}>
                {PICKUPS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select name="status" defaultValue="new">
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Note</span>
            <textarea name="note" rows={2} />
          </label>

          <div className="dialog-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="dialog-foot">
          <button
            type="button"
            className="btn secondary"
            onClick={() => ref.current?.close()}
          >
            Cancel
          </button>
          <button type="submit" className="btn">
            Add order
          </button>
        </div>
      </form>
    </dialog>
  );
}
