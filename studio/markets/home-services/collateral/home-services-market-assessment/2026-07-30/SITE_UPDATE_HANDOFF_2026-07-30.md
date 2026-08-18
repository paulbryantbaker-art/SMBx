# Site update handoff — Home Services assessment, 2026-07-30

**For Claude Code working on the smbX site. Read only this. Do not re-derive
anything.**

The research is done, verified and rendered. Nothing needs recalculating, no
figures need checking, no document needs rebuilding. One line of the report
changed and the PDF was re-rendered from it. Your job is to swap a binary and,
if the download is not wired yet, wire it.

---

## 1. What changed, and why

One figure. The 2026-07-28 primary-source verification pass retired a
wage-inflation number, the correction landed in Part VI and in the appendix
ledger, and it never propagated to Part X. The published PDF therefore stated
three different positions on the same variable:

| Where | Said |
|---|---|
| Part VI, §6.3 | "Underwrite wage inflation at 3–4%" |
| Part X, §10.3 | "Assume ≈5–7% annual wage inflation" |
| Appendix A.0.3 | 5–7% has no source; BLS ECI is +4.0% |

Part X is now corrected. All three agree. That is the entire content change.

**Source of truth:** `markets/home-services/documents/market-assessment.md`
line 696, under `## 10.3 Underwriting guardrails`.

Was:

```
2. Assume ≈5–7% annual wage inflation and require matching pricing power.
```

Now:

```
2. Assume **3–4%** annual wage inflation and require matching pricing power. No source publishes the ≈5–7% figure in circulation; BLS ECI for installation, maintenance and repair is **+4.0%** for the twelve months to March 2026, and the OEWS medians run lower still (§6.3).
```

The same correction was applied to `markets/home-services/master.md` line 703.
Both files are in sync.

---

## 2. The artifact to publish

```
markets/home-services/collateral/home-services-market-assessment/2026-07-30/home-services-market-assessment.pdf
```

| | |
|---|---|
| Size | 5,791,163 bytes |
| SHA-256 | `ef9d65edc58332189c88fd604e521b16ce2d421ef090b2646422d1e6f2df041a` |
| Pages | 55 |
| Cover | checked, no overflow — byline and headshot on page 1 |

**The file it replaces** — do not serve this one any more:

```
markets/home-services/collateral/home-services-market-assessment/2026-07-29/home-services-market-assessment.pdf
```

| | |
|---|---|
| Size | 5,801,826 bytes |
| SHA-256 | `aad0ad679f269057a017c53744ad7ac8ce1806a3b37b14200a44488d70c5f40c` |

Keep the 2026-07-29 folder on disk. It is version history, not garbage — the
output law is one dated folder per build and nothing is ever overwritten.

---

## 3. What to actually do on the site

**Finding the serving path is step one, and it is not in this checkout.**
`find` across `SMBx-main` returns no copy of the report PDF, and nothing under
`client/src` or `client/public` references it by name. The matches for
"download" and "assessment" in `client/src/components/v6/**` are product-app
screens — Studio, Files, MarketWorkspace, StudioResearch — not a marketing
download route. So one of these is true, and you need to establish which before
touching anything:

1. **The download is served from the deployed repo, not this one.** The project
   syncs from `paulbryantbaker-art/SMBx`; this local tree is `SMBx-main`. Check
   there first.
2. **The PDF is hosted outside the repo** — object storage or a CDN. Then this
   is an upload, not a commit, and the site needs no code change at all.
3. **The download was never wired.** Then it needs building: put the PDF in the
   public asset path and add the link.

**If it is 1 or 2:** replace the binary, verify the served file's SHA-256
matches the value above, done. No code change, no rebuild, no content edit.

**If it is 3:** the link belongs wherever the site already promotes the
research. Keep the filename `home-services-market-assessment.pdf` — the LinkedIn
collateral drives to it and the slug is fixed by the studio's slug law.

---

## 4. Do not do these

- **Do not regenerate the PDF.** It came out of `build-report.mts` against
  `house/tokens.ts`. Any other renderer produces off-brand output; that has
  happened before and cost a 52-page report.
- **Do not edit figures in the PDF or in site copy to "match".** Every figure in
  the report traces to `markets/home-services/master.md`; the audit passes at
  372 of 372 figures with zero unexplained. Changing one on the site breaks that
  chain silently.
- **Do not re-run the research.** The verification pass is complete and recorded
  in the report's own appendix at A.0.1 through A.0.3.
- **Do not change the cover date without asking Paul.** It currently reads
  *Published 29 July 2026*. Whether a corrected document keeps its original date
  or takes today's is his call and it is genuinely arguable both ways.

---

## 5. Checks worth running after

- Fetch the served PDF and confirm SHA-256 `ef9d65e…f041a`.
- Confirm the served copy has 55 pages and page 1 shows the byline and headshot.
- Search the site's own copy for `5–7%` and for `5-7%`. If a marketing page
  quotes the old wage figure, it needs the same correction — I found none in
  `client/src`, but this checkout may not be what is deployed.

---

*Prepared 2026-07-30. Report source, master and rendered PDF are all in sync as
of this note. Questions about the figures go to the appendix, not to a re-run.*
