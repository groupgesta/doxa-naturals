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
      intro="No delivery at present. You collect in person, and you pay before collecting."
    >
      <h2>Step by step</h2>
      <ol>
        <li>Add products to your bag and send the order on WhatsApp.</li>
        <li>I confirm availability and your total.</li>
        <li>You pay by MCB Juice or bank transfer and send me the receipt.</li>
        <li>We agree on a day and place, and you collect.</li>
      </ol>

      <h2>Collection points</h2>
      <ul>
        <li>Curepipe</li>
        <li>Quatre Bornes</li>
        <li>Port Louis</li>
      </ul>
      <p>
        I share the exact meeting spot and time on WhatsApp once your payment
        is in.
      </p>

      <h2>Payment methods</h2>
      <p>
        MCB Juice or bank transfer, in advance. I send the details in the
        conversation after confirming your order. This website never takes
        payment.
      </p>

      <h2>Delivery</h2>
      <p>Not available at the moment. If that changes, this page will say so.</p>
    </PageShell>
  );
}
