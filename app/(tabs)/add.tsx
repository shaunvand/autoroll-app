import { useState } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "@/lib/api";
import { C } from "@/lib/theme";

export default function AddPhotos() {
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 30,
      quality: 0.9,
    });
    if (res.canceled) return;
    setBusy(true);
    for (const a of res.assets) {
      const name = a.fileName || a.uri.split("/").pop() || "p.jpg";
      try {
        const r = await api.uploadPhoto(a.uri, name);
        setLog((L) => [`${name}: ${r.status}${r.score !== undefined ? ` (${r.score})` : ""}`, ...L].slice(0, 50));
      } catch (e: any) {
        setLog((L) => [`${name}: err ${e?.message}`, ...L].slice(0, 50));
      }
    }
    setBusy(false);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 32, fontWeight: "800", color: C.text, marginBottom: 24 }}>Add photos</Text>
      <Pressable onPress={pick} disabled={busy}
        style={{ padding: 16, borderRadius: 12, backgroundColor: busy ? C.muted : C.text, alignItems: "center", marginBottom: 16 }}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Pick from gallery</Text>}
      </Pressable>
      {log.length > 0 && (
        <View style={{ backgroundColor: C.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border }}>
          {log.map((l, i) => (
            <Text key={i} style={{ color: C.text, fontSize: 13, paddingVertical: 4, borderBottomWidth: i === log.length - 1 ? 0 : 1, borderBottomColor: C.border }}>{l}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
