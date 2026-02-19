# SMBX.AI Design System

Aesthetic: Claude.ai product design language. The app should feel like Claude.ai — warm, minimal, conversational.

## CRITICAL RULE: CONSISTENCY IS MANDATORY

Every instance of a component type MUST look identical across every page. No exceptions. Specifically:
- Every primary button on every page: same height, same padding, same font size, same border radius, same colors
- Every secondary/ghost button on every page: same height, same padding, same font size, same border radius
- Every dropdown on every page: same style, same chevron icon, same border, same animation
- Every input field on every page: same height, same padding, same border, same focus ring
- Every card on every page: same border radius, same shadow, same padding
- Every heading level (h1, h2, h3) on every page: same font, same size, same weight, same color
- If a component exists on two pages, it must be pixel-identical

To enforce this, shared components live in `client/src/components/ui/` and are used EVERYWHERE.

---

## Shared Components

### Button (`components/ui/Button.tsx`)
- `variant="primary"`: bg-[#DA7756] text-white rounded-full px-8 py-3 text-base font-medium hover:bg-[#C4684A] transition-colors duration-150. Height: 48px.
- `variant="secondary"`: bg-white border border-[#E8E4DC] text-[#1A1A18] rounded-full px-8 py-3 text-base font-medium hover:bg-[#F0EDE6] transition-colors duration-150. Height: 48px.
- `variant="ghost"`: bg-transparent text-[#6B6963] hover:text-[#1A1A18] px-4 py-2 text-sm transition-colors duration-150. Height: 36px.
- `variant="icon"`: bg-transparent text-[#6B6963] hover:text-[#1A1A18] hover:bg-[#E8E4DC] rounded-lg p-2 transition-colors duration-150. Height: 36px width: 36px.
- ALL buttons site-wide MUST use this component. No raw `<button>` elements anywhere.

### Input (`components/ui/Input.tsx`)
- Standard: h-12 w-full rounded-lg border border-[#E8E4DC] bg-white px-4 text-base text-[#1A1A18] placeholder-[#9B9891] focus:outline-none focus:ring-2 focus:ring-[#DA7756] focus:border-transparent transition-colors duration-150
- ALL inputs site-wide MUST use this component. No raw `<input>` elements.

### Card (`components/ui/Card.tsx`)
- Standard: bg-white rounded-2xl shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.035)] p-6
- Hover variant: adds hover:shadow-[0_0.5rem_2rem_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-150
- ALL cards site-wide MUST use this component.

### Dropdown (`components/ui/Dropdown.tsx`)
- Trigger: same as Button variant="secondary" with chevron-down icon on right
- Menu: bg-white rounded-xl shadow-[0_0.5rem_2rem_rgba(0,0,0,0.06)] border border-[#E8E4DC] py-1
- Menu item: px-4 py-2 text-sm text-[#1A1A18] hover:bg-[#F0EDE6] transition-colors
- ALL dropdowns site-wide MUST use this component.

---

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| --bg-primary | #F5F5F0 | Warm cream — main background |
| --bg-card | #FFFFFF | White cards on cream |
| --bg-sidebar | #F0EDE6 | Sidebar and footer |
| --bg-hover | #E8E4DC | Hover states |
| --text-primary | #1A1A18 | Near-black, NEVER pure black |
| --text-secondary | #6B6963 | Descriptions, muted text |
| --text-tertiary | #9B9891 | Metadata, timestamps |
| --terra | #DA7756 | Primary accent, CTAs, user messages |
| --terra-hover | #C4684A | Hover on terra elements |

---

## Typography — ONLY these combinations, no others

| Usage | Font | Classes |
|-------|------|---------|
| Brand/logo | Georgia, ui-serif, serif | text-2xl font-bold text-[#DA7756] |
| Page heading (h1) | Georgia, ui-serif, serif | text-4xl font-bold text-[#1A1A18] |
| Section heading (h2) | Georgia, ui-serif, serif | text-2xl font-semibold text-[#1A1A18] |
| Subsection heading (h3) | system-ui, sans-serif | text-lg font-semibold text-[#1A1A18] |
| Body text | system-ui, sans-serif | text-base text-[#1A1A18] |
| Description text | system-ui, sans-serif | text-base text-[#6B6963] |
| Small/meta text | system-ui, sans-serif | text-sm text-[#9B9891] |

- NEVER mix these. A heading is always serif. Body is always sans-serif. No exceptions.

---

## Shapes — ONLY these radii

| Element | Radius |
|---------|--------|
| Cards and message bubbles | rounded-2xl (1rem) |
| Buttons | rounded-full (pill) |
| Inputs and textareas | rounded-lg (0.5rem) |
| Dropdown menus | rounded-xl (0.75rem) |
| Icon buttons | rounded-lg (0.5rem) |

- NEVER use rounded-md, rounded-sm, or rounded alone. Pick from this list only.

---

## Shadows — ONLY these two

| Level | Value |
|-------|-------|
| Default | shadow-[0_0.25rem_1.25rem_rgba(0,0,0,0.035)] |
| Hover/elevated | shadow-[0_0.5rem_2rem_rgba(0,0,0,0.06)] |

- NEVER use shadow-sm, shadow-md, shadow-lg, or any other Tailwind shadow preset.

---

## Chat UI Specific

- Sidebar: #F0EDE6 background, 280px wide desktop, full-width overlay on mobile
- Message area: #FFFFFF background
- User messages: #DA7756 background, white text, rounded-2xl, max-width 80%, right-aligned
- Assistant messages: #F5F5F0 background, #1A1A18 text, rounded-2xl, max-width 80%, left-aligned
- Input bar: sticky bottom, white background, subtle top border 1px #E8E4DC, rounded-xl textarea
- Send button: uses Button variant="primary" but circular, 40px
- Typing indicator: three dots animation in #9B9891

---

## Spacing

- Content max-width: max-w-3xl for chat messages
- Card padding: p-6
- Message padding: px-4 py-3
- Message gap: space-y-4

---

## Rules

- NO stock photos
- NO emojis in UI chrome
- NO gradients
- NO pure black (#000000) anywhere
- NO heavy shadows
- Mobile-first — build for 375px first
- ALL transitions: 150ms ease (transition-colors duration-150 or transition-all duration-150)
- NEVER create a one-off styled element. If it doesn't fit an existing component, add a variant to the component.
