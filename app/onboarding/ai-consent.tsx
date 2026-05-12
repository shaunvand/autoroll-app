/**
 * Apple/Google App Review compliance: explicit AI data-sharing consent.
 * User must affirmatively tap "I agree" before any photo touches Gemini or OpenAI.
 */
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { C } from "@/lib/theme";

export default function AiConsent() {
  const [busy, setBusy] = useState(false);

  async function accept() {
    setBusy(true);
    try {
      await api.aiConsent(true);
      router.replace("/onboarding/connect-ig");
    } finally { setBusy(false); }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: C.text, marginBottom: 16 }}>
        One quick thing
      </Text>
      <Text style={{ fontSize: 16, color: C.text, lineHeight: 24, marginBottom: 16 }}>
        Autoroll uses AI to score your photos, enhance them, and write captions.
        Before we touch a single photo, we need your OK to send images to:
      </Text>
      <View style={{ backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ fontWeight: "600", color: C.text, marginBottom: 4 }}>Google (Gemini)</Text>
        <Text style={{ color: C.muted, fontSize: 14 }}>Scores photos and applies optional generative enhancement.</Text>
      </View>
      <View style={{ backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border }}>
        <Text style={{ fontWeight: "600", color: C.text, marginBottom: 4 }}>OpenAI (GPT-4o-mini)</Text>
        <Text style={{ color: C.muted, fontSize: 14 }}>Generates the caption text for each approved post.</Text>
      </View>
      <Text style={{ fontSize: 14, color: C.muted, lineHeight: 20, marginBottom: 32 }}>
        Photos are sent only for processing and aren't used to train any model.
        You can withdraw consent and delete all your data anytime in Settings.
      </Text>
      <Pressable onPress={accept} disabled={busy}
        style={{ padding: 16, borderRadius: 12, backgroundColor: busy ? C.muted : C.text, alignItems: "center", marginBottom: 12 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>I agree, continue</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: C.muted, fontSize: 14, textAlign: "center" }}>Not now</Text>
      </Pressable>
    </ScrollView>
  );
}
