"use client";

import Image from "next/image";
import { LOW_STOCK, money } from "../data/products";
import { useProducts } from "../lib/store";
import { useCart } from "./CartProvider";

export default function ProductGrid() {
  const products = useProducts();
  const { add } = useCart();

  return (
    <div className="grid">
      {products.map((p, i) => {
        const soldOut = p.stock <= 0;
        return (
          <article
            className="product"
            key={p.id}
            data-reveal
            style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
          >
            <div className={`image${soldOut ? " sold-out" : ""}`}>
              {p.image ? (
                <Image
                  src={p.image}
                  alt={`${p.name}, ${p.size}`}
                  fill
                  sizes="(max-width: 400px) 100vw, (max-width: 950px) 50vw, 300px"
                />
              ) : (
                <span className="no-photo">Photo coming soon</span>
              )}
              {soldOut && <span className="badge">Sold out</span>}
              {!soldOut && p.stock <= LOW_STOCK && (
                <span className="badge low">Only {p.stock} left</span>
              )}
            </div>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div className="buy-row">
              <strong>{money(p.price)}</strong>
              <button
                onClick={() => add(p.id)}
                disabled={soldOut}
                aria-label={
                  soldOut
                    ? `${p.name} is sold out`
                    : `Add ${p.name} to bag`
                }
              >
                {soldOut ? "Sold out" : "+ Add to bag"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
