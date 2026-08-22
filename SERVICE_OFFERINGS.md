# smbX service offerings — the three lines

**DRAFT for Paul's approval, 2026-08-22.** Not law yet. When approved, the
"Product naming" section of `CLAUDE.md` points here and this file becomes the
canonical offering definition; `THE_LINE_POLICY.md` takes the amendment in §5.

---

## 0. What was asked for

Paul, 2026-08-22, verbatim (the message truncated mid-sentence — noted so the
record is honest about what is his and what is filled in):

> I want to offer customers:
> - Corporate Development Coaching for brand that have a team but could use assistance and support
> - Corporate Development staffing - a variety of roles that suport _
>
> 1. CD project manager

Then: *"etc"* — carry the list.

**So: two new lines, and one named role.** Everything below marked 🟡 is
proposed and needs your yes/no. Everything marked ⚪ is existing law, unchanged.

---

## 1. The three lines

The practice sells one thing — a corporate development function — in three
delivery modes. The difference between them is *who holds the seat*.

| Line | We… | For a buyer who… | Paid |
|---|---|---|---|
| 🟡 **smbx Dev** | run the deal, through close | has no corp-dev function, or no capacity | Retainer + success fee |
| 🟡 **smbx Coach** | make your team better at running it | has a team that needs a sharper method | Retainer only |
| 🟡 **smbx Crew** | fill the seats on your team | has the mandate and is short a body | Per seat, per month |

🟡 **smbx Dev Pro** (with PMI) is the renamed Premium tier. ⚪ **smbXDefinitive**
(the method) is what all three lines run on — that is the through-line in the
pitch: *same method, three ways to get it.*

### ✅ Naming — DECIDED (Paul, 2026-08-22)

> smbx Dev (and Dev Pro) · smbx Coach · smbx Crew

**This retires `smbXCorpDev` and `smbXCorpDev Premium`.** The new set follows
Carta's own product convention — mark plus a plain word, the way *Carta Law* and
*Carta Fund ERP* work — which is consistent with the design direction.

Two consequences, neither of them free:

**The flagship rename costs a brochure rebuild.** `smbXCorpDev` is the name
inside `content/collateral/smbx-corpdev-pricing.pdf`, a rendered binary with no
source markdown in the repo that `POST /api/practice/pricing` mails to every lead
who asks. The name is also in the engagement letter. This is the §3 trap, now
triggered by the rename rather than by adding lines — and it fires whether or not
the two new lines ever ship.

**`smbXDefinitive` is now inconsistent** with the set. Either it becomes
**smbx Definitive** or it stays as the one camel-case name because it's the
method rather than a product. 🟡 Your call — I'd move it, since it appears
alongside the three lines in exactly the places the inconsistency shows.

## 2. 🟡 smbx Crew — the role ladder

You named the CD Project Manager. Here is the full ladder, and it isn't a list —
**it's the seats along the engagement track the site already publishes.** Every
phase of B0→B5 + PMI has exactly one seat, which is why this reads as designed
rather than assembled.

| # | Seat | Owns | Track phase |
|---|---|---|---|
| 1 | **CD Project Manager** *(yours)* | The calendar, the workstream owners, the close checklist. The spine of the deal. | B3–B5 |
| 2 | **CD Analyst** | The numbers — valuation, LBO, the model build, QoE support | B2 |
| 3 | **Diligence Manager** | The DDQ, the data room, the issues log, coordinating the licensed specialists | B3 |
| 4 | **Sourcing Associate** | The target list, the outreach cadence, owner conversations, pipeline hygiene | B1 |
| 5 | **Integration Manager** | Day 0 → 100 days: the plan, the workstreams, synergy tracking | PMI0–PMI3 |
| 6 | **Interim Head of Corp Dev** | The senior seat — thesis, IC/board reporting, leading the negotiation | B0 + whole track |

Seats 1–5 are individual contributors and are the volume business. Seat 6 is a
different sale (fractional executive, longer term, higher rate) — worth keeping
on the ladder because it's the one an acquirer between hires actually needs.

**Add or cut freely.** The one I'd resist adding is anything named "counsel",
"tax" or "appraisal" — THE LINE says we coordinate those specialists, we don't
seat them.

### 🔴 The question this line raises, and it is the big one

**smbX has one employee.** `THE_LINE_POLICY.md` says so, and staffing sells
labour the practice does not currently have. Three honest ways to have it:

- **(a) Paul takes one seat.** Real revenue immediately, but it consumes the
  person who runs the mandates. One seat at a time, max.
- **(b) A vetted contractor bench.** Scales, but it makes smbX a firm that
  carries people — and `CLAUDE.md` rule 2 says *"a partner is the only growth
  path… not customers."* A contractor bench is a third category that rule
  doesn't contemplate. **This is an amendment to rule 2, not an application of
  it,** and it should be made deliberately.
- **(c) 🟡 AI-augmented seats.** One person plus DEFINITIVE covering what a
  client would otherwise hire two or three people for. This is the practice's
  own thesis pointed at staffing, it's the only version that's differentiated
  rather than a commodity staffing agency, and it's the one that prices on
  *output* instead of *headcount*.

**I'd build (c), open with (a).** But this is your call and nothing below
depends on it.

---

## 3. 🟡 How each line gets paid

smbx Dev's economics are unchanged: **$15,000/quarter up front + the banded success
fee, every retainer dollar credited at close.** No figure from it reaches the
site. Nothing here touches that.

**smbx Coach — quarterly retainer, no success fee.**
Same unit as the mandate, and the unit is the deliberate part: a quarter commits
where a month lets them leave after thirty days. Priced meaningfully below the
mandate rate or it cannibalises — a buyer who'd pay $15K/quarter for coaching
pays it for the mandate instead.

