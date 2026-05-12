/**
 * Expo push registration + inbound notification handling.
 */
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { router } from "expo-router";
import { api } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true,
    shouldPlaySound: true, shouldSetBadge: false,
  }),
});

export async function ensurePushPermission(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return null;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default", importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250], lightColor: "#FF5A5F",
    });
  }
  const projectId = (require("expo-constants").default.expoConfig?.extra?.eas?.projectId);
  const tok = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return tok.data;
}

export async function registerPushWithBackend() {
  const expoToken = await ensurePushPermission();
  if (!expoToken) return null;
  try {
    await api.registerPush(expoToken,
      Device.osInternalBuildId ?? undefined,
      "autoroll/0.1.0");
  } catch {}
  return expoToken;
}

let listenersInstalled = false;
export function installNotificationListeners() {
  if (listenersInstalled) return;
  listenersInstalled = true;
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data: any = response.notification.request.content.data;
    if (data?.type === "batch_ready" && data?.batch_id) {
      router.push(`/approve/${data.batch_id}`);
    }
  });
}
