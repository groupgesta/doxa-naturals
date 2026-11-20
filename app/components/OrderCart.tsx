"use client";

import { useRef, useState, type FormEvent } from "react";
import { money } from "../data/products";
import { PICKUPS } from "../lib/orders";
import { useCart } from "./CartProvider";
import Spinner from "./Spinner";

export default function OrderCart() {
  const { lines, total, remove, checkout } = useCart();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function openForm() {
    setOpen(true);
    // Wait for the form to render, then bring it into view.
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      formRef.current
        ?.querySelector<HTMLInputElement>("input")
        ?.focus({ preventScroll: true });
    });
  }

  async function pay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const err = await checkout({
      name: String(f.get("name") ?? ""),
      phone: String(f.get("phone") ?? ""),
      email: String(f.get("email") ?? ""),
      pickup: String(f.get("pickup") ?? ""),
    });
    // On success the browser is already heading to Stripe: keep the loader.
    if (err) {
      setError(err);
      setBusy(false);
    }
  }

  return (
    <div className="cart">
      <h3>Your little bag ✳</h3>
      <div>
        {lines.length ? (
          lines.map(({ product: p, qty }) => (
            <div className="cart-item" key={p.id}>
              <span>
                {p.name}
                <br />
                <small>
                  {money(p.price)} × {qty}
                </small>
              </span>
              <button onClick={() => remove(p.id)} disabled={busy}>
                Remove −
              </button>
            </div>
          ))
        ) : (
          <p className="empty">
            Your bag is empty. Find something lovely in the collection.
          </p>
        )}
      </div>
      <div className="total">
        <span>Subtotal</span>
        <span>{money(total)}</span>
      </div>

      {!open || !lines.length ? (
        <button className="btn" disabled={!lines.length} onClick={openForm}>
          Checkout
        </button>
      ) : (
        <form className="cart-form" onSubmit={pay} ref={formRef}>
          <h4 className="cart-form-title">
            Your details
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Back
            </button>
          </h4>
          <label className="wide">
            Full name
            <input
              name="name"
              autoComplete="name"
              placeholder="Your name"
              required
              maxLength={120}
            />
          </label>
          <label>
            Phone
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="5xxx xxxx"
              required
              maxLength={40}
            />
          </label>
          <label>
            Email (optional)
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@email.com"

              maxLength={160}
            />
          </label>
          <label className="wide">
            Collection point
            <select name="pickup" required defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              {PICKUPS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          {error && (
            <p className="cart-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? <Spinner /> : `Pay ${money(total)} by card`}
          </button>
        </form>
      )}
      <p className="cart-note">
        Secure card payment by Stripe. You collect in person.
      </p>
    </div>
  );
}
