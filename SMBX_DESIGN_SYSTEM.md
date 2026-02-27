# SMBX.ai Design System v12
## Source of Truth — Public Site & App Interface

This document defines every design token, component specification, and layout pattern used in smbx.ai. The public website and the authenticated app MUST use identical design language. There is no visual break between "landing on the site" and "using the tool."

---

## 1. TYPOGRAPHY

### Font Family
```
Primary (and only): Inter
Google Fonts: family=Inter:wght@400;500;600;700;800
CSS Variables:
  --serif: 'Inter', system-ui, sans-serif    (legacy name, maps to Inter)
  --sans:  'Inter', system-ui, -apple-system, sans-serif
```

**No serif fonts anywhere.** All previous references to DM Serif Display, Playfair Display, or Georgia are deprecated. Inter is the sole typeface across all weights and contexts.

### Font Weights
| Weight | Name        | Usage                                                    |
|--------|-------------|----------------------------------------------------------|
| 400    | Regular     | Body text, descriptions, placeholder text                |
| 500    | Medium      | Insight box text, Yulia message text, secondary emphasis |
| 600    | Semi-Bold   | Quote text, attribution, topbar links                    |
| 700    | Bold        | Card titles, section labels, deal type labels, strong    |
| 800    | Extra-Bold  | Headlines (h1), section headings (h3), logo, deal sizes  |

### Type Scale — Mobile (default, <768px)

| Element                  | Size  | Weight | Line-Height | Letter-Spacing | Color        |
|--------------------------|-------|--------|-------------|----------------|--------------|
| Homepage h1              | 44px  | 800    | 1.08        | -0.03em        | --text       |
| Homepage subtitle        | 20px  | 400    | 1.45        | normal         | --muted      |
| Journey h1               | 36px  | 800    | 1.1         | -0.02em        | --text       |
| Journey h1 `<em>`        | 36px  | 800    | 1.1         | -0.02em        | --terra      |
| Section label            | 14px  | 700    | normal      | 0.1–0.12em     | --terra      |
| Section h3               | 28px  | 800    | 1.15        | -0.015em       | --text       |
| Section h3 `<em>`        | 28px  | 800    | 1.15        | -0.015em       | --terra      |
| Journey subtitle         | 20px  | 400    | 1.5         | normal         | --text-mid   |
| Insight box text         | 18px  | 500    | 1.6         | normal         | --text       |
| Insight box `<strong>`   | 18px  | 700    | 1.6         | normal         | --text       |
| Card title (h4)          | 19px  | 700    | normal      | normal         | --text       |
| Card body (p)            | 17px  | 400    | 1.55        | normal         | --text-mid   |
| Deal size number         | 30px  | 800    | normal      | -0.02em        | --terra      |
| Deal type label          | 16px  | 700    | normal      | normal         | --text       |
| Deal result text         | 16px  | 400    | 1.45        | normal         | --text-mid   |
| Quote text               | 20px  | 600    | 1.5         | normal         | --text       |
| Quote attribution        | 15px  | 600    | normal      | normal         | --terra      |
| Action card label        | 18px  | 700    | 1.25        | normal         | --text       |
| Chat input               | 17px  | 400    | 1.5         | normal         | --text       |
| Input placeholder        | 17px  | 400    | 1.5         | normal         | --muted      |
| User message bubble      | 16px  | 400    | 1.5         | normal         | #FFFFFF      |
| Yulia message text       | 16px  | 500    | 1.65        | normal         | --text       |
| Topbar logo              | 26px  | 800    | normal      | -0.03em        | --text       |
| Topbar logo "x"          | 26px  | 800    | normal      | -0.03em        | --terra      |
| Back button text         | 15px  | 500    | normal      | normal         | --muted      |
| Tools popup title        | 15px  | 600    | 1.3         | normal         | --text       |
| Tools popup description  | 13px  | 400    | 1.4         | normal         | --muted      |
| Divider label (section)  | 14px  | 700    | normal      | 0.1em          | --terra      |

