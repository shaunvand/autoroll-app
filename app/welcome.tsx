/**
 * 3-screen swipeable onboarding carousel with animated dot indicator.
 * Shown to first-launch users before login/signup.
 */
import { useRef, useState } from "react";
import { View, Text, Dimensions, Pressable, FlatList } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { C } from "@/lib/theme";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "AI picks your best",
    body: "Our AI scores every photo you add and rejects screenshots, blurry shots, and bad framing.",
    image: require("../assets/hero-curate.png"),
  },
  {
    title: "Pro-look enhancement",
    body: "Every approved post is colour-graded and sharpened before it lands on Instagram.",
    image: require("../assets/hero-enhance.png"),
  },
  {
    title: "One-tap approve",
    body: "We push you 4 photo picks with captions written for you. Tap once. We schedule. You sleep.",
    image: require("../assets/hero-approve.png"),
  },
];

export default function Welcome() {
  const [idx, setIdx] = useState(0);
  const listRef = useRef<FlatList>(null);

  function next() {
    if (idx < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: idx + 1, animated: true });
    } else {
      router.replace("/signup");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <View style={{ width, alignItems: "center", paddingHorizontal: 32, paddingTop: 96 }}>
            <Animated.View entering={FadeInUp.delay(50).duration(500)}>
              <Image source={item.image} style={{ width: width - 64, height: width - 64, borderRadius: 32 }} contentFit="cover" />
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(150).duration(500)}
              style={{ fontSize: 30, fontWeight: "800", color: C.text, marginTop: 40, textAlign: "center", letterSpacing: -1 }}>
              {item.title}
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(250).duration(500)}
              style={{ fontSize: 16, color: C.muted, marginTop: 12, textAlign: "center", lineHeight: 24 }}>
              {item.body}
            </Animated.Text>
          </View>
        )}
      />

      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 24 }}>
        {SLIDES.map((_, i) => (
          <View key={i} style={{
            width: i === idx ? 24 : 8, height: 8, borderRadius: 4, marginHorizontal: 4,
            backgroundColor: i === idx ? C.brand : C.border,
          }} />
        ))}
      </View>

      <View style={{ padding: 24, paddingBottom: 36 }}>
        <Pressable onPress={next}
          style={{ padding: 16, borderRadius: 999, backgroundColor: C.brand, alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            {idx === SLIDES.length - 1 ? "Get started" : "Next"}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.replace("/login")}>
          <Text style={{ color: C.muted, fontSize: 14, textAlign: "center" }}>Already have an account? Log in</Text>
        </Pressable>
      </View>
    </View>
  );
}
