# The eight deal skills — provenance and consumption record

Installed 2026-08-17 from the `additional-skills/` staging pack (built the same
day from four downloaded skill sets, distilled to eight SMB-calibrated skills;
the pack was removed after full consumption — this file is what survives it).

| Skill | Job | Descends from |
|---|---|---|
| `smbx-cim-teardown` | Broker package → analytical brief | PE: cim-teardown · CIM: growth-narrative-validation |
| `smbx-add-back-scrutiny` | STAR test, verified-flag gate, clean earnings | CIM: ebitda-add-back-scrutiny · PE: teardown step 4 |
| `smbx-concentration-forensics` | Pyramid, cohort test, walk-away sim | CIM: customer-concentration-forensics |
| `smbx-dependency-transfer-risk` | Owner/bus-factor + license/contract transfer triage | CIM: key-person-dependency-map + change-of-control-contract-review |
| `smbx-diligence-plan` | SMB-scaled workplan, DDQ, issues log | PE: diligence-architecture |
| `smbx-deal-scenarios` | Bear/base/bull through the engine, DSCR, bid ceiling | PE: financial-scenario-modelling |
| `smbx-ic-deal-memo` | Answer-first decision memo, risk register, 3 pressure questions | PE: ic-memo-drafting · CIM: ic-diligence-memo |
| `smbx-value-creation-plan` | 100-day plan, lever bridge, KPI dashboard | PE: portfolio-value-creation |

Source sets: `claude-skills-investment-banking-deal-engine-skills` (21 —
discarded, superseded), `private-equity-claude-skill-set-skills` (8 — the stage
playbooks), `past-cim-claude-due-diligence-skills-private-skills` (6 — the
forensic tests), `claude-skills-build-boardroom-strategy-decks-skills` (25 —
discarded as skills; three narrative rules harvested).

## What else the pack carried, and where it went (2026-08-17)

- **Drift review** (the pack's step 1, initially skipped): V17 league citation →
  V19; the non-existent `compare` engine run removed from `smbx-deal-scenarios`
  (cases compare by running one `deal.mts` spec each); bear/base/bull vs the
  Scenario Panel's conservative/base/stretch distinguished; `deal.json` and
  `master@commit` annotated as designed-not-built per `house/where.ts`.
- **STUDIO_ADDENDUM.md** → repo law files (`content/studio/RESEARCH.md` sizing
  cross-checks, `PLAYBOOK.md` screening additions + why-now law, `FORMATS.md` §7
  three structure tests), pushed to the workspace via `init-workspace --update`.
- **YULIA_MINING_BRIEF.md** → `methodology/METHODOLOGY_V19.md` §5.1 (STAR +
  evidence grading — method doc first), `server/prompts/YULIA_PROMPTS_V4.md`
  invariants 7–8, both master prompts' hard rails, and gates S1 (STAR pass +
  four-check exit readiness), S3 (equity story + three questions), B3 (three
  questions before signing). The brief targeted V2/V17; the live structure was
  V4/V19 + `masterPrompt.ts` + `gatePrompts.ts`.

## The second-opinion harvest (2026-08-17, later the same day)

Paul: *"i wanted you to check to see what could be beneficial to our current
skills or methodology."* The distillation kept 8 of 60 and its discard
decisions had never been independently reviewed, so a 27-agent workflow read
all 60 source skills again — 253 atoms extracted → 3 gap lenses (deal-side,
studio/narrative, Yulia/product) against the CURRENT repo → every nominee
adversarially verified on five grounds (already present · THE LINE · scale
mismatch · engine rule · teeth). **20 nominated, 15 harvested, 5 refuted with
file:line evidence.** The refutations are the distillation vindicated at the
edges; the harvests are where it was beaten in the middle — mostly the two
unmapped PE skills (`commercial-analysis`, `deal-screening`) and
`financial-scenario-modelling`, which carried real SMB-translatable mechanism.

**Deal skills (6):** `ruin-vs-return-read` (bear case classified bad-deal vs
called-PG, with survival runway) → deal-scenarios step 3 + ic-deal-memo step 4;
`sources-and-uses-check` (itemized fees open every structure run; exposed the
`sbaFinancing` fee gap) → deal-scenarios step 2; `fixed-cost-bear-floor` (bear
EBITDA from the fixed/variable split, never a margin haircut) → deal-scenarios
step 1; `growth-capacity-governor` (crews × revenue-per-crew, churn-net
contract math) → cim-teardown step 6; `non-delivery-register` (what the seller
stalls on is evidence) → diligence-plan steps 2–3; `teaser-triage-gate` (the
90-second screen, previously a label with no method) → METHODOLOGY_V19 §4.4.

**Studio law files (5), pushed to the workspace via `--update`:**
`skeleton-before-content` → FORMATS §7 + §0 pointer; `so-what-filter` →
PLAYBOOK preamble; `reader-ledger-triage` → PLAYBOOK §5 preamble;
`price-volume-attribution` → RESEARCH Pass 1b fourth rule;
`comparison-evidence-classing` → RESEARCH Pass 3; plus the adjacency-is-
optionality corollary on the substitution test.

**Yulia prompts (4):** walk-away baseline + sacrifice rule + fragility flag on
the golden pattern's OPTIONS beat, and name-the-decision-first, both in
`masterPrompt.ts` (mirrored into MSP's methodology rules); credit-committee
scrutiny prep at B4; buy-box hard-stops that GATE plus the four-outcome
verdict at B1, both in `gatePrompts.ts`.

**Engine (Paul: "What about model - 3 statements, sensitivity, etc?"):**
audited against `house/`, `deal.mts` and the V19 runtime's 98 models —
sensitivity, scenarios, DCF, LBO all covered; comps deliberately league bands;
the ONE gap was the integrated lender projection. `house/projections.ts`
(monthly year-1 + annual 5-year, real `amortize()` schedules, seller-note
standby, two coverage bases, refuses on missing drivers, TTM-basis ΔWC so the
monthly/annual tie holds for any seasonality) + `sensitivityBreakpoints()` +
`transactionFees` on `sbaFinancing` in BOTH engines (parity contract), all
wired into `deal.mts` (`projections:` block, `threshold:` on sensitivity,
`transactionFees:` on sba). `npm run test:projections` — 55 cases, one
WHY-THIS-EXISTS (the seasonal tie) and one WRONG-FIRST (a 10-year loan is
~63% outstanding at month 60, not half).

**Refuted (already present in sharper house form):** pre-registered walk-away
criteria (gatePrompts B3 #4), multiple-provenance screen (the league system,
`house/valuation.ts leagueFor()`), make-or-break flag (PLAYBOOK thesis §
"What has to be true" + §5c), hidden-approver roster (`smbx-dependency-
transfer-risk` transfer triage), make-or-break-tested-first (distributed across
PLAYBOOK + deal-scenarios step 6). The `smbx-deal-skills.zip` in Downloads was
byte-identical to this pack and carried nothing new.
