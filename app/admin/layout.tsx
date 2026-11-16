import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin | Doxa Naturals",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="admin">{children}</div>;
}
