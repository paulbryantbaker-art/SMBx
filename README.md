# smbx.ai

AI-powered deal intelligence platform for business acquisitions from $300K to mega-cap. Users talk to **Yulia** (AI deal intelligence) who guides them through buying, selling, or raising capital. Chat-first — Yulia is the front door.

> Production runs on `main`. The build is current as long as **Yulia Prompts V3** + **Methodology V18a (tax)** + **Methodology V18b (legal)** + the **V6 design handoff bundles** are wired in — and they are.

## Read these first (in order)

1. **[`REPO_STATUS.md`](./REPO_STATUS.md)** — what's current, what's stale, how to tell the difference. Start here if you're reviewing the repo from a clone or on GitHub.
2. **[`CLAUDE.md`](./CLAUDE.md)** — project operating instructions. Architecture, critical rules, key file map.
3. **[`YULIA_AGENCY_SPEC.md`](./YULIA_AGENCY_SPEC.md)** — Yulia's agentic operating doctrine: methodology, permissions, app surfaces, data-room boundaries, and legal/tax guardrails.
4. **[`YULIA_AGENCY_IMPLEMENTATION_PLAN.md`](./YULIA_AGENCY_IMPLEMENTATION_PLAN.md)** — how to wire the surfaces, prompt stack, tools, approval gates, and file/data-room model together.
5. **[`DESIGN_SOURCE.md`](./DESIGN_SOURCE.md)** — V6 design handoff → production code map.

## Don't read these

Files in [`docs/_archive/`](./docs/_archive/) describe earlier eras of the platform (V3/V4 design, March 2026 pricing model, pre-V18 methodology). They are retained for history. **Do not build against them.** Each archived markdown carries a banner saying so.

## Stack

React 19 + Vite 7 + Tailwind v3 + Radix UI · Node + Express (ESM) · PostgreSQL (postgres-js, no ORM) · Claude API primary · Stripe monthly subscriptions · Railway deployment.

## Commands

```bash
npm run dev               # Vite dev server (frontend, port 5173)
npx tsx server/index.ts   # Express backend (port 3000)
npm run build             # Production build
```

See `CLAUDE.md` for environment variables, the four user journeys (SELL / BUY / RAISE / PMI), the calculation engine, and the agentic tool inventory.
