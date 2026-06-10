# MyTremor — v4 (Mobile-First PWA)

A simple hand-tremor tracking web app, rebuilt mobile-first and installable as a Progressive Web App.

## What's new in v4

- **Installable on iPhone**: open in Safari → Share → Add to Home Screen → launches like a native app
- **Touch-first interactions**: all three tests use pointer events (touch, mouse, stylus) — no more mouse-only code
- **Mobile bottom tab bar**: switch between Home, Tests, Check-In, History, and More with one tap
- **Safe-area aware**: respects notch / Dynamic Island / home indicator
- **Larger touch targets**: 16-18px start dots, 90px pickup zones, 56px+ tab buttons
- **Service worker** caches the app for installability + slightly faster repeat loads
- **Test redesigns:**
  - **Rest Test**: tap and hold on the dot. Lifting your finger costs **−5 points** each time.
  - **Draw Test**: tap the green dot, then drag along the dashed blue line. Lift to end each shape.
  - **Steady Cup**: tap the cup to pick up, drag to move. Lifting your finger **pauses** the test (no penalty) — tap the cup again to continue.

## How to run it locally

You need Node.js 18+. If you don't have it: https://nodejs.org

```bash
cd ~/Downloads/tremor-fixed
npm install
npm run dev
```

Open http://localhost:3000 on your Mac.

To test on your phone over WiFi: when `npm run dev` starts, it also prints a "Network" URL like `http://192.168.x.x:3000`. Open that URL on your phone (same WiFi as your laptop).

> Note: Service worker registration is disabled in dev mode to prevent stale caches. To verify install behavior, deploy to production.

## How to deploy

This repo is GitHub-connected to Vercel. To push updates:

```bash
git add .
git commit -m "describe your change"
git push
```

Vercel auto-deploys in ~1 minute. Live URL: https://my-tremor.vercel.app

## How to install on iPhone (Add to Home Screen)

1. Open https://my-tremor.vercel.app in **Safari** (not Chrome — only Safari supports Add to Home Screen on iOS)
2. Tap the **Share** button (square with arrow up)
3. Scroll down → tap **Add to Home Screen**
4. Tap **Add**
5. Launch from your home screen — it opens in standalone mode with no Safari URL bar

## How to install on Android

1. Open the URL in Chrome
2. Chrome will show an "Install" prompt automatically, or:
3. Menu (three dots) → **Install app** or **Add to Home Screen**

## File structure

```
app/
  layout.tsx          # PWA + iOS meta tags
  manifest.ts         # PWA manifest
  page.tsx            # Section switcher
  globals.css         # Safe-area + mobile defaults
  auth/               # Login + sign-up pages
components/
  navigation.tsx      # Top bar + mobile bottom tab bar
  dashboard.tsx       # Mobile-first home
  tests/
    countdown-overlay.tsx     # Responsive 3-2-1-GO overlay
    rest-test.tsx             # Touch-hold + lift penalty
    draw-test.tsx             # Touch tracing
    steady-water-test.tsx     # Touch pickup + pause-on-lift
    test-results.tsx          # Always-visible movement graph
  service-worker-registrar.tsx
  ...
lib/
  local-auth.ts         # localStorage user/test/survey store
  use-pointer-handlers.ts  # Shared pointer (mouse+touch) hook
public/
  manifest.webmanifest  # auto-generated from app/manifest.ts
  sw.js                 # Service worker
  icon.svg              # MyTremor logo
  icon-192.png          # PWA icon
  icon-512.png          # PWA icon
  apple-icon.png        # iOS home screen icon
```

## Notes

- All user data lives in browser localStorage. No backend, no signup required.
- Passwords are stored in plaintext (demo only; not real security).
- The 3 tests preserve the original tremor-scoring algorithms — only the input layer changed.
