import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Link, router } from "expo-router";
import { api, setToken, ApiError } from "@/lib/api";
import { C } from "@/lib/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setErr(null); setBusy(true);
    try {
      const r = await api.login(email.trim().toLowerCase(), password);
      await setToken(r.session_token);
      router.replace("/");
    } catch (e: any) {
      setErr(e?.detail?.detail || e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Text style={{ fontSize: 40, fontWeight: "800", letterSpacing: -1.5, color: C.text, marginBottom: 8 }}>Autoroll</Text>
        <Text style={{ fontSize: 16, color: C.muted, marginBottom: 32 }}>Your camera roll, posted automatically.</Text>

        <TextInput value={email} onChangeText={setEmail} placeholder="email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={C.muted}
          style={{ padding: 16, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginBottom: 12, fontSize: 16, color: C.text }} />
        <TextInput value={password} onChangeText={setPassword} placeholder="password" secureTextEntry placeholderTextColor={C.muted}
          style={{ padding: 16, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginBottom: 12, fontSize: 16, color: C.text }} />

        {err && <Text style={{ color: C.err, marginBottom: 12 }}>{err}</Text>}

        <Pressable onPress={go} disabled={busy || !email || !password}
          style={{ padding: 16, borderRadius: 12, backgroundColor: busy ? C.muted : C.text, alignItems: "center", marginBottom: 16 }}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Log in</Text>}
        </Pressable>

        <Link href="/signup" style={{ textAlign: "center", color: C.muted, fontSize: 14 }}>
          New here? Create an account
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
