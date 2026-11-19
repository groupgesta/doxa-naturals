import { useSyncExternalStore } from "react";
import { products as defaults, type Product } from "../data/products";
import { rowToProduct, type ProductRow } from "./product-row";
import { getSupabase } from "./supabase";

// Product catalogue backed by Supabase (table: products). The hook keeps a
// module-level cache that the shop and the admin dashboard share, loads it
// once, and refreshes it live through Supabase Realtime. Without Supabase env
// vars it falls back to the starting catalogue in data/products.ts.

const listeners = new Set<() => void>();
let cache: Product[] = getSupabase() ? [] : defaults;
let ready = !getSupabase();
let started = false;

const emit = () => listeners.forEach((l) => l());

/** Lets the server-rendered shop hand its products to the client store. */
export function seedProducts(initial: Product[]) {
  if (ready) return;
  cache = initial;
  ready = true;
}

async function load() {
  const sb = getSupabase();
  if (!sb) return;
  const { data, error } = await sb
    .from("products")
    .select("id,name,size,price,description,image,stock")
    .order("position");
  if (error || !data) return;
  cache = (data as ProductRow[]).map(rowToProduct);
  ready = true;
  emit();
}

function start() {
  if (started) return;
  started = true;
  const sb = getSupabase();
  if (!sb) return;
  void load();
  sb.channel("products-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
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

export function useProducts(): Product[] {
  return useSyncExternalStore(
    subscribe,
    () => cache,
    () => cache,
  );
}

/** False until the catalogue has loaded, so screens can avoid an empty flash. */
export function useProductsReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => ready,
  );
}

export type ProductInput = Omit<Product, "id">;

/** Every mutator resolves to an error message, or null on success. */
async function run(
  op: () => PromiseLike<{ error: { message: string } | null }>,
): Promise<string | null> {
  if (!getSupabase()) return "Supabase is not connected.";
  const { error } = await op();
  if (error) return error.message;
  await load();
  return null;
}

export function addProduct(input: ProductInput) {
  const sb = getSupabase();
  return run(() => sb!.from("products").insert(input));
}

export function updateProduct(id: string, patch: Partial<ProductInput>) {
  const sb = getSupabase();
  return run(() => sb!.from("products").update(patch).eq("id", id));
}

export function adjustStock(id: string, delta: number) {
  const sb = getSupabase();
  return run(() => sb!.rpc("adjust_stock", { p_id: id, p_delta: delta }));
}

export function deleteProduct(id: string) {
  const sb = getSupabase();
  return run(() => sb!.from("products").delete().eq("id", id));
}
