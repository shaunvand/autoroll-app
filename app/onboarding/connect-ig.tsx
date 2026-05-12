/**
 * Connect Instagram via Facebook Login for Business.
 * Opens FB OAuth URL in expo-web-browser, captures code from /app/fb-callback,
 * posts to /ig/connect on backend, which exchanges + discovers IG accounts.
 */
import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { C } from "@/lib/theme";

const META_APP_ID = (Constants.expoConfig?.extra?.metaAppId as string) || "1491705065689201";
const REDIRECT = (Constants.expoConfig?.extra?.fbOauthRedirect as string) || "https://autoroll.online/app/fb-callback";

const SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

function authUrl(state: string) {
  const u = new URL("https://www.facebook.com/v22.0/dialog/oauth");
  u.searchParams.set("client_id", META_APP_ID);
  u.searchParams.set("redirect_uri", REDIRECT);
  u.searchParams.set("scope", SCOPES);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("state", state);
  return u.toString();
}

export default function ConnectIg() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  async function connect() {
    setErr(null); setHint(null); setBusy(true);
    try {
      const state = Math.random().toString(36).slice(2);
      const result = await WebBrowser.openAuthSessionAsync(authUrl(state), REDIRECT);
      if (result.type !== "success" || !result.url) {
        setErr("Cancelled before completing Facebook login.");
        return;
      }
      const parsed = Linking.parse(result.url);
      const code = (parsed.queryParams?.code as string) || "";
      const returnedState = parsed.queryParams?.state as string;
      if (!code) { setErr("No authorization code returned."); return; }
      if (returnedState !== state) { setErr("State mismatch — possible CSRF."); return; }
      const accounts = await api.igConnect(code, REDIRECT);
      if (!accounts.length) {
        setHint("Logged in, but no Instagram Business or Creator account was found linked to a Facebook Page you manage. Convert your Instagram to Creator/Business and link a Page, then try again.");
        return;
      }
      router.replace("/onboarding/photos");
    } catch (e: any) {
      const d = e?.detail;
      if (d?.error === "no_ig_business_account") setHint(d.message);
      else setErr(d?.detail || e?.message || "Connection failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: C.text, marginBottom: 12 }}>
        Connect Instagram
      </Text>
      <Text style={{ fontSize: 16, color: C.muted, lineHeight: 24, marginBottom: 24 }}>
        We post on your behalf using Facebook&apos;s official Graph API. Your password
        never touches Autoroll.
      </Text>

      <View style={{ backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ fontWeight: "600", marginBottom: 8, color: C.text }}>You&apos;ll need:</Text>
        <Text style={{ color: C.muted, marginBottom: 4 }}>• An Instagram Creator or Business account</Text>
        <Text style={{ color: C.muted, marginBottom: 4 }}>• That account linked to a Facebook Page you admin</Text>
        <Text style={{ color: C.muted }}>• To be logged into Facebook in your browser</Text>
      </View>

      {err && <Text style={{ color: C.err, marginBottom: 12 }}>{err}</Text>}
      {hint && (
        <View style={{ backgroundColor: "#fff7ed", borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#fdba74" }}>
          <Text style={{ color: "#9a3412", lineHeight: 22 }}>{hint}</Text>
        </View>
      )}

      <Pressable onPress={connect} disabled={busy}
        style={{ padding: 16, borderRadius: 12, backgroundColor: busy ? C.muted : "#1877F2", alignItems: "center" }}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Connect with Facebook</Text>}
      </Pressable>
    </ScrollView>
  );
}
