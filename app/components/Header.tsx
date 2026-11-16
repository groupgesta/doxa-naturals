"use client";

import Image from "next/image";
import { useState } from "react";
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
        className="menu"
        aria-expanded={open}
        aria-controls="links"
        onClick={() => setOpen((o) => !o)}
      >
        Menu ☰
      </button>
      <nav className={`links${open ? " open" : ""}`} id="links">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </a>
        ))}
        <a className="btn" href="#order" onClick={() => setOpen(false)}>
          Bag <span>({count})</span>
        </a>
      </nav>
    </header>
  );
}
