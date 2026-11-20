import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "../../components/PageShell";

export const metadata: Metadata = {
  title: "Thank you | Doxa Naturals",
  robots: { index: false },
};

export default function Success() {
  return (
    <PageShell
      kicker="Payment received"
      title="Thank you for your order"
      intro="Your payment went through. A receipt from Stripe is on its way to your email."
    >
      <h2>What happens next</h2>
      <p>
        I prepare your products and message you on the number you gave with the
        exact time and place to collect, at the collection point you chose.
      </p>
      <p>
        <Link href="/" className="btn">
          Back to the shop
        </Link>
      </p>
    </PageShell>
  );
}
