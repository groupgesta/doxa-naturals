import type { Metadata } from "next";
import PageShell from "../components/PageShell";

export const metadata: Metadata = {
  title: "Terms of sale | Doxa Naturals",
  description:
    "How ordering, payment, collection and returns work at Doxa Naturals.",
};

export default function Terms() {
  return (
    <PageShell
      kicker="Terms"
      title="Terms of sale"
      intro="Plain rules for ordering from Doxa Naturals."
      updated="18 November 2026"
    >
      <h2>Orders</h2>
      <p>
        An order is confirmed when your card payment goes through. Until then,
        stock shown on the website is not a reservation. If something sells out
        while you check out, the website tells you before you pay.
      </p>

      <h2>Prices</h2>
      <p>
        All prices are in Mauritian rupees (Rs). The total shown on the Stripe
        payment page is the total you pay.
      </p>

      <h2>Payment</h2>
      <p>
        Pay in advance by card on the Stripe payment page. I prepare your
        products after payment arrives.
      </p>

      <h2>Collection</h2>
      <p>
        Collection is by arrangement in Curepipe, Quatre Bornes or Port Louis.
        There is no delivery at present. Details are on the{" "}
        <a href="/collection-and-payment">collection and payment</a> page.
      </p>

      <h2>Returns and problems</h2>
      <p>
        Hair care is personal and opened products are not returnable. If your
        order is damaged, leaking or not what you ordered, message me within 7
        days of collection with a photo and I will replace it or refund you.
      </p>

      <h2>Allergies and patch testing</h2>
      <p>
        Products contain natural ingredients such as shea, mango, olive and
        jojoba oils, rosemary and peppermint. Check the ingredient list on the
        label and patch test on a small area before first use. Stop using a
        product if it irritates your skin or scalp. If you are pregnant,
        nursing or treating a scalp condition, ask your doctor first.
      </p>

      <h2>Results</h2>
      <p>
        Healthy haircare is a routine, not a promise of overnight growth.
        Results vary from person to person and I do not guarantee a specific
        outcome.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Message me on WhatsApp, details on the{" "}
        <a href="/contact">contact page</a>.
      </p>
    </PageShell>
  );
}
