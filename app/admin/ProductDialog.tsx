"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Product } from "../data/products";
import { addProduct, updateProduct } from "../lib/store";

// Downscale uploads so a few photos fit in localStorage (about 5 MB total).
async function toDataUrl(file: File, max = 900): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#efe5d6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function ProductDialog({
  product,
  onClose,
}: {
  product?: Product;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [image, setImage] = useState(product?.image ?? "");
  const [error, setError] = useState("");
  const editing = Boolean(product);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  async function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    try {
      setImage(await toDataUrl(file));
      setError("");
    } catch {
      setError("That image could not be read. Try a JPG or PNG.");
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const size = String(f.get("size") ?? "").trim();
    const description = String(f.get("description") ?? "").trim();
    const price = Number(f.get("price"));
    const stock = Number(f.get("stock"));

    if (!name) return setError("Give the product a name.");
    if (!Number.isFinite(price) || price < 0)
      return setError("Enter a valid price.");
    if (!Number.isInteger(stock) || stock < 0)
      return setError("Stock must be a whole number, 0 or more.");

    const input = { name, size, price, stock, description, image };
    const ok = product ? updateProduct(product.id, input) : addProduct(input);
    if (!ok) return setError("Storage is full. Try a smaller photo.");
    ref.current?.close();
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="dialog-head">
          <h2>{editing ? "Edit product" : "Add product"}</h2>
          <button
            type="button"
            className="x"
            aria-label="Close"
            onClick={() => ref.current?.close()}
          >
            ×
          </button>
        </div>

        <div className="dialog-body">
          <div className="upload">
            <div className="upload-preview">
              {image ? (
                <Image src={image} alt="Product preview" fill sizes="160px" />
              ) : (
                <span>No photo</span>
              )}
            </div>
            <div className="upload-actions">
              <label className="btn secondary small">
                {image ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </label>
              {image && (
                <button
                  type="button"
                  className="text-btn danger"
                  onClick={() => setImage("")}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <label className="field">
            <span>Name</span>
            <input name="name" defaultValue={product?.name} required />
          </label>
          <div className="row2">
            <label className="field">
              <span>Size</span>
              <input
                name="size"
                defaultValue={product?.size}
                placeholder="e.g. 100 ml"
              />
            </label>
            <label className="field">
              <span>Price (Rs)</span>
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.price}
                required
              />
            </label>
            <label className="field">
              <span>Stock</span>
              <input
                name="stock"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.stock ?? 0}
                required
              />
            </label>
          </div>
          <label className="field">
            <span>Description</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={product?.description}
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="dialog-foot">
          <button
            type="button"
            className="btn secondary"
            onClick={() => ref.current?.close()}
          >
            Cancel
          </button>
          <button type="submit" className="btn">
            {editing ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
