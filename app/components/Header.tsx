"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

const links = [
  { href: "#collection", label: "The collection" },
  { href: "#story", label: "My story" },
  { href: "#ritual", label: "The routine" },
  { href: "#order", label: "How to order" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="nav">
      <a className="brand" href="#home" aria-label="Doxa Naturals, home">
        <Image
          src="/images/logo.png"
          alt="Doxa Naturals logo"
          width={1208}
          height={587}
          sizes="222px"
          loading="eager"
        />
      </a>
      <div className="nav-tools">
        <a
          className="bag-btn"
          href="#order"
          aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
          onClick={() => setOpen(false)}
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 8h14l-1 12H6L5 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          {count > 0 && (
            <span className="bag-count" key={count}>
              {count}
            </span>
          )}
        </a>
        <button
          className={`menu${open ? " is-open" : ""}`}
          aria-expanded={open}
          aria-controls="links"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>
      <nav className={`links${open ? " open" : ""}`} id="links">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a className="btn bag-link" href="#order" onClick={() => setOpen(false)}>
          Bag{" "}
          <span className="count" key={count}>
            ({count})
          </span>
        </a>
      </nav>
    </header>
  );
}
