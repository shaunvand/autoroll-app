import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
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
