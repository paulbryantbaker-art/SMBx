# CD Retool Handoff Spec — what the new design bundle must contain

**Audience: Claude Design (CD).** You are producing the mockups for the 2026-07
retool (new design language; marketing rebuilt ground-up, app re-skinned).
**Claude Code (CC)** implements your bundle into the live React codebase.
CC's implementation playbook is `UI_RETOOL_READINESS.md` — this file is the
contract for what you hand over so implementation starts without a Q&A round.

## 1. Format

- A self-contained folder `design_handoff_<codename>/` committed at the repo
  root (same pattern as previous eras). Static **HTML + CSS** references —
  no build step, no framework. CC recreates them in React; your files are the
  visual source of truth, never shipped as-is.
- **All tokens as CSS custom properties in ONE file** (`tokens.css` or a
  `:root` block every page shares). If a value isn't a token, CC has to guess.
- Screenshots/PNGs are welcome as supplements, not substitutes — CC needs
  inspectable CSS for exact values.

## 2. Token sheet (exhaustive — this is the highest-leverage artifact)

- Background/surface ladder (page → card → inset, light + any dark sections)
- Ink ladder (primary/secondary/muted text on both light and dark)
- Brand accent (+ strong/soft/on-accent variants)
- Semantic status colors (good / warn / danger + soft backgrounds)
- **Verdict trio (pursue / watch / pass)** — MUST stay visually distinct from
  the brand accent (the standing "two-greens law": verdict pills never adopt
  the brand color)
- Borders/hairlines, radii scale, shadow scale, spacing rhythm
- Type: families + weights + sizes for display/heading/body/label, and the
  **number treatment** (mono or not? tabular figures?) — numbers are half this
  product's UI
- Motion: durations + easing for the few animations that matter

## 3. Minimum mock set

**Marketing (ground-up rebuild):**
- Home (hero + one content section + footer)
- Pricing — the five locked tiers ONLY: Free / $99 / $249 / $749 / $3,000+
- One journey page (Buy or Sell) as the template for the rest

**App desktop (re-skin target):**
- Today, Deals list, Cockpit (single deal), Settings/Billing
- The chat surface — **decide the posture** (right rail vs floating FAB window)

**App mobile:**
- Today, Cockpit, and the Yulia chat surface (sheet/FAB)

**Component sheet (one page is fine):**
- Buttons/pills/cards/inputs/tabs; the **staged-approval card**
  (approve/decline — the LINE-critical control); paywall/upgrade card;
  loading / empty / error states.

CC extrapolates every screen you don't mock from the kit — more is welcome,
this is the floor.

## 4. Decisions the bundle must answer explicitly

State these in a README in the bundle (a sentence each is enough):
1. **Chat posture:** desktop rail or FAB window? mobile sheet?
2. **Dark mode:** in or out for this era?
3. **Exports/emails:** do PDFs + emails rebrand to the new language, or stay
   conservative? (They currently speak an old terra/cream era.)
4. **Final font list** (keep it small — it's loaded on every page).

## 5. Constraints (product law — mockups must respect these)

- **Pricing:** only the five locked numbers above; nothing per-deal,
  success-based, or deal-value-linked. No invented plan names or prices.
- **CTAs route to chat:** "Talk to Yulia" posture. No "Contact Sales", no
  forms, no dead-end CTAs.
- **No decorative eyebrows/micro-text** (tiny uppercase kickers, status
  sublines). Structural labels only.
- **Software-not-broker positioning** in all marketing copy; artifact mocks
  show a disclosure/disclaimer block where documents appear.
- **Honest data:** placeholder content is fine but must read as placeholder —
  no fabricated "live" metrics styled as real (no fake $48M pipelines).
- **Copy source:** `CLAUDE_DESIGN_COPY.md` is still valid; reuse it unless
  you're deliberately revising copy.

## 6. What you do NOT need to do

React, data wiring, responsiveness on every page (one desktop + one mobile
reference per surface is enough), accessibility annotations, or every screen.
That's CC's job.

## 7. Handoff

Commit the folder to the repo root (or send the zip into a CC session). Then
start the implementation session with:

> "The bundle landed at `design_handoff_<codename>/` — run Phase 1 of
> `UI_RETOOL_READINESS.md`."

Phase 1 (token swap) re-skins most of the app in one contained, reversible
step; marketing rebuild follows page by page.
