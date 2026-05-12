import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { getToken, api } from "@/lib/api";
import { C } from "@/lib/theme";

export default function Splash() {
  useEffect(() => {
    (async () => {
      const tok = await getToken();
      if (!tok) { router.replace("/login"); return; }
      try {
        await api.me();
        // Check IG accounts to route to onboarding vs main tabs
        const igs = await api.igList();
        if (!igs.length) router.replace("/onboarding/connect-ig");
        else router.replace("/(tabs)/today");
      } catch {
        router.replace("/login");
      }
    })();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 48, fontWeight: "800", letterSpacing: -2, color: C.brand }}>Autoroll</Text>
      <ActivityIndicator color={C.muted} style={{ marginTop: 24 }} />
    </View>
  );
}