### Type Scale — Tablet (768px+)

| Element            | Size  | Weight | Notes                     |
|--------------------|-------|--------|---------------------------|
| Homepage h1        | 48px  | 800    | margin-bottom: 16px       |
| Journey h1         | 36px  | 800    | (unchanged)               |
| Section h3         | 26px  | 800    | (unchanged from desktop)  |
| Topbar logo        | 26px  | 800    | (unchanged)               |

### Type Scale — Desktop (1024px+)

| Element            | Size  | Weight | Notes                |
|--------------------|-------|--------|----------------------|
| Homepage h1        | 54px  | 800    |                      |
| Homepage subtitle  | 20px  | 400    | max-width: 480px     |
| Journey h1         | 40px  | 800    |                      |
| Section h3         | 26px  | 800    |                      |
| Topbar logo        | 28px  | 800    |                      |
| Chat input         | 18px  | 400    | min-height: 54px     |

### Text Rendering
```css
-webkit-font-smoothing: antialiased;
```

### Emphasis Pattern
- `<em>` tags render in **--terra color, normal style (not italic)**
- `<strong>` tags render in **font-weight: 700**
- No italic is used anywhere in the design system

---

## 2. COLOR PALETTE

### CSS Custom Properties
```css
:root {
  /* Backgrounds */
  --cream:       #FAF8F4;    /* Page background, topbar, dock */
  --fill:        #F3F0EA;    /* Hover states, plus button background */
  --white:       #FFFFFF;    /* Cards, message bubbles, input backgrounds */

  /* Brand */
  --terra:       #D4714E;    /* Primary accent — icons, labels, accents, buttons */
  --terra-hover: #BE6342;    /* Button hover state */
  --terra-soft:  #FFF0EB;    /* Subtle terra background, plus button hover */
  --terra-glow:  rgba(212, 113, 78, 0.12);  /* Focus ring glow */

  /* Text */
  --text:        #1A1A18;    /* Primary text — headlines, card titles, body */
  --text-mid:    #3D3B37;    /* Secondary text — card body, descriptions */
  --muted:       #6E6A63;    /* Tertiary text — subtitles, placeholders, back button */
  --faint:       #A9A49C;    /* Lowest emphasis — typing dots */

  /* Structure */
  --border:      #DDD9D1;    /* Dividers, dock top border, topbar border */
}
```

### Gradients
```css
/* Insight box background */
background: linear-gradient(135deg, #FFF8F4, #FFF0EB);
```

### Opacity / Transparency Patterns
```css
/* Card border */
rgba(212, 113, 78, 0.35)     /* Terra at 35% — dock card, hero card border */

/* Insight box inner border */
rgba(212, 113, 78, 0.06)     /* Terra at 6% — subtle inner edge */

/* Login button hover background */
rgba(212, 113, 78, 0.08)     /* Terra at 8% */

/* Focus glow ring */
rgba(212, 113, 78, 0.12)     /* Terra at 12% */
```

---

## 3. SHADOWS

```css
--shadow-sm:   0 1px 3px rgba(26, 26, 24, 0.06);
--shadow-card: 0 1px 4px rgba(26, 26, 24, 0.05);
--shadow-md:   0 2px 8px rgba(26, 26, 24, 0.07), 0 1px 2px rgba(26, 26, 24, 0.04);
--shadow-lg:   0 4px 20px rgba(26, 26, 24, 0.08), 0 1px 3px rgba(26, 26, 24, 0.05);
```

### Shadow Usage
| Shadow      | Used On                                           |
|-------------|---------------------------------------------------|
| --shadow-sm | Card active/pressed state                         |
| --shadow-card | All cards (journey, deal, quote, action, message) |
| --shadow-md | Card hover state, tools popup items               |
| --shadow-lg | Dock card, hero card, tools popup container        |

