"use client";

import { money, products } from "../data/products";
import { useCart } from "./CartProvider";

export default function OrderCart() {
  const { cart, total, remove, checkout } = useCart();
  const selected = products.filter((p) => cart[p.id]);

  return (
    <div className="cart">
      <h3>Your little bag ✳</h3>
      <div>
        {selected.length ? (
          selected.map((p) => (
            <div className="cart-item" key={p.id}>
              <span>
                {p.name}
                <br />
                <small>
                  {money(p.price)} × {cart[p.id]}
                </small>
              </span>
              <button onClick={() => remove(p.id)}>Remove −</button>
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
      <button className="btn" onClick={checkout}>
        Send order on WhatsApp ↗
      </button>
      <p className="cart-note">
        Payment is arranged directly after confirmation, not collected on this
        website.
      </p>
    </div>
  );
}
