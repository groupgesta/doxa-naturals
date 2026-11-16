"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOut, useAdminSession } from "../lib/auth";
import { useOrders } from "../lib/orders";

const icons = {
  overview: (
    <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" />
  ),
  orders: (
    <path d="M6 3h12l2 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7l2-4Zm.6 2L5.5 7h13l-1.1-2H6.6ZM9 11a3 3 0 0 0 6 0h-2a1 1 0 0 1-2 0H9Z" />
  ),
  products: (
    <path d="m12 2 9 4.5v11L12 22l-9-4.5v-11L12 2Zm0 2.2L6.2 7 12 9.8 17.8 7 12 4.2ZM5 8.7v7.6l6 3v-7.6l-6-3Zm14 0-6 3v7.6l6-3V8.7Z" />
  ),
  shop: (
    <path d="M5 4h14l1 5a3 3 0 0 1-2 2.8V20H6v-8.2A3 3 0 0 1 4 9l1-5Zm3 9.9V18h8v-4.1a3 3 0 0 1-2-.9 3 3 0 0 1-4 0 3 3 0 0 1-2 .9Z" />
  ),
  out: (
    <path d="M10 4H5v16h5v-2H7V6h3V4Zm5.6 4.4L14.2 9.8 15.4 11H9v2h6.4l-1.2 1.2 1.4 1.4L19.2 12l-3.6-3.6Z" />
  ),
};

const nav = [
  { href: "/admin", label: "Overview", icon: icons.overview },
  { href: "/admin/orders", label: "Orders", icon: icons.orders },
  { href: "/admin/products", label: "Products & stock", icon: icons.products },
];

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAdminSession();
  const orders = useOrders();
  const [open, setOpen] = useState(false);
  const newCount = orders.filter((o) => o.status === "new").length;

  useEffect(() => {
    if (session === false) router.replace("/admin/login");
  }, [session, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!session) return <div className="admin-loading">Loading…</div>;

  return (
    <div className="shell">
      <aside className={`sidebar${open ? " open" : ""}`} id="sidebar">
        <Link href="/admin" className="side-brand" aria-label="Admin home">
          <Image
            src="/images/logo.png"
            alt="Doxa Naturals"
            width={1208}
            height={587}
          />
        </Link>

        <nav className="side-nav" aria-label="Admin sections">
          {nav.map((n) => {
            const on = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={on ? "side-link on" : "side-link"}
                aria-current={on ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon>{n.icon}</Icon>
                <span>{n.label}</span>
                {n.href === "/admin/orders" && newCount > 0 && (
                  <span className="tab-badge">{newCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="side-foot">
          <Link href="/" className="side-link">
            <Icon>{icons.shop}</Icon>
            <span>View shop</span>
          </Link>
          <button
            className="side-link"
            onClick={() => {
              signOut();
              router.replace("/admin/login");
            }}
          >
            <Icon>{icons.out}</Icon>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="side-scrim"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="shell-main">
        <header className="topbar">
          <button
            className={`menu${open ? " is-open" : ""}`}
            aria-expanded={open}
            aria-controls="sidebar"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
          <Image
            src="/images/logo.png"
            alt="Doxa Naturals"
            width={1208}
            height={587}
            className="topbar-logo"
          />
          <span className="topbar-title">
            {nav.find((n) => n.href === pathname)?.label ?? "Admin"}
          </span>
          <div className="topbar-actions">
            <Link href="/" className="link-btn">
              View shop ↗
            </Link>
            <span className="topbar-user">
              <span className="topbar-avatar" aria-hidden="true">
                D
              </span>
              Admin
            </span>
            <button
              className="link-btn"
              onClick={() => {
                signOut();
                router.replace("/admin/login");
              }}
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
