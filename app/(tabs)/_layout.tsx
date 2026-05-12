import { Tabs } from "expo-router";
import { C } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: C.brand,
      tabBarInactiveTintColor: C.muted,
      tabBarStyle: { backgroundColor: C.card, borderTopColor: C.border },
      tabBarLabelStyle: { fontSize: 12 },
    }}>
      <Tabs.Screen name="today" options={{ title: "Today" }} />
      <Tabs.Screen name="add" options={{ title: "Add photos" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
