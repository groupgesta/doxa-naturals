import { PICKUPS } from "../../data/products";
import { SITE_URL } from "../../lib/site";
import { getServiceSupabase } from "../../lib/server-supabase";
import { CURRENCY, getStripe } from "../../lib/stripe-server";

type Body = {
  items?: { id?: unknown; qty?: unknown }[];
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  pickup?: unknown;
};

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const fail = (error: string, status = 400) =>
  Response.json({ error }, { status });

/** Creates a pending order, then a Stripe Checkout session to pay for it. */
export async function POST(req: Request) {
  const stripe = getStripe();
  const sb = getServiceSupabase();
  if (!stripe || !sb) return fail("Online payment is not available yet.", 503);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail("Invalid request.");
  }

  const name = text(body.name, 120);
  const phone = text(body.phone, 40);
  const email = text(body.email, 160);
  const pickup = text(body.pickup, 60);
  if (!name) return fail("Please enter your name.");
  if (phone.replace(/\D/g, "").length < 7)
    return fail("Please enter a valid phone number.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return fail("That email address does not look right.");
  if (!(PICKUPS as readonly string[]).includes(pickup))
    return fail("Please choose a collection point.");

  const items = (body.items ?? []).map((i) => ({
    product_id: typeof i.id === "string" ? i.id : "",
    qty: Number(i.qty),
  }));
  if (
    !items.length ||
    items.some((i) => !i.product_id || !Number.isInteger(i.qty) || i.qty < 1)
  ) {
    return fail("Your bag is empty.");
  }

  const { data, error } = await sb.rpc("create_checkout_order", {
    p_customer: name,
    p_phone: phone,
    p_email: email,
    p_pickup: pickup,
    p_items: items,
  });
  if (error || !data) {
    const msg = error?.message ?? "";
    const stock = msg.startsWith("Not enough stock");
    return fail(
      stock ? `${msg}.` : "Could not start your order. Please try again.",
      stock ? 409 : 500,
    );
  }
  const order = data as {
    id: string;
    number: number;
    total: number;
    items: { name: string; size: string; price: number; qty: number }[];
  };

  const origin = req.headers.get("origin") ?? SITE_URL;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(email && { customer_email: email }),
      client_reference_id: order.id,
      metadata: { order_id: order.id, order_number: String(order.number) },
      line_items: order.items.map((i) => ({
        quantity: i.qty,
        price_data: {
          currency: CURRENCY,
          unit_amount: i.price * 100,
          product_data: { name: i.size ? `${i.name} (${i.size})` : i.name },
        },
      })),
      payment_intent_data: {
        description: `Doxa Naturals order #${order.number}`,
      },
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: `${origin}/order/success`,
      cancel_url: `${origin}/?checkout=cancelled#order`,
    });
    await sb
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);
    return Response.json({ url: session.url });
  } catch {
    await sb.from("orders").delete().eq("id", order.id);
    return fail("Could not reach the payment page. Please try again.", 502);
  }
}
