import Link from "next/link";
import PageShell from "./components/PageShell";

export default function NotFound() {
  return (
    <PageShell
      kicker="Page not found"
      title="This page doesn't exist."
      intro="The link may be old or mistyped. The collection is one tap away."
    >
      <p>
        <Link className="btn" href="/">
          Back to the shop
        </Link>
      </p>
    </PageShell>
  );
}
