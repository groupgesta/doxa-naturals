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
      intro="Short version: this website does not collect your personal details. Orders happen in a WhatsApp conversation with me."
      updated="18 November 2026"
    >
      <h2>What this website collects</h2>
      <p>
        Nothing about you. There are no customer accounts, no sign-up form, no
        advertising trackers and no analytics scripts on this site. Fonts are
        served from the site itself, so your browser does not contact Google
        to load them.
      </p>
      <p>
        Your bag lives in the page while you shop. Close the tab and it is
        gone.
      </p>

      <h2>What happens when you order</h2>
      <p>
        When you tap &quot;Send order on WhatsApp&quot;, your phone opens
        WhatsApp with a message already written: the products, quantities and
        total. You choose whether to send it. Once you do, the conversation is
        between you and me, and WhatsApp handles it under its own privacy
        policy.
      </p>
      <p>
        I see your WhatsApp name and number, plus anything you tell me to
        arrange payment and collection (a name, a collection point, a time).
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
        This website never asks for card numbers or bank details. Payment is
        arranged directly with me after I confirm your order, by MCB Juice or
        bank transfer. Keep those details inside the conversation and do not
        post them anywhere public.
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
