import type { Metadata } from "next";
import PageShell from "../components/PageShell";

export const metadata: Metadata = {
  title: "FAQ | Doxa Naturals",
  description:
    "Answers about ordering, payment, collection and using Doxa Naturals products.",
};

const faqs = [
  {
    q: "How do I order?",
    a: "Add products to your bag, tap Checkout, enter your details and pay by card. I then message you the day and place to collect.",
  },
  {
    q: "Do you deliver?",
    a: "Not at present. Collection is by arrangement in Curepipe, Quatre Bornes or Port Louis.",
  },
  {
    q: "How do I pay?",
    a: "By card, on a secure Stripe page, when you check out. Your card details never touch this website.",
  },
  {
    q: "A product shows as sold out. Can I still get it?",
    a: "Message me on WhatsApp. I can tell you when it comes back.",
  },
  {
    q: "Which products suit my hair?",
    a: "The range is made for curls, coils and textured hair. Tell me your hair type on WhatsApp and I will suggest a routine.",
  },
  {
    q: "What is the order of use?",
    a: "Detangle gently with the flaxseed gel, care for your scalp with the spray and oil, then seal in moisture with the rosemary butter.",
  },
  {
    q: "Can I return a product?",
    a: "Opened products are not returnable. If something arrives damaged or wrong, message me within 7 days with a photo. See the terms of sale.",
  },
  {
    q: "What do you do with my details?",
    a: "I use them to handle your order and nothing else. Read the privacy policy for the full detail.",
  },
];

export default function Faq() {
  return (
    <PageShell
      kicker="FAQ"
      title="Questions, answered"
      intro="Can't find yours? Message me on WhatsApp."
    >
      <div className="faq">
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