### Component-Specific Shadows
```css
/* Send button */
box-shadow: 0 2px 8px rgba(212, 113, 78, 0.3);

/* Yulia avatar */
box-shadow: 0 2px 6px rgba(212, 113, 78, 0.2);

/* User message bubble */
box-shadow: 0 2px 8px rgba(212, 113, 78, 0.2);
```

---

## 4. SPACING SYSTEM

### Page-Level Padding
| Context              | Mobile    | Tablet (768px+) | Desktop (1024px+) |
|----------------------|-----------|------------------|--------------------|
| Scroll inner padding | 0 20px    | 0 40px           | 0 48px             |
| Topbar padding       | 12px 20px | 14px 32px        | 16px 48px          |
| Dock padding         | 8px 20px  | 8px 20px         | 8px 20px           |
| Landing top padding  | 56px      | 72px             | 72px               |
| Journey top padding  | 28px      | 28px             | 28px               |

### Content Max-Widths
| Context              | Mobile | Tablet  | Desktop |
|----------------------|--------|---------|---------|
| Scroll inner         | 100%   | 860px   | 960px   |
| Dock inner           | 640px  | 640px   | 640px   |
| Message area         | 640px  | 640px   | 640px   |
| Action grid          | 100%   | 660px   | 720px   |
| Journey subtitle     | 560px  | 560px   | 560px   |
| Landing subtitle     | 360px  | 440px   | 480px   |

### Component Spacing
| Element                    | Value  |
|----------------------------|--------|
| Section margin-bottom      | 40px   |
| Divider margin             | 40px 0 |
| Insight box margin-bottom  | 40px   |
| Hero margin-bottom         | 36px   |
| Card gap (vertical stack)  | 14px   |
| Deal grid gap              | 14px   |
| Action grid gap            | 14px   |
| Message gap                | 16px   |
| Landing h1 → subtitle      | 20px   |
| Landing subtitle → grid    | 44px   |
| Section label → heading    | 14px   |
| Section heading → cards    | 18px   |
| Card title → body          | 10px   |
| Quote text → attribution   | 12px   |

---

## 5. BORDER RADIUS

