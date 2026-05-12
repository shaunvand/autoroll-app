# How to test Autoroll on your Android phone

Three ways, fastest to slowest.

## Option A — Expo Go (fastest, no build needed)

Free path that gets you running in 5 minutes.

1. **Install Expo Go** on your Android phone from the Play Store.
2. From this folder, run:
   ```bash
   cd C:\Users\shaun\autoroll-app
   npm install     # first time only
   npm start
   ```
3. A QR code prints in the terminal. Scan it with **Expo Go**.
4. The app loads on your phone live-reload — change a file, app updates.

**Limitations:** push notifications won't work end-to-end in Expo Go (you need a
custom build for FCM project linkage), and the Facebook OAuth redirect requires
the `autoroll://` scheme that only works in a custom build. Everything else
(signup, photos upload, batches, candidates, settings) works.

## Option B — EAS Build APK (recommended for real testing)

You need a free **Expo account** at https://expo.dev/signup.

1. Install the EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Initialize the project (first time only):
   ```bash
   cd C:\Users\shaun\autoroll-app
   eas init --id $(uuidgen)   # or let EAS pick
   ```
3. Build the APK:
   ```bash
   eas build --platform android --profile preview
   ```
4. EAS builds in the cloud. After ~10-15 minutes it sends you a download URL.
5. Download the `.apk` on your phone, tap to install (you'll be asked to allow
   "install from unknown sources" once — that's normal for sideload APKs).
6. Sign in, connect IG, upload photos, push will fire.

Builds are free on the EAS hobby plan (limited builds/month, fine for this).

## Option C — Local Android Studio build

Heaviest path, full control. Install Android Studio + JDK 17 + Android SDK,
then `npx expo run:android` from this folder. Skip unless EAS doesn't work.

---

## What to test once installed

1. **Signup** → email + password → check you land on AI consent screen
2. **AI consent** → tap "I agree, continue" → check Connect Instagram screen
3. **Connect Instagram** → tap "Connect with Facebook" → browser opens → log in
   - If IG Business exists + linked to Page: you proceed
   - If not: app shows the "no IG Business" warning + walkthrough hint
4. **Photos onboarding** → pick 10-20 photos → watch them score (curated / rejected)
5. **Today tab** → tap "Generate new batch" → wait ~30s → batch card appears
6. **Tap batch** → approval sheet shows photo 1 of 4, caption, 8 actions
7. **Approve** → schedules to next slot, advances to photo 2
8. **Switch slot** (FEED ↔ STORY) → instant change
9. **Recrop** (1:1, 4:5, 9:16) → image re-renders
10. **Regen caption** → new caption appears
11. **Reject** / **Trash** → photo removed from rotation
12. **Settings tab** → see connected IG, plan, logout, delete account
13. **Push notification** → triggered when a batch finishes (B/C only)
14. **Scheduled post** → fires via cron `*/10 * * * *`. Wait, check IG.

## When things break

- Login fails: backend at https://api.autoroll.online/health should return `{ok:true, db:true}`
- Photo upload returns score 0 reject: check Gemini key on Render env vars
- Batch generate hangs: imgbb may be rate-limiting; retry
- Push never arrives: not yet wired in Expo Go; use APK (Option B)
- OAuth returns to browser instead of app: only works in APK builds (deep link)
