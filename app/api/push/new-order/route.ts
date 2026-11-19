import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { sendNotification, setVapidDetails } from "web-push";

// Called by a Supabase Database Webhook (orders, Update). Sends a push
// notification to every admin device in push_subscriptions.

type Webhook = {
  type: string;
  record?: { number: number; total: number; status: string; customer: string };
  old_record?: { total: number } | null;
};

function authorised(req: Request) {
  const secret = process.env.PUSH_WEBHOOK_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return given.length === want.length && timingSafeEqual(given, want);
}

export async function POST(req: Request) {
  if (!authorised(req)) return new Response("Unauthorized", { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!url || !serviceKey || !vapidPublic || !vapidPrivate) {
    return new Response("Push is not configured", { status: 500 });
  }

  const body = (await req.json()) as Webhook;
  const o = body.record;
  // A new order is complete when its total goes from 0 to something.
  const isNew =
    body.type === "UPDATE" &&
    !!o &&
    o.status === "new" &&
    o.total > 0 &&
    body.old_record?.total === 0;
  if (!o || !isNew) return Response.json({ sent: 0 });

  setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@doxa-naturals.com",
    vapidPublic,
    vapidPrivate,
  );

  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: subs } = await sb.from("push_subscriptions").select("*");
  if (!subs?.length) return Response.json({ sent: 0 });

  const payload = JSON.stringify({
    title: "New order",
    body: `Order #${o.number}, Rs ${o.total.toLocaleString("en-US")}`,
    url: "/admin/orders",
    tag: `order-${o.number}`,
  });

  let sent = 0;
  const gone: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) gone.push(s.endpoint);
      }
    }),
  );
  if (gone.length) {
    await sb.from("push_subscriptions").delete().in("endpoint", gone);
  }
  return Response.json({ sent });
}
