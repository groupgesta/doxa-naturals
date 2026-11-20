import type { Metadata, Viewport } from "next";
import "./admin.css";

// viewportFit "cover" lets the bottom tab bar respect the iPhone home indicator.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#fbf8f1",
};

export const metadata: Metadata = {
  title: "Admin | Doxa Naturals",
  robots: { index: false, follow: false },
  // The install prompt only exists on admin pages, so shop visitors never see it.
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "Doxa Admin", statusBarStyle: "default" },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="admin">{children}</div>;
}
