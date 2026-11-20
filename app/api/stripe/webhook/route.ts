import type Stripe from "stripe";
import { notifyNewOrder } from "../../../lib/push-server";
import { getServiceSupabase } from "../../../lib/server-supabase";
import { getStripe } from "../../../lib/stripe-server";

/** Stripe calls this when a payment succeeds or a checkout expires. */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sb = getServiceSupabase();
  if (!stripe || !secret || !sb)
    return new Response("Not configured", { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      const { data, error } = await sb.rpc("mark_order_paid", {
        p_session: session.id,
        p_email: session.customer_details?.email ?? "",
      });
      // A 500 makes Stripe retry later.
      if (error) return new Response("Database error", { status: 500 });
      const r = data as {
        already?: boolean;
        number?: number;
        total?: number;
      } | null;
      if (r && r.already === false && r.number != null && r.total != null) {
        await notifyNewOrder({ number: r.number, total: r.total }).catch(
          () => {},
        );
      }
    }
  } else if (event.type === "checkout.session.expired") {
    await sb.rpc("drop_pending_order", { p_session: event.data.object.id });
  }

  return Response.json({ received: true });
}
