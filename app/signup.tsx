import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { api, setToken } from "@/lib/api";
import { C } from "@/lib/theme";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setErr(null); setBusy(true);
    try {
      const r = await api.signup(email.trim().toLowerCase(), password, undefined,
        Intl.DateTimeFormat().resolvedOptions().timeZone);
      await setToken(r.session_token);
      router.replace("/onboarding/ai-consent");
    } catch (e: any) {
      setErr(e?.detail?.detail || e?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 32, fontWeight: "800", color: C.text, marginBottom: 24 }}>Create an account</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={C.muted}
        style={{ padding: 16, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginBottom: 12, fontSize: 16, color: C.text }} />
      <TextInput value={password} onChangeText={setPassword} placeholder="password (8+ chars)" secureTextEntry placeholderTextColor={C.muted}
        style={{ padding: 16, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginBottom: 12, fontSize: 16, color: C.text }} />
      {err && <Text style={{ color: C.err, marginBottom: 12 }}>{err}</Text>}
      <Pressable onPress={go} disabled={busy || password.length < 8 || !email}
        style={{ padding: 16, borderRadius: 12, backgroundColor: busy ? C.muted : C.text, alignItems: "center", marginBottom: 16 }}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Create account</Text>}
      </Pressable>
      <Link href="/login" style={{ textAlign: "center", color: C.muted, fontSize: 14 }}>
        Already have an account? Log in
      </Link>
      <Text style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 24, paddingHorizontal: 16 }}>
        By signing up you accept the Terms and acknowledge the Privacy Policy.
      </Text>
    </View>
  );
}
