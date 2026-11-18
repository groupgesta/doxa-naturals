import type { Metadata } from "next";
import PageShell from "../components/PageShell";
import { WHATSAPP_NUMBER } from "../data/products";

export const metadata: Metadata = {
  title: "Contact | Doxa Naturals",
  description:
    "Message Doxa Naturals on WhatsApp for orders and product questions.",
};

export default function Contact() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Doxa Naturals! I would like to ask about your products.",
  )}`;
  return (
    <PageShell
      kicker="Contact"
      title="Message me directly"
      intro="WhatsApp is the fastest way to reach me. Orders, questions about your hair type, anything."
    >
      <p>
        <a className="btn" href={href} target="_blank" rel="noopener noreferrer">
          Open WhatsApp ↗
        </a>
      </p>
      <h2>Details</h2>
      <ul>
        <li>WhatsApp: +230 5476 6618</li>
        <li>Collection: Curepipe, Quatre Bornes, Port Louis</li>
        <li>Made in Mauritius</li>
      </ul>
      <p>
        Looking for answers first? The <a href="/faq">FAQ</a> covers the most
        common questions.
      </p>
    </PageShell>
  );
}
