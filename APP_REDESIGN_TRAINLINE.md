# THE APP REDESIGN — Trainline structure, Carta skin

**Status:** PLAN. Nothing below is built yet.
**Date:** 2026-08-15
**Supersedes:** the app's Atlas layout language. `ATLAS_BUILD_CONTRACT.md` and
`MOBILE_REDESIGN.md` become history the moment Phase 1 lands.

> Paul, 2026-08-15, with four thetrainline.com screenshots and one of the Neo
> browser: *"Let's plan the redesign around this and drop atlas / and the huge
> chat bar can go.. all i need is the sidebar chat in the tool pages. like the
> last image."*

---

## 0. What we are taking, and what we are not

Trainline is a consumer booking funnel and we are an internal deal tool. The
funnel is not the point. **What is worth stealing is its RESULT-SCANNING
GRAMMAR** — the way it lets you understand a field of options, and the
trade-offs between them, without opening any of them.

That grammar is the thing the app has never had. Atlas presents *records*: here
is a table, here are your rows, click one. Trainline presents *a decision*: here
are your options, here is the number that separates them, here is the one we'd
pick and why, and here is what you cannot have. Those are different products,
and the second is what a corp-dev practitioner actually needs at a board.

**Not taking:** the marketing home page (screenshot 2), the illustration
language, the mega-menu (screenshot 4), any of their colour. The skin stays
**CARTA** — Deal Green `#0A7A58`, ink `#16181A`, radius 0 except buttons and
inputs, one accent. Where this document says "indigo", read "Deal Green".

---

## 1. The eleven patterns

Each is stated as Trainline does it, then as we will.

### P1 · THE CRITERIA BAR
*Them:* one horizontal strip of segmented cells with hairline dividers —
`Sevilla ⇄ Bilbao │ Out Sa 15 Aug · 12:15 │ + Add a return │ 1 adult (26-59) │ 🔍`.
It states what you are looking at, in editable cells, above everything else.

*Us:* the scope of the list. On Deals: `Client ⇄ Stage │ As of │ + Add a filter │
Run for │ 🔍`. It replaces the current bare search box. **The cells are
editable in place** — no settings screen, no modal.

### P2 · THE CHIP ROW, AND CHIPS CARRY NUMBERS
*Them:* `Train · $104.88` │ `Bus` (a segmented pair) then `Direct only`
(boolean) then `Add travel via ▾` `All prices ▾` `Carriers ▾` (dropdowns), then
right-aligned `📅 Other days from $54.79 ▲` (an expander).

**The detail that matters: `Train · $104.88` tells you the cheapest train before
you click it.** The filter previews its own result. A chip that only says "Bus"
makes you click to find out; a chip that says "Bus · $61" lets you not bother.

*Us:* every chip carries its consequence. `All · 34` `Watch · 6` `Due · 4`,
and on the stage chips the aggregate value, not just the count. **This is the
single highest-value pattern in the whole reference** and it costs us nothing —
the counts are already computed for the board.

### P3 · THE COMPARISON STRIP
*Them:* seven neighbouring days, each with `from $X`, active one carrying a 3px
underline. **Two of the seven show a magnifying glass instead of a price** — not
loaded, and it says so rather than showing a blank or a zero.

*Us:* already built once, in `ValuationPanel` — every valuation method for the
chosen deal type, each with its number or the reason there isn't one. Generalise
it into a primitive and use it for pipeline stages on Deals and waves on
Clients. **Keep the "no value" state visible.** A blank cell reads as zero.

### P4 · LIST / DETAIL, BOTH SCROLLING
*Them:* ~58/42. Left is the scannable list, right is the committed choice and
everything about it. The right panel is sticky and nothing is modal.

*Us:* the same split replaces today's row-expansion. Clicking a deal fills the
right panel instead of pushing every row below it down the page — which is what
happens now, and it is why you lose your place. The deal cockpit stays a
separate full tab for deep work; the right panel is the at-a-glance.

### P5 · THE ROW
*Them:* two big facts as the anchor (`1:15 pm → 11:02 pm`), one small line of
consequence beneath (`9h 47m, 1 change` — with the *interesting* part
underlined), identity in the middle (carrier logos), and the deciding numbers
right-aligned in **fixed columns under a header row**.
**Unavailable prints `Not available` in grey. It is never hidden.**

