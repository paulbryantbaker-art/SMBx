# smbXCorpDev — video post

**Post this one:** `SMBX-corpdev-offering-16x9.mp4` · **1920×1080** · 60 fps · 29.2 s · no audio

## Which dimensions — settled by measurement, not by spec guides

I got this wrong twice by trusting published LinkedIn guidance. Measured off your own screenshots instead:

**LinkedIn renders feed video inside a 16:9 stage, on both surfaces.** Anything else is pillarboxed.

| surface | player stage | your 1:1 file was shown at |
|---|---|---|
| desktop feed | 617 × 347 → **1.778 (16:9)** | 349 × 347, black bars either side |
| mobile immersive | 921 × 518 → **1.778 (16:9)** | 517 × 517, black bars either side |

Both match a 16:9 stage to within a pixel, from two independent screenshots. The container did **not** resize to fit the video — which is what tells you it is fixed, not adaptive. The widely repeated "4:5 gets you more feed real estate" advice describes LinkedIn's *vertical video surface*, not a normal post from a personal profile.

So the ratio that fills the frame is the one that matches the stage:

| ratio | desktop | mobile | verdict |
|---|---|---|---|
| **16:9 · 1920×1080** | **fills** | **fills** | **post this** |
| 1:1 · 1080×1080 | pillarboxed | pillarboxed | — |
| 4:5 · 1080×1350 | pillarboxed hardest | pillarboxed | — |

**Nothing needs re-rendering** — the 16:9 master has existed since the first build. It also reads better at the sizes LinkedIn actually displays, because filling the stage means the type is scaled up rather than shrunk to fit:

| | word size shown | pill size shown |
|---|---|---|
| 16:9 on mobile | 40 px | 12 px |
| 1:1 on mobile | 28 px | 8.6 px |
| 4:5 on mobile | 24 px | 7.3 px |

The file now carries an explicit `display_aspect_ratio 16:9` so no player has to guess.

---

## Caption

Buying a business is hard work. We make it easier.

Most buyers in the lower middle market have three options for getting a deal done.

• A standing corp-dev team — $500,000 to $1,500,000 a year all-in, attached to an activity that only happens occasionally, and idle in between.
• An advisory firm — real capacity, brought to several clients at once.
• Doing it yourself — no fees, and no bandwidth, against someone who does this every week.

smbX is a fourth: a corporate development function you engage for the deal.

→ smbXCorpDev runs it end to end. Then it scales to zero.

→ smbXCorpDev Premium carries the same team past signing into the first hundred days. A deal is not finished when it closes. It is finished when the thing you underwrote is actually running.

One buyer per target. Never the sell side. Never two-sided. It is in the engagement letter.

About 150 acquisitions behind it, and zero sell-side transactions. Ever.

If you are buying in the lower middle market this year — are you resourcing it with a team, a firm, or your own evenings? Curious what people are actually doing. 👇

Book a call — smbx.ai

\#MergersAndAcquisitions #CorporateDevelopment #PrivateEquity #LowerMiddleMarket

---

## Provenance — what changed from the approved caption, and what did not

This is `specs/smbx-corpdev-offering.deck.mts` §CAPTION, cut for a video post. **No sentence was written for this. No figure was introduced.** Two edits only:

| edit | why |
|---|---|
| **Cut** "Two ways to work with smbX, and one idea underneath both of them." | The video is now that sentence — six stations closing into a ring, then the two engagements. Saying it in the caption as well is the post explaining its own video. |
| **Cut** from the smbXCorpDev line: "Thesis, market sized from primary sources, off-market outreach, diligence, negotiation, close." | The video names those five stages out loud. Both surviving clauses — "runs it end to end" and "Then it scales to zero" — are verbatim from the same approved line. |
| **Added** "Book a call — smbx.ai" | Verbatim from the same spec's `closer.action`. The carousel had the CTA on its last page; a video post has no last page, so it moves into the caption. |

### Figures, and one I deliberately left out

Every figure here is already in the approved caption: **$500,000 to $1,500,000 a year all-in** (PRACTICE_RECORD.md §What a standing corp-dev function costs, Paul 2026-08-06, published as a range), **about 150 acquisitions**, **zero sell-side transactions. Ever.**

**`$5B+ enterprise value added` is NOT in this caption, on purpose.** It sits in the spec's cover figures, not its caption, and it is the one figure in this deck with a correction history — it shipped as "revenue" and was corrected to "enterprise value added" on 2026-08-06. Adding it here would be me introducing a figure into copy rather than carrying one across, and I could not re-verify it (see below). If you want it in, it belongs beside the other two: *"About 150 acquisitions behind it, $5B+ of enterprise value added, and zero sell-side transactions. Ever."*

### ⚠ What has NOT been re-verified

I could not run `verify-spec.mts ... --against PRACTICE_RECORD.md` for this post. The record lives on your machine and file staging failed — the Claude desktop app's sign-in has gone stale (`untrusted_device`), and there is a sign-in banner waiting for you there.

What that does and does not mean: every claim above is carried verbatim out of a caption that **was** verified when the deck shipped, so nothing new is being asserted. But *carried from a verified source* is not the same as *verified today*, and by the preflight's own rule a check that did not run is not a check that passed. **Before this posts, sign in again and run:**

```
npx tsx $REPO/scripts/studio/preflight.mts <market> --spec specs/smbx-corpdev-offering.deck.mts
```

---

## Posting notes

- **It plays muted.** LinkedIn autoplays video with sound off, so the piece was built to work silently — it is all type and figure, no voiceover, nothing load-bearing in the audio. The score is a reward for anyone who unmutes, not a requirement.
- **First two lines are the hook.** LinkedIn truncates at roughly 200 characters behind "…see more". "Buying a business is hard work. We make it easier." and the three-options line both clear that.
- **No link in the body.** "Book a call — smbx.ai" is plain text, not a hyperlink, so the post is not down-ranked for taking people off-platform. Put the live link in the first comment if you want it clickable.
- **Post the 16:9.** It is the only ratio that fills LinkedIn's player instead of being boxed inside it — see the measurements at the top. The 1:1 and 4:5 cuts stay in the folder for surfaces that genuinely want them (Instagram, a vertical push), but not for this.
