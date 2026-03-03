# smbX.ai — Public Pages UI Style Guide

This is the complete design language for the 5 public content pages (Home, Sell, Buy, Advisors, Pricing). Any new page or revision MUST follow these rules exactly.

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Page background | `#FDFCFB` | Outermost wrapper on every page |
| Section alternate bg | `#F8F6F1` | Alternating sections (infographic, empowerment) |
| White | `#FFFFFF` | Cards, ticker bar, empowerment inner card |
| Primary text | `#1A1A18` | Headlines, body text, strong emphasis |
| Secondary text | `#6E6A63` | Body paragraphs, descriptions, supporting copy |
| Muted/label text | `#A9A49C` | Overlines, section labels, "Powered By" |
| Terra cotta (brand accent) | `#D4714E` | Headlines accent, buttons, badges, icons, sparkle |
| Terra cotta hover | `#b8613d` | Button hover state |
| Terra cotta light bg | `#FFF0EB` | Hero pill background, step number circles, highlight spans |
| Terra cotta light border | `#FBE3D9` | Hero pill border |
| Orange-100 (on terra bg) | `text-orange-100` | Subtitle text on terra cotta background cards |
| Border color | `#EAE6DF` | All card borders, section dividers, ticker borders |
| Card inner bg | `#FDFCFB` | Inner cards (outcome cards, step cards, chat preview inner) |
| Green success | `text-green-600` / `bg-green-50` | Checkmark callouts, positive indicators |
| Amber warning | `text-amber-600` / `bg-amber-50` | Warning/attention callouts |
| Red negative | `text-red-700` | Negative financial numbers (e.g., debt service) |

## Typography

- **No SVG icons anywhere.** All visual indicators use typography characters only.
- **Font stack:** System sans-serif (`font-sans` — Tailwind default). No custom fonts loaded.
- **Sparkle character:** `✧` (Unicode 10023 / `&#10023;`) — used in InputDock only, rendered in `font-serif`
- **Dot separator:** `·` (`&middot;`) — used in trust ticker
- **Numbered items:** Plain `01`, `02`, `1`, `2`, `3` text — NOT circled unicode numbers
- **Checkmark:** `✓` (literal Unicode character) — NOT `&check;` HTML entity
- **Warning:** `!` (exclamation mark)
- **Quotation marks:** `"` and `"` (`&ldquo;` / `&rdquo;`) wrapping suggestion chip text
- **Dollar/percent:** `$` and `%` as icon replacements in circle badges
- **Brand logo in text:** `smb` + `<span className="text-[#D4714E]">X</span>` + `.ai`
- **Letter avatar:** `Y` for Yulia, `X` for smbX branding

### Type Scale

| Element | Classes |
|---------|---------|
| Hero headline | `text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05]` |
| Section headline (h2) | `text-4xl md:text-5xl font-bold` or `text-3xl md:text-4xl font-bold` |
| Card headline (h3) | `text-2xl font-bold` or `text-xl font-bold` |
| Step title (h4) | `text-xl font-bold` |
| Hero subtitle | `text-xl md:text-2xl text-[#6E6A63] font-medium leading-relaxed` |
| Body text | `text-[16px] leading-relaxed` or `text-[15px] leading-relaxed` |
| Small body | `text-sm leading-relaxed` (14px) |
| Overline/label | `text-sm font-bold text-[#A9A49C] uppercase tracking-widest` |
| Badge/tag | `text-xs font-bold` or `text-xs font-black uppercase tracking-widest` |
| Mono (financial tables) | `font-mono text-sm` |

---

## Page Structure (Every Page Follows This)

Every content page is a `<div>` with `className="bg-[#FDFCFB] text-[#1A1A18] font-sans relative selection:bg-[#D4714E] selection:text-white pb-32 min-h-screen"`.

The `pb-32` provides clearance for the floating InputDock (which is rendered separately by AppShell — **content pages must NOT render the dock**).

