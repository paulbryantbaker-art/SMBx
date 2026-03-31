# smbx.ai — Complete UI & Brand Style Guide
## For marketing materials, presentations, documents, and all external assets
## Last updated: March 30, 2026

---

## 1. LOGO SYSTEM

### Primary Logo (Side-by-Side)
- **File:** `final logo.png` (1360×476, transparent PNG)
- **Usage:** Hero placements, presentations, marketing headers
- **Style:** 3D gradient X mark + "smbx.ai" text in metallic gradient
- **Gradient direction:** Purple (#6B2FA0) → Hot Pink (#D44A78) → Orange/Gold (#F0A030), flows top-left to bottom-right
- **Minimum clear space:** Half the X height on all sides
- **Minimum size:** 120px wide for digital, 1.5" for print

### Icon Mark (X Only)
- **File:** `x.png` (500×500, transparent PNG)
- **Usage:** Favicons, app icons, sidebar, compact spaces, social avatars
- **Style:** Same gradient as primary logo
- **Minimum size:** 24px for digital, 0.25" for print

### Logo Don'ts
- Never change the gradient colors
- Never rotate the logo
- Never add effects (shadows, outlines, bevels) beyond what's built in
- Never place on busy backgrounds without sufficient contrast
- Never stretch or distort proportions
- Never use the old rose gold/crimson X marks — those are deprecated

### Logo on Backgrounds
- **Light backgrounds:** Logo has built-in drop shadow, works on any light surface
- **Dark backgrounds:** Use `DG Trans.png` (dark-optimized transparent version) or primary logo
- **Colored backgrounds:** Avoid — logo gradient conflicts with most colored surfaces
- **Over photography:** Place on a semi-transparent dark or light overlay first

---

## 2. COLOR PALETTE

### Primary Accent (from logo gradient)
| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#D44A78` | Buttons, active states, accent text, send button, links, highlighted data |
| **Dark Mode** | `#E8709A` | Same uses on dark backgrounds — lighter for legibility |
| **Hover/Pressed** | `#B03860` | Button hover, pressed states |

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| **Light page bg** | `#F9F9FC` | All light mode page backgrounds, body |
| **Dark page bg** | `#1A1C1E` | All dark mode page backgrounds |
| **Light card bg** | `#FFFFFF` | Cards, inputs, chat bubbles, modals |
| **Dark card bg** | `#2F3133` | Cards on dark backgrounds |
| **Cream/warm** | `#FAF8F4` | Callout boxes, alternate section backgrounds |
| **Sidebar light** | `#FFFFFF` | Desktop sidebar rail background |
| **Sidebar dark** | `#09090B` (zinc-950) | Desktop sidebar dark mode |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| **Primary text** | `#1A1A18` | All body text, headings (light mode) |
| **Dark mode text** | `#F0F0F2` | All body text (dark mode) |
| **Secondary text** | `#44403C` | Subheadings, labels |
| **Muted text** | `#6E6A63` | Captions, footnotes, meta info |
| **Light text** | `#A9A49C` | Timestamps, attribution, disabled text |
| **Placeholder** | `#5A4044` | Input placeholder text |

### Borders & Dividers
| Token | Hex | Usage |
|-------|-----|-------|
| **Card border** | `#EEEEF0` | Card outlines, section dividers |
| **Input border** | `rgba(0,0,0,0.06)` | Input fields, dock outlines |
| **Accent border** | `#E3BDC3` | Chat dock border (rose-tinted) |
| **Dark mode border** | `rgba(255,255,255,0.06)` | Dark mode dividers |

### Status Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Green (success)** | `#34A853` | SBA eligible, passing DSCR, positive indicators |
| **Yellow (warning)** | `#FBBC04` | Marginal, near-threshold |
| **Red (error)** | `#EA4335` | Below threshold, risk, negative indicators |

### Color Rules
- **Primary accent is functional only** — buttons, active states, highlighted data numbers. Never decorative backgrounds.
- **Never use the accent color as a large background fill** — it's too vibrant. Use at text/icon scale.
- **Gradients:** Only the logo uses the purple-to-gold gradient. UI elements use flat accent color.
- **Dark mode:** Everything shifts — backgrounds darken, text lightens, accent shifts to `#E8709A`. Never use light-mode colors on dark backgrounds.

---

## 3. TYPOGRAPHY

### Font Stack
| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| **Headlines** | Sora | 800 (ExtraBold) | system-ui, sans-serif |
| **Section heads** | Sora | 600-700 | system-ui, sans-serif |
| **Body text** | Inter | 400 (Regular) | system-ui, sans-serif |
| **Medium text** | Inter | 500 (Medium) | system-ui, sans-serif |
| **Semibold text** | Inter | 600 (Semibold) | system-ui, sans-serif |
| **Financial data** | Inter | 500, tabular-nums | system-ui, sans-serif |

### Type Scale (App)
| Element | Size | Weight | Leading | Tracking |
|---------|------|--------|---------|----------|
| Page title | 50px desktop / 36px mobile | Sora 800 | 1.05 | -0.03em (tighter) |
| Section heading | 14pt | Sora 700 | 1.25 | normal |
| Subsection | 11pt | Sora 600 | 1.25 | normal |
| Body | 10.5pt / 14-15px | Inter 400 | 1.55-1.6 | normal |
| Caption/meta | 10-11px | Inter 400-500 | 1.4 | normal |
| Label (uppercase) | 9-10px | Inter 600-700 | 1.2 | 0.1em (wide) |
| Financial table | 10pt | Inter 500 | 1.4 | tabular-nums |
| KPI number | 18-28px | Sora 800 | 1.1 | tight |

### Type Scale (Documents/PDF)
| Element | Size | Font |
|---------|------|------|
| Cover title | 32pt | Sora 800 |
| Cover subtitle | 16pt | Inter 400 |
| Document H1 | 14pt | Sora 700, terra underline |
| Document H2 | 11pt | Sora 600 |
| Body | 10.5pt | Inter 400 |
| Table header | 8.5pt | Inter 600, uppercase |
| Table cell | 10pt | Inter 400 |
| Footnote | 7.5pt | Inter 400 |
| Disclaimer | 7.5pt | Inter 400, muted |

### Typography Rules
- **Headlines:** Sora ExtraBold, tight tracking (-0.03em), reduced line-height (1.05)
- **Body:** Inter Regular, relaxed line-height (1.55-1.6), max ~65ch width for readability
- **Financial data:** Always use `font-variant-numeric: tabular-nums` for aligned columns
- **Uppercase labels:** 9-10px, 600-700 weight, letter-spacing 0.1em
- **Never use more than 3 type sizes on one screen** — title, body, caption
- **Orphaned words:** Use `text-wrap: balance` on headlines

---

## 4. BACKGROUNDS & TEXTURES

### Dot Grid (Global)
- **Light mode:** `radial-gradient(circle, rgba(0,0,0,0.12) 1.2px, transparent 1.2px)`, 26px spacing
- **Dark mode:** `radial-gradient(circle, rgba(255,255,255,0.10) 1.2px, transparent 1.2px)`, 26px spacing
- **Mobile light:** 14% opacity, 1.4px dots, 24px spacing
- **Mobile dark:** 10% opacity, 1.4px dots, 24px spacing
- **Applied to:** `<body>` via CSS — shows on all pages where content doesn't cover it
- **Purpose:** Subtle texture that prevents flat-white/flat-black monotony

### Circuit Board Background (Landing Pages)
- **Light:** `rose gold bg.jpeg` — warm rose gold circuit board pattern at 10% opacity
- **Dark:** `GD.jpeg` — dark circuit board with glowing rose nodes at 35% opacity
- **Placement:** Absolute-positioned behind landing page content (home + journey pages)
- **Center treatment:** Radial gradient ellipse fades the center for clean text reading area
- **Not used on:** Chat page, canvas panels, tool views

### For Marketing Materials
- Use the circuit board pattern at 8-15% opacity behind hero sections
- The light version works on white/cream backgrounds
- The dark version works on dark navy/black backgrounds
- Always ensure text has a clean reading zone (center fade or solid overlay behind text)
- The dot grid can be recreated as a tileable PNG for print materials

---

## 5. COMPONENTS

### Buttons
| State | Style |
|-------|-------|
| **Primary (active)** | `#D44A78` fill, white text, rounded-full (pill shape), 46px height |
| **Primary hover** | `#B03860` fill |
| **Disabled/empty** | `#D8D8DA` fill, `rgba(0,0,0,0.3)` text, pointer-events: none |
| **Ghost** | Transparent, border 1px `rgba(0,0,0,0.08)`, text color primary |
| **Ghost hover** | Border shifts to accent color |

### Send Button
- Round circle (46px home, 42px in-chat)
- **Empty state:** Grey `#D8D8DA`, faded up-arrow
- **Has text:** Accent `#D44A78`, white up-arrow
- Arrow always points UP (not forward/right)

### Cards
- `#FFFFFF` background (light), `#2F3133` (dark)
- Border: `1px solid #EEEEF0` (light), `1px solid rgba(255,255,255,0.06)` (dark)
- Border-radius: 12-20px (larger radius = more premium)
- Shadow: `0 1px 4px rgba(0,0,0,0.05)` resting, `0 2px 8px rgba(0,0,0,0.07)` hover

### Input Fields
- Rounded-full (pill) for hero inputs
- Rounded-lg (8-12px) for form inputs
- Border: `1px solid rgba(0,0,0,0.08)`, accent on focus
- 16px minimum font size on mobile (prevents iOS zoom)
- 44px minimum height on mobile for touch targets

### Financial Tables
- Header: uppercase labels, 8.5pt, accent underline (2.5px `#D44A78`)
- Alternating rows: `#FAFAF8` tint
- Right-aligned numbers with `tabular-nums`
- Currency format: `$1,234,567` (no cents for large numbers)
- Negatives in parentheses for financial contexts

### Charts
- Primary data color: `#D44A78` (accent)
- Secondary: `#E8709A` (lighter accent)
- Background/base: `#F3F0EA` (cream)
- Grid lines: `rgba(0,0,0,0.04)`
- Text on charts: Inter 10-11px, `#6E6A63`
- Max 3-4 colors per chart
- No 3D effects, no rainbow palettes
- Always cite data source below chart

---

## 6. SPACING & LAYOUT

### Spacing Scale
| Token | Size | Usage |
|-------|------|-------|
| xs | 4px | Tight gaps (icon-to-text) |
| sm | 8px | Element padding, small gaps |
| md | 16px | Section padding, card padding |
| lg | 24px | Section gaps |
| xl | 32px | Major section spacing |
| 2xl | 48px | Hero spacing, page sections |

### Layout
- **Max content width:** 860px for chat, 960px for tools/canvas, 1200px for landing pages
- **Desktop sidebar:** 80px icon rail, fixed left
- **Chat + Canvas split:** Resizable, default 42% canvas width
- **Mobile:** Single column, full width, canvas as overlay

### Whitespace Rules
- White space is a feature — generous spacing = premium feel
- Double the padding you think you need for hero sections
- Cards should breathe — `p-4` minimum, `p-6` preferred
- Between sections: `py-24` to `py-40`

---

## 7. ICONOGRAPHY

### System
- **Icon set:** Material Symbols Outlined (Google)
- **Default size:** 20px in navigation, 16-18px inline
- **Weight:** 400 (default variation)
- **Color:** Inherits from parent text color

### Logo Icon Usage
| Context | File | Size |
|---------|------|------|
| Sidebar (desktop) | `x.png` | 38×38px |
| Mobile drawer | `x.png` via LogoIcon | 40px |
| Empty canvas state | LogoImg | 36px |
| Favicon | Needs generation from `x.png` | 32×32 |
| Apple touch icon | Needs generation from `x.png` | 180×180 |

---

## 8. MOTION & ANIMATION

### Principles
- **Functional only** — animation serves a purpose (transition, feedback, attention)
- **Fast** — 200-300ms for UI transitions, 500ms max for page transitions
- **Ease curves:** `cubic-bezier(0.4, 0, 0.2, 1)` for standard, spring for interactive

### Specific Animations
| Element | Animation |
|---------|-----------|
| Sidebar X logo | 180° rotation on hover, 0.5s cubic-bezier, returns on mouse leave |
| Dark mode toggle | Scale 1.1 hover, 0.95 active |
| Page transitions | `fadeOnly 0.25s` for home, `slideUp 0.35s` for journey pages |
| Chat morph | CSS animation (not router navigation) to prevent remount |
| Theme toggle | 300ms `theme-transition` class for smooth color shift |
| Buttons | `active:scale-95` for tactile press feedback |

### Motion Rules
- Never use `transition: all` — list properties explicitly
- Animate only `transform` and `opacity` for GPU acceleration
- Honor `prefers-reduced-motion`
- Loading states: skeleton loaders matching layout, not spinners
- No bounce effects, no elastic — this is finance, not a game

---

## 9. DARK MODE

### Color Mapping
| Light | Dark |
|-------|------|
| `#F9F9FC` (bg) | `#1A1C1E` |
| `#FFFFFF` (card) | `#2F3133` |
| `#1A1A18` (text) | `#F0F0F2` |
| `#6E6A63` (muted) | `#9A9A9E` |
| `#D44A78` (accent) | `#E8709A` |
| `#EEEEF0` (border) | `rgba(255,255,255,0.06)` |
| `#FAF8F4` (cream) | `#232527` |

### Dark Mode Rules
- Never use pure `#000000` — always `#1A1C1E` or darker grays
- Accent color lightens in dark mode (not darkens)
- Shadows use higher opacity in dark mode
- Dot grid at 10% white (not 12% black)
- Safari toolbar must match: `#1A1C1E` dark, `#F9F9FC` light

---

## 10. DOCUMENT / PDF BRANDING

### Cover Page
- Solid base color (`#FAF8F4` light / `#1A1C1E` dark)
- 5px accent stripe at top (`#D44A78`)
- "smbx.ai" brand mark centered (Sora 800)
- Document title (Sora 800, 32pt)
- Date + "Confidential" at bottom

### Headers & Footers
- Header: "smbx.ai" left, page number right, 1.5px accent rule below
- Footer: "Confidential — Prepared by smbx.ai" centered

### Financial Tables in Documents
- Header row: cream bg `#F3F0EA`, 2.5px accent bottom border
- Alternating rows: `#FAFAF8`
- Right-aligned numbers, tabular-nums
- No vertical borders — horizontal only
- Source citation below table in 7.5pt muted text

### Charts in Documents
- Rendered at 3x DPI (288 effective DPI)
- Canvas→PNG conversion for reliable PDF rendering
- Same color rules as interactive charts
- Caption below in 8.5pt muted text

---

## 11. SOCIAL MEDIA & MARKETING

### Brand Voice
- Sounds like a veteran M&A advisor: human, authoritative, specific
- Never AI-marketing-speak ("Elevate", "Seamless", "Unleash")
- Never "small business" — smbx serves all deal sizes
- "Talk to Yulia" replaces "Contact Sales" everywhere
- "smbx.ai" (lowercase smb, X is the logo mark, .ai is the domain)

### Social Avatar
- Use `x.png` on solid backgrounds
- Light bg: `#F9F9FC` behind the X
- Dark bg: `#1A1C1E` behind the X

### Presentation Slides
- Background: circuit board pattern at 8-12% opacity
- Dot grid: recreate as 1920×1080 tileable PNG
- Title slides: logo centered, document title below, accent stripe
- Content slides: Sora headings, Inter body, accent for callout numbers
- Charts: same styling as app (accent primary, cream base, muted grid)

### Print Materials
- CMYK equivalents needed for accent color (approximately C:5 M:75 Y:40 K:0)
- Minimum logo size: 1.5" wide
- Bleed: 0.125" on all sides
- Paper: uncoated stock for premium feel

---

## 12. FILE INVENTORY

### Current Assets (client/public/)
| File | Purpose | Transparent |
|------|---------|-------------|
| `final logo.png` | Primary logo (X + smbx.ai side-by-side) | Yes (68%) |
| `x.png` | Icon mark (X only) for sidebar/compact | Yes |
| `DG Trans.png` | Dark mode logo variant | Yes (80%) |
| `rose gold bg.jpeg` | Light circuit board background | N/A (jpeg) |
| `GD.jpeg` | Dark circuit board background | N/A (jpeg) |
| `TF3.png` | Alternate stacked logo (X above smbx.ai) | Yes |

### Needed Assets (not yet created)
- Favicon (32×32 from x.png)
- Apple touch icon (180×180 from x.png)
- Open Graph image (1200×630 for social sharing)
- Tileable dot grid PNG (for print/presentations)
- CMYK versions of logo for print
