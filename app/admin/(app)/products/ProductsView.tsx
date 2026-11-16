"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LOW_STOCK, money, type Product } from "../../../data/products";
import {
  adjustStock,
  deleteProduct,
  resetProducts,
  updateProduct,
  useProducts,
} from "../../../lib/store";
import ProductDialog from "../../ProductDialog";

type Filter = "all" | "low" | "out";
type DialogState = null | { product?: Product };

export default function ProductsView() {
  const products = useProducts();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);

  const stats = useMemo(() => {
    const units = products.reduce((s, p) => s + p.stock, 0);
    const value = products.reduce((s, p) => s + p.stock * p.price, 0);
    const out = products.filter((p) => p.stock <= 0).length;
    const low = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK)
      .length;
    return { units, value, out, low };
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === "out" && p.stock > 0) return false;
      if (filter === "low" && !(p.stock > 0 && p.stock <= LOW_STOCK))
        return false;
      return !q || p.name.toLowerCase().includes(q);
    });
  }, [products, filter, query]);

  return (
    <>
      <div>
        <div className="admin-head">
          <div>
            <div className="kicker">Catalogue</div>
            <h1>Products &amp; stock</h1>
          </div>
          <button className="btn" onClick={() => setDialog({})}>
            + Add product
          </button>
        </div>

        <div className="stats">
          <Stat label="Products" value={products.length} />
          <Stat label="Units in stock" value={stats.units} />
          <Stat label="Stock value" value={money(stats.value)} />
          <Stat
            label="Needs attention"
            value={stats.low + stats.out}
            hint={`${stats.low} low · ${stats.out} sold out`}
            warn={stats.low + stats.out > 0}
          />
        </div>

        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filter products">
            {(
              [
                ["all", "All"],
                ["low", "Low stock"],
                ["out", "Sold out"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                className={filter === key ? "chip on" : "chip"}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            className="search"
            type="search"
            placeholder="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <div className="table" role="table" aria-label="Products">
          <div className="tr th" role="row">
            <span role="columnheader">Product</span>
            <span role="columnheader">Price</span>
            <span role="columnheader">Stock</span>
            <span role="columnheader">Status</span>
            <span role="columnheader" className="right">
              Actions
            </span>
          </div>
          {visible.length ? (
            visible.map((p) => (
              <Row key={p.id} product={p} onEdit={() => setDialog({ product: p })} />
            ))
          ) : (
            <p className="table-empty">
              {products.length
                ? "No products match this filter."
                : "No products yet. Add your first one."}
            </p>
          )}
        </div>

        <p className="admin-foot">
          Demo data is saved in this browser only.{" "}
          <button
            className="text-btn"
            onClick={() => {
              if (confirm("Reset the catalogue to the starting products?"))
                resetProducts();
            }}
          >
            Reset to starting products
          </button>
        </p>
      </div>

      {dialog && (
        <ProductDialog
          product={dialog.product}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: string | number;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div className={`stat${warn ? " warn" : ""}`}>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function Row({ product: p, onEdit }: { product: Product; onEdit: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const status =
    p.stock <= 0
      ? { cls: "out", label: "Sold out" }
      : p.stock <= LOW_STOCK
        ? { cls: "low", label: "Low stock" }
        : { cls: "ok", label: "In stock" };

  return (
    <div className="tr" role="row">
      <div className="cell-product" role="cell">
        <div className="thumb">
          {p.image ? (
            <Image src={p.image} alt="" fill sizes="56px" />
          ) : (
            <span>—</span>
          )}
        </div>
        <div>
          <strong>{p.name}</strong>
          <small>{p.size}</small>
        </div>
      </div>
      <span role="cell" data-label="Price">
        {money(p.price)}
      </span>
      <span role="cell" data-label="Stock">
        <StockControl key={p.stock} product={p} />
      </span>
      <span role="cell" data-label="Status">
        <span className={`pill ${status.cls}`}>{status.label}</span>
      </span>
      <span role="cell" className="row-actions right">
        <button className="text-btn" onClick={onEdit}>
          Edit
        </button>
        {confirming ? (
          <>
            <button
              className="text-btn danger"
              onClick={() => deleteProduct(p.id)}
            >
              Confirm delete
            </button>
            <button className="text-btn" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className="text-btn danger" onClick={() => setConfirming(true)}>
            Delete
          </button>
        )}
      </span>
    </div>
  );
}

function StockControl({ product: p }: { product: Product }) {
  const [draft, setDraft] = useState(String(p.stock));

  function commit() {
    const n = Math.max(0, Math.floor(Number(draft)));
    if (Number.isFinite(n) && n !== p.stock) updateProduct(p.id, { stock: n });
    else setDraft(String(p.stock));
  }

  return (
    <span className="stepper">
      <button
        aria-label={`Decrease ${p.name} stock`}
        disabled={p.stock <= 0}
        onClick={() => adjustStock(p.id, -1)}
      >
        −
      </button>
      <input
        inputMode="numeric"
        aria-label={`${p.name} stock`}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
      <button
        aria-label={`Increase ${p.name} stock`}
        onClick={() => adjustStock(p.id, 1)}
      >
        +
      </button>
    </span>
  );
}
