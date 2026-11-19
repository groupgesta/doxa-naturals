import { cacheLife, cacheTag } from "next/cache";
import { products as defaults, type Product } from "../data/products";
import { rowToProduct, type ProductRow } from "./product-row";
import { getSupabase } from "./supabase";

/** Catalogue for the server-rendered shop, cached for a minute. */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const sb = getSupabase();
  if (!sb) return defaults;
  const { data, error } = await sb
    .from("products")
    .select("id,name,size,price,description,image,stock")
    .order("position");
  if (error || !data) return defaults;
  return (data as ProductRow[]).map(rowToProduct);
}
