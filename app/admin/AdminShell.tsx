"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
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
  { href: "/admin", label: "Overview", short: "Home", icon: icons.overview },
  {
    href: "/admin/orders",
    label: "Orders",
    short: "Orders",
    icon: icons.orders,
  },
  {
    href: "/admin/products",
    label: "Products & stock",
    short: "Products",
    icon: icons.products,
  },
];

function Icon({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
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
  const newCount = orders.filter((o) => o.status === "new").length;

  useEffect(() => {
    if (session === false) router.replace("/admin/login");
  }, [session, router]);

  if (!session) return <div className="admin-loading">Loading…</div>;

  const leave = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="shell">
      {/* Desktop: sidebar */}
      <aside className="sidebar">
        <Link href="/admin" className="side-brand" aria-label="Admin home">
          <Image
            src="/images/logo.png"
            alt="Doxa Naturals"
            width={1208}
            height={587}
          />
        </Link>

        <nav className="side-nav" aria-label="Admin sections">
          <p className="side-label">Manage</p>
          {nav.map((n) => {
            const on = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={on ? "side-link on" : "side-link"}
                aria-current={on ? "page" : undefined}
              >
                <Icon>{n.icon}</Icon>
                <span>{n.label}</span>
                {n.href === "/admin/orders" && newCount > 0 && (
                  <span className="tab-badge">{newCount}</span>
                )}
              </Link>
            );
          })}

          <p className="side-label">Shop</p>
          <Link href="/" className="side-link" target="_blank" rel="noreferrer">
            <Icon>{icons.shop}</Icon>
            <span>View shop</span>
            <span className="side-ext" aria-hidden="true">
              ↗
            </span>
          </Link>
        </nav>

        <div className="side-account">
          <span className="topbar-avatar" aria-hidden="true">
            D
          </span>
          <span className="side-who">
            <b>Doxa Naturals</b>
            <small>Administrator</small>
          </span>
          <button
            className="side-out"
            onClick={leave}
            aria-label="Sign out"
            title="Sign out"
          >
            <Icon size={18}>{icons.out}</Icon>
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
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

          {/* Desktop actions */}
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
            <button className="link-btn" onClick={leave}>
              Sign out
            </button>
          </div>

          {/* Phone actions */}
          <div className="topbar-icons">
            <Link href="/" className="icon-btn" aria-label="View shop">
              <Icon size={22}>{icons.shop}</Icon>
            </Link>
            <button className="icon-btn" aria-label="Sign out" onClick={leave}>
              <Icon size={22}>{icons.out}</Icon>
            </button>
          </div>
        </header>

        <main className="admin-main">{children}</main>
      </div>

      {/* Phone: bottom tab bar */}
      <nav className="bottom-nav" aria-label="Admin sections">
        {nav.map((n) => {
          const on = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={on ? "bn-item on" : "bn-item"}
              aria-current={on ? "page" : undefined}
            >
              <span className="bn-icon">
                <Icon size={22}>{n.icon}</Icon>
                {n.href === "/admin/orders" && newCount > 0 && (
                  <span className="bn-badge">{newCount}</span>
                )}
              </span>
              <span>{n.short}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
