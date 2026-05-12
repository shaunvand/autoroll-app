import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { installNotificationListeners, registerPushWithBackend } from "@/lib/push";
import { getToken } from "@/lib/api";

export default function RootLayout() {
  useEffect(() => {
    installNotificationListeners();
    (async () => {
      if (await getToken()) await registerPushWithBackend();
    })();
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="welcome" options={{ animation: "fade" }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="onboarding/connect-ig" />
        <Stack.Screen name="onboarding/ai-consent" />
        <Stack.Screen name="onboarding/photos" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="approve/[batchId]" options={{ presentation: "modal" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
