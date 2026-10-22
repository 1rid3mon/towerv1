# Kule Savunma — Android WebView prototype

This is a **prototype scaffold**, not a verified release APK. It keeps the existing HTML/JavaScript game as the canonical source and copies the root game files into the Android app's bundled assets during Gradle's `preBuild` task.

## Build

1. Install Android Studio and a compatible JDK (JDK 17).
2. Open this `android-wrapper` directory in Android Studio.
3. Install Android SDK Platform 35 and the Android build tools requested by Gradle.
4. Let Gradle sync, then build/run the `app` configuration on an emulator or Android device.
5. Before sharing an APK, test portrait and landscape, local saves, audio, canvas resizing, reload/reopen, and the Firebase login/cloud-save flows with a **separate Firebase test project and disposable test account**.

The wrapper uses AndroidX WebKit's `WebViewAssetLoader` to serve local game assets on its supported app-assets origin. It enables JavaScript and DOM storage because the game uses them, disables raw file/content access, and does not expose a JavaScript-to-native bridge.

## Important prototype limitations

- This scaffold has **not yet been built or run on a device**; compile/runtime fixes may be needed.
- Only the five known root files (`index.html`, `engine.js`, `render.js`, `ui.js`, `data.js`) are copied. If the game later adds local image/font/audio files, add them to the Gradle copy includes.
- Firebase SDKs or fonts loaded from CDNs still require internet. Verify the Firebase Auth redirect/popup behavior inside WebView; if the current flow does not work, implement and test an Android-compatible sign-in path before release.
- The allowlist for external navigation is intentionally narrow. Review any required external OAuth domains against actual observed redirects instead of broadly allowing all URLs.
- No signing key, production Firebase credentials, or production rules are included.
- Wrapping JavaScript in an APK does not prevent cheating. Keep valuable currency, rewards, and trusted leaderboard results server-authoritative.

## Release gate

Do not call this production-ready or publish it until a real Gradle build and device test pass, Firebase flows work against a staging project, and privacy/Play Store requirements are reviewed.
