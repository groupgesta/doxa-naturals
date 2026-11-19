import { getSupabase } from "./supabase";

// Browser side of admin push notifications. The server side lives in
// app/api/push/new-order/route.ts and public/sw.js.

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    !!VAPID_PUBLIC
  );
}

function keyBytes(base64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registration() {
  return navigator.serviceWorker.register("/sw.js");
}

/** True when this browser already has a subscription. */
export async function isSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration("/");
  return !!(await reg?.pushManager.getSubscription());
}

/** Resolves to an error message, or null when notifications are on. */
export async function enablePush(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb || !pushSupported()) return "This browser can't receive notifications.";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return "Notifications are blocked. Allow them in your browser settings.";
  }
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes(VAPID_PUBLIC),
    }));
  const json = sub.toJSON();
  const { data } = await sb.auth.getUser();
  if (!data.user || !json.endpoint || !json.keys) return "Please sign in again.";
  const { error } = await sb.from("push_subscriptions").upsert({
    endpoint: json.endpoint,
    user_id: data.user.id,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  });
  return error ? error.message : null;
}

export async function disablePush(): Promise<string | null> {
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return null;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  const { error } = (await getSupabase()
    ?.from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)) ?? { error: null };
  return error ? error.message : null;
}
