import { useSyncExternalStore } from "react";
import { products as defaults, type Product } from "../data/products";

// Demo persistence: the catalogue lives in the browser's localStorage and is
// shared by the shop and the admin dashboard. Swap this module for real API
// calls once there is a backend; the hook and mutators are the whole surface.

const KEY = "doxa:products:v1";
const listeners = new Set<() => void>();

let cacheRaw: string | null | undefined;
let cache: Product[] = defaults;

function read(): Product[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? (JSON.parse(raw) as Product[]) : defaults;
  } catch {
    cache = defaults;
  }
  return cache;
}

function write(next: Product[] | null): boolean {
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    return false; // storage full or blocked
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

export function useProducts(): Product[] {
  return useSyncExternalStore(subscribe, read, () => defaults);
}

export type ProductInput = Omit<Product, "id">;

export function addProduct(input: ProductInput): boolean {
  const id = `p-${Date.now().toString(36)}`;
  return write([...read(), { id, ...input }]);
}

export function updateProduct(id: string, patch: Partial<ProductInput>) {
  return write(read().map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export function adjustStock(id: string, delta: number) {
  const p = read().find((x) => x.id === id);
  if (!p) return false;
  return updateProduct(id, { stock: Math.max(0, p.stock + delta) });
}

export function deleteProduct(id: string) {
  return write(read().filter((p) => p.id !== id));
}

export function resetProducts() {
  return write(null);
}
