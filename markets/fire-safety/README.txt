A MARKET — everything you know about one lane, and everything built from it.

Organised by category. Every market folder has these nine things, always in
this order, so you never have to hunt:

research/    RESEARCH — the reads you gathered (PDF, .md, pasted text), plus
             verification-pass-<date>.md
master.md    the one synthesized document, built from all of research/
versions/    master-v1.md, master-v2.md … keep the history
documents/   what you derive from the master: market-map.md, whos-who.md,
             target-map.md, one thesis per buyer profile
             (thesis-family-office.md, thesis-independent-sponsor.md …),
             and the source .md a report renders from
screen/      the target board — buy-box, the consolidator register, and
             candidates.csv (open it in Google Sheets)
specs/       the build specs — <name>.deck.mts, <name>.post.mts
media/       MEDIA — the pictures used on THIS market's collateral
collateral/  COLLATERAL — finished work that can be posted publicly, anywhere.
             One dated folder per build: <slug>/<date>/
decks/       DECKS — client-specific, client-direct material. Never posted.
             One dated folder per build: <slug>/<date>/

Brand images are house-wide and live in the studio's assets/, not here.

Check any document against its research before it goes anywhere:
  npx tsx <repo>/scripts/studio/audit.mts markets/<m>/master.md

A clean audit proves TRACEABILITY, not truth. Verify load-bearing figures
against primary sources too — CLAUDE.md job 2.

A thesis is a position held for a particular buyer, and it ages as the
master moves. Scaffold and track them from the workspace root:
  npx tsx <repo>/scripts/studio/thesis.mts new <market> <buyer profile>
  npx tsx <repo>/scripts/studio/thesis.mts check      (which ones went stale)

Build the target board — a Places pull, tagged against who already owns what:
  npx tsx <repo>/scripts/studio/screen.mts init <market>
  npx tsx <repo>/scripts/studio/screen.mts pull <market>   (needs GOOGLE_PLACES_API_KEY)
  npx tsx <repo>/scripts/studio/screen.mts rank <market>   (free, offline)

Render, from the STUDIO ROOT so ./assets resolves the house library:
  npx tsx <repo>/scripts/studio/build-deck.mts markets/<m>/specs/<n>.deck.mts \
    --media markets/<m>/media --out markets/<m>/collateral/<slug>/$(date +%F)
