# smbX Deal Skills — consolidated pack

**Built 2026-08-17** from four downloaded skill sets, distilled to eight SMB-calibrated
skills for deal-shaped work. Ready for CC review and install into the SMBx repo.

## What this is

Eight skills covering a deal from CIM arrival to post-close value creation, written for
smbX's architecture rather than the institutional-PE world the source material assumed:

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

Source sets: `claude-skills-investment-banking-deal-engine-skills` (21 — discarded,
superseded), `private-equity-claude-skill-set-skills` (8 — the stage playbooks),
`past-cim-claude-due-diligence-skills-private-skills` (6 — the forensic tests),
`claude-skills-build-boardroom-strategy-decks-skills` (25 — discarded as skills; three
narrative rules harvested into `STUDIO_ADDENDUM.md`).

## The three laws baked into every skill

1. **The seam** (2026-08-15): these are deal-shaped, counterparty-confidential tools.
   They run app-side with CC from IoI. Pre-IoI screening stays in the studio.
2. **The engine**: no deal figure is computed in conversation. Skills fill the deal
   profile and interpret engine runs (valuation, sba, lbo, earnout, compare). Every
   output is engine-stamped. League rule: L1–L2 lead SDE, L3–L6 lead Adjusted EBITDA.
   DSCR floor 1.25, strong 1.50.
3. **Evidence**: every figure carries a source. Add-backs enter the math only when
   `verified: true` with evidence — the STAR test is the rubric for that flag. Claims
   are graded Primary / Secondary / Asserted.

## Install (CC, on the Mac)

1. Review each SKILL.md against METHODOLOGY_V17 and the current engine module names —
   adjust any drift (these were written from the workbench/seam project docs of
   2026-08-14/15, not from the repo at today's commit).
2. Copy the eight folders from `skills/` into `SMBx/.claude/skills/` so every CC
   session in the repo loads them. (Repo-level, not `~/.claude/skills/`, so they stay
   versioned with the engine they depend on.)
3. Commit on the Mac. Standard rule: never push from a cloud session.

Names are prefixed `smbx-` so they never collide with generic downloads.

## Also in this pack

- `STUDIO_ADDENDUM.md` — studio-side harvest (sizing cross-checks, screening additions,
  three narrative rules). File into the studio workspace via a studio session with
  smbx-studio preflight; it is NOT a CC/app item.
- `YULIA_MINING_BRIEF.md` — product-side harvest for Yulia's prompts. A CC brief
  against `YULIA_PROMPTS_V2.md` / `METHODOLOGY_V17.md`.
