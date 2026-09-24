import { graphqlRequest } from "@/lib/api-client";

const PUBLIC_KEY_QUERY = `query WebPushPublicKey { webPushPublicKey }`;
const REGISTER_MUTATION = `mutation RegisterWebPushSubscription($endpoint:String!,$p256dh:String!,$auth:String!){registerWebPushSubscription(endpoint:$endpoint,p256dh:$p256dh,auth:$auth)}`;
const UNREGISTER_MUTATION = `mutation UnregisterWebPushSubscription($endpoint:String!){unregisterWebPushSubscription(endpoint:$endpoint)}`;

let lifecycleVersion = 0;
let persistedEndpoint: string | null = null;

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

function assertLifecycle(version: number) {
  if (version !== lifecycleVersion) {
    throw new Error("Web Push reconciliation was cancelled.");
  }
}

function cancelPendingReconciliation() {
  lifecycleVersion += 1;
  persistedEndpoint = null;
}

function hasPersistedSubscription() {
  return Boolean(persistedEndpoint);
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

async function retireLocalSubscription(subscription: PushSubscription) {
  const endpoint = subscription.endpoint;
  if (persistedEndpoint === endpoint) persistedEndpoint = null;
  try {
    await subscription.unsubscribe();
  } finally {
    // Server cleanup is deliberately best effort. Browser unsubscribe is the
    // privacy boundary and must not serialize logout behind a network request.
    void unregisterEndpoint(endpoint).catch(() => undefined);
  }
}

async function ensureSubscription(version = lifecycleVersion) {
  if (!supported()) throw new Error("This browser does not support Web Push.");
  if (Notification.permission !== "granted") {
    throw new Error("Notification permission has not been granted.");
  }

  assertLifecycle(version);
  const registration = await serviceWorkerRegistration();
  assertLifecycle(version);
  const applicationServerKey = decodeApplicationServerKey(await publicKey());
  assertLifecycle(version);
  let subscription = await registration.pushManager.getSubscription();
  assertLifecycle(version);

  if (
    subscription
    && !sameKey(subscription.options.applicationServerKey, applicationServerKey)
  ) {
    await retireLocalSubscription(subscription);
    assertLifecycle(version);
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    if (version !== lifecycleVersion) {
      await retireLocalSubscription(subscription);
      assertLifecycle(version);
    }
  }

  try {
    await persistSubscription(subscription);
  } catch (error) {
    // A local PushSubscription alone is not proof that Marketlift can deliver
    // to it. Leave realtime browser notifications enabled until registration
    // has been confirmed by the API.
    if (persistedEndpoint === subscription.endpoint) persistedEndpoint = null;
    throw error;
  }

  if (version !== lifecycleVersion) {
    await retireLocalSubscription(subscription);
    assertLifecycle(version);
  }

  persistedEndpoint = subscription.endpoint;
  return subscription;
}

async function removeSubscription() {
  cancelPendingReconciliation();
  if (!supported()) return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  await retireLocalSubscription(subscription);
}

async function getStatus() {
  if (!supported()) {
    return {
      supported: false,
      permission: "unsupported" as const,
      subscribed: false,
    };
  }

  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = registration
    ? await registration.pushManager.getSubscription()
    : null;

  return {
    supported: true,
    permission: Notification.permission,
    subscribed: Boolean(subscription),
  };
}

async function enable() {
  if (!supported()) throw new Error("This browser does not support Web Push.");
  const version = lifecycleVersion;
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }
  assertLifecycle(version);
  return ensureSubscription(version);
}

async function reconcile(enabled: boolean) {
  if (!supported()) return;
  if (!enabled) {
    await removeSubscription();
    return;
  }
  const version = lifecycleVersion;
  // Reconciliation must never trigger a permission prompt during login/page load.
  if (Notification.permission === "granted") {
    await ensureSubscription(version);
  }
}

export const webPushService = {
  supported,
  enable,
  ensureSubscription,
  removeSubscription,
  reconcile,
  cancelPendingReconciliation,
  hasPersistedSubscription,
  getStatus,
};
