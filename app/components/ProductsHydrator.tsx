"use client";

import { seedProducts } from "../lib/store";
import type { Product } from "../data/products";

/** Hands the server-fetched catalogue to the client store before first render. */
export default function ProductsHydrator({
  products,
}: {
  products: Product[];
}) {
  seedProducts(products);
  return null;
}
