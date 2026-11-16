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
import { WHATSAPP_NUMBER, money, type Product } from "../data/products";
import { useProducts } from "../lib/store";

type Cart = Record<string, number>;
export type CartLine = { product: Product; qty: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (id: string) => void;
  remove: (id: string) => void;
  checkout: () => void;
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

  const checkout = useCallback(() => {
    const msg = lines.length
      ? `Hello Doxa Naturals! I'd like to order:\n\n${lines
          .map(
            (l) =>
              `${l.qty} × ${l.product.name} (${l.product.size}) - ${money(l.qty * l.product.price)}`,
          )
          .join(
            "\n",
          )}\n\nTotal: ${money(total)}\n\nPlease confirm availability and collection arrangements. Thank you!`
      : "Hello Doxa Naturals! I would like to ask about your products and how to order.";
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [lines, total]);

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
