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
      <nav className={`links${open ? " open" : ""}`} id="links">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a className="btn" href="#order" onClick={() => setOpen(false)}>
          Bag{" "}
          <span className="count" key={count}>
            ({count})
          </span>
        </a>
      </nav>
    </header>
  );
}
