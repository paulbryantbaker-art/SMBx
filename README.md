# smbX Studio — local workspace

Everything runs on this computer. No SMBX app, no app API key.

Organised **by market first, then by category.** Every market folder has the
same shape, so you always know where a thing is.

```
assets/       THE HOUSE LIBRARY — brand images shared by every market
              brand/ · trades/ · mep/ · concept/ · INDEX.md · PROMPTS.md

markets/<market>/
    research/     the reads you gathered — Claude, Gemini, PDFs, pasted text
    master.md     the one synthesized document, built from all of research/
    versions/     master-v1.md, master-v2.md … the history
    documents/    what you derive: market-map, whos-who, thesis, report source
    screen/       the target board — buy-box, consolidators, candidates.csv
    specs/        the build specs — <name>.deck.mts, <name>.post.mts
    media/        the pictures used on THIS market's collateral
    collateral/<slug>/<date>/   finished work that can be posted publicly
    decks/<slug>/<date>/        client-direct material — never posted

deals/<deal>/     one folder per deal — what they sent, what we produced
posting-plan.md   what to build next
THESES.md         every position we hold and what it rests on (generated)
```

**collateral vs decks** is about audience, not file type. `collateral/` is
posting content, anywhere it can be posted — the carousel PDF, its page JPGs
and its caption stay together. `decks/` is client-specific material cut for a
named acquirer. Not sure which? Ask before filing.

## Build a deck
Run from this folder — that is what makes `./assets` resolve the house library.

```
npx tsx <path-to-SMBx-repo>/scripts/studio/build-deck.mts \
  markets/<m>/specs/<name>.deck.mts \
  --media markets/<m>/media \
  --out markets/<m>/collateral/<slug>/$(date +%F)
```

Images resolve `--media` → `./assets` → the repo. Output goes where `--out`
says: always a dated folder inside the market, so a rebuild never overwrites
the last one.

## Track the theses
```
npx tsx <path-to-SMBx-repo>/scripts/studio/thesis.mts check
```
Tells you which positions rest on a master that has since moved.

Full guide: STUDIO_COWORK.md in the SMBx repo; the laws and the document
specs are in CLAUDE.md and PLAYBOOK.md right here.