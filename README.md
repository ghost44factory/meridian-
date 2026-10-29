# Meridian

AI-native freight intelligence — demurrage & detention recovery for freight forwarders,
NVOCCs and importers. Every container tracked. Every overcharge contested.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind v4) — deployed on Vercel
- **Supabase** (Postgres + RLS, Auth, Storage) — project `guuoggtdzshtqpdcnsad`, eu-west-2 (London)
- **Claude API** — document extraction + dispute drafting (`src/app/api/extract`)
- **Deterministic audit rules engine** — `src/lib/audit-engine.ts` (all date/rate arithmetic in code, never LLM)
- Three.js / react-three-fiber — animated 3D port homepage

## Apps

- `/` — marketing site (3D scroll journey, ROI calculator, free-audit CTA)
- `/map` — public live-tracking demo (sample data)
- `/app/*` — customer dashboard (auth required): overview, shipments, invoices + audit,
  dispute pipeline, document vault + upload, review queue, live map, settings
- `/admin` — staff-only cross-customer ops console (managed-tier workbench)

## Local dev

```bash
npm install
npm run dev
```

Env vars in `.env.local` (Supabase URL + publishable key are safe for the client;
`ANTHROPIC_API_KEY` is server-side only).

Demo login: `demo@meridian.app` / `MeridianDemo2026!`

## Database

Schema is managed via Supabase migrations (`meridian_core_schema`, `staff_admin_access`).
Tables: orgs, profiles, shipments, contracts, documents, invoices, disputes, alerts —
all with org-scoped RLS; staff flag grants cross-org read for the admin console.
