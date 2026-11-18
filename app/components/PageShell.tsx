import type { ReactNode } from "react";
import SiteFooter from "./SiteFooter";
import SubHeader from "./SubHeader";

export default function PageShell({
  kicker,
  title,
  intro,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  intro?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SubHeader />
      <main className="page">
        <div className="page-head">
          <div className="kicker">{kicker}</div>
          <h1>{title}</h1>
          {intro && <p className="page-intro">{intro}</p>}
          {updated && <p className="page-updated">Last updated {updated}</p>}
        </div>
        <div className="prose">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
