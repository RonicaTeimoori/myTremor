# MyTremor — v2

A simple web app for tracking hand tremors. Built with Next.js, stores everything in your browser (no backend, no signup hassles).

## What changed in this version

- **Simpler everywhere**: easier wording, bigger buttons, more step-by-step instructions, friendlier tone
- **Daily Check-In is unrestricted**: no sign-in required, can fill it out as many times as you want
- **3-second countdown before every test** so you have time to position your hand
- **Clear "start here" markers** so you always know where to put your cursor
- **Draw test traces over pre-drawn shapes** with bright green start dots
- **Steady Cup test is now realistic** — your cursor IS a cup of water that wobbles, spills droplets when you shake, and gets emptier the more you move
- **Test result graphs actually render** (fixed: was using CSS variables that weren't resolving)
- **History graphs draw connecting lines** (fixed: each point now has a unique label)
- **Tremor algorithms unchanged** — scoring is still accurate

## How to run it on your Mac

You need Node.js installed. If you don't have it, get the LTS version from https://nodejs.org.

```bash
cd ~/Downloads/tremor-fixed
npm install
npm run dev
```

Then open Chrome to http://localhost:3000.

**Mac permissions tip:** if you get `EPERM uv_cwd`, move the folder out of Downloads:
```bash
mv ~/Downloads/tremor-fixed ~/tremor-fixed && cd ~/tremor-fixed && npm install
```

## How to deploy to Vercel (so anyone can access it)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → sign in with GitHub
3. Add New → Project → import the repo → Deploy
4. No env vars needed. Done.

## Notes

- Everything lives in browser localStorage. Sign up on one device, account/data only exists on that device.
- Passwords are stored in plain text — fine for class demos, not real security.
- Sign-in is optional. The Tests, Check-In, and History all work for guests too (stored under a "guest" identity).