### Standard Section Order

1. **Hero** — `bg-[#FDFCFB]` (inherits from wrapper)
2. **Trust Ticker** — `bg-white border-y border-[#EAE6DF]`
3. **Infographic / Bento Grid** — `bg-[#F8F6F1] border-b border-[#EAE6DF]`
4. **Live Chat Preview** — `bg-[#FDFCFB]` (inherits)
5. **Outcomes / Deliverables Grid** — `bg-white border-y border-[#EAE6DF]`
6. **Empowerment / CTA** — `bg-[#F8F6F1] border-t border-[#EAE6DF]`

Not every page has all 6 sections. Pricing omits the chat preview. But the alternating background pattern (`#FDFCFB` → white → `#F8F6F1` → default → white → `#F8F6F1`) MUST be maintained.

---

## Component Catalog

### 1. Hero Section

```
<section className="px-6 pt-12 md:pt-24 pb-16 max-w-6xl mx-auto w-full relative z-10">
```

**Hero pill** (overline badge):
```
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0EB] text-[#D4714E] text-xs font-bold tracking-wider uppercase mb-8 border border-[#FBE3D9]">
  For Business Owners
</div>
```

**Hero headline:**
```
<h1 className="text-5xl md:text-[80px] font-extrabold tracking-tight leading-[1.05] mb-8 text-left">
  First line.<br />
  <span className="text-[#D4714E]">Accented second line.</span>
</h1>
```
- Always left-aligned (`text-left`)
- Two lines: first line is primary color, second is terra cotta
- Line break via `<br />`

**Hero subtitle:**
```
<p className="text-xl md:text-2xl text-[#6E6A63] font-medium max-w-3xl leading-relaxed mb-12 text-left">
```

**Suggestion chips** (below subtitle):
```
<div className="flex flex-wrap justify-start gap-3 max-w-3xl">
  <Suggestion text="..." onClick={() => onSend?.("...")} />
</div>
```

### 2. Trust Ticker

Static horizontal bar. No animation, no marquee.

```
<div className="border-y border-[#EAE6DF] bg-white py-6">
  <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6 text-sm font-bold text-[#A9A49C] tracking-widest uppercase">
    <span className="hidden md:inline-block">Powered By:</span>
    <span className="text-[#1A1A18] flex items-center gap-2">
      <span className="text-[#D4714E] text-lg leading-none">&middot;</span> U.S. Census
    </span>
    <!-- repeat for BLS, Federal Reserve, SEC EDGAR, SBA -->
  </div>
</div>
```

- "Powered By:" label hidden on mobile (`hidden md:inline-block`)
- Each source: terra dot + source name
- Same on every page

### 3. Infographic / Bento Grid Section

```
<section className="px-6 py-24 bg-[#F8F6F1] text-[#1A1A18] border-b border-[#EAE6DF]">
  <div className="max-w-6xl mx-auto">
```

**Section header** (left side text + right side badge):
```
<div className="mb-16 md:flex justify-between items-end gap-8">
  <div className="max-w-2xl">
    <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">OVERLINE</div>
    <h2 className="text-4xl md:text-5xl font-bold mb-6">First line.<br /><span className="text-[#D4714E]">Accented line.</span></h2>
    <p className="text-[#6E6A63] text-lg leading-relaxed">Description text.</p>
  </div>
  <!-- Optional right-side badge pill -->
  <div className="mt-8 md:mt-0 flex items-center gap-4 bg-white px-6 py-5 rounded-2xl border border-[#EAE6DF] shadow-sm">
    <div className="w-10 h-10 rounded-full bg-[#1A1A18] flex items-center justify-center text-white font-black text-lg">$</div>
    <div>
      <div className="text-xs text-[#A9A49C] uppercase tracking-wider font-bold">Label</div>
      <div className="font-bold text-lg text-[#1A1A18]">Title</div>
    </div>
  </div>
</div>
```

