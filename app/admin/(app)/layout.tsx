import AdminShell from "../AdminShell";

export default function AppLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
