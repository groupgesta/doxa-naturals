"use client";

import Image from "next/image";
import { money, products } from "../data/products";
import { useCart } from "./CartProvider";

export default function ProductGrid() {
  const { add } = useCart();

  return (
    <div className="grid">
      {products.map((p) => (
        <article className="product" key={p.id}>
          <div className="image">
            <Image
              src={p.image}
              alt={`${p.name}, ${p.size}`}
              fill
              sizes="(max-width: 400px) 100vw, (max-width: 950px) 50vw, 300px"
            />
          </div>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <div className="buy-row">
            <strong>{money(p.price)}</strong>
            <button
              onClick={() => add(p.id)}
              aria-label={`Add ${p.name} to bag`}
            >
              + Add to bag
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
