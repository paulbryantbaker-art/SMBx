#!/usr/bin/env bash
#
# rebuild-all.sh — re-render every spec on disk into Carta, in a new dated folder.
#
# WRITTEN 2026-08-18, after the ONE CLONE move. `studio/.gitignore` treats a
# rendered PDF as reproducible, so `git subtree` brought the specs, the
# captions, the BUILD.txt files and the 31 RETIRED-PALETTE.txt markers across
# and left every actual render behind. This clone contains 0 PDFs and 0 page
# JPGs. This script is the "reproducible" half of that bargain being called in.
#
# RUN IT ON THE MAC. It cannot run in a Cowork sandbox: puppeteer-core wants a
# real Chromium at /usr/bin/chromium-browser and there is none there, and
# node_modules in this clone is darwin-arm64. From the studio root:
#
#     cd ~/Developer/smbx-prod/studio        # or wherever the clone lives
#     bash rebuild-all.sh                    # dry run — prints, renders nothing
#     bash rebuild-all.sh --go               # actually render
#     bash rebuild-all.sh --go --only fire   # substring filter on the slug
#
# WHY IT RENDERS FROM THE STUDIO ROOT. That is what makes ./assets resolve the
# house library, so a spec can keep saying trades/hvac-ac.png. Running it from
# anywhere else silently changes image resolution, and the bare builder default
# is a flat ./collateral at the root — which both overwrites the last build and
# files it outside its market.
#
# WHY EACH BUILD GETS TODAY'S DATE RATHER THAN ITS ORIGINAL ONE. A dated folder
# is the record of what was published on that date. Re-rendering 2026-08-06 art
# into the 2026-08-06 folder would overwrite a record with something that is
# not what went out — the pre-Carta build was a different document. The
# RETIRED-PALETTE.txt marker in the old folder already says never to reuse it,
# and the re-render law says a pre-Carta artifact is rebuilt, never patched.
#
# WHAT IT REFUSES TO DO. It does not skip a spec whose art is missing and
# carry on quietly — a partial rebuild that reports success is the failure mode
# worth avoiding here. Missing images are checked FIRST, printed as blockers,
# and that spec is not rendered.

set -uo pipefail

STUDIO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$STUDIO/.." && pwd)"
TODAY="$(date +%F)"
GO=0
ONLY=""

while [ $# -gt 0 ]; do
  case "$1" in
    --go)   GO=1; shift ;;
    --only) ONLY="${2:-}"; shift 2 ;;
    *) echo "unknown flag: $1"; exit 64 ;;
  esac
done

command -v npx >/dev/null 2>&1 || { echo "npx not found"; exit 69; }

# ── the four images this workspace is missing ──────────────────────────────
# markets/elevator/media/ is EMPTY. These are referenced by specs that will
# fail at render. Named here so they are a blocker rather than a surprise.
MISSING_ART="elevator-teardown-1-cover.png elevator-teardown-2-cover.png elevator-route-book.png hvac-condensers.png"

echo "════════════════════════════════════════════════════════════"
echo "  studio rebuild — Carta"
echo "  studio   $STUDIO"
echo "  engine   $REPO  ($(git -C "$REPO" rev-parse --short HEAD 2>/dev/null || echo 'not a git clone'))"
echo "  dated    $TODAY"
[ "$GO" -eq 1 ] || echo "  MODE     DRY RUN — nothing will be written. Add --go to render."
echo "════════════════════════════════════════════════════════════"
echo

blocked=0; rendered=0; failed=0

# resolve an image the way build-deck does: market media, studio media,
# assets, the spec's own folder, the studio root.
resolve_img() {
  local img="$1" market="$2" specdir="$3"
  for p in "$STUDIO/markets/$market/media/$img" "$STUDIO/media/$img" \
           "$STUDIO/assets/$img" "$specdir/$img" "$STUDIO/$img" \
           "$REPO/client/public/$img"; do
    [ -f "$p" ] && return 0
  done
  return 1
}

cd "$STUDIO" || exit 70