*Us:* business name + ask as the anchor; `sector · location · run for` beneath
with the live part linked; right-aligned columns for the numbers. And the same
law: a deal missing a figure prints why, it does not vanish or print `$0`. The
`Deals.tsx` header already documents this instinct ("a literal 0-cents Ask must
not print `$0 Ask`") — the redesign makes it structural.

### P6 · THE ENDORSEMENT BAND
*Them:* a tinted band with a **notch pointing down at the row it endorses**:
"We recommend this journey based on price and duration." The endorsed row is
then wrapped in a bordered box.

**It is a sentence with grounds, not a badge.** "Recommended" alone would be an
opinion; "based on price and duration" is a claim you can check.

*Us:* the practice's whole doctrine is that a figure travels with its basis, so
this pattern is already our house style rendered as UI. Use it for the next
action due, the fit call, the stalled flag — always with the reason in the band.
**Never ship the band without the grounds clause.**

### P7 · GROUP HEADER AND COLUMN HEADER ARE ONE ROW
*Them:* `📅 Sat, Aug 15, 2026 │ Standard │ 1st Class`. The date groups the rows
below it *and* names the columns, in one line, repeated per group.

*Us:* group by stage or by client; name the money columns in the same row. Saves
a whole row of chrome per group and keeps the column labels next to the numbers
rather than stranded at the top of a long scroll.

### P8 · EXPANDERS AT BOTH ENDS
*Them:* full-width `⌃ Earlier` and `⌄ Later` rows top and bottom. The list
admits it is a window onto something larger.

*Us:* replaces the pager. Better for a board you scan than page numbers.

### P9 · THE HONEST FOOTER
*Them:* "**More about search results** — We show tickets for the fastest
available journeys with the smallest number of changes, highlighting the
cheapest within these results. Some results may be sponsored. Learn more about
our search ranking criteria."

*Us:* **take this one seriously.** Every ranked list in this app applies a
ranking nobody can see — the board order, the fit score, the screen's tiering.
A footer stating the ordering rule is the practice's citation law applied to a
UI, and it is the cheapest honesty win available. Ours has no sponsorship to
disclose, which is itself worth one clause.

### P10 · THE DETAIL PANEL STACK
*Them:* a **dark navy card** carrying the headline number, a yellow `Cheapest`
badge and the one primary action (`Continue to next step →`), then a
**timeline card** (dot · line · dot with times and stations, collapsible), then
`Ticket conditions`, then `Comfort options`. Info banners carry a **left colour
bar** and plain prose ("This journey continues overnight").

*Us:* the same stack. Dark card = the deal's headline (ask, or WACC on the
capital panel) plus the one action. Timeline card = the gate history. Then the
condition cards. **The dark card is Carta's flat near-black `#181818`, not
navy,** and the badge is Deal Green tint, not yellow.

### P11 · THE PRICED CHOICE PAIR
*Them:* `Lowest Price $32.32` │ `Semi-flexible + $3.21` — two cards, the
selected one bordered, **the alternative priced as a DELTA rather than an
absolute.** You read the cost of flexibility, not two prices you have to
subtract.

*Us:* structure options priced as deltas off the base — the earnout vs. the
higher ask, the seller note vs. more equity. This is a genuinely good idea we
do not currently have anywhere.

---

## 2. The chat change

**Today:** `AtlasChatRail` is **340px, pinned LEFT**, inside every app screen.
It is the first thing on the page and it is always the same width whether you
are using it or not.

**Paul:** *"the huge chat bar can go.. all i need is the sidebar chat in the
tool pages. like the last image."*

**The Neo model (screenshot 5)**, which is what he is pointing at:
- a **right-hand sidebar**, page-content on the left taking the majority
- a **context chip** — `1 Context` — stating what the assistant can currently see
- a **`SUGGESTED FOR THIS PAGE` grid**, 2×2, each an icon + a short label
  (*Technical Breakdown · Practical Example · Find Pitfalls · Step-by-step*)
- a **compact composer** at the bottom: `Ask Neo anything`, a `+`, a mic
- a privacy line

