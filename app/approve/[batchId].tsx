/**
 * Approval sheet — the core UX. Swipeable carousel of candidates, editable
 * caption, 10 actions. Each action mutates server-side then refreshes batch.
 */
import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView, Dimensions, Alert } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft, ZoomIn } from "react-native-reanimated";
import { api } from "@/lib/api";
import { C } from "@/lib/theme";

const { width } = Dimensions.get("window");

type Cand = { id: string; image_url: string | null; caption: string | null; slot_type: string; status: string; regen_count?: number };
type Batch = { id: string; candidates: Cand[] };

export default function ApproveScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");

  const load = useCallback(async () => {
    const all = await api.pendingBatches();
    const b = all.find((x: any) => x.id === batchId);
    setBatch(b || null);
    if (b?.candidates?.[idx]?.caption !== captionDraft) {
      setCaptionDraft(b?.candidates?.[idx]?.caption || "");
    }
  }, [batchId, idx]);

  useEffect(() => { load(); }, [load]);

  if (!batch) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg }}><ActivityIndicator /></View>;
  const c = batch.candidates[idx];
  if (!c) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg, padding: 32 }}>
        <Text style={{ fontSize: 18, color: C.text, marginBottom: 24 }}>All done — batch reviewed.</Text>
        <Pressable onPress={() => router.back()} style={{ padding: 14, paddingHorizontal: 32, borderRadius: 12, backgroundColor: C.text }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Back</Text>
        </Pressable>
      </View>
    );
  }

  async function withBusy(label: string, fn: () => Promise<any>) {
    setBusy(label);
    try { await fn(); await load(); }
    catch (e: any) {
      Alert.alert("Failed", e?.detail?.detail || e?.message || "Try again");
    }
    finally { setBusy(null); }
  }

  const advance = () => setIdx(Math.min(idx + 1, batch.candidates.length));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, paddingTop: 60, paddingBottom: 48 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: C.brand, fontSize: 16 }}>✕ Close</Text>
        </Pressable>
        <Text style={{ color: C.muted }}>{idx + 1} / {batch.candidates.length}</Text>
      </View>

      <Animated.View key={c.id} entering={SlideInRight.duration(280)} exiting={SlideOutLeft.duration(180)}>
        {c.image_url ? (
          <Image source={{ uri: c.image_url }} style={{ width: width - 32, height: width - 32, borderRadius: 16, marginBottom: 12 }} contentFit="cover" />
        ) : (
          <View style={{ width: width - 32, height: width - 32, borderRadius: 16, backgroundColor: C.border, marginBottom: 12 }} />
        )}
      </Animated.View>

      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        <Text style={{ backgroundColor: C.text, color: "#fff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, fontSize: 12, fontWeight: "600" }}>
          {c.slot_type}
        </Text>
        <Text style={{ marginLeft: 8, color: C.muted, fontSize: 12, alignSelf: "center" }}>
          regen: {c.regen_count ?? 0}
        </Text>
      </View>

      <TextInput
        value={captionDraft}
        onChangeText={setCaptionDraft}
        multiline
        placeholder="Caption..."
        placeholderTextColor={C.muted}
        style={{ backgroundColor: C.card, borderRadius: 12, padding: 14, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.border, minHeight: 100, marginBottom: 16 }}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <ActionBtn label="✅ Approve" primary disabled={!!busy} onPress={() => withBusy("approve", async () => { await api.approve(c.id); advance(); })} />
        <ActionBtn label="❌ Reject" disabled={!!busy} onPress={() => withBusy("reject", async () => { await api.reject(c.id); advance(); })} />
        <ActionBtn label="🔄 New caption" disabled={!!busy} onPress={() => withBusy("regen", () => api.regenCaption(c.id))} />
        <ActionBtn label="✂️ 4:5" disabled={!!busy} onPress={() => withBusy("crop", () => api.recrop(c.id, "4:5"))} />
        <ActionBtn label="✂️ 9:16" disabled={!!busy} onPress={() => withBusy("crop", () => api.recrop(c.id, "9:16"))} />
        <ActionBtn label="✂️ 1:1" disabled={!!busy} onPress={() => withBusy("crop", () => api.recrop(c.id, "1:1"))} />
        <ActionBtn label={c.slot_type === "FEED" ? "→ STORY" : "→ FEED"} disabled={!!busy}
          onPress={() => withBusy("slot", () => api.switchSlot(c.id, c.slot_type === "FEED" ? "STORY" : "FEED"))} />
        <ActionBtn label="🗑️ Trash photo" disabled={!!busy} onPress={() => withBusy("trash", async () => { await api.trash(c.id); advance(); })} />
      </View>

      {busy && <ActivityIndicator color={C.brand} />}
      <Text style={{ color: C.muted, fontSize: 11, marginTop: 24, lineHeight: 18 }}>
        Approve schedules to the next available slot. Nothing posts to Instagram immediately.
      </Text>
    </ScrollView>
  );
}

function ActionBtn({ label, onPress, primary, disabled }: { label: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={{
        paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999,
        backgroundColor: primary ? C.brand : C.card, borderWidth: 1, borderColor: primary ? C.brand : C.border,
        opacity: disabled ? 0.5 : 1,
      }}>
      <Text style={{ color: primary ? "#fff" : C.text, fontWeight: "600", fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}