**Bento grid:**
```
<div className="grid md:grid-cols-3 gap-4 md:gap-6">
```

Card types in the bento grid:

**Large card (spans 2 cols):**
```
<div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm relative overflow-hidden group">
  <!-- Optional decorative blur circle: -->
  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF0EB] rounded-full blur-3xl -mr-20 -mt-20 opacity-60" />
  <h3 className="text-2xl font-bold mb-4 relative z-10">Title</h3>
  <p className="text-[#6E6A63] mb-8 relative z-10 max-w-lg leading-relaxed">Description.</p>
  <div className="flex flex-wrap gap-2 relative z-10">
    <Badge text="Tag 1" /><Badge text="Tag 2" />
  </div>
</div>
```

**Small numbered card (1 col):**
```
<div className="bg-white rounded-3xl p-8 border border-[#EAE6DF] shadow-sm flex flex-col">
  <div className="w-12 h-12 bg-[#F8F6F1] rounded-xl flex items-center justify-center text-[#D4714E] font-black text-xl mb-6">01</div>
  <h3 className="text-xl font-bold mb-3">Title</h3>
  <p className="text-[#6E6A63] text-sm leading-relaxed mt-auto">Description.</p>
</div>
```

**Terra cotta accent card (spans 2 cols):**
```
<div className="bg-[#D4714E] rounded-3xl p-8 flex items-center justify-between md:col-span-2 text-white shadow-md">
  <div className="max-w-lg">
    <h3 className="text-3xl font-bold mb-3">Bold statement.</h3>
    <p className="text-orange-100 font-medium leading-relaxed">Supporting text.</p>
  </div>
</div>
```

### 4. Live Chat Preview

```
<section className="px-6 py-24 max-w-5xl mx-auto w-full">
```

**Centered section header:**
```
<div className="text-center mb-16">
  <h2 className="text-4xl font-bold mb-4">Section title</h2>
  <p className="text-[#6E6A63] text-lg">Subtitle.</p>
</div>
```

**Chat container:**
```
<div className="bg-[#F8F6F1] rounded-[40px] p-6 md:p-10 border border-[#EAE6DF] shadow-xl max-w-4xl mx-auto">
  <div className="flex flex-col gap-6">
```

**User message bubble (right-aligned):**
```
<div className="self-end bg-[#D4714E] text-white p-6 rounded-[24px] rounded-br-[8px] max-w-[85%] md:max-w-[75%] shadow-md text-[16px] leading-relaxed">
  Message text...
</div>
```

**Yulia response (left-aligned, with avatar):**
```
<div className="self-start flex gap-4 max-w-[95%] md:max-w-[85%]">
  <div className="w-10 h-10 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-[#D4714E] font-black text-sm shrink-0 shadow-sm mt-1">Y</div>
  <div className="bg-white border border-[#EAE6DF] p-6 md:p-8 rounded-[24px] rounded-tl-[8px] shadow-md text-[#1A1A18] text-[16px] leading-relaxed">
    <!-- Content here -->
  </div>
</div>
```

**Financial data card (inside Yulia response):**
```
<div className="bg-[#FDFCFB] border border-[#EAE6DF] rounded-2xl p-6 mb-6 shadow-sm font-mono text-sm">
  <div className="text-xs font-sans text-[#6E6A63] uppercase tracking-wider font-bold mb-4 border-b border-[#EAE6DF] pb-2">Table Title</div>
  <div className="flex justify-between mb-2"><span>Label:</span> <span className="font-bold">$Value</span></div>
  <!-- green for additions: text-green-700 -->
  <!-- red for costs: text-red-700 -->
</div>
```

**Highlight range card (inside Yulia response):**
```
<div className="bg-[#FDFCFB] border border-[#EAE6DF] rounded-2xl p-6 mb-6 shadow-sm">
  <div className="text-sm text-[#6E6A63] uppercase tracking-wider font-bold mb-1">Label</div>
  <div className="text-3xl font-black text-[#1A1A18]">$3.7M – $4.8M</div>
</div>
```

