/**
 * Today: pending batches awaiting approval + generate new batch button.
 */
import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, router } from "expo-router";
import { api } from "@/lib/api";
import { C } from "@/lib/theme";

type Cand = { id: string; image_url: string | null; caption: string | null; slot_type: string; status: string };
type Batch = { id: string; status: string; created_at: string; candidates: Cand[] };

export default function Today() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [igAccountId, setIgAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [bs, igs] = await Promise.all([api.pendingBatches(), api.igList()]);
      setBatches(bs);
      setIgAccountId(igs[0]?.id || null);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function generate() {
    if (!igAccountId) { setErr("Connect an Instagram account first"); return; }
    setGenerating(true); setErr(null);
    try {
      await api.generateBatch(igAccountId);
      await load();
    } catch (e: any) {
      setErr(e?.detail?.detail || e?.message || "Generate failed");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg }}><ActivityIndicator /></View>;

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 60 }}
      data={batches}
      keyExtractor={(b) => b.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      ListHeaderComponent={() => (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 32, fontWeight: "800", color: C.text, marginBottom: 16 }}>Today</Text>
          <Pressable onPress={generate} disabled={generating || !igAccountId}
            style={{ padding: 14, borderRadius: 12, backgroundColor: generating ? C.muted : C.brand, alignItems: "center" }}>
            {generating ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Generate new batch</Text>}
          </Pressable>
          {err && <Text style={{ color: C.err, marginTop: 12 }}>{err}</Text>}
        </View>
      )}
      ListEmptyComponent={() => (
        <View style={{ alignItems: "center", padding: 32 }}>
          <Text style={{ fontSize: 16, color: C.muted, textAlign: "center" }}>
            No pending batches. Tap &quot;Generate new batch&quot; above.
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <Pressable onPress={() => router.push(`/approve/${item.id}` as any)}
          style={{ backgroundColor: C.card, borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {item.candidates.slice(0, 4).map((c) => (
              c.image_url ? (
                <Image key={c.id} source={{ uri: c.image_url }}
                  style={{ width: 70, height: 70, borderRadius: 8, marginRight: 8 }} contentFit="cover" />
              ) : <View key={c.id} style={{ width: 70, height: 70, borderRadius: 8, marginRight: 8, backgroundColor: C.border }} />
            ))}
          </View>
          <Text style={{ color: C.text, fontWeight: "600" }}>
            {item.candidates.length} photos ready · tap to review
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
            Created {new Date(item.created_at).toLocaleString()}
          </Text>
        </Pressable>
      )}
    />
  );
}
