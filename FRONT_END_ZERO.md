# FRONT END ZERO — the rethink brief (2026-08-16 night)

Paul: *"let's get rid of all of the logged in chrome in app... and start over
completely. The backend as you just said, stays intact, we just need to
really think through properly how the front end should work."*

The logged-in app is now `ZeroShell` — the mark, an honest sentence,
sign-out. Both old shells (desktop Atlas + atlasmobile, ~36k lines) stand
behind `LOGGED_IN_CHROME` in appSurfaces.ts for reference. **Nothing gets
built against this file until the §2 conversation has happened.**

## 1. What today's live use actually taught (the data for the rethink)

Three rebuilds shipped in 36 hours and Paul could not find or use them. The
failures were not cosmetic:

1. **Structure hid behind toggles.** List/Board/Outreach pills, view
   switches, collapsed detail columns — every capability existed and none
   announced itself. He asked "where do I look?" three times in one day.
   A surface he has to be taught is a failed surface.
2. **Vocabulary he never chose.** Tier A, DFW, Flow-constrained, buy
   signals, waves — seeded from an outreach plan, rendered as if they were
   his words. The next front end uses only words Paul has actually said.
3. **Screens outran the workflow.** Nine tabs for a practice whose current
   motion is: search → connect on LinkedIn → track the conversation →
   (someday) run a deal. The build was ahead of the use at every step.
4. **Clever input lost to typing.** The LinkedIn paste-parser lost three
   rounds to live pages. Fast manual entry beats fragile automation.
5. **What DID work:** the deal detail reading top-to-bottom in work order
   (worth → cost of money → returns → gates); numbers that say why they're
   missing; the Colour-Carta/Shape-Trainline kit itself. Keep the grammar,
   rethink the architecture.

## 2. How the rethink runs (process, not design)

**Step 1 — Paul narrates, nobody designs.** A session (chat or Cowork) where
he walks one real day and one imagined deal end-to-end, in his own words:
what he opens first, what he writes down, what he can never find, what he
would show a partner. Questions worth asking him:
   - When you open the app in the morning, what ONE thing should it tell you?
   - Walk me through yesterday: what did you actually do, in order?
   - When a LinkedIn conversation turns real, what do you want written down —
     and what's the least you'd tolerate typing?
   - When the first deal goes live, what's on the screen you'd keep open all
     day?
   - What belongs in the app versus in Cowork versus in your head?

**Step 2 — one page, his words.** The narration becomes a one-page spec:
the surfaces (fewest possible), each described as the question it answers,
in his vocabulary. He approves the PAGE, not mockups.

**Step 3 — one surface at a time.** Build the first surface, he uses it for
real, it earns the next one. No phase plans, no parallel agents fanning out
nine screens.

## 3. What stands, unconditionally (the constraints)

- **The backend, whole.** Every route, table, migration, test; DEFINITIVE
  (30 gates / 134 slots), house/ (valuation, capital, scenarios, engagement,
  deal math), the reset endpoint, the outreach machine, post_queue, Yulia's
  tools. The new front end is a consumer, not a rewrite.
- **THE LINE and practice law.** Never multi-tenant; third parties
  corresponded with, never onboarded; one touch, one press, one human;
  nothing charges money; zero hallucination — missing renders as missing.
- **THE SPLIT.** Documents are files (Cowork/studio); pipelines are rows
  (app). Doc creation never returns to the app.
- **Colour Carta, Shape Trainline** — the kit and its transcription persist
  as the visual language unless Paul says otherwise.
- **Safari rule**, money in integer cents, the honesty grammar (population
  rule, stated orderings, refuse-don't-default).

## 4. Ledger of retired-but-standing front ends

| what | where | how it returns |
|---|---|---|
| Desktop Atlas shell (kit screens, deal detail, cockpit) | `v6/desktop/` | `LOGGED_IN_CHROME = true` |
| Mobile shell | `v6/atlasmobile/` | same flag |
| CRM/campaign surfaces | same tree | `CRM_SURFACES_IN_APP = true` (with chrome on) |
| Studio/sourcing screens | deleted Phase A | git revert only |

Prior briefs `FRONT_END_REBUILD.md`, `CRM_WORKFLOW_SPEC.md`, `CRM_RESTART.md`
are records now, superseded by this file.
