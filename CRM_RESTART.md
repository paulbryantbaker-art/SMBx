# CRM RESTART (2026-08-16 night)

Paul, after a day of live use: *"i cant tell where anything actually is and i
think everything is jumbled together with outreach and marketing ... so for
everything that is not deal management - IoI through integration (Definitive
and the LIne) - i want to blow up the CRM and Campaign management so we can
start over."*

## What the app IS now

**Deal management, IoI through Integration.** Three tabs: **Today · Deals ·
Agent.** Inside Deals: the list/board/table, the deal detail (specialists
tasks, key dates, valuation, capital, scenarios, the DEFINITIVE gate stack),
the cockpit, the data room, integration. THE LINE governs all of it. This is
the half that worked and it is untouched.

## What was retired (chrome only — `CRM_SURFACES_IN_APP` in appSurfaces.ts)

Clients (List / Board / Outreach), Targets, People, Companies, Posting,
Reports. Every route, table, migration and test SURVIVES: the reset endpoint,
the stage discipline, the engagement object, the promotion ceremony, the
post_queue, the campaign seed. The deal side still reads CRM data where deal
management needs it (client chips on deals, the specialists address book).
Flip the flag and the old surfaces return intact for reference.

## Why it failed — honest, for the restart to learn from

1. **Two vocabularies collided.** The seeded outreach plan's world (Tier A/B,
   DFW, Flow-constrained, buy signals, waves) rendered next to the new spec's
   world (Lead → Won, aging, loss reasons). Both were internally coherent;
   together they read as jumble. The restart must pick ONE vocabulary — the
   one from Paul's actual mouth — and seed NOTHING by default.
2. **Surface count outran the workflow.** Nine tabs for a practice whose CRM
   motion is currently: run a Claude search → connect on LinkedIn → track who
   said what. The restart should ship the smallest surface that carries that
   motion and grow only when the volume demands it.
3. **The LinkedIn paste-parser lost three rounds against live pages** —
   "Actions List", the Sales Nav toasts, "I'm looking for..." each filed UI
   chrome as a person before its pattern was blocklisted. VERDICT for the
   restart: heuristic full-page parsing is a losing arms race against a UI
   that changes weekly. The add-a-person motion should be a FAST MANUAL FORM
   first (two required fields: person, firm — five seconds), with parsing at
   most as an optional assist that only ever fills EMPTY fields and only from
   high-confidence signals (the browser-tab title, a linkedin.com/in URL).
   `house/linkedin.ts` (54 cases) stays for that narrow job.

## What today built that the restart should KEEP (all still in the tree)

- The stage-discipline mechanics: aging from stage_entered_at, the
  no-next-step red dot, loss reasons required on a dead pursuit.
- The engagement object (migration 129) and the fee schedule as law.
- Deals-created-at-the-IoI with the frozen-target receipt (routes/targets.ts)
  — the ceremony is right even if the Targets board around it wasn't.
- The one-touch-one-press-one-human outreach machine (unwired, not unwound).
- The post_queue ownership law (markdown owns content, table owns state) and
  the Aug 17 campaign seed — the campaign itself runs from Cowork meanwhile.
- `POST /api/crm/reset` — the clean-slate button, now headless.

## How the restart should start

Not with code. With Paul narrating the actual loop once — "I found a firm,
I connected, they replied, now what do I write down and where" — and a
one-page screen spec derived from THAT, built as ONE tab until it earns a
second. The spec conversation is the next session's first job, when he's
ready.