**Success callout (inside Yulia response):**
```
<div className="flex items-start gap-3 bg-green-50/50 p-4 rounded-xl border border-green-100">
  <div className="mt-1 font-black text-green-600">✓</div>
  <div><strong>Label:</strong> Explanation text.</div>
</div>
```

**Warning callout (inside Yulia response):**
```
<div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
  <div className="mt-1 font-black text-amber-600">!</div>
  <div><strong>Label:</strong> Explanation text.</div>
</div>
```

**Highlighted inline value:**
```
<strong className="bg-[#FFF0EB] text-[#D4714E] px-1 rounded">4.8x–6.2x</strong>
```

**Yulia CTA line (at bottom of response):**
```
<div className="pt-4 font-bold text-[#D4714E]">Want me to dig deeper?</div>
```

### 5. Outcomes / Deliverables Grid

```
<section className="px-6 py-24 bg-white border-y border-[#EAE6DF]">
  <div className="max-w-6xl mx-auto">
```

**Centered header with overline:**
```
<div className="text-center mb-16">
  <div className="text-sm font-bold text-[#A9A49C] uppercase tracking-widest mb-4">The Deliverables</div>
  <h2 className="text-3xl md:text-4xl font-bold mb-4">What you actually walk away with.</h2>
  <p className="text-[#6E6A63] text-lg max-w-2xl mx-auto">Description.</p>
</div>
```

**2x2 outcome card grid:**
```
<div className="grid md:grid-cols-2 gap-4 md:gap-6">
  <OutcomeCard tag="TAG" title="Title" desc="Description." />
</div>
```

### 6. Empowerment / CTA Section

```
<section className="px-6 py-24 bg-[#F8F6F1] border-t border-[#EAE6DF]">
  <div className="max-w-4xl mx-auto">
    <div className="bg-white border border-[#EAE6DF] rounded-[40px] p-8 md:p-12 shadow-xl shadow-[#1A1A18]/5">
```

**Centered header inside card:**
```
<div className="text-center mb-12">
  <h2 className="text-3xl md:text-4xl font-bold mb-6">Headline.</h2>
  <p className="text-lg text-[#6E6A63] leading-relaxed">Description.</p>
</div>
```

**Numbered step cards (vertical stack):**
```
<div className="space-y-6">
  <StepCard num="1" title="Title" desc="Description." />
</div>
```

---

## Shared Sub-Components

Each page defines its own copies of these. They are NOT in a shared file.

### Suggestion (chip button)
```tsx
function Suggestion({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white border border-[#EAE6DF] text-[#6E6A63] text-[13px] md:text-sm font-medium px-4 py-2.5 rounded-full hover:border-[#D4714E] hover:text-[#D4714E] hover:shadow-sm transition-all cursor-pointer text-left" type="button">
      &ldquo;{text}&rdquo;
    </button>
  );
}
```
- Wraps text in curly quotes
- White bg, border on idle; terra border + text on hover

### Badge (tag pill)
```tsx
function Badge({ text }: { text: string }) {
  return <div className="bg-[#F8F6F1] border border-[#EAE6DF] text-[#6E6A63] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">{text}</div>;
}
```

### OutcomeCard
```tsx
function OutcomeCard({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div className="bg-[#FDFCFB] border border-[#EAE6DF] p-8 rounded-3xl hover:shadow-md transition-all flex flex-col">
      <div className="text-xs font-black text-[#A9A49C] uppercase tracking-widest mb-4">{tag}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-[#6E6A63] leading-relaxed text-[15px] flex-1">{desc}</p>
    </div>
  );
}
```

### StepCard
```tsx
function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-6 items-start p-6 bg-[#FDFCFB] rounded-2xl border border-[#EAE6DF]">
      <div className="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#D4714E] flex items-center justify-center font-black text-xl shrink-0">{num}</div>
      <div>
        <h4 className="text-xl font-bold mb-2">{title}</h4>
        <p className="text-[#6E6A63] leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
```

