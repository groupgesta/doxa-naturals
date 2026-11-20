import type { Metadata } from "next";
import PageShell from "../components/PageShell";

export const metadata: Metadata = {
  title: "Privacy policy | Doxa Naturals",
  description:
    "What Doxa Naturals collects when you browse and order, and what it does with it.",
};

export default function Privacy() {
  return (
    <PageShell
      kicker="Privacy"
      title="Privacy policy"
      intro="Short version: no accounts, no trackers. When you order, I keep what you type at checkout. Card details go to Stripe, not to me."
      updated="19 November 2026"
    >
      <h2>What this website collects</h2>
      <p>
        There are no customer accounts, no sign-up form, no advertising
        trackers and no analytics scripts on this site. Fonts are served from
        the site itself, so your browser does not contact Google to load them.
      </p>
      <p>
        Your bag lives in the page while you shop. Close the tab and it is
        gone, until you send your order.
      </p>

      <h2>What happens when you order</h2>
      <p>
        At checkout you give your name and phone number, choose a collection
        point, and can add an email. Stripe also asks for an email if you
        did not give one, to send your receipt. I save these with the products and quantities in my
        order records (hosted on Supabase). Only I can open these records.
      </p>
      <p>
        You then pay on a page run by Stripe, which handles your card details
        under its own privacy policy. I never see your card number. Stripe
        sends me confirmation that the payment went through and emails you a
        receipt.
      </p>
      <p>
        I use your phone number to message you the day and place to collect,
        by WhatsApp or SMS.
      </p>

      <h2>How I use your details</h2>
      <ul>
        <li>To confirm availability, payment and collection of your order.</li>
        <li>To answer questions you send me about products.</li>
        <li>To keep a record of past orders so I can sort out any issue.</li>
      </ul>
      <p>
        I do not sell your details, share them for marketing, or message you
        about promotions unless you ask me to.
      </p>

      <h2>Payment details</h2>
      <p>
        Card payments are taken by Stripe on its own secure page. This website
        never sees or stores your card number.
      </p>

      <h2>How long I keep things</h2>
      <p>
        Order messages and records stay as long as I need them to deal with
        questions about an order or for basic bookkeeping. Ask me to delete
        your conversation and your details and I will, except for what the law
        requires me to keep.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the Mauritius Data Protection Act 2017 you can ask to see the
        data I hold about you, correct it, or have it deleted. Message me on
        WhatsApp and I will answer within 14 days. You can also complain to
        the Data Protection Office of Mauritius.
      </p>

      <h2>Changes</h2>
      <p>If this policy changes, the date at the top changes too.</p>
    </PageShell>
  );
}
