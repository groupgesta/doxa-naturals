import "server-only";
import { sendNotification, setVapidDetails } from "web-push";
import { getServiceSupabase } from "./server-supabase";

/** Sends a push notification to every admin device that turned alerts on. */
export async function notifyNewOrder(order: { number: number; total: number }) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const sb = getServiceSupabase();
  if (!publicKey || !privateKey || !sb) return;

  setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@doxa-naturals.com",
    publicKey,
    privateKey,
  );
  const { data: subs } = await sb.from("push_subscriptions").select("*");
  if (!subs?.length) return;

  const payload = JSON.stringify({
    title: "New paid order",
    body: `Order #${order.number}, Rs ${order.total.toLocaleString("en-US")}`,
    url: "/admin/orders",
    tag: `order-${order.number}`,
  });

  const gone: string[] = [];
  await Promise.all(
    subs.map(async (s) => {
      try {
        await sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) gone.push(s.endpoint);
      }
    }),
  );
  if (gone.length) {
    await sb.from("push_subscriptions").delete().in("endpoint", gone);
  }
}