### FreeCard (Pricing page only)
```tsx
function FreeCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 border border-[#EAE6DF] rounded-2xl bg-[#FDFCFB] hover:shadow-sm transition-shadow">
      <div className="font-black text-[#D4714E] text-xl mb-3">✓</div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-[#6E6A63] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
```

### PriceItem (Pricing page only)
```tsx
function PriceItem({ title, price, desc }: { title: string; price: string; desc: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start border-b border-[#EAE6DF] pb-6 last:border-0 last:pb-0">
      <div className="flex-1">
        <h4 className="font-bold text-[#1A1A18] text-lg">{title}</h4>
        <p className="text-[#6E6A63] text-sm mt-1 leading-relaxed">{desc}</p>
      </div>
      <div className="font-black text-xl text-[#D4714E] shrink-0">{price}</div>
    </div>
  );
}
```

---

## Border Radius Scale

| Usage | Value |
|-------|-------|
| Outer containers (chat preview, empowerment card) | `rounded-[40px]` |
| Bento grid cards | `rounded-3xl` (24px) |
| Inner cards (outcome, step, financial tables) | `rounded-2xl` (16px) |
| Callout cards (success/warning) | `rounded-xl` (12px) |
| Badge pills | `rounded-lg` (8px) |
| Suggestion chips, hero pill | `rounded-full` |
| Chat bubbles | `rounded-[24px]` with one corner at `rounded-br-[8px]` or `rounded-tl-[8px]` |

## Shadow Scale

| Usage | Value |
|-------|-------|
| Bento cards, ticker badge | `shadow-sm` |
| Terra accent card | `shadow-md` |
| Chat preview container | `shadow-xl` |
| Empowerment card | `shadow-xl shadow-[#1A1A18]/5` |
| Chat bubbles (user & Yulia) | `shadow-md` |
| Financial data cards inside chat | `shadow-sm` |

## Spacing

| Property | Value |
|----------|-------|
| Section padding (vertical) | `py-24` (96px) |
| Section padding (horizontal) | `px-6` (24px) |
| Max content width | `max-w-6xl` (main), `max-w-5xl` (chat preview section), `max-w-4xl` (chat preview card, empowerment) |
| Grid gap | `gap-4 md:gap-6` |
| Card inner padding | `p-8` (bento), `p-6` (steps, outcomes) |
| Bottom clearance for dock | `pb-32` on page wrapper |

---

## DO NOT

- **DO NOT use SVG icons or icon libraries** (no lucide-react, no heroicons, no font-awesome)
- **DO NOT render the InputDock** — AppShell handles this
- **DO NOT use `&check;`** HTML entity — use literal `✓` character
- **DO NOT use marquee or animation** on the trust ticker
- **DO NOT use dark mode classes** — public pages are light-only
- **DO NOT import shared component files** — each page defines its own sub-components inline
- **DO NOT change the component signature** — always `interface Props { onSend?: (prompt: string) => void; }`

## InputDock (DO NOT MODIFY — Reference Only)

The InputDock is a **separate component** rendered by AppShell below the scroll area. Content pages never touch it. Key facts for reference:

- **Landing mode:** `position: fixed`, `bottom-6 md:bottom-10`, `z-50`, `max-w-[700px]`, `rounded-[28px]`
- **Shadow:** `shadow-[0_8px_30px_rgba(0,0,0,0.12),0_20px_60px_rgba(0,0,0,0.08)]`
- **Outline:** `ring-2 ring-black/[0.04] border border-[#D4714E]/20`
- **Sparkle:** `✧` character in `font-serif text-[#D4714E]`
- **Send button:** Text "Send" (not an icon), `rounded-full`, terra cotta when active
- **Auto-expanding textarea**, max 160px height
- **Chat mode:** `flex-shrink-0`, `rounded-2xl`, gradient fade above
