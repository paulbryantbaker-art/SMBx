# smbx.ai — Complete UI & Brand Style Guide
## For marketing materials, LinkedIn content, presentations, documents, and all external assets
## Last updated: April 4, 2026

---

## 1. LOGO SYSTEM

The logo family is **flat, ink-on-paper** — no gradients, no 3D, no metallic effects. Black on cream for light mode, white on charcoal for dark mode. One rose-gold 3D variant exists for special hero placements on dark backgrounds only.

### Primary Wordmark — Light Mode
- **File:** `G3L.png` (transparent PNG)
- **Description:** Flat black "X" mark + "smbx.ai" wordmark, horizontal, transparent background
- **Use on:** All light-mode backgrounds (cream #F8F6F2), marketing materials, social posts, email signatures, headers
- **Minimum size:** 120px wide (digital), 1.5" (print)
- **Clear space:** Half the X mark height on all sides
- **On-site placement:** Home page hero on light mode, at 60px tall (desktop) / 52px tall (mobile)

### Primary Wordmark — Dark Mode
- **File:** `G3D.png` (transparent PNG)
- **Description:** Flat white "X" mark + "smbx.ai" wordmark, horizontal, transparent background
- **Use on:** All dark-mode backgrounds (charcoal #151617), dark social cards, dark presentations
- **Minimum size:** 120px wide (digital), 1.5" (print)
- **On-site placement:** Home page hero on dark mode, at 60px tall (desktop) / 52px tall (mobile)

### Icon Mark (X Only)
- **File:** `X.png` (transparent PNG, flat black)
- **Description:** Just the "X" mark from the wordmark — flat, line-art style
- **Use on:** Sidebar icon (42px on-site), favicon, app icon, social avatars, LinkedIn profile photo, tab icons
- **Sidebar behavior:** 180° spin on hover (0.5s cubic-bezier), returns on mouse leave
- **Minimum size:** 24px digital, 0.25" print
- **Dark mode:** Invert to white using CSS filter or use `X.png` on a light card

### Rose-Gold 3D Variant (Special Use Only)
- **File:** `New G1 Logo T.png` (transparent, 1360×476)
- **Description:** 3D metallic rose-gold "X" + "smbx.ai" — dimensional, warm, premium
- **Use on:** Hero placements on dark backgrounds only (not a general-purpose logo)
- **Never use on:** Light backgrounds, print materials, email signatures, social posts
- **Why restricted:** The flat G3L/G3D are the system standard. This variant exists for atmospheric dark-mode heroes where the rose-gold reads as an accent against charcoal.

### Logo Don'ts
- Never change the X shape or wordmark
- Never add gradient fills to G3L/G3D (they're intentionally flat black/white)
- Never rotate the logo (hover spin is sidebar-only behavior)
- Never place on busy backgrounds without a fade/overlay
- Never stretch or distort proportions
- **Never use deprecated logos:** `final logo.png`, `DG Trans.png`, `TF3.png`, `TF3x.png`, `GX.png`, `redx.png`, `Fancy.png`, `F2.png`, `F3.png`, `sbs.png`, `Logo_transparent.png`, `logo-smbx.png`, any `.mp4` logo animations — all deprecated

---

## 2. COLOR PALETTE

The palette is **Grok-minimal**: warm paper base, ink text, rose-gold as the single functional accent. No gradients, no atmospheric color washes, no decorative color anywhere.

### Primary Accent (used sparingly, for intentional emphasis only)
| Token | Hex | Usage |
|-------|-----|-------|
| **Rose** | `#D44A78` | Buttons, active states, H1 accent words, chat pill, links, highlighted numbers, section labels, CTAs |
| **Rose (dark mode)** | `#E8709A` | Same uses on dark backgrounds — lighter for legibility |
| **Rose (hover/pressed)** | `#B03860` | Button hover, pressed states, active navigation |

### Backgrounds (warm paper base)
| Token | Hex | Usage |
|-------|-----|-------|
| **Light page** | `#F8F6F2` | Warm cream base for all light mode surfaces |
| **Dark page** | `#151617` | Warm charcoal base for all dark mode surfaces |
| **Light card** | `#FFFFFF` | Cards, inputs, chat column, modals |
| **Dark card** | `#2F3133` | Cards on dark backgrounds |
| **Light subtle** | `#F3F3F6` | Alternate sections, table headers, muted panels |
| **Dark subtle** | `#2F3133` | Alternate sections in dark mode |
| **Dark panel** | `#0F1012` | Deep dark panels (CTAs, footer callouts) |

### Text (ink)
| Token | Hex | Usage |
|-------|-----|-------|
| **Primary (light)** | `#1A1C1E` | All body text, headings in light mode |
| **Primary (dark)** | `#F0F0F3` | All body text, headings in dark mode |
| **Muted (light)** | `#5D5E61` | Subheadings, labels, captions, meta |
| **Muted (dark)** | `rgba(218,218,220,0.8)` | Muted text in dark mode |
| **Placeholder** | `#5A4044` | Input placeholder text |

### Borders & Dividers
| Token | Hex | Usage |
|-------|-----|-------|
| **Light border** | `#EEEEF0` | Card outlines, dividers |
| **Input border** | `rgba(0,0,0,0.06)` | Input fields, dock |
| **Rose-tinted border** | `#E3BDC3` | Chat dock border (subtle warm accent) |
| **Dark border** | `rgba(255,255,255,0.08)` | Dark mode dividers |

### Status Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Green** | `#34A853` | Passing DSCR, SBA eligible, positive outcomes |
| **Yellow** | `#FBBC04` | Marginal, near threshold |
| **Red** | `#EA4335` | Below threshold, risk, negative |

### Color Rules
- Rose gold is **functional only** — buttons, active states, highlighted data words, intentional accents. **Never decorative, never atmospheric, never as a background wash.**
- No gradients in the UI. Ever. (The rose-gold 3D logo variant is the only exception, and it's restricted to dark hero placements.)
- No neon, no purple, no teal. The palette is strictly warm neutral + rose gold + status colors.
- Dark mode: rose shifts from `#D44A78` → `#E8709A`, backgrounds from cream → charcoal, text inverts.
- Never use pure `#000000` — always `#1A1C1E` or warmer grays. Pure `#FFFFFF` is reserved for cards, not page backgrounds.

---

## 3. TYPOGRAPHY

### Font Stack
| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| **Headlines** | Sora | 800 (ExtraBold) | system-ui, sans-serif |
| **Section heads** | Sora | 600-700 | system-ui, sans-serif |
| **Body** | Inter | 400 (Regular) | system-ui, sans-serif |
| **Medium** | Inter | 500 | system-ui, sans-serif |
| **Semibold** | Inter | 600 | system-ui, sans-serif |
| **Financial data** | Inter | 500, tabular-nums | system-ui, sans-serif |

### Type Scale (Site)
| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Home H1 (desktop) | 50px | Sora 800 | tracking: -0.03em, leading: 1.05 |
| Home H1 (mobile) | 42px | Sora 800 | tracking: -0.03em, leading: 1.02 |
| Journey H1 (desktop) | 60-70px | Sora 800 | tracking: -0.04em, leading: 0.9 |
| Section heading | 36-48px | Sora 800 | tracking: -0.02em, leading: 1.1 |
| Subsection | 18-24px | Sora 600 | |
| Body | 16-18px | Inter 400 | line-height: 1.5-1.6, max ~65ch |
| Body small | 14-15px | Inter 400 | |
| Caption/meta | 12-13px | Inter 400-500 | |
| Uppercase label | 10-11px | Inter 700-800 | letter-spacing: 0.2em, uppercase |
| KPI number | 20-32px | Sora 800 | tabular-nums |

### Type Scale (Documents/PDF)
| Element | Size | Font |
|---------|------|------|
| Cover title | 32pt | Sora 800 |
| Document H1 | 14pt | Sora 700, rose accent underline |
| Document H2 | 11pt | Sora 600 |
| Body | 10.5pt | Inter 400 |
| Table header | 8.5pt | Inter 600, uppercase, 0.1em tracking |
| Disclaimer | 7.5pt | Inter 400, muted |

### Typography Rules
- **Sora** is display-only — used for headlines, KPIs, section heads. Never body.
- **Inter** is body — paragraphs, labels, tables, UI text. Never headlines.
- **Never mix other fonts** (no Poppins, no Montserrat, no Caveat, no Roboto).
- **Tracking:** tight for headlines (`-0.02em` to `-0.04em`), neutral for body (0), wide for labels (`+0.2em`).
- **Leading:** tight for display (0.9-1.05), loose for body (1.5-1.6).
- **Tabular numbers** for ALL financial data — never proportional.

---

## 4. BACKGROUNDS & TEXTURES

### The Canvas: Warm Paper + Subtle Grain (Grok-minimal)

The site uses a single, quiet canvas across every page — no circuit boards, no dot grids, no atmospheric glows. Just a warm cream base (`#F8F6F2`) with subtle SVG film-grain noise for paper character. Dark mode uses charcoal (`#151617`) with lighter noise.

**Light mode CSS (body):**
```css
background-color: #F8F6F2;
background-image: url("data:image/svg+xml,...fractal-noise-svg...");
background-size: 180px 180px;
background-repeat: repeat;
```

**Dark mode CSS (body):**
```css
background-color: #151617;
background-image: url("data:image/svg+xml,...fractal-noise-svg..."); /* white noise */
background-size: 180px 180px;
background-repeat: repeat;
```

### What's NOT on the site anymore (deprecated)
- ❌ Circuit board backgrounds (`rose gold bg.jpeg`, `GD.jpeg`, `G1.png`, `G2.png`)
- ❌ Dot-grid pattern (`radial-gradient(circle, ...)`)
- ❌ Atmospheric rose-gold glows (previously at top-right corner)
- ❌ Center-fade ellipses for "reading area"
- ❌ Circuit sparks animation

### For Marketing Materials
- **Base:** `#F8F6F2` solid cream (light) or `#151617` charcoal (dark)
- **Texture:** Optional subtle film grain at 3-5% opacity — available as PNG export or CSS SVG filter
- **Never add:** gradients, color washes, pattern fills, decorative textures
- **Hero layouts:** Rely on typography and the rose-gold accent — never on background decoration

---

## 5. COMPONENTS

### Chat Pill (The Hero Element)
The primary interactive element on the home page — a rounded-full pill input with a subtle rose-gold glow behind it.

- **Shape:** Rounded-full (pill)
- **Padding:** 2px outer, 16-24px inner
- **Border:** 1px `#E3BDC3` (rose-tinted) light / 1px `rgba(255,255,255,0.1)` dark
- **Shadow:** Large drop shadow `0 6px 32px rgba(0,0,0,0.06)` light / `0 6px 32px rgba(0,0,0,0.3)` dark
- **Glow:** Rose-gold gradient blur behind pill — 18% opacity light, 40% dark
- **Left:** Circular + (add) button, 40px (desktop) / 36px (mobile), rose accent
- **Right:** Circular send button, 46px (desktop) / 42px (mobile), arrow-up icon
- **Send state:** Grey `#D8D8DA` when empty (disabled), `#D44A78` when filled
- **Arrow:** Always points **UP** (never forward/right)

### Tools Popup (+ Button Menu)
Opens from the + button on the chat pill. Used on home hero and in-chat dock.

- **Position:** Drops UP from the pill (`bottom: calc(100% + 10px)`)
- **Width:** Full pill width
- **Style:** White card (light) / #2F3133 (dark), 24px radius, shadow
- **Sections:** "Start with Yulia" (journey shortcuts) + "Tools" (tool shortcuts)
- **Items:** Icon + title + description, rose icon, 14-16px padding
- **Click behavior:** Fills the input with a contextual prompt, focuses it, closes popup

### Buttons
| State | Style |
|-------|-------|
| **Primary** | `#D44A78` fill, white text, rounded-full (pill), 46px height |
| **Primary hover** | `#B03860` fill |
| **Disabled** | `#D8D8DA` fill, `rgba(0,0,0,0.3)` text |
| **Ghost** | Transparent, 1px border `rgba(0,0,0,0.08)` |
| **Ghost hover** | Border shifts to rose |

### Cards
- **Light:** `#FFFFFF` bg, 1px `#EEEEF0` border, 12-20px radius
- **Dark:** `#2F3133` bg, 1px `rgba(255,255,255,0.06)` border, 12-20px radius
- **Shadow:** `0 1px 4px rgba(0,0,0,0.05)` rest, `0 2px 8px rgba(0,0,0,0.07)` hover

### Inputs
- **Hero (home):** Pill shape (rounded-full), large padding, rose-tinted border
- **Forms:** 8-12px radius
- **Mobile:** 16px minimum font size (prevents iOS zoom), 44px minimum tap target
- `inputMode="decimal"` for numeric inputs

### Financial Tables
- **Header:** uppercase 8.5pt labels, 2.5px `#D44A78` bottom border, `#F3F3F6` background
- **Alternating rows:** `#FAFAF8`
- **Numbers:** Right-aligned, `tabular-nums`
- **Currency:** `$1,234,567` (no cents for large numbers)

### Charts (Interactive + PDF)
- **Primary data:** `#D44A78`
- **Secondary:** `#E8709A`
- **Base/grid:** `#F3F3F6` bg, `rgba(0,0,0,0.04)` grid lines
- **Labels:** Inter 10-11px, `#5D5E61`
- **Rules:** Max 3-4 colors. No 3D. No rainbow. Source citation below.

### Range Sliders
- **Track:** 6px desktop, 8px mobile
- **Thumb:** 20px desktop, **28px mobile** (touch-friendly)
- **Color:** rose `#D44A78`
- **Fill:** gradient from left to current position
- **Border:** 2px white + subtle shadow

---

## 6. SPACING & LAYOUT

### Spacing Scale
| Token | Size | Usage |
|-------|------|-------|
| xs | 4px | Tight gaps |
| sm | 8px | Element padding |
| md | 16px | Card padding, section padding |
| lg | 24px | Section gaps |
| xl | 32px | Major spacing |
| 2xl | 48px | Hero sections |
| 3xl | 64px | Between major page sections |

### Layout
- **Max width:** 860px chat, 960px tools/canvas, 1200-1536px landing
- **Sidebar:** 80px icon rail, fixed left (desktop only, hidden on mobile)
- **Canvas split:** Resizable, default 42% canvas width
- **Mobile:** Single column, canvas as full-screen overlay with pill tabs

### Home Page Layout (Mobile)
- Logo at `pt-[14vh]` (pinned at 14% of viewport height)
- Logo → H1 gap: **80px** (`mb-20`)
- H1 → subtitle gap: **48px** (`mb-12`)
- Pill anchored at bottom with `env(safe-area-inset-bottom) + 0.75rem` padding
- No center fade, no scroll spacer

### Home Page Layout (Desktop)
- Top cluster vertically centered with `flex-1 justify-center`
- Logo height: 60px
- H1: 50px
- Input + glow + chips in a stack

---

## 7. ICONOGRAPHY

- **System:** Material Symbols Outlined (Google)
- **Sizes:** 20px navigation, 16-18px inline, weight 400
- **Logo icon:** `X.png` — sidebar 42px, compact contexts 24-40px
- **Rules:** Monoline style, never filled unless indicating active state

### Required Marketing Assets
- [x] `G3L.png` — light wordmark (in marketing repo)
- [x] `G3D.png` — dark wordmark (in marketing repo)
- [x] `X.png` — icon mark (in marketing repo)
- [ ] Favicon (32×32 from X.png)
- [ ] Apple touch icon (180×180)
- [ ] Open Graph image (1200×630) — wordmark on cream + headline
- [ ] LinkedIn banner (1584×396)
- [ ] CMYK logo for print

---

## 8. MOTION & ANIMATION

| Element | Animation |
|---------|-----------|
| Sidebar X | 180° spin on hover, 0.5s cubic-bezier(0.4,0,0.2,1), returns on leave |
| Dark mode toggle | Scale 1.1 hover, 0.95 active |
| Theme switch | 300ms `theme-transition` class for smooth color shift |
| Page transitions | `fadeOnly 0.25s` home, `slideUp 0.35s` journey |
| Buttons | `active:scale-95` press feedback |
| + button open | Icon rotates 45° (becomes ×) |
| Tools popup | `opacity 0→1` + `translateY(8px)→0` + `scale(0.97)→1`, 200ms |
| Scroll reveal | Fade + translate-y(32px) when scrolled into view, 600ms |

### Rules
- **Never** use `transition: all` — list specific properties
- Animate only `transform` and `opacity` for performance
- Honor `prefers-reduced-motion`
- **No bounce, no elastic, no exaggerated motion** — this is finance

---

## 9. DARK MODE

| Light | Dark |
|-------|------|
| `#F8F6F2` page bg | `#151617` |
| `#FFFFFF` card | `#2F3133` |
| `#1A1C1E` text | `#F0F0F3` |
| `#5D5E61` muted | `rgba(218,218,220,0.8)` |
| `#D44A78` accent | `#E8709A` |
| `#EEEEF0` border | `rgba(255,255,255,0.08)` |
| `#F3F3F6` subtle | `#2F3133` |

### Safari Toolbar
- `DarkModeToggle` sets `body` + `html` `background-color` with `!important`
- Meta `theme-color` updated via `setAttribute` (`#F8F6F2` light / `#151617` dark)
- Background layers on landing pages use `position: absolute` (not fixed — Safari reads fixed elements for toolbar tinting)
- `color-scheme` meta updated for scrollbar/overscroll colors

---

## 10. DOCUMENT / PDF BRANDING

### Cover Page
- Solid `#F8F6F2` base + 5px `#D44A78` accent stripe at top
- `G3L.png` wordmark top-left (48px tall)
- Document title in Sora 800 (32pt)
- "Confidential" + date footer

### Quality Standards
- 3x `deviceScaleFactor` (288 DPI)
- Charts rendered via Chart.js CDN inside Puppeteer, converted to PNG before capture
- Google Fonts preloaded (Sora + Inter)
- All borders minimum 1.5px (prevents disappearing in PDF)
- `print-color-adjust: exact !important` on all elements
- Tables: rows never split, headers repeat on page breaks

---

## 11. BRAND VOICE & COPY

### Voice
- Veteran M&A advisor: **human, authoritative, specific**
- Warm like a boutique advisory firm, not corporate banking
- Confident without being arrogant
- Technical precision without jargon-for-jargon's-sake

### Forbidden Words & Phrases
- Never: "Elevate", "Seamless", "Unleash", "Next-Gen", "Delve", "Revolutionize"
- Never: "small business" (smbx serves all deal sizes from $300K to mega-cap)
- Never: "Contact Sales" → always "Talk to Yulia"
- Never: "leverage" as a verb (use "use")
- Never: "solutions" (say what the thing actually is)

### Brand Conventions
- **"smbx.ai"** — lowercase `smbx`, `.ai` lowercase, X in the logo is the mark
- **"ValueLens"** — not Bizestimate
- **"Yulia"** — the AI advisor's name, always capitalized
- **Every drafted communication** ends with `[Review and send when ready]`
- **Journey names:** Sell, Buy, Raise, Integrate (PMI) — capitalized as brand terms

### LinkedIn-Specific
- Hashtags at the bottom, never inline, always `#smbxai` first
- Standard hashtag set: `#smbxai #BusinessValuation #MergersAndAcquisitions #ExitPlanning`
- Journey-specific sets per audience (see MARKETING_MASTER_PLAN.md)
- Profile headline includes: "AI deal intelligence", "M&A", "business valuation", "exit planning"

---

## 12. FILE INVENTORY

### Active Logo Assets
| File | Purpose | Location |
|------|---------|----------|
| `G3L.png` | Light mode wordmark (flat black X + smbx.ai) | `client/public/`, `smx.ai-marketing/assets/logos/` |
| `G3D.png` | Dark mode wordmark (flat white X + smbx.ai) | `client/public/`, `smx.ai-marketing/assets/logos/` |
| `X.png` | Icon mark (just the X, flat black) | `client/public/`, `smx.ai-marketing/assets/logos/` |
| `New G1 Logo T.png` | Rose-gold 3D variant (dark hero only, restricted use) | `client/public/` |

### Deprecated Assets (do NOT use in marketing materials)
| Deprecated File | Replaced By |
|-----------------|-------------|
| `final logo.png` | `G3L.png` |
| `DG Trans.png` | `G3D.png` |
| `TF3.png`, `TF3x.png` | `G3L.png` / `X.png` |
| `GX.png`, `redx.png`, `x-logo.png` | `X.png` |
| `rose gold bg.jpeg`, `GD.jpeg`, `G1.png`, `G2.png` | No background — use warm cream `#F8F6F2` |
| `final logo.png` hero variant | `G3L.png` |

### Full deprecated list
`GX.png, redx.png, x-logo.png, X2 Transaparant.png, TF3.png, TF3x.png, Fancy.png, F2.png, F3.png, sbs.png, sbs dark.jpeg/png, sbs trans.png, Personal.png, light bg.jpeg/png, dark bg.jpeg/png, Green BG.jpeg, Logo_transparent.png, logo-smbx.png, final logo.png, DG Trans.png, Animated_Logo_1.mp4, Animated_Logo_2.mp4, fancy.mp4, TF3.mp4, G1.png, G2.png, G1L.png, G2D.png, G light.png, G dark.png, GD.jpeg, GL.jpeg, rose gold bg.jpeg, Gemini Logo.png`

---

## 13. QUICK REFERENCE (for marketing agents)

When generating LinkedIn posts, presentations, or any marketing material, use **exactly**:

```
BACKGROUND:     #F8F6F2  (warm cream, light) / #151617 (warm charcoal, dark)
BODY TEXT:      #1A1C1E  (light) / #F0F0F3  (dark)
ACCENT:         #D44A78  (rose) / #E8709A  (rose, dark mode)
MUTED TEXT:     #5D5E61  (light) / rgba(218,218,220,0.8)  (dark)
BORDER:         #EEEEF0  (light) / rgba(255,255,255,0.08) (dark)

HEADLINE FONT:  Sora 800
BODY FONT:      Inter 400

LOGO (LIGHT):   G3L.png
LOGO (DARK):    G3D.png
ICON:           X.png
```

**Never use** gradients (except the one restricted dark-hero logo variant), circuit boards, dot grids, atmospheric color washes, or any color outside this palette.

**Aesthetic reference:** Grok.com minimal + Mercury/Ramp warmth + boutique M&A advisory firm gravitas.
