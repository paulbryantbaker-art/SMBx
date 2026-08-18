# FROZEN — this is the shipped deploy fixture, not the register

**2026-08-18.** The living buy-side register moved to the workspace repo:

```
~/Documents/smbx-studio/clients/crm-bundle/
```

Edit it THERE. Read `crm-bundle/COLUMNS.md` first — it carries the column
ownership rule (git owns the facts, the app owns the state) and the two ways
this bundle fails silently.

## Why this folder still exists

It is a runtime dependency of the deployed app, not a convenience copy:

- `server/services/crmOutreachSeed.ts` resolves this path and reads all seven
  files **by name** (`seedDir()`, `:88`). Remove it and the app's seed press
  throws `content/crm-seed is missing — the plan bundle is not on this deploy`.
- `client/src/hooks/useCrmAccounts.ts` surfaces that press.
- `CRM_BRIDGE.md` §2 names these files as the canonical header reference.

## What that makes it

**The 2026-08-05 plan exactly as shipped.** A frozen fixture and a header
contract. It is not a working copy and it does not get research updates — those
land in the workspace and reach the app through `push-crm.mts`.

If the two ever need to be levelled (a new deploy seed), copy workspace → here
wholesale and say so in the commit. Never edit this copy in place: that is the
same drift that put two wrong figures on the live website on 12 August, and the
rule from `SMBX_WHAT_LIVES_WHERE.md` is the one that survived it — **the copy is
not allowed to be edited.**
