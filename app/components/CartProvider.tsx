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
import { products, WHATSAPP_NUMBER, money } from "../data/products";

type Cart = Record<string, number>;

type CartContextValue = {
  cart: Cart;
  count: number;
  total: number;
  toast: string | null;
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
  const [cart, setCart] = useState<Cart>({});
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const add = useCallback((id: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    setToast("Added to your bag");
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const remove = useCallback((id: string) => {
    setCart((c) => {
      const next = { ...c, [id]: (c[id] ?? 0) - 1 };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }, []);

  const count = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart],
  );

  const total = useMemo(
    () => products.reduce((s, p) => s + p.price * (cart[p.id] ?? 0), 0),
    [cart],
  );

  const checkout = useCallback(() => {
    const selected = products.filter((p) => cart[p.id]);
    const msg = selected.length
      ? `Hello Doxa Naturals! I'd like to order:\n\n${selected
          .map(
            (p) =>
              `${cart[p.id]} × ${p.name} (${p.size}) - ${money(cart[p.id] * p.price)}`,
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
  }, [cart, total]);

  const value = useMemo(
    () => ({ cart, count, total, toast, add, remove, checkout }),
    [cart, count, total, toast, add, remove, checkout],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        className="toast"
        role="status"
        style={{ display: toast ? "block" : "none" }}
      >
        {toast}
      </div>
    </CartContext.Provider>
  );
}
