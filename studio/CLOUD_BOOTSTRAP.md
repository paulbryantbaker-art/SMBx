# Running the studio from a cloud Cowork session

> **ONE CLONE (2026-08-18) — read before acting on any path in this document.**
> This workspace now lives at **`studio/` inside the SMBx repo** — the one
> clone at `~/Documents/GitHubRepos/smbx-prod`; the engine is `..`. The old
> `~/Documents/smbx-studio` folder and its remote `smbx-ai/smbx-studio` are
> history. Where this document says `$REPO`, that is now the parent of this
> folder; where it says "the workspace repo" or "the engine repo", they are
> the same repo. **Nobody commits to `main`** — branch (`cowork/<topic>` ·
> `claude/<topic>`), PR, Paul merges; a cloud session cannot push. Full
> statement: the ONE CLONE section at the top of `CLAUDE.md` in this folder.
> Everything below is otherwise unchanged and still binding.


**Read this first if you are a Cowork session that can see Paul's disk through
the `mcp__remote-devices__*` bridge rather than running on his machine.**

## The constraint

`device_bash` does NOT run on macOS. It runs in a stripped-down Linux sandbox
the Claude desktop app provides, with the granted folders mounted. That sandbox
has **no Chromium and no network access**, so:

- The builders (`build-deck`, `build-onepager`, `build-report`) **cannot render
  there.** They drive a headless Chrome to produce PDFs. There is no Chrome, and
  no way to install one.
- `npm install` cannot run there either.

`audit.mts` is the exception — pure computation, no browser. It runs anywhere.

The cloud container the session itself runs in *does* have Chromium and network.
So the engine goes there, the workspace files come to it, and finished output
goes back to disk.

## The bootstrap — about two minutes

Run these in order. Substitute the real session mount path, which you can find
with `ls /sessions/*/mnt/`.

**1. Tar the engine on the device** (`device_bash`):

```bash
R=/sessions/<session>/mnt/GitHubRepos/SMBx-live/SMBx
S=/sessions/<session>/mnt/smbx-studio
mkdir -p $S/_to_delete
tar -czf $S/_to_delete/engine.tar.gz -C $R \
  house scripts/studio studio-kit/lib server/services/fontEmbeds.ts \
  client/public/logo-green-x.png client/public/logo-green-x-dark.png \
  client/public/founder-portrait.jpg client/public/founder-walking.webp \
  client/public/textures/blackbleed.webp \
  client/public/textures/bonebleed.webp
```

**2. Stage it** — `device_stage_files` on
`/Users/paulbaker/Documents/smbx-studio/_to_delete/engine.tar.gz`.

**3. Unpack and install in the cloud container** (`Bash`):

```bash
mkdir -p ~/smbx-engine && tar -xzf /mnt/user-data/uploads/smbx-studio/_to_delete/engine.tar.gz -C ~/smbx-engine
cd ~/smbx-engine
# the app's premiumPdfRenderer drags in server templates; newRenderPage is all
# the builders use, and studio-kit/lib/render.mts exports exactly that
cp studio-kit/lib/render.mts server/services/premiumPdfRenderer.ts
cat > package.json <<'JSON'
{ "name":"smbx-studio-engine","private":true,"type":"module",
  "dependencies":{"@fontsource-variable/fraunces":"^5.3.0","@fontsource-variable/inter":"^5.3.0",
    "@fontsource/ibm-plex-mono":"^5.3.0","marked":"^15.0.0","puppeteer-core":"^24.40.0"},
  "devDependencies":{"tsx":"^4.20.0"} }
JSON
npm install --silent
```

**4. Bring the workspace over** — tar `markets/`, `assets/` and `posting-plan.md`
the same way, unpack to `~/smbx-studio`. (Since 2026-07-29 there is no top-level
`decks/` or `media/`: specs, media and output all live inside `markets/<m>/`.)

**5. Render.** Chromium is pre-installed in the container; point puppeteer at it:

```bash
cd ~/smbx-studio
PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium \
npx --prefix ~/smbx-engine tsx ~/smbx-engine/scripts/studio/build-deck.mts \
  markets/<m>/specs/<name>.deck.mts \
  --media markets/<m>/media \
  --out markets/<m>/collateral/<slug>/<date>
```

Output is byte-for-byte house style — same `house/tokens.ts`, same embedded
woff2s, same brand assets.

## Getting output back to disk

`SendUserFile` the artifact (Paul sees it in chat), then
`device_commit_files` with the returned `file_uuid`. Two gotchas, both real:

- **30MB upload ceiling.** A bundle over that is rejected. Split it, or leave
  large source images on the device and copy them locally with `device_bash`
  instead of shipping them both ways.
- **`tar -x` fails on the mount** with `Cannot open: File exists` — extraction
  needs to unlink, and the mount does not permit it. Extract to `/tmp` inside
  the sandbox and `cp` over the top; `cp` truncates in place and works.

`device_bash` also cannot delete. To remove something, `mv` it into
`_to_delete/` and tell Paul, who empties that folder himself.

**And `mv` only works WITHIN one mounted folder.** Inside a mount it is a
rename, which is allowed. Across two mounts it is copy-then-unlink, and the
unlink fails — so moving a file out of `smbx-studio` into `GitHubRepos/_to_delete`
fails while moving it into `smbx-studio/_to_delete` succeeds. Worth knowing
before you conclude a file is undeletable: it may just be the wrong destination.
Each mount needs its own `_to_delete/`.

**Git through the bridge leaves locks behind** (found 2026-08-12). Git creates
`.git/index.lock`, writes, then unlinks — and the unlink is the one thing the
mount forbids. So every `git status` or `git commit` run through `device_bash`
succeeds and then leaves a stale lock that blocks the NEXT command, including
GitHub Desktop. A commit also strands `.git/HEAD.lock`,
`.git/objects/maintenance.lock` and a `tmp_obj_*` per object written.

Clear them the only way the bridge allows — move them out — then confirm the
repository is intact:

```bash
# D MUST be inside the same mounted folder as the repo — see the mv note above
D=$R/../_to_delete/git-locks-$(date +%F); mkdir -p $D
find $R/.git -maxdepth 3 \( -name '*.lock' -o -name 'tmp_obj_*' \) \
  -exec sh -c 'mv "$1" "$2/$(echo $1 | tr "/" "_")"' _ {} $D \;
git -C $R fsck --no-progress --no-dangling   # must print nothing
```

Run this after the last git command, not before the first — the very act of
checking creates another lock. And never push from here: there is no credential
helper on the device and Paul signs in to GitHub with Google. Commit through the
bridge if you must, then let him press Push in GitHub Desktop.

## The simpler path

None of this is needed on Paul's own machine. In a Terminal on macOS the
builders find Chrome themselves:

```bash
export REPO=/Users/paulbaker/Documents/GitHubRepos/SMBx-live/SMBx
cd ~/Documents/smbx-studio
npx tsx $REPO/scripts/studio/build-deck.mts markets/<m>/specs/<name>.deck.mts \
  --media markets/<m>/media \
  --out markets/<m>/collateral/<slug>/$(date +%F)
```

A cloud session is for the thinking — research, verification, writing the spec.
The render is a local command that costs nothing and needs no session at all.