**smbx Crew — per seat, per month, minimum one quarter.**
The seat is smbX's person, not the client's hire. Two clauses that have to be in
the contract from day one:
- **Convert-to-hire fee.** If the client wants to hire the person, that's a
  priced event — otherwise smbX is a free recruiter.
- **No success fee, ever, on a Crew or Coach engagement.** See §4.

**Figures are yours to set.** I've deliberately not invented any, and none of
this reaches the public site — same as the mandate schedule.

### ⚠️ The brochure trap, which applies here in full

`content/collateral/smbx-corpdev-pricing.pdf` is a rendered binary with no text
layer and no source markdown in the repo, and `POST /api/practice/pricing` mails
it to every lead who asks. **Adding two lines to the schedule is not a code
change — it is a studio rebuild dropped back at that exact filename,** plus the
engagement letter. Until that happens, the app and the customer-facing schedule
disagree. This is the same trap `CLAUDE.md` documents at the 2026-08-17 cadence
change; it cost a round trip then.

---

## 4. THE LINE — what these two lines do to the perimeter

**The good news is structural: neither new line takes transaction-contingent
compensation.** Coaching and staffing are fee-for-service — you're selling
instruction and labour, not effecting transactions for a fee. That sits *further
inside* the perimeter than the existing success fee does, not closer to it. The
§15(b)(13) / state-registration question that's pending on the mandate does not
newly arise here.

**But three things do, and they're new:**

**4.1 — One buyer per target has to cover coaching and staffing too.**
Today the rule and the `ENGAGED_LANES` register are aimed at mandates. If we
coach Acquirer A on hunting HVAC in Phoenix while running a smbx Dev mandate
for Acquirer B in the same lane, that's the same conflict the perimeter
forbids — *even though no fee touches either deal.* The register has to include
Coach and Crew engagements, or the honest "this lane is open" close stops being
honest.

**4.2 — A seated person is still smbX.**
An embedded CD PM negotiating with a seller is the practitioner-runs-the-deal
boundary, and it is fine — *while the client is the acquirer.* It is fatal the
day a Crew client asks that seat to work a sell-side or two-sided mandate. The
Bench contract needs the same buy-side-only clause the engagement letter carries,
and the seat needs to know it can say no.

**4.3 — Never mix the two compensation shapes.**
If a Crew client closes a deal the seat worked on, smbX bills the seat, not the
outcome. A success fee on a staffing engagement re-creates exactly the structure
the perimeter exists to prevent — contingent money out of a transaction —
*without* the buy-side mandate that makes it defensible. This is the single
easiest way to undo the whole perimeter, and it will be proposed by a client at
some point because it sounds generous.

**4.4 — Coaching is still not licensed advice.**
A coach who says "structure it as an F-reorg" is giving tax advice. Same rule,
same words: coordinate the specialist.

### 🔴 For counsel — add to the pending call, don't book a new one

The one-time §15(b)(13) / state-registration confirmation is already pending.
These ride along on the same call for very little extra:
1. Confirm coaching and staffing, as fee-for-service with no transaction
   contingency, sit outside the broker-registration analysis entirely.
2. **Co-employment and worker classification** on Crew — the standard staffing
   clauses (no transfer of direction-and-control, conversion fee, W-2 vs 1099).
3. Whether the buy-side-only clause papers cleanly into a staffing contract, where
   the client directs the day-to-day work.

Item 2 is the only genuinely new legal surface in this update. It's ordinary
staffing-contract law, not securities law, and it's cheap — but it is real, and
it should not be improvised.

---

## 5. What has to change if this ships

Nothing here is built yet. In rough dependency order:

| # | Change | Where |
|---|---|---|
| 1 | Offering fork — the site presents one shape today (seven phases, one brochure gate) | `client/src/practice/Landing.tsx` `#how`, `#pricing` |
| 2 | Two new pages, or two new segments | `client/src/practice/` |
| 3 | Engagement `kind` — coaching/staffing rows must not inherit the success-fee arithmetic | migration + `house/engagement.ts` |
| 4 | `ENGAGED_LANES` covers Coach + Crew engagements (§4.1) | `server/`, env |
| 5 | The intake assumes the visitor wants a market map; a coaching or staffing lead is a different conversation | `services/practiceIntake.ts` |
| 6 | Brochure + engagement letter rebuilt (§3 trap) | studio, on the Mac |

**None of it is hard. #3 and #4 are the two that fail silently if skipped** —
a coaching engagement quietly carrying a success-fee calculation, and a lane
conflict the register can't see.

---

## 6. 🟡 Open decisions — answer by number

1. ~~**Names.**~~ ✅ Answered — smbx Dev / Dev Pro / Coach / Crew. Remaining
   sub-question: does **smbXDefinitive** become **smbx Definitive** too?
2. **The ladder.** Six seats as listed — cut any, add any?
3. **Who fills the seats** — (a) Paul, (b) contractor bench, (c) AI-augmented?
   (b) amends `CLAUDE.md` rule 2 and should be decided knowingly.
4. **Figures** for Coach (per quarter) and Crew (per seat, per month).
5. **Is coaching capped?** "A team that needs support" ranges from a monthly
   review to a second full-time brain. Where does Coach end and a mandate begin?
6. **Do we do permanent placement at all** — find-and-place for a one-time fee?
   It's a recruiting business, different muscle, and I'd say no. But it's the
   thing clients will ask for.

Answer 2–3 and I can write the site copy, the page structure and the brochure
spec. Answer 4 and the engagement arithmetic follows in an afternoon.
