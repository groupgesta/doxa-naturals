import type { Metadata } from "next";
import PageShell from "../components/PageShell";

export const metadata: Metadata = {
  title: "Collection and payment | Doxa Naturals",
  description:
    "Where to collect your Doxa Naturals order and how to pay: MCB Juice or bank transfer.",
};

export default function CollectionAndPayment() {
  return (
    <PageShell
      kicker="Collection and payment"
      title="How your order reaches you"
      intro="You pay by card on the website, then collect in person. No delivery at present."
    >
      <h2>Step by step</h2>
      <ol>
        <li>Add products to your bag and tap Checkout.</li>
        <li>Enter your name, phone, email and choose a collection point.</li>
        <li>Pay by card on the secure Stripe page.</li>
        <li>I message you the day and place, and you collect.</li>
      </ol>

      <h2>Collection points</h2>
      <ul>
        <li>Curepipe</li>
        <li>Quatre Bornes</li>
        <li>Port Louis</li>
      </ul>
      <p>
        I share the exact meeting spot and time by message once your payment
        is in.
      </p>

      <h2>Payment methods</h2>
      <p>
        Debit and credit cards, paid in advance on a secure page run by
        Stripe. Your card details go to Stripe and never touch this website.
        You get a receipt by email.
      </p>

      <h2>Delivery</h2>
      <p>Not available at the moment. If that changes, this page will say so.</p>
    </PageShell>
  );
}
