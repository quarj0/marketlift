import { graphqlRequest } from "@/lib/api-client";

const PUBLIC_KEY_QUERY = `query WebPushPublicKey { webPushPublicKey }`;
const REGISTER_MUTATION = `mutation RegisterWebPushSubscription($endpoint:String!,$p256dh:String!,$auth:String!){registerWebPushSubscription(endpoint:$endpoint,p256dh:$p256dh,auth:$auth)}`;
const UNREGISTER_MUTATION = `mutation UnregisterWebPushSubscription($endpoint:String!){unregisterWebPushSubscription(endpoint:$endpoint)}`;

function supported() {
  return typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window
    && "Notification" in window;
}

function decodeApplicationServerKey(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
    + "=".repeat((4 - (value.length % 4)) % 4);
  const raw = window.atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }
  return bytes;
}

function sameKey(left: ArrayBuffer | null, right: Uint8Array) {
  if (!left) return false;
  const current = new Uint8Array(left);
  if (current.length !== right.length) return false;
  for (let index = 0; index < current.length; index += 1) {
    if (current[index] !== right[index]) return false;
  }
  return true;
}

async function serviceWorkerRegistration() {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (!existing) {
    await navigator.serviceWorker.register("/sw.js");
  }
  return navigator.serviceWorker.ready;
}

async function publicKey() {
  const data = await graphqlRequest<{ webPushPublicKey: string }>(PUBLIC_KEY_QUERY);
  const key = data.webPushPublicKey.trim();
  if (!key) throw new Error("Web Push is not configured on the Marketlift API.");
  return key;
}

async function persistSubscription(subscription: PushSubscription) {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!p256dh || !auth) {
    throw new Error("The browser returned an incomplete push subscription.");
  }
  await graphqlRequest<{ registerWebPushSubscription: boolean }>(REGISTER_MUTATION, {
    endpoint: subscription.endpoint,
    p256dh,
    auth,
  });
}

async function unregisterEndpoint(endpoint: string) {
  await graphqlRequest<{ unregisterWebPushSubscription: boolean }>(
    UNREGISTER_MUTATION,
    { endpoint },
  );
}

async function ensureSubscription() {
  if (!supported()) throw new Error("This browser does not support Web Push.");
  if (Notification.permission !== "granted") {
    throw new Error("Notification permission has not been granted.");
  }

  const registration = await serviceWorkerRegistration();
  const applicationServerKey = decodeApplicationServerKey(await publicKey());
  let subscription = await registration.pushManager.getSubscription();

  if (
    subscription
    && !sameKey(subscription.options.applicationServerKey, applicationServerKey)
  ) {
    const oldEndpoint = subscription.endpoint;
    try {
      await unregisterEndpoint(oldEndpoint);
    } catch {
      // The browser unsubscribe is the privacy boundary. A stale API record will
      // be disabled when the push service later returns 404/410.
    }
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  await persistSubscription(subscription);
  return subscription;
}

async function removeSubscription() {
  if (!supported()) return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  try {
    await unregisterEndpoint(subscription.endpoint);
  } finally {
    await subscription.unsubscribe();
  }
}

async function enable() {
  if (!supported()) throw new Error("This browser does not support Web Push.");
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }
  return ensureSubscription();
}

async function reconcile(enabled: boolean) {
  if (!supported()) return;
  if (!enabled) {
    await removeSubscription();
    return;
  }
  // Reconciliation must never trigger a permission prompt during login/page load.
  if (Notification.permission === "granted") {
    await ensureSubscription();
  }
}

export const webPushService = {
  supported,
  enable,
  ensureSubscription,
  removeSubscription,
  reconcile,
};
