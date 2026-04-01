# smbx.ai — Complete UI & Brand Style Guide
## For marketing materials, presentations, documents, and all external assets
## Last updated: April 1, 2026

---

## 1. LOGO SYSTEM

### Primary Logo (Side-by-Side)
- **File:** `final logo.png` (1360×476, transparent PNG, 68% alpha)
- **Usage:** Hero placements, presentations, marketing headers, home page
- **Style:** 3D gradient X mark + "smbx.ai" text in metallic gradient
- **Gradient:** Purple (#6B2FA0) → Hot Pink (#D44A78) → Orange/Gold (#F0A030), top-left to bottom-right
- **Minimum clear space:** Half the X height on all sides
- **Minimum size:** 120px wide digital, 1.5" print
- **Light mode:** Uses drop-shadow for depth: `drop-shadow(0 6px 24px rgba(160,48,80,0.4))`
- **Dark mode variant:** `DG Trans.png` (transparent, optimized for dark backgrounds)

### Icon Mark (X Only)
- **File:** `x.png` (cropped, transparent PNG)
- **Usage:** Sidebar (42px), mobile drawer (40px), favicon, app icon, social avatar
- **Style:** Same purple-to-gold gradient as primary logo
- **Sidebar behavior:** 180° spin on hover (0.5s cubic-bezier), returns on mouse leave
- **Visibility:** Hidden on home page (hero logo is there), visible on chat + journey pages
- **Minimum size:** 24px digital, 0.25" print

### Logo Don'ts
- Never change the gradient colors
- Never rotate the logo (hover spin is sidebar-only behavior)
- Never add effects beyond the built-in drop shadow
- Never place on busy backgrounds without a fade/overlay
- Never stretch or distort proportions
- Never use old logos: GX.png, redx.png, X2 Transaparant.png, TF3.png, x-logo.png — all deprecated

---

## 2. COLOR PALETTE

### Primary Accent (sampled from logo gradient center)
| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#D44A78` | Buttons, active states, accent text, send button, links, highlighted numbers, section labels |
| **Dark Mode** | `#E8709A` | Same uses on dark backgrounds — lighter for legibility |
| **Hover/Pressed** | `#B03860` | Button hover, pressed states, active navigation |

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| **Light page** | `#F9F9FC` | All light mode page backgrounds, body, html |
| **Dark page** | `#1A1C1E` | All dark mode page backgrounds |
| **Light card** | `#FFFFFF` | Cards, inputs, chat column, modals |
| **Dark card** | `#2F3133` | Cards on dark backgrounds |
| **Cream** | `#FAF8F4` | Callout boxes, alternate sections, table headers |
| **Sidebar light** | `#FFFFFF` | Desktop 80px sidebar rail |
| **Sidebar dark** | `#09090B` (zinc-950) | Desktop sidebar dark mode |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#1A1A18` | All body text, headings (light mode) |
| **Dark mode** | `#F0F0F2` | All body text (dark mode) |
| **Secondary** | `#44403C` | Subheadings, labels |
| **Muted** | `#6E6A63` | Captions, footnotes, meta, timestamps |
| **Light** | `#A9A49C` | Attribution, disabled text |
| **Placeholder** | `#5A4044` | Input placeholder text |

### Borders & Dividers
| Token | Hex | Usage |
|-------|-----|-------|
| **Card border** | `#EEEEF0` | Card outlines, dividers |
| **Input border** | `rgba(0,0,0,0.06)` | Input fields, dock |
| **Accent border** | `#E3BDC3` | Chat dock (rose-tinted) |
| **Dark border** | `rgba(255,255,255,0.06)` | Dark mode dividers |

### Status Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Green** | `#34A853` | Passing DSCR, SBA eligible, positive |
| **Yellow** | `#FBBC04` | Marginal, near threshold |
| **Red** | `#EA4335` | Below threshold, risk, negative |

### Color Rules
- Accent is **functional only** — buttons, active states, highlighted data. Never decorative backgrounds.
- Only the logo uses the purple-to-gold gradient. UI uses flat `#D44A78`.
- Dark mode: accent shifts to `#E8709A`, backgrounds darken, text lightens.
- Never use pure `#000000` — always `#1A1C1E` or darker grays.

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

### Type Scale (App)
| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Page title | 50px desktop / 36px mobile | Sora 800 | tracking: -0.03em, leading: 1.05 |
| Section heading | 14pt | Sora 700 | 2.5px accent underline |
| Subsection | 11pt | Sora 600 | |
| Body | 10.5pt / 14-15px | Inter 400 | line-height: 1.55-1.6, max ~65ch |
| Caption/meta | 10-11px | Inter 400-500 | |
| Uppercase label | 9-10px | Inter 600-700 | letter-spacing: 0.1em |
| KPI number | 18-28px | Sora 800 | |
| Financial table | 10pt | Inter 500 | tabular-nums always |

### Type Scale (Documents/PDF)
| Element | Size | Font |
|---------|------|------|
| Cover title | 32pt | Sora 800 |
| Document H1 | 14pt | Sora 700, accent underline |
| Document H2 | 11pt | Sora 600 |
| Body | 10.5pt | Inter 400 |
| Table header | 8.5pt | Inter 600, uppercase |
| Disclaimer | 7.5pt | Inter 400, muted |

---

## 4. BACKGROUNDS & TEXTURES

### Dot Grid (Global — on body via CSS)
| Mode | Opacity | Dot Size | Spacing |
|------|---------|----------|---------|
| Light desktop | 12% | 1.2px | 26px |
| Light mobile | 14% | 1.4px | 24px |
| Dark desktop | 10% | 1.2px | 26px |
| Dark mobile | 10% | 1.4px | 24px |

CSS: `radial-gradient(circle, rgba(0,0,0,0.12) 1.2px, transparent 1.2px)`

### Circuit Board Background (Landing Pages Only)
- **Light:** `rose gold bg.jpeg` — warm rose gold circuit pattern at **10% opacity**
- **Dark:** `GD.jpeg` — dark circuit with glowing nodes at **35% opacity**
- **Solid base layer** behind circuit image blocks the dot grid from showing
- **Center blur ellipse** on home page: radial gradient fade (75%×65% desktop, 85%×55% mobile) with 2.5px backdrop-blur for clean text reading area
- **Position: absolute** (NOT fixed) — Safari reads fixed elements for toolbar tinting
- **Not used on:** Chat page, canvas panels, tool views — only landing/journey pages

### For Marketing Materials
- Circuit board at 8-12% opacity behind hero sections
- Dot grid as tileable PNG for print (1.2px dots, 26px spacing)
- Always ensure clean reading zone behind text (center fade or solid overlay)

---

## 5. COMPONENTS

### Send Button
- Round circle: 46px (home hero), 42px (in-chat)
- **Empty:** Grey `#D8D8DA`, faded up-arrow, `pointer-events: none`
- **Has text:** Accent `#D44A78`, white up-arrow, clickable
- Arrow always points **UP** (not forward/right)
- Consistent across all three placements (home desktop, home mobile, in-chat)
- CSS `:not(:placeholder-shown)` triggers active state on hero inputs

### Buttons
| State | Style |
|-------|-------|
| **Primary** | `#D44A78` fill, white text, rounded-full (pill), 46px height |
| **Primary hover** | `#B03860` fill |
| **Disabled** | `#D8D8DA` fill, `rgba(0,0,0,0.3)` text |
| **Ghost** | Transparent, 1px border `rgba(0,0,0,0.08)` |
| **Ghost hover** | Border shifts to accent |

### Cards
- Light: `#FFFFFF` bg, 1px `#EEEEF0` border, 12-20px radius
- Dark: `#2F3133` bg, 1px `rgba(255,255,255,0.06)` border
- Shadow: `0 1px 4px rgba(0,0,0,0.05)` rest, `0 2px 8px rgba(0,0,0,0.07)` hover

### Inputs
- **Hero (home):** Pill shape (rounded-full), large padding
- **Forms:** 8-12px radius
- **Mobile:** 16px min font (prevents iOS zoom), 44px min height
- `inputMode="decimal"` for numeric inputs (triggers number keyboard)

### Financial Tables
- Header: uppercase 8.5pt labels, 2.5px `#D44A78` bottom border, `#F3F0EA` background
- Alternating rows: `#FAFAF8`
- Right-aligned numbers with `tabular-nums`
- Currency: `$1,234,567` (no cents for large numbers)

### Charts (Interactive + PDF)
- Primary data: `#D44A78`
- Secondary: `#E8709A`
- Background/base: `#F3F0EA`
- Grid lines: `rgba(0,0,0,0.04)`
- Labels: Inter 10-11px, `#6E6A63`
- Max 3-4 colors. No 3D. No rainbow. Source citation below.

### Range Sliders (Interactive Models)
- Track: 6px desktop, 8px mobile
- Thumb: 20px desktop, **28px mobile** (touch-friendly)
- Color: accent `#D44A78`
- Fill: accent gradient from left to current position
- 2px white border + subtle shadow on thumb

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

### Layout
- **Max width:** 860px chat, 960px tools/canvas, 1200px landing
- **Sidebar:** 80px icon rail, fixed left (desktop only, hidden on mobile)
- **Canvas split:** Resizable, default 42% canvas width
- **Mobile:** Single column, canvas as full-screen overlay with pill tabs

### Responsive Grids (Interactive Models)
- `grid-cols-5` → `grid-cols-2 sm:grid-cols-5` (KPI rows)
- `grid-cols-4` → `grid-cols-2 sm:grid-cols-4`
- `grid-cols-3` → `grid-cols-1 sm:grid-cols-3` (controls)
- `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` (panels)

---

## 7. ICONOGRAPHY

- **System:** Material Symbols Outlined (Google), 20px nav, 16-18px inline, weight 400
- **Logo icon:** `x.png` — sidebar 42px, mobile drawer 40px

### Needed Assets
- Favicon (32×32 from x.png)
- Apple touch icon (180×180)
- Open Graph image (1200×630)
- CMYK logo for print

---

## 8. MOTION & ANIMATION

| Element | Animation |
|---------|-----------|
| Sidebar X | 180° spin hover, 0.5s cubic-bezier(0.4,0,0.2,1), returns on leave |
| Dark mode toggle | Scale 1.1 hover, 0.95 active |
| Theme switch | 300ms `theme-transition` class for smooth color shift |
| Page transitions | `fadeOnly 0.25s` home, `slideUp 0.35s` journey |
| Buttons | `active:scale-95` press feedback |

### Rules
- Never `transition: all` — list properties
- Animate only `transform` and `opacity`
- Honor `prefers-reduced-motion`
- No bounce/elastic — this is finance

---

## 9. DARK MODE

| Light | Dark |
|-------|------|
| `#F9F9FC` bg | `#1A1C1E` |
| `#FFFFFF` card | `#2F3133` |
| `#1A1A18` text | `#F0F0F2` |
| `#6E6A63` muted | `#9A9A9E` |
| `#D44A78` accent | `#E8709A` |
| `#EEEEF0` border | `rgba(255,255,255,0.06)` |
| `#FAF8F4` cream | `#232527` |

### Safari Toolbar
- DarkModeToggle sets `body` + `html` background-color with `!important`
- Meta `theme-color` updated via `setAttribute` (not remove/recreate)
- Background layers on landing pages use `position: absolute` (not fixed)
- `color-scheme` meta updated for scrollbar/overscroll colors

---

## 10. DOCUMENT / PDF BRANDING

### Cover Page
- Solid base color + 5px accent stripe at top
- "smbx.ai" brand mark (Sora 800), document title (32pt)
- Date + "Confidential" footer

### Quality
- 3x deviceScaleFactor (288 DPI)
- Charts rendered via Chart.js CDN inside Puppeteer, converted to PNG before capture
- Google Fonts preloaded (Sora + Inter)
- All borders minimum 1.5px (prevents disappearing in PDF)
- `print-color-adjust: exact !important` on all elements
- Tables: rows never split, headers repeat on page breaks

---

## 11. BRAND VOICE & COPY

- Veteran M&A advisor: human, authoritative, specific
- Never: "Elevate", "Seamless", "Unleash", "Next-Gen", "Delve"
- Never: "small business" — smbx serves all deal sizes
- Never: "Contact Sales" → "Talk to Yulia"
- "smbx.ai" — lowercase smb, X is the logo mark
- "ValueLens" (not Bizestimate)
- Every drafted communication ends with "[Review and send when ready]"

---

## 12. FILE INVENTORY

### Active Assets (client/public/)
| File | Purpose | Transparent |
|------|---------|-------------|
| `final logo.png` | Primary hero logo (X + smbx.ai) | Yes (68%) |
| `x.png` | Sidebar/compact icon (X only) | Yes |
| `DG Trans.png` | Dark mode hero logo | Yes (80%) |
| `rose gold bg.jpeg` | Light circuit board background | N/A |
| `GD.jpeg` | Dark circuit board background | N/A |

### Deprecated (deleted — do not use)
GX.png, redx.png, x-logo.png, X2 Transaparant.png, TF3.png, TF3x.png, Fancy.png, F2.png, F3.png, sbs.png, sbs dark.jpeg/png, sbs trans.png, Personal.png, light bg.jpeg/png, dark bg.jpeg/png, Green BG.jpeg, Logo_transparent.png, logo-smbx.png, Animated_Logo_1.mp4, Animated_Logo_2.mp4, fancy.mp4, TF3.mp4
