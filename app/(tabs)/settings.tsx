import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { api, setToken } from "@/lib/api";
import { C } from "@/lib/theme";

export default function Settings() {
  const [me, setMe] = useState<any>(null);
  const [igs, setIgs] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try { setMe(await api.me()); setIgs(await api.igList()); } catch {}
    })();
  }, []);

  async function logout() {
    await setToken(null);
    router.replace("/login");
  }

  async function deleteAccount() {
    Alert.alert("Delete account?", "All your photos, captions, and connections will be deleted within 30 days. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await api.deleteMe();
            await setToken(null);
            router.replace("/login");
          } catch (e: any) {
            Alert.alert("Failed", e?.message || "Try again later");
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 32, fontWeight: "800", color: C.text, marginBottom: 24 }}>Settings</Text>

      <View style={{ backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ color: C.muted, fontSize: 12, marginBottom: 4 }}>ACCOUNT</Text>
        <Text style={{ color: C.text, fontSize: 16, marginBottom: 8 }}>{me?.email || "Loading…"}</Text>
        <Text style={{ color: C.muted, fontSize: 14 }}>Plan: {me?.plan || "—"}</Text>
      </View>

      <View style={{ backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>INSTAGRAM</Text>
        {igs.length === 0 ? (
          <Text style={{ color: C.muted }}>No Instagram connected.</Text>
        ) : igs.map((ig) => (
          <View key={ig.id} style={{ marginBottom: 8 }}>
            <Text style={{ color: C.text, fontWeight: "600" }}>@{ig.ig_username || ig.ig_user_id}</Text>
            <Text style={{ color: C.muted, fontSize: 12 }}>Page: {ig.page_name}</Text>
          </View>
        ))}
        <Pressable onPress={() => router.push("/onboarding/connect-ig")}
          style={{ marginTop: 8, paddingVertical: 8 }}>
          <Text style={{ color: C.brand, fontWeight: "600" }}>+ Connect another</Text>
        </Pressable>
      </View>

      <Pressable onPress={logout}
        style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, alignItems: "center", marginBottom: 12 }}>
        <Text style={{ color: C.text, fontWeight: "600" }}>Log out</Text>
      </Pressable>

      <Pressable onPress={deleteAccount}
        style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.err, alignItems: "center" }}>
        <Text style={{ color: C.err, fontWeight: "600" }}>Delete my account</Text>
      </Pressable>

      <Text style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 32 }}>
        Autoroll v0.1.0 · operated by AfriYaziMedia
      </Text>
    </ScrollView>
  );
}