**The plan:**
1. Rail moves **left → right**, and narrows 340 → **300px**.
2. It **collapses to a 44px edge tab** and stays collapsed by default. The
   practitioner opens it when they want it. This is the actual answer to "the
   huge chat bar can go" — the problem is not the pixels, it is that it is
   unconditional.
3. Add the **context chip**. We already have the vocabulary for this —
   `client/src/lib/yuliaSurfaceContext.ts` is the agent↔UI surface contract, so
   the chip can name the real surface Yulia is reading rather than a decoration.
4. Add **per-screen suggestions**, four per screen, derived from the surface
   context. On a deal: *Draft the next touch · What's missing for the IoI ·
   Compare to the last three · Explain the WACC*.
5. `ChatDock` (777 lines, "THE chat input — used everywhere") stays the shared
   composer. The rail gets a compact variant, not a second implementation.

**Preserved:** the agent↔UI surface-action vocabulary. `UI_RETOOL_READINESS.md`
names it as a preservation contract and this redesign does not touch it.

---

## 3. Screen by screen

| screen | criteria bar | chips | compare strip | list/detail |
|---|---|---|---|---|
| **Deals** | client ⇄ stage, as-of, run-for | All/Watch/Due **with counts** | the 5 pipeline stages, count + value | deal pane right, sticky |
| **Clients** | tier ⇄ segment, owner | existing CRM filters + counts | outreach waves, touches due | account pane right |
| **Integration** | deal ⇄ phase | PMI0–PMI3 with open-item counts | the four phases | workstream right |
| **Files** | scope ⇄ kind | kind chips with counts | — (no natural axis) | preview right |
| **Today** | — | — | — | unchanged, full-bleed |
| **Agent** | — | — | — | unchanged |

**Deals is the pilot.** It is the densest screen, the one you live in, and it
already has the data every pattern needs — counts, stages, a summary hook. If
the grammar does not work there it will not work anywhere, and we find that out
in one screen rather than six.

---

## 4. Build order

**Phase 0 — the kit.** `client/src/components/v6/desktop/kit/` — `CriteriaBar`,
`ChipRow`, `CompareStrip`, `ListDetail`, `ResultRow`, `GroupHeader`,
`Endorsement`, `RankingNote`, `DetailStack`, `OptionPair`. Carta-tokened,
no screen logic. `CompareStrip` is extracted from `ValuationPanel`, which
already implements it correctly — so the first primitive is a refactor with a
working reference, not a guess.

**Phase 1 — Deals rebuilt on the kit.** The pilot. Ship, look at it, adjust.

**Phase 2 — the chat rail moves right, narrows, collapses, gains context +
suggestions.**

**Phase 3 — Clients, Integration, Files onto the kit.**

**Phase 4 — Atlas comes out.** Delete what Phase 1–3 orphaned; add the entries
to `house/retired.ts` with a proof each, per the register's own law.

Phases 1 and 2 are independent and could land in either order.

---

## 5. Open questions

1. **Do the token identifiers get renamed?** `atlasTokens.ts` exports `T` with
   slots called `blue` that hold Deal Green. Renaming is a large mechanical diff
   with no visual change. **Recommendation: keep the identifiers, retire the
   name in the docs** — precedent is `--pd-coral` holding green across the whole
   practice site since the Office-blue pivot.
2. **Does the Board/Table toggle survive?** The kit's list/detail arguably makes
   the kanban redundant. **Recommendation: keep the board for one release**,
   decide once the table has been rebuilt and can be compared honestly.
3. **Where does the deal cockpit sit** once the right panel carries the
   at-a-glance? Probably unchanged as a full tab, but worth checking after
   Phase 1 that the two do not say the same thing twice.

---

## 6. What this does not change

- **THE LINE.** Every band, chip and footer is subject to it. An endorsement
  band that recommended a counterparty action would be Yulia negotiating.
- **The two-surface rule** in `App.tsx` — logged-out visitors see the practice
  site, and none of this touches it.
- **Zero hallucination.** P5 and P3 both exist to make a missing figure VISIBLE.
  Nothing in this plan may fill a gap with a plausible number.
- **The Safari toolbar rule.** No `position: fixed` full-viewport coloured divs.
  The collapsible rail is `position: absolute` inside a relative parent.
- **`house/` purity.** The kit is presentation. Every judgement it renders comes
  from `house/`.