| Component          | Radius |
|--------------------|--------|
| All cards          | 20px   |
| Dock card          | 20px   |
| Insight box        | 20px   |
| Quote card         | 20px   |
| Message bubbles    | 20px (with 6px on user's bottom-right) |
| Tools popup        | 16px   |
| Popup items        | 12px   |
| Buttons (round)    | 50% (send, plus, login, Yulia avatar) |

**Rule: Every card-like surface uses 20px radius. No exceptions.**

---

## 6. COMPONENTS

### 6.1 Topbar
```
Layout:      flex, space-between, align-center
Background:  --cream
Border:      1px solid transparent (visible in chat mode: --border)
Z-index:     20

Left side:   [Back button (hidden by default)] + Logo
Right side:  [Login icon button]

Logo:        "smbx.ai" — 26px/28px, weight 800, "x" in --terra
Back button: chevron-left SVG + "Home", 15px weight 500, --muted
Login:       Person SVG icon, 26×26, --text-mid, hover: --terra + rgba bg
```

### 6.2 Cards (Universal Pattern)
```
Background:    --white
Border:        none
Border-radius: 20px
Padding:       28px (journey cards, deal cards, quote, insight)
               28px 22px (action cards on mobile)
Box-shadow:    --shadow-card
Hover:         --shadow-md, translateY(-1px)
Active:        scale(0.97), --shadow-sm
```

### 6.3 Journey Card (j-card)
```
Title (h4):  19px, weight 700, --text
Body (p):    17px, weight 400, line-height 1.55, --text-mid
```

### 6.4 Deal Card (j-deal)
```
Padding:     26px
Size number: 30px, weight 800, --terra, letter-spacing -0.02em
Type label:  16px, weight 700, --text
Result text: 16px, weight 400, --text-mid, line-height 1.45
```

### 6.5 Insight Box
```
Background:    linear-gradient(135deg, #FFF8F4, #FFF0EB)
Border-radius: 20px
Padding:       28px
Box-shadow:    --shadow-card, inset 0 0 0 1px rgba(212,113,78,.06)
Margin-bottom: 40px

Yulia avatar:  28×28, border-radius 50%, bg --terra, color #fff
               font-size 11px, weight 700, margin-right 8px
               box-shadow: 0 2px 6px rgba(212,113,78,.2)
Text:          18px, weight 500, line-height 1.6, --text
Strong:        weight 700
```

### 6.6 Quote Card
```
Background:    --white
Border-radius: 20px
Padding:       28px
Box-shadow:    --shadow-card

Quote text:    20px, weight 600, line-height 1.5, --text, NOT italic
Attribution:   15px, weight 600, --terra
```

### 6.7 Section Label
```
Font-size:      14px
Font-weight:    700
Letter-spacing: 0.1em (journey sections) or 0.12em (hero label)
Text-transform: uppercase
Color:          --terra
Margin-bottom:  14px
```

### 6.8 Divider
```
Width:      40px
Height:     1px
Background: --border
Margin:     40px 0
```

### 6.9 Action Cards (Homepage Grid)
```
Grid:          2 columns, gap 14px
               4 columns on desktop (1024px+)
Border-radius: 20px
Padding:       28px 22px (mobile), 22px 18px (tablet), 24px 20px (desktop)
Icon:          32px × 32px, --terra (24px on desktop)
Label:         18px, weight 700 (16px on desktop)
```

### 6.10 Chat Input (Dock)
```
Position:      fixed, left 0, right 0, bottom 0
Z-index:       30
Background:    --cream
Border-top:    1px solid --border
Padding:       8px 20px, bottom: max(8px, env(safe-area-inset-bottom))

Card:          --white bg, 1.5px border rgba(212,113,78,.35), radius 20px, --shadow-lg
Focus:         border --terra, shadow-lg + 0 0 0 4px --terra-glow

Textarea:      17px (18px desktop), --text, --muted placeholder
               min-height 50px (54px desktop), max-height 140px
               padding: 14px 52px 14px 50px (with plus button)

Send button:   36×36, radius 50%, --terra bg, #fff icon
               opacity 0 → 1 when text present
               hover: --terra-hover
               shadow: 0 2px 8px rgba(212,113,78,.3)

Plus button:   36×36, radius 50%, --fill bg, --terra icon
               hover: --terra-soft bg
               icon rotates 45° when popup open
```

### 6.11 Message Bubbles
```
User message:
  align-self:    flex-end
  max-width:     82%
  background:    --terra-soft (#FFF0EB)
  border:        1px solid rgba(212, 113, 78, 0.2)
  color:         --text (#1A1A18)
  padding:       14px 18px
  border-radius: 20px 20px 6px 20px
  font-size:     16px, line-height 1.5

Yulia message:
  align-self:    flex-start
  max-width:     90%

  Avatar:        32×32, radius 50%, --terra bg, #fff text
                 12px weight 700, shadow 0 2px 6px rgba(212,113,78,.2)
                 margin-bottom: 8px

  Bubble:        --white bg, radius 20px, padding 16px 18px
                 --shadow-card
                 16px, weight 500, line-height 1.65
                 <p> margin-bottom: 12px (last-child: 0)
                 <strong> weight 700
```

### 6.12 Tools Popup
```
Position:      absolute (below trigger by default, above for dock)
Background:    --white
Border-radius: 16px
Box-shadow:    --shadow-lg
Padding:       6px
Z-index:       10

Items:         flex row, gap 12px, padding 14px 16px, radius 12px
               hover: --fill bg
               active: #EBE7DF bg
Icon:          20×20, --terra
Title:         15px, weight 600, --text
Description:   13px, weight 400, --muted
```

### 6.13 Typing Indicator
```
Three dots:    8×8 each, radius 50%, --faint bg
Gap:           5px
Animation:     dp 1.4s ease infinite (staggered by .15s)
               opacity 0.3 → 1, scale 0.8 → 1
```

### 6.14 Sidebar
```
Layout:        flex column, height 100%, width 280px
Background:    --cream
Border-right:  1px solid --border

Header:        flex row, justify-end, padding 16px 16px 8px
  No logo (logo lives in the topbar).
  New Chat:    36×36 circle, --fill bg, --terra icon (plus), hover: --terra-soft bg

Sections:
  Active Deals:
    Label:     11px, weight 700, uppercase, letter-spacing 0.1em, --terra
    Items:     journey dot (8×8, colored by journey) + title (13px weight 600)
               + gate badge + timestamp
    Badge:     10px, weight 700, --terra text, --terra-soft bg, border-radius 4px
  Recent:
    Label:     11px, weight 700, uppercase, letter-spacing 0.1em, --muted
    Items:     optional journey dot + title (13px weight 500, --text-mid)
               + timestamp (12px, --faint)

Item states:
  Default:     transparent bg
  Hover:       rgba(243, 240, 234, 0.6)
  Active:      --fill (#F3F0EA)
  Radius:      12px, padding 8-10px

Footer:        border-top --border, padding 12px 16px
  Avatar:      28×28 circle, --fill bg, initial letter
  Name:        13px, weight 500, --text
  Sign out:    12px, weight 500, --muted, no bg

No navigation links in sidebar. Pipeline, Intel, Sourcing, Data Room
live in the topbar only.
```

### 6.15 Topbar Navigation (Authenticated)
```
Text-only links (no pill backgrounds, no icons).
Font-size:     14px
Font-weight:   600
Letter-spacing: -0.01em
Color:         --text-mid (#3D3B37)
Hover:         --terra (#D4714E)
Transition:    color 0.2s
Padding:       8px 14px
Border-radius: 8px (for focus outline only)

Items: Pipeline, Intel, Sourcing, Data Room
Active state: --terra color (text turns terra when panel is open)
Utility icons (notification bell, settings gear, wallet) remain as
small circles. Settings gear also toggles --terra when active.

Topbar links toggle canvas panels alongside chat (not separate routes).
Clicking an active link closes its panel.
```

### 6.16 Canvas Panels (Pipeline, Intel, Sourcing, Settings, Data Room)
```
Architecture:   Tool pages are NO LONGER standalone routes.
                They render as resizable side panels alongside the chat.
                Chat is always the base layer — it never goes away.

Layout:         [Sidebar] [Chat Column] [ResizeHandle] [Canvas Panel]
                Desktop: side-by-side with drag-to-resize handle
                Mobile:  canvas opens as full-screen overlay (z-index 50)

CanvasShell:    Wrapper for all panel content
  Header:       flex row, space-between, border-bottom --border
                Title: 14px weight 600 --text, truncated
                Subtitle: 12px --muted
                Buttons: fullscreen toggle + close (7×7 circles, --muted → --text on hover)

ResizeHandle:   4px wide, --border bg, hover: --terra bg
                Cursor: col-resize
                Min width: 320px, max width: 60% of container
                Default width: 480px
                Grip dots: 3 vertical dots, visible on hover

Fullscreen:     Hides sidebar + chat, canvas fills entire width
                Toggle via expand/collapse icon in CanvasShell header
                Mobile: always fullscreen (no resize handle)

Panel bg:       --white (panels render inside CanvasShell)
Inner cards:    --cream bg (#FAF8F4) instead of white-on-white
                This inverts the card pattern: cream cards on white canvas

Auto-behaviors:
  - Opening canvas closes mobile sidebar
  - Switching panels resets fullscreen to off
  - Opening a deliverable viewer replaces the active canvas content
  - Chat message area narrows (max-w-640px) when canvas is open
```

---

## 7. LAYOUT ARCHITECTURE

### App Shell
```
.app {
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

Structure:
  [Topbar]        — flex-shrink: 0
  [Scroll Area]   — flex: 1, overflow-y: auto
  [Dock]          — position: fixed, bottom: 0
```

### Scroll Area
```
flex: 1
overflow-y: auto
-webkit-overflow-scrolling: touch
overscroll-behavior-y: contain
padding-bottom: 80px (when dock is active — prevents content from hiding behind dock)
```

### Content Inner
```
padding: 0 20px (mobile)
padding: 0 40px (tablet), max-width: 860px, margin: 0 auto
padding: 0 48px (desktop), max-width: 960px
```

### Journey Cards Layout
```
Mobile:  single column, flex-direction column, gap 14px
Tablet+: 3-column grid, gap 12px
```

### Deal Cards Layout
```
Mobile:  2-column grid, gap 14px
Tablet+: 4-column grid, gap 12px
```

---

## 8. ANIMATIONS

### Fade Up (fu) — Page Entry
```css
@keyframes fu {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
Duration: 0.4s ease
Stagger:  h1 at 0s, subtitle at 0.06s, grid at 0.18s
```

### Slide In (si) — Messages
```css
@keyframes si {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
Duration: 0.3s–0.35s ease
```

### Typing Dots (dp)
```css
@keyframes dp {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40%           { opacity: 1;   transform: scale(1); }
}
Duration: 1.4s ease infinite
Stagger:  dot 1 at 0s, dot 2 at 0.15s, dot 3 at 0.3s
```

### Transition Patterns
```css
/* Card hover */
transition: all 0.2s;

/* Dock show/hide */
transition: opacity 0.3s, transform 0.3s;

/* Topbar border appearance */
transition: border-color 0.3s;

/* Landing fade-out */
transition: opacity 0.3s ease, transform 0.3s ease;

/* Landing fade-out state */
.landing.out { opacity: 0; transform: translateY(-10px); pointer-events: none; }

/* Send button appearance */
transition: all 0.2s;
/* Hidden: opacity 0, scale(0.8) → Visible: opacity 1, scale(1) */

/* Plus button icon rotation */
transition: transform 0.2s;
/* Closed: rotate(0) → Open: rotate(45deg) */
```

---

## 9. RESPONSIVE BREAKPOINTS

```
Mobile:   < 768px  (default styles)
Tablet:   ≥ 768px  (@media min-width: 768px)
Desktop:  ≥ 1024px (@media min-width: 1024px)
```

### Key Changes at 768px
- Topbar padding increases
- Scroll inner gets max-width and centering
- Journey cards switch from single column to 3-column grid
- Deal cards switch from 2-column to 4-column grid
- Homepage h1 scales to 48px

### Key Changes at 1024px
- Topbar padding increases again
- Homepage h1 scales to 54px
- Action grid switches to 4 columns
- Action card icons shrink to 24px, text to 16px
- Logo scales to 28px
- Chat input font scales to 18px

---

## 10. INTERACTION STATES

### Cards
```
Default:  --shadow-card
Hover:    --shadow-md, translateY(-1px)
Active:   scale(0.97), --shadow-sm
```

### Dock Card (Input)
```
Default:  1.5px border rgba(212,113,78,.35), --shadow-lg
Focus:    border-color --terra, shadow-lg + 0 0 0 4px --terra-glow
```

### Buttons
```
Send button:
  Default:  --terra bg
  Hover:    --terra-hover bg
  Active:   scale(0.9)

Plus button:
  Default:  --fill bg, --terra color
  Hover:    --terra-soft bg
  Active:   scale(0.9)

Login button:
  Default:  transparent bg, --text-mid color
  Hover:    rgba(212,113,78,.08) bg, --terra color
  Active:   scale(0.92)

Back button:
  Default:  --muted color
  Hover:    --terra color
```

---

## 11. Z-INDEX LAYERS

| Layer        | Z-Index | Component                    |
|--------------|---------|------------------------------|
| Dock         | 30      | Fixed bottom input           |
| Topbar       | 20      | Fixed top navigation         |
| Tools popup  | 10      | Floating above input card    |

---

## 12. SAFE AREA HANDLING

```css
/* Dock bottom padding respects iPhone notch/home indicator */
padding-bottom: max(8px, env(safe-area-inset-bottom));

/* Full viewport height including dynamic address bar */
height: 100dvh;
```

---

## 13. ICON SPECIFICATIONS

### Icon Style
- All icons are **stroke-based SVGs** (not filled)
- stroke-width: 2
- stroke-linecap: round
- stroke-linejoin: round
- Color: --terra (in cards and buttons) or currentColor

### Icon Sizes
| Context          | Size   |
|------------------|--------|
| Action card      | 32×32 (mobile), 24×24 (desktop) |
| Tools popup      | 20×20  |
| Send button      | 16×16  |
| Plus button      | 18×18  |
| Back chevron     | 18×18  |
| Login icon       | 26×26  |
| Yulia avatar (insight) | 28×28  |
| Yulia avatar (message) | 32×32  |

---

## 14. CRITICAL RULES

1. **One font: Inter.** No serif fonts, no secondary typefaces, no system font fallbacks visible to users.

2. **Cards are 20px radius everywhere.** Journey cards, deal cards, quotes, insights, action cards, dock card, message bubbles — all 20px.

3. **Padding is 28px on cards.** This is the Bose-inspired generous whitespace rule. Cards never feel cramped.

4. **Section labels are always uppercase --terra at 14px weight 700.** This is the consistent wayfinding pattern.

5. **Headlines are weight 800.** h1 and h3 headings use extra-bold. No lighter headline weights.

6. **Body text is 17px on cards.** Not 14px, not 15px. 17px minimum for readability on mobile.

7. **--terra is the only accent color.** No blues, no greens, no secondary accents. Terra and its variants (hover, soft, glow) handle all accent needs.

8. **--cream is the page background.** Not white. The warm cream (#FAF8F4) is the canvas. Cards are white (#FFFFFF) to float above it.

9. **No italic anywhere.** `<em>` tags change color to --terra, not font-style. This is a deliberate design choice.

10. **The dock is always fixed at the bottom.** Position fixed, z-index 30, above everything. Same pattern on every page, public or authenticated.

11. **The transition from public site to app is invisible.** Same colors, same fonts, same component patterns, same spacing. The user should never feel they've "entered" a different product.

---

## 15. APPLYING THIS IN THE REACT APP

When implementing in the React + Tailwind codebase:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        cream:       '#FAF8F4',
        fill:        '#F3F0EA',
        terra:       '#D4714E',
        'terra-hover': '#BE6342',
        'terra-soft': '#FFF0EB',
        'text-primary': '#1A1A18',
        'text-mid':  '#3D3B37',
        muted:       '#6E6A63',
        faint:       '#A9A49C',
        border:      '#DDD9D1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'popup': '16px',
        'popup-item': '12px',
      },
      boxShadow: {
        'sm':   '0 1px 3px rgba(26, 26, 24, 0.06)',
        'card': '0 1px 4px rgba(26, 26, 24, 0.05)',
        'md':   '0 2px 8px rgba(26, 26, 24, 0.07), 0 1px 2px rgba(26, 26, 24, 0.04)',
        'lg':   '0 4px 20px rgba(26, 26, 24, 0.08), 0 1px 3px rgba(26, 26, 24, 0.05)',
      },
    }
  }
}
```

---

*This document is the single source of truth for all visual decisions in smbx.ai. Any component, page, or feature — public or authenticated — must conform to these specifications. When in doubt, reference the live prototype: smbx-homepage-v12.html.*
