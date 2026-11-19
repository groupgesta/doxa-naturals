"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LOW_STOCK, money, type Product } from "../../../data/products";
import {
  adjustStock,
  deleteProduct,
  updateProduct,
  useProducts,
  useProductsReady,
} from "../../../lib/store";
import { useBusy } from "../../../lib/use-busy";
import Spinner from "../../../components/Spinner";
import DataTable, { type Column } from "../../components/DataTable";
import ProductDialog from "../../ProductDialog";

type Filter = "all" | "low" | "out";
type DialogState = null | { product?: Product };

function stockStatus(stock: number) {
  return stock <= 0
    ? { cls: "out", label: "Sold out" }
    : stock <= LOW_STOCK
      ? { cls: "low", label: "Low stock" }
      : { cls: "ok", label: "In stock" };
}

export default function ProductsView() {
  const products = useProducts();
  const ready = useProductsReady();
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

  const columns: Column<Product>[] = [
    {
      id: "product",
      header: "Product",
      primary: true,
      hideLabel: true,
      cell: (p) => (
        <div className="cell-product">
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
      ),
    },
    { id: "price", header: "Price", cell: (p) => money(p.price) },
    {
      id: "stock",
      header: "Stock",
      cell: (p) => <StockControl key={p.stock} product={p} />,
    },
    {
      id: "status",
      header: "Status",
      cell: (p) => {
        const st = stockStatus(p.stock);
        return <span className={`pill ${st.cls}`}>{st.label}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      primary: true,
      hideLabel: true,
      cell: (p) => (
        <RowActions product={p} onEdit={() => setDialog({ product: p })} />
      ),
    },
  ];

  return (
    <>
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

      <DataTable
        key={`${filter}|${query}`}
        label="Products"
        columns={columns}
        rows={visible}
        rowKey={(p) => p.id}
        template="2.4fr 0.9fr 1.3fr 1fr 1.5fr"
        pageSize={8}
        empty={
          !ready
            ? "Loading…"
            : products.length
              ? "No products match this filter."
              : "No products yet. Add your first one."
        }
      />

      <p className="admin-foot">
        Changes go live on the shop straight away.
      </p>

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

function RowActions({
  product: p,
  onEdit,
}: {
  product: Product;
  onEdit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, act] = useBusy();
  return (
    <span className="row-actions">
      <button className="text-btn" onClick={onEdit}>
        Edit
      </button>
      {confirming ? (
        <>
          <button
            className="text-btn danger"
            disabled={pending !== null}
            onClick={() => act("delete", () => deleteProduct(p.id))}
          >
            {pending === "delete" ? <Spinner /> : "Confirm delete"}
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
  );
}

function StockControl({ product: p }: { product: Product }) {
  const [draft, setDraft] = useState(String(p.stock));
  const [pending, act] = useBusy();

  function commit() {
    const n = Math.max(0, Math.floor(Number(draft)));
    if (Number.isFinite(n) && n !== p.stock)
      act("stock", () => updateProduct(p.id, { stock: n }));
    else setDraft(String(p.stock));
  }

  return (
    <span className="stepper">
      <button
        aria-label={`Decrease ${p.name} stock`}
        disabled={pending !== null || p.stock <= 0}
        onClick={() => act("minus", () => adjustStock(p.id, -1))}
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
        disabled={pending !== null}
        onClick={() => act("plus", () => adjustStock(p.id, 1))}
      >
        +
      </button>
    </span>
  );
}
