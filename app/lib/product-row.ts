import type { Product } from "../data/products";

export type ProductRow = {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  image: string;
  stock: number;
};

export const rowToProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  size: r.size,
  price: r.price,
  description: r.description,
  image: r.image,
  stock: r.stock,
});