# every spec except the seeded examples
while IFS= read -r spec; do
  case "$spec" in
    */_example-market/*|./decks/example.deck.mts) continue ;;
  esac

  slug="$(basename "$spec")"; slug="${slug%.deck.mts}"; slug="${slug%.post.mts}"
  [ -n "$ONLY" ] && case "$slug" in *"$ONLY"*) ;; *) continue ;; esac

  specdir="$(dirname "$spec")"
  case "$spec" in
    ./markets/*) market="$(echo "$spec" | cut -d/ -f3)"; outroot="markets/$market/collateral" ;;
    *)           market=""; outroot="collateral" ;;
  esac

  case "$spec" in *.post.mts) builder="build-onepager.mts" ;; *) builder="build-deck.mts" ;; esac

  # ── art check before anything renders ──────────────────────────────────
  gaps=""
  for img in $(grep -ohE "image:[[:space:]]*['\"][^'\"]+['\"]" "$spec" 2>/dev/null \
               | sed -E "s/image:[[:space:]]*['\"]//; s/['\"]//" | sort -u); do
    case "$img" in ../*) continue ;; esac   # explicit repo-relative paths resolve themselves
    resolve_img "$img" "$market" "$specdir" || gaps="$gaps $img"
  done

  out="$outroot/$slug/$TODAY"

  if [ -n "$gaps" ]; then
    echo "  ⛔ BLOCKED  $slug"
    echo "              missing art:$gaps"
    echo "              generate it per FORMATS.md §4.1 before this one can build."
    blocked=$((blocked+1))
    continue
  fi

  cmd="npx tsx $REPO/scripts/studio/$builder $spec --out $out"
  [ -n "$market" ] && cmd="$cmd --media markets/$market/media"

  if [ "$GO" -eq 0 ]; then
    echo "  ·  $slug"
    echo "     $cmd"
    continue
  fi

  echo "  ▶  $slug → $out"
  if eval "$cmd" >/tmp/rebuild-$slug.log 2>&1; then
    echo "     ✓ $(ls "$out" 2>/dev/null | wc -l | tr -d ' ') file(s)"
    # the BUILD.txt the builders write is the rebuild provenance; keep it.
    rendered=$((rendered+1))

    # ── the second destination (Paul, 2026-08-18) ────────────────────────
    # "any collateral we make needs to be able to be used in 2 places: 1, as a
    # post on linkedin (PDF or single image), 2 or usable by CC to build into
    # the website like the current research docs." The PDF above is (1); this
    # is (2). Both derive from the one spec, so they cannot drift.
    # Non-fatal on purpose: a failed site export must never cost you the PDF
    # that already rendered, so it warns and the build still counts.
    if npx tsx "$REPO/scripts/studio/export-site.mts" "$spec" >/tmp/site-$slug.log 2>&1; then
      grep -q "DECK-ISM" /tmp/site-$slug.log \
        && echo "     ⚠ site export has deck-isms — see /tmp/site-$slug.log" \
        || echo "     ✓ site markdown → scripts/studio/reports/$slug.md"
    else
      echo "     ⚠ site export FAILED (PDF is fine) — /tmp/site-$slug.log"
    fi
  else
    echo "     ✗ FAILED — tail of /tmp/rebuild-$slug.log:"
    tail -6 /tmp/rebuild-$slug.log | sed 's/^/       /'
    failed=$((failed+1))
  fi
done < <(find . -name '*.deck.mts' -o -name '*.post.mts' | sort)

echo
echo "════════════════════════════════════════════════════════════"
if [ "$GO" -eq 0 ]; then
  echo "  dry run. $blocked spec(s) blocked on missing art."
  echo "  re-run with --go to render."
else
  echo "  rendered $rendered · failed $failed · blocked $blocked"
  [ "$failed" -gt 0 ] && echo "  a failure is not a skip — read the log before calling this done."
fi
echo "════════════════════════════════════════════════════════════"

[ "$failed" -gt 0 ] && exit 1
[ "$blocked" -gt 0 ] && exit 2
exit 0
