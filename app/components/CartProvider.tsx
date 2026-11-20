"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../data/products";
import { useProducts } from "../lib/store";

export type CheckoutDetails = {
  name: string;
  phone: string;
  email: string;
  pickup: string;
};

type Cart = Record<string, number>;
export type CartLine = { product: Product; qty: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (id: string) => void;
  remove: (id: string) => void;
  checkout: (details: CheckoutDetails) => Promise<string | null>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const items = useProducts();
  const [cart, setCart] = useState<Cart>({});
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  // Quantities are clamped to current stock, so lowering stock in the admin
  // can never leave more in the bag than exists.
  const lines = useMemo<CartLine[]>(
    () =>
      items
        .map((product) => ({
          product,
          qty: Math.min(cart[product.id] ?? 0, product.stock),
        }))
        .filter((l) => l.qty > 0),
    [items, cart],
  );

  const count = useMemo(() => lines.reduce((a, l) => a + l.qty, 0), [lines]);
  const total = useMemo(
    () => lines.reduce((s, l) => s + l.product.price * l.qty, 0),
    [lines],
  );

  const add = useCallback(
    (id: string) => {
      const p = items.find((x) => x.id === id);
      if (!p || p.stock <= 0) return flash("Sold out");
      if ((cart[id] ?? 0) >= p.stock)
        return flash(`Only ${p.stock} in stock`);
      setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
      flash("Added to your bag");
    },
    [items, cart, flash],
  );

  const remove = useCallback((id: string) => {
    setCart((c) => {
      const next = { ...c, [id]: (c[id] ?? 0) - 1 };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }, []);

  // Creates the order on the server and sends the customer to Stripe to pay.
  // Resolves to an error message; on success the page navigates away.
  const checkout = useCallback(
    async (details: CheckoutDetails): Promise<string | null> => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...details,
            items: lines.map((l) => ({ id: l.product.id, qty: l.qty })),
          }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          return data.error ?? "Something went wrong. Please try again.";
        }
        window.location.assign(data.url);
        return null;
      } catch {
        return "No connection. Please try again.";
      }
    },
    [lines],
  );

  const value = useMemo(
    () => ({ lines, count, total, add, remove, checkout }),
    [lines, count, total, add, remove, checkout],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div className={`toast${toast ? " show" : ""}`} role="status">
        {toast}
      </div>
    </CartContext.Provider>
  );
}
