A MARKET — everything you know about one lane.

IF research/ IS EMPTY, START AT ../../RESEARCH.md. Gathering a market is six
passes and roughly twenty runs across several hours — its own job, with its own
procedure. A market map written from an empty research/ is not a thin map, it
is an invented one.

research/    the reads you gathered, however you gathered them (PDF, .md, pasted text)
master.md    the one synthesized document, built from all of research/
versions/    master-v1.md, master-v2.md … keep the history
documents/   what you derive from the master: market-map.md, whos-who.md,
             target-map.md, and one thesis per buyer profile
             (thesis-family-office.md, thesis-independent-sponsor.md …)
screen/      the target board — buy-box, the consolidator register, and
             candidates.csv (open it in Google Sheets)
collateral/  rendered output for this market

Check any document against its research before it goes anywhere:
  npx tsx <repo>/scripts/studio/audit.mts master.md

A thesis is a position held for a particular buyer, and it ages as the
master moves. Scaffold and track them from the workspace root:
  npx tsx <repo>/scripts/studio/thesis.mts new <market> <buyer profile>
  npx tsx <repo>/scripts/studio/thesis.mts check      (which ones went stale)

Build the target board — a Places pull, tagged against who already owns what:
  npx tsx <repo>/scripts/studio/screen.mts init <market>
  npx tsx <repo>/scripts/studio/screen.mts pull <market>   (needs GOOGLE_PLACES_API_KEY)
  npx tsx <repo>/scripts/studio/screen.mts rank <market>   (free, offline)
