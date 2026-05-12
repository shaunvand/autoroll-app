import { useEffect } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { getToken, api } from "@/lib/api";
import { C } from "@/lib/theme";

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(async () => {
      const tok = await getToken();
      if (!tok) { router.replace("/welcome"); return; }
      try {
        await api.me();
        const igs = await api.igList();
        if (!igs.length) router.replace("/onboarding/connect-ig");
        else router.replace("/(tabs)/today");
      } catch {
        router.replace("/welcome");
      }
    }, 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
      <Animated.View entering={ZoomIn.duration(450)} exiting={FadeOut}>
        <Image source={require("../assets/icon.png")}
          style={{ width: 120, height: 120, borderRadius: 28 }} contentFit="cover" />
      </Animated.View>
      <Animated.Text entering={FadeIn.delay(300).duration(400)}
        style={{ fontSize: 36, fontWeight: "800", letterSpacing: -1.5, color: C.text, marginTop: 24 }}>
        Autoroll
      </Animated.Text>
    </View>
  );
}
