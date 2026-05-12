/**
 * Autoroll API client. Stores JWT in expo-secure-store.
 */
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const BASE = (Constants.expoConfig?.extra?.apiBase as string) || "https://api.autoroll.online";
const TOKEN_KEY = "autoroll_session";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function setToken(t: string | null) {
  if (t) await SecureStore.setItemAsync(TOKEN_KEY, t);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

type CallOpts = { auth?: boolean; idempotencyKey?: string };

async function call<T = any>(method: string, path: string, body?: any, opts: CallOpts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;
  if (opts.auth !== false) {
    const tok = await getToken();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!r.ok) throw new ApiError(r.status, parsed);
  return parsed as T;
}

export class ApiError extends Error {
  constructor(public status: number, public detail: any) {
    super(typeof detail === "string" ? detail : detail?.detail ?? `HTTP ${status}`);
  }
}

export const api = {
  // auth
  signup: (email: string, password: string, displayName?: string, tz?: string) =>
    call<{ session_token: string; user_id: string; plan: string }>("POST", "/auth/signup",
      { email, password, display_name: displayName, tz: tz || "UTC" }, { auth: false }),
  login: (email: string, password: string) =>
    call<{ session_token: string; user_id: string; plan: string }>("POST", "/auth/login",
      { email, password }, { auth: false }),
  google: (idToken: string) =>
    call<{ session_token: string; user_id: string; plan: string }>("POST", "/auth/google",
      { id_token: idToken }, { auth: false }),
  me: () => call<{ id: string; email: string; display_name: string | null; tz: string; plan: string }>("GET", "/auth/me"),

  // ig
  igConnect: (code: string, redirectUri: string) =>
    call<any[]>("POST", "/ig/connect", { code, redirect_uri: redirectUri }),
  igList: () => call<any[]>("GET", "/ig/accounts"),
  igDisconnect: (id: string) => call("DELETE", `/ig/${id}`),

  // photos
  uploadPhoto: async (uri: string, fileName: string) => {
    const tok = await getToken();
    const form = new FormData();
    form.append("file", { uri, name: fileName, type: "image/jpeg" } as any);
    const r = await fetch(`${BASE}/photos`, {
      method: "POST",
      headers: tok ? { Authorization: `Bearer ${tok}` } : {},
      body: form as any,
    });
    if (!r.ok) throw new ApiError(r.status, await r.text());
    return (await r.json()) as { id: string; status: string; score?: number; reject_reason?: string };
  },
  listPhotos: (status?: string) => call<any[]>("GET", `/photos${status ? `?status=${status}` : ""}`),

  // batches
  generateBatch: (igAccountId: string, voice?: string, n: number = 4) =>
    call<any>("POST", "/batches/generate", { ig_account_id: igAccountId, voice, n }),
  pendingBatches: () => call<any[]>("GET", "/batches/pending"),

  // candidates
  approve: (id: string) => call("POST", `/candidates/${id}/approve`),
  reject: (id: string) => call("POST", `/candidates/${id}/reject`),
  regenCaption: (id: string, opts?: { voice?: string; custom_voice?: string; hint?: string }) =>
    call("POST", `/candidates/${id}/regen-caption`, opts || {}),
  recrop: (id: string, aspect: "1:1" | "4:5" | "9:16") =>
    call("POST", `/candidates/${id}/recrop`, { aspect }),
  switchSlot: (id: string, slotType: "FEED" | "STORY") =>
    call("POST", `/candidates/${id}/switch-slot`, { slot_type: slotType }),
  reschedule: (id: string, when: string) =>
    call("POST", `/candidates/${id}/reschedule`, { scheduled_for: when }),
  trash: (id: string) => call("DELETE", `/candidates/${id}/trash`),

  // me
  aiConsent: (accepted: boolean, providers: string[] = ["google-gemini", "openai-gpt-4o-mini"]) =>
    call("POST", "/me/ai-consent", { accepted, providers }),
  deleteMe: () => call("DELETE", "/me"),

  // push
  registerPush: (fcmToken: string, deviceId?: string, appVersion?: string) =>
    call("POST", "/push/register", { fcm_token: fcmToken, device_id: deviceId, app_version: appVersion }),
};
