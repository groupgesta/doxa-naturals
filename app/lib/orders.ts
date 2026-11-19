import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";

// Orders backed by Supabase (tables: orders, order_items). Only signed-in
// admins can read them. Customers create orders through the place_order
// function, which takes prices from the products table. Stock changes happen
// inside the database functions so they stay consistent.

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

type OrderRow = {
  id: string;
  number: number;
  created_at: string;
  customer: string;
  phone: string;
  pickup: string;
  note: string;
  status: OrderStatus;
  total: number;
  stock_deducted: boolean;
  order_items: {
    id: number;
    product_id: string;
    name: string;
    size: string;
    price: number;
    qty: number;
  }[];
};

const rowToOrder = (r: OrderRow): Order => ({
  id: r.id,
  number: r.number,
  createdAt: new Date(r.created_at).getTime(),
  customer: r.customer,
  phone: r.phone,
  pickup: r.pickup,
  note: r.note,
  status: r.status,
  total: r.total,
  stockDeducted: r.stock_deducted,
  items: [...r.order_items]
    .sort((a, b) => a.id - b.id)
    .map((i) => ({
      productId: i.product_id,
      name: i.name,
      size: i.size,
      price: i.price,
      qty: i.qty,
    })),
});

const listeners = new Set<() => void>();
const EMPTY: Order[] = [];
let cache: Order[] = EMPTY;
let ready = false;
let started = false;

async function load() {
  const sb = getSupabase();
  if (!sb) return;
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error || !data) return;
  cache = (data as OrderRow[]).map(rowToOrder);
  ready = true;
  listeners.forEach((l) => l());
}

function start() {
  if (started) return;
  started = true;
  const sb = getSupabase();
  if (!sb) return;
  void load();
  sb.channel("orders-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      () => void load(),
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "order_items" },
      () => void load(),
    )
    .subscribe();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  start();
  return () => {
    listeners.delete(cb);
  };
}

/** Empty on the server and until the orders have loaded. */
export function useOrders(): Order[] {
  return useSyncExternalStore(
    subscribe,
    () => cache,
    () => EMPTY,
  );
}

/** False until the first load finishes. */
export function useOrdersReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
}

export type NewOrderInput = {
  customer: string;
  phone: string;
  pickup: string;
  note: string;
  items: Pick<OrderItem, "productId" | "qty">[];
  status: OrderStatus;
};

/** Every mutator resolves to an error message, or null on success. */
export async function addOrder(input: NewOrderInput): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return "Supabase is not connected.";
  const { error } = await sb.rpc("place_order", {
    p_customer: input.customer,
    p_phone: input.phone,
    p_pickup: input.pickup,
    p_note: input.note,
    p_status: input.status,
    p_items: input.items.map((i) => ({ product_id: i.productId, qty: i.qty })),
  });
  if (error) return error.message;
  await load();
  return null;
}

/** Moves an order to a new status; the database keeps product stock in step. */
export async function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return "Supabase is not connected.";
  const { error } = await sb.rpc("set_order_status", {
    p_id: id,
    p_status: status,
  });
  if (error) return error.message;
  await load();
  return null;
}

export async function deleteOrder(id: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return "Supabase is not connected.";
  const { error } = await sb.rpc("delete_order", { p_id: id });
  if (error) return error.message;
  await load();
  return null;
}
