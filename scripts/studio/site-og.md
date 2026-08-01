<!--cover
byline: Paul Baker
role: smbX.ai · Buy-side corporate development
image: founder-walking.webp
imagePos: 50% 30%
-->

# Buy-side corporate development for the lower middle market

---

Source for the SITE-WIDE link preview card (2026-08-01).

Every public page except the research reports had no `og:image` at all, so a
posted smbx.ai link previewed as bare text — on the one channel the practice
actually markets through. This file is the card's copy, rendered by the SAME
builder the report cards use, so the site preview and a report preview are
visibly one family.

Build it with:

    npx tsx scripts/studio/build-og-card.mts scripts/studio/site-og.md \
      --slug site --out client/public --kicker "Buy-side only"

Output: `client/public/site-cover.jpg`, referenced as the default `og:image`
in `client/index.html`. Report pages override it per-report from
`shared/reports.ts`.

Everything below the `---` is ignored by the builder — only the cover block
and the `#` title above it are read.
