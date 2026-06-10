# MyTremor — localStorage version

This version of MyTremor uses **localStorage** for accounts and data instead of Supabase, so it works with no backend setup at all. Just deploy and go.

## What changed from the original

- Removed all Supabase code (auth, database, middleware)
- Added `lib/local-auth.ts` — a simple localStorage-based store for users, tests, and surveys
- Replaced the login / signup pages, navigation, history, daily survey, and tremor tests components to use the new store
- Fixed the History "Score Over Time" graph so the line actually draws (each data point now gets a unique X-axis label, so points on the same day don't collapse)
- Tightened up the Rest Test so the timer is independent of mouse movement

## How to run it

### Option A — Deploy on Vercel (no credits needed for hobby deploys)

1. Create a new GitHub repo and push this folder to it.
2. Go to https://vercel.com → "Add New Project" → import your repo.
3. Vercel will detect Next.js automatically. Just click **Deploy**. No env vars required.
4. Your app will be live at `https://your-project-name.vercel.app`.

### Option B — Run locally

You need Node.js 18+ installed.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Notes

- **Accounts are stored in your browser only.** Sign up on one device, and the account/data only exists on that device + browser. Clearing browser data wipes it. This is intentional for a class demo — it means no backend, no env vars, no "fail to fetch."
- **Passwords are stored in plain text in localStorage.** Do NOT use this for anything real. This is fine for a class project but not real security.
- All test results and daily survey data are scoped per-user (per localStorage account).
