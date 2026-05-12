/**
 * Photo source onboarding. User picks photos via PickVisualMediaRequest
 * (zero library permission). Uploads to backend for scoring.
 */
import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { C } from "@/lib/theme";

export default function PhotosOnboarding() {
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ name: string; status: string; score?: number }[]>([]);

  async function pickAndUpload() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 20,
      quality: 0.9,
    });
    if (res.canceled) return;
    setBusy(true);
    const out: { name: string; status: string; score?: number }[] = [];
    for (const asset of res.assets) {
      const name = asset.fileName || asset.uri.split("/").pop() || "photo.jpg";
      try {
        const r = await api.uploadPhoto(asset.uri, name);
        out.push({ name, status: r.status, score: r.score });
        setResults([...out]);
      } catch (e: any) {
        out.push({ name, status: `err: ${e?.message}` });
        setResults([...out]);
      }
    }
    setBusy(false);
  }

  function done() { router.replace("/(tabs)/today"); }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: C.text, marginBottom: 12 }}>Add some photos</Text>
      <Text style={{ fontSize: 16, color: C.muted, lineHeight: 24, marginBottom: 24 }}>
        Pick 10-20 of your recent photos. Our AI will score them and pick the best
        for your first batch. We never read your full library — only the photos you
        pick here.
      </Text>

      <Pressable onPress={pickAndUpload} disabled={busy}
        style={{ padding: 16, borderRadius: 12, backgroundColor: C.text, alignItems: "center", marginBottom: 16 }}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Pick photos</Text>}
      </Pressable>

      {results.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: C.muted, marginBottom: 8 }}>
            {results.filter(r => r.status === "curated").length} of {results.length} curated
          </Text>
          {results.slice(-8).reverse().map((r, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
              <Text numberOfLines={1} style={{ color: C.text, flex: 1, marginRight: 12 }}>{r.name}</Text>
              <Text style={{ color: r.status === "curated" ? C.ok : C.muted, fontSize: 12 }}>
                {r.status}{r.score !== undefined ? ` (${r.score})` : ""}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Pressable onPress={done} disabled={!results.some(r => r.status === "curated")}
        style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: "center", backgroundColor: C.card }}>
        <Text style={{ color: results.some(r => r.status === "curated") ? C.text : C.muted, fontSize: 16, fontWeight: "600" }}>
          {results.some(r => r.status === "curated") ? "Done — go to my feed" : "Add at least one curated photo"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
