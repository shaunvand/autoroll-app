# Autoroll — Android app

Expo React Native app for Autoroll. Targets Android only.

## Stack
- Expo SDK 51 / React Native 0.74 / TypeScript
- expo-router (file-based)
- expo-secure-store (JWT session)
- expo-image-picker (PickVisualMediaRequest — no library permission)
- expo-web-browser (FB Login for Business OAuth)
- expo-notifications (FCM via Expo Push Service)

## Setup
```
npm install
npm start
```

For a real APK:
```
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Routes
- `/` splash + auto-route
- `/login`, `/signup`
- `/onboarding/ai-consent` — explicit consent gate (compliance)
- `/onboarding/connect-ig` — FB Login OAuth
- `/onboarding/photos` — first picks
- `/(tabs)/today` — pending batches + generate
- `/(tabs)/add` — add more photos
- `/(tabs)/settings` — account, IG list, logout, delete
- `/approve/[batchId]` — 10-action approval sheet

## Env
Hardcoded in `app.json` → `extra`:
- `apiBase`: `https://api.autoroll.online`
- `metaAppId`: `1491705065689201`
- `fbOauthRedirect`: `https://autoroll.online/app/fb-callback`

The marketing site at `autoroll.online/app/fb-callback` is a one-line page that
forwards the `?code=` query back to the app via the `autoroll://` scheme so
`expo-web-browser`'s `openAuthSessionAsync` can capture it.
