import { useSyncExternalStore } from "react";
import { products as catalogue } from "../data/products";
import { adjustStock } from "./store";

// Demo persistence in localStorage, same idea as lib/store.ts. Replace the
// read/write internals with API calls when there is a backend.

export type OrderStatus =
  | "new"
  | "confirmed"
  | "paid"
  | "collected"
  | "cancelled";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  paid: "Paid",
  collected: "Collected",
  cancelled: "Cancelled",
};

export const STATUS_ORDER: OrderStatus[] = [
  "new",
  "confirmed",
  "paid",
  "collected",
  "cancelled",
];

export const PICKUPS = ["Curepipe", "Quatre Bornes", "Port Louis"] as const;

export type OrderItem = {
  productId: string;
  name: string;
  size: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  number: number;
  createdAt: number;
  customer: string;
  phone: string;
  pickup: string;
  note: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  /** True while this order's items are subtracted from product stock. */
  stockDeducted: boolean;
};

/** Money has been received. */
export const isRevenue = (o: Order) =>
  o.status === "paid" || o.status === "collected";
/** Counts toward stock and is not cancelled. */
const holdsStock = (s: OrderStatus) =>
  s === "confirmed" || s === "paid" || s === "collected";

const KEY = "doxa:orders:v1";
const listeners = new Set<() => void>();
let cacheRaw: string | null | undefined;
let cache: Order[] = [];
let seeded: Order[] | null = null;

// Demo orders, generated on the client only so the dashboard has something to
// show. They are replaced the moment a real order is added or changed.
function seed(): Order[] {
  if (seeded) return seeded;
  const DAY = 864e5;
  const now = Date.now();
  const byId = Object.fromEntries(catalogue.map((p) => [p.id, p]));
  const rows: [number, string, string, string, [string, number][], OrderStatus][] =
    [
      [0.2, "Demo Customer A", "5700 0001", "Curepipe", [["butter", 1], ["gel", 1]], "new"],
      [0.9, "Demo Customer B", "5700 0002", "Port Louis", [["oil", 1]], "confirmed"],
      [1.4, "Demo Customer C", "5700 0003", "Quatre Bornes", [["butter", 2], ["spray", 1]], "paid"],
      [2.2, "Demo Customer D", "5700 0004", "Curepipe", [["gel", 2]], "collected"],
      [3.1, "Demo Customer E", "5700 0005", "Port Louis", [["shea", 1]], "collected"],
      [4.5, "Demo Customer F", "5700 0006", "Curepipe", [["butter", 1], ["oil", 1], ["spray", 1]], "collected"],
      [5.3, "Demo Customer A", "5700 0001", "Curepipe", [["gel", 1]], "collected"],
      [6.8, "Demo Customer G", "5700 0007", "Quatre Bornes", [["oil", 2]], "cancelled"],
      [8.4, "Demo Customer H", "5700 0008", "Port Louis", [["butter", 1], ["gel", 1]], "collected"],
      [10.2, "Demo Customer I", "5700 0009", "Curepipe", [["spray", 2]], "collected"],
      [12.6, "Demo Customer B", "5700 0002", "Port Louis", [["butter", 3]], "collected"],
      [15.1, "Demo Customer J", "5700 0010", "Quatre Bornes", [["shea", 1], ["gel", 1]], "collected"],
      [18.7, "Demo Customer K", "5700 0011", "Curepipe", [["oil", 1], ["spray", 1]], "collected"],
      [21.3, "Demo Customer C", "5700 0003", "Quatre Bornes", [["butter", 1]], "collected"],
      [24.9, "Demo Customer L", "5700 0012", "Port Louis", [["gel", 3], ["spray", 1]], "collected"],
      [27.5, "Demo Customer M", "5700 0013", "Curepipe", [["butter", 2], ["oil", 1]], "collected"],
      [33.0, "Demo Customer D", "5700 0004", "Curepipe", [["gel", 1], ["butter", 1]], "collected"],
      [38.4, "Demo Customer N", "5700 0014", "Port Louis", [["shea", 1]], "collected"],
    ];
  seeded = rows
    .map(([days, customer, phone, pickup, lines, status], i) => {
      const items: OrderItem[] = lines.map(([id, qty]) => ({
        productId: id,
        name: byId[id].name,
        size: byId[id].size,
        price: byId[id].price,
        qty,
      }));
      return {
        id: `seed-${i}`,
        number: 1000 + rows.length - i,
        createdAt: Math.round(now - days * DAY),
        customer,
        phone,
        pickup,
        note: "",
        items,
        total: items.reduce((s, it) => s + it.price * it.qty, 0),
        status,
        stockDeducted: holdsStock(status),
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
  return seeded;
}

function read(): Order[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? (JSON.parse(raw) as Order[]) : seed();
  } catch {
    cache = seed();
  }
  return cache;
}

function write(next: Order[] | null): boolean {
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: Order[] = [];

/** Empty on the server and during hydration, then the saved orders. */
export function useOrders(): Order[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export type NewOrderInput = {
  customer: string;
  phone: string;
  pickup: string;
  note: string;
  items: OrderItem[];
  status: OrderStatus;
};

export function addOrder(input: NewOrderInput): boolean {
  const orders = read();
  const number = orders.reduce((m, o) => Math.max(m, o.number), 1000) + 1;
  const deduct = holdsStock(input.status);
  if (deduct) input.items.forEach((i) => adjustStock(i.productId, -i.qty));
  const order: Order = {
    ...input,
    id: `o-${Date.now().toString(36)}`,
    number,
    createdAt: Date.now(),
    total: input.items.reduce((s, i) => s + i.price * i.qty, 0),
    stockDeducted: deduct,
  };
  return write([order, ...orders]);
}

/** Moves an order to a new status and keeps product stock in step. */
export function setOrderStatus(id: string, status: OrderStatus) {
  const orders = read();
  const o = orders.find((x) => x.id === id);
  if (!o || o.status === status) return;
  let stockDeducted = o.stockDeducted;
  if (holdsStock(status) && !o.stockDeducted) {
    o.items.forEach((i) => adjustStock(i.productId, -i.qty));
    stockDeducted = true;
  } else if (!holdsStock(status) && o.stockDeducted) {
    o.items.forEach((i) => adjustStock(i.productId, i.qty));
    stockDeducted = false;
  }
  write(orders.map((x) => (x.id === id ? { ...x, status, stockDeducted } : x)));
}

export function deleteOrder(id: string) {
  const o = read().find((x) => x.id === id);
  if (o?.stockDeducted) o.items.forEach((i) => adjustStock(i.productId, i.qty));
  write(read().filter((x) => x.id !== id));
}

export function resetOrders() {
  return write(null);
}
