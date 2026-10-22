# Android Release Plan (WebView Wrapper)

Status: planning only. This file does not create an Android project, change production, or deploy Firebase rules.

## Recommended approach

Keep the current game as HTML/CSS/JavaScript and package it inside a small Android application using Android Studio + Java/Kotlin + Android WebView. Do not rewrite the game engine in Java just to publish an Android app.

Suggested asset layout in the Android project:

```
app/src/main/assets/game/
  index.html
  engine.js
  render.js
  ui.js
  data.js
  (any local images, fonts, styles, icons, and other required assets)
```

Prefer AndroidX WebKit's `WebViewAssetLoader` to serve bundled local assets on an HTTPS-like origin instead of relying on raw `file://` URLs. Confirm all relative script/style/image paths work after packaging.

## Packaging choices

- **Local bundled game (recommended for the first reliable release):** HTML and JS ship inside the app. The game can open without downloading the game files, but content changes generally require an app update.
- **Remote Vercel URL:** simpler to prototype, but it depends on connectivity and a web deployment can change independently of the app version. Do not use this as a security boundary.
- Keep one canonical source tree so the website and Android bundle do not silently drift. Add a repeatable copy/build step later rather than manually maintaining separate JS copies.

## WebView configuration and navigation

- Enable JavaScript because the game needs it; enable DOM storage if the current save/login flow requires localStorage.
- Keep cleartext HTTP disabled; use HTTPS for network services.
- Restrict top-level navigation to the game's own bundled origin and explicitly approved HTTPS destinations. Open unrelated external links in the system browser.
- Do not expose `addJavascriptInterface` unless a specific native feature requires it. If it is needed, expose the smallest possible API, annotate intended methods, validate every input, and never load untrusted pages into that WebView.
- Handle Android back navigation, screen rotation, immersive/full-screen mode, app pause/resume, keyboard/safe areas, and network failures deliberately.
- Test Firebase Auth persistence, Firestore access, localStorage, canvas resizing, audio, portrait/landscape, and older supported Android/WebView versions on real devices.

## Security: what does and does not change

Packaging JavaScript inside an APK does **not** make game state authoritative. A motivated player can inspect or modify the APK, instrument the WebView, patch JavaScript, or call Firestore APIs directly with their own authenticated session. Minification/obfuscation only raises effort; it is not an anti-cheat boundary.

The current save checksum is useful for accidental corruption/tamper detection, not for proving a save is honest. The secret/salt and verifier ship with the client and can be reproduced by a modified client.

For meaningful protection:
1. Firestore Rules must enforce ownership and permitted document operations, and be tested against the exact client writes.
2. Valuable balances, purchases, rewards, prestige and trusted leaderboard scores must be validated by trusted server code or a server-authoritative simulation. Never trust client-submitted gold, crystals, wave, damage, or rewards as proof.
3. Do not ship Firebase Admin credentials, service-account keys, server secrets, or privileged backend tokens in HTML/JS or the APK. Firebase client configuration is not a server secret; security comes from Auth, Rules, and backend authorization.
4. Treat local saves and offline progress as untrusted until reconciled with server-side rules.
5. Keep Android release signing keys private and backed up securely. Signing identifies the release; it does not prevent a user from modifying their own client.

## Release gates

- [ ] Build a minimal Android wrapper on a separate branch/project; do not modify the live Vercel app while prototyping.
- [ ] Bundle every required local asset and check whether Tailwind, fonts, icons, and Firebase SDKs currently load from CDNs. Decide which assets need bundling and which intentionally require internet.
- [ ] Test login/signup/logout, cloud push/pull, V1/V2 saves, save-code import, cross-device sync, account deletion, and app reinstall/update on a disposable Firebase test project/account.
- [ ] Run the existing security-lab tests and add a WebView smoke test for the packaged build.
- [ ] Test desktop web and Android together; keep the website path working.
- [ ] Verify privacy disclosures, data-safety declarations, app signing, target SDK, and Google Play requirements before publishing an AAB.
- [ ] Do not merge/deploy candidate Firestore rules until the P0 checklist in `SECURITY_REMAINING_WORK.md` is complete.

## Official references

- Android WebView: https://developer.android.com/develop/ui/views/layout/webapps/webview
- Load local web content safely with WebViewAssetLoader: https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader
- Android App Bundles: https://developer.android.com/guide/app-bundle
