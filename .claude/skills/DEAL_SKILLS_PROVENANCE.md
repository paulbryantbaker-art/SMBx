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
