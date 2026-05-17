# V6 Design Language Review

Last updated: 2026-05-17

This is the working read of the current smbx.ai design language. It does not replace `DESIGN_SOURCE.md` or `DESIGN_TOKENS.md`; it explains how the shipped surfaces are actually being used so future page edits do not drift into generic SaaS or AI-slop cards.

## The Core Feeling

V6 is a cool paper deal desk with selective texture and one artful accent. The shell should feel like a calm professional work surface: pale blue backdrop, white canvas, slate ink, crisp edges, and Yulia always nearby. The page can have beauty, but the beauty is in the material system, not in turning every section into an art card.

Good references already in the app:

- Files page: hierarchy, white list cards, textured shortcut cards, private/shared file boundary.
- Search page: one strong textured hero, textured category cards, one art-house `Ask Yulia` accent card, white recent-discovery list.
- Today page: flat app backdrop, sharp white canvas, one portfolio-intelligence art board, white priority and file cards, dark glass pills on textured surfaces.
- Pipeline page: textured hero, deal cards as white/product cards, action cards as textured calls to action.

## Canvas And Shell

- **Backdrop:** pale blue-gray, flat and quiet. It should make the white canvas look sharp, not compete with it.
- **Canvas:** white or near-white stage with a soft vertical gradient, crisp border, and stronger upper-left depth. The canvas is the work surface.
- **Chat rail:** slightly bluer, persistent, and quiet. The rail does not need extra decoration. The chat pill is its own object.
- **Launcher/tab bar:** centered, fixed-feeling, and browser-like. Active state is a subtle white/light-blue selection, not a chunky old-school selector.
- **Hover tab tray:** lightweight hierarchy. Plain readable rows beat button-looking rows.

## Surface Taxonomy

### 1. White Work Cards

Use for files, rows, lists, tables, comparisons, FAQs, model sections, and anything the user needs to read carefully.

Pattern:

- White or near-white background.
- Cool border: `var(--m-outline-var)` or rgba blue-gray.
- Soft shadow, no heavy decorative glow.
- Rows separated by thin dividers.
- Small icon tile or status pill only when it clarifies state.

Good examples:

- `client/src/components/v6/modes/FilesRoot.tsx`: `F.card`, `F.rows`, `F.fileRow`, `F.roomRow`.
- `client/src/components/v6/modes/SearchRoot.tsx`: `S.listCard`, `S.discoveryRow`.
- `client/src/components/v6/modes/TodayRoot.tsx`: priority cards, file rows, deal rows.

Do not use:

- White cards with arbitrary colored top borders.
- Repeated generic card grids where every card has the same heading/body rhythm.
- Nested cards inside cards unless it is a real tool or modal.

### 2. Textured Cards

Use for page heroes, category launchers, and high-intent action cards. Texture is the material, not decoration.

Pattern:

- Texture background from `DESKTOP_TEXTURES`.
- One tinted overlay that supports legibility.
- White text.
- Rounded corners around 22-28px.
- Dark/liquid glass pill for the action.

Good examples:

- Search category cards: `S.categoryCard`.
- Files shortcut cards: `F.shortcutCard`.
- Pipeline action cards: `P.actionCard` plus texture tone.
- Today start/action strip.

Do not use:

- Too many different art textures on one page.
- Brown/terra warmth as the dominant app language.
- Texture just to make a normal content card “interesting.”

### 3. Art-House Accent Cards

Use exactly like the Search page uses `Ask Yulia`: one artful accent that gives the page heart. Art is the accent, not the page system.

Pattern:

- One art-house panel per page or major viewport.
- It should have a clear job: “Ask Yulia,” portfolio intelligence, or a single editorial proof point.
- It can carry white text and a dark glass pill.
- It should contrast the product surfaces around it, not replace them.

Good examples:

- Search page `S.storyCard`.
- Today portfolio intelligence board.

Do not use:

- Multiple unrelated art cards in the same section.
- Large art panels as filler.
- Art cards for basic explanatory content.

### 4. Colored Accent Cards

Use for status, verdict, risk, or model-read emphasis. These should be soft and purposeful.

Pattern:

- Mostly white card, soft colored icon/pill or small background wash.
- Gold for review/draft/action.
- Green for pursue/healthy.
- Blue for selection/system.
- Plum only as supporting accent.

Do not use:

- Saturated color blocks for normal explanatory content.
- Orange/terra as atmosphere.
- Color as a replacement for structure.

### 5. Liquid Glass

Liquid Glass is for pills and chrome, not for whole content-card systems.

Use it on:

- Dark pills over textured cards.
- Search chips.
- Hero action pills.
- Chat controls and launcher chrome.
- Small overlay memo only when sitting on a texture/art surface.

The current best desktop recipe is the Search/Today one:

- Background: radial white glint plus translucent light/dark linear layer.
- Filter: `blur(5px) saturate(155-165%) contrast(1.08) brightness(1.04)`.
- Shadow: tight inset highlights plus a small dark drop shadow.
- Border: `0.5px solid rgba(255,255,255,0.5-ish)`.

Do not use:

- Fake frosted panels that are just translucent gray.
- Glass as a generic card background for explanatory content.
- Sweep/glare gimmicks.

## Typography And Copy

- Big headings are okay in heroes and major editorial sections.
- Compact panels use compact type.
- Eyebrows are orientation markers, not decoration. If every card has microtext, the page is noisy.
- Body copy should be short and specific. Public pages can say more about the methodology, but not with dense microcopy everywhere.
- “Yulia” is the interface. CTAs should route to chat.

## Page Composition

A strong V6 page usually follows this rhythm:

1. One textured hero or product board.
2. One white list/work section.
3. One art-house accent card, if the page needs emotional lift.
4. More white work cards or rows.
5. Textured action strip only when the user should do something.

For Learn / How It Works specifically:

- Use a blue texture hero, not an art museum hero.
- Use one art card in the Search-page style, likely “Ask Yulia to run the desk.”
- “What makes it different” should be an expandable white list, not decorative cards.
- “Working surfaces” should use Files/Search style white rows or a simple list, not top-border cards.
- Keep pricing readable and simpler. Do not duplicate small summary price cards and large price cards unless they serve different jobs.
- Reduce microtext. Keep only labels that orient the user or protect legal/tax boundaries.

## Hard No List

- White cards with colored top borders.
- Random card grids with identical “eyebrow / title / body” structure.
- Full page art museum treatment.
- Art as background for every major section.
- Glass on every card.
- Purple/blue AI gradients.
- Terra/orange/brown as the core app palette.
- Pure decorative micro-eyebrows.
- Generic SaaS comparison table styling.

## Quick Decision Rules

- If the user reads it, default to a white work card or row.
- If the user launches something, consider a textured card with a dark glass pill.
- If the page needs heart, use one art-house accent card.
- If the state matters, use a soft colored pill.
- If it is just “pretty,” cut it.
- If it does not look like Files, Search, Today, Pipeline, or the canvas shell, stop and re-check the pattern before building.
