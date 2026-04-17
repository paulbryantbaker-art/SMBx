# Glass Grok — smbx.ai visual brand skill

Use this skill whenever creating marketing materials for smbx.ai. This includes LinkedIn carousel PDFs, quote cards, stat graphics, announcement images, social posts, pitch slides, one-pagers, or any branded visual that must match the smbx.ai website and mobile app exactly. Trigger this skill even if the user only says "a LinkedIn post for smbx," "a quote card," or "a carousel about X" — the skill applies whenever smbx.ai brand materials are being produced.

## When to use this skill

**Use it when:**
- Building a LinkedIn carousel PDF (most common case — 5–10 slides, 1080×1350)
- Creating a standalone quote card, stat card, or comparison graphic
- Producing pitch deck slides, one-pagers, or sales enablement visuals
- Making any image or PDF that bears the smbx.ai brand
- The user mentions "Glass Grok," "smbx branding," or asks for "on-brand" visuals

**Do not use it when:**
- Building website code (use the website repo and components instead)
- Building app UI (use the mobile app spec instead)
- Producing internal documents with no brand requirement

## The two-file deliverable

Always produce marketing materials as **HTML rendered to PDF**, not as images. This gives crisp type at any zoom and keeps file sizes small. The workflow is:

1. Write a single HTML file containing all slides
2. Use the `pdf` skill (at `/mnt/skills/public/pdf/SKILL.md`) to render it to a multi-page PDF
3. Present the PDF to the user

Each slide is a `<div class="slide">` sized to the target canvas. CSS `page-break-after: always` ensures each slide becomes one page of the PDF.

## Canvas dimensions

Use **1080×1350 (4:5 portrait)** as the default for LinkedIn. This takes maximum vertical real estate in the feed and is LinkedIn's recommended carousel size.

| Format | Dimensions | Use |
|---|---|---|
| **Portrait (default)** | 1080×1350 | LinkedIn carousels, Instagram feed |
| Square | 1080×1080 | Twitter/X cards, universal fallback |
| Landscape | 1200×628 | LinkedIn single-image, blog headers |

For carousels, always stick to one aspect ratio across all slides — don't mix.

## Design rules (non-negotiable)

These map 1:1 to the Glass Grok style guide. Violating them breaks brand consistency.

### 1. Logo is plain text
Always render as `smbx.ai` (lowercase) or `X` (standalone mark) in Sora 800. **Never** color one letter, never use a logomark/icon, never apply a gradient. The logo inherits the surrounding text color — black on light surfaces, white on dark.

### 2. Typography is Sora + Inter only
- **Sora** for display (headlines, hero numbers, labels, logo)
- **Inter** for body (paragraphs, supporting text)
- No third typeface, no serif, no italic
- Reference Google Fonts in every HTML: `https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap`

### 3. Color is greyscale + content accent only
The UI chrome (background, cards, text, buttons) is strictly greyscale. Color is only permitted when it represents **content-level meaning**: status dots (green/amber/red/grey), score band pills, chart data. No decorative color. No brand-accent color. No "pop" color.

### 4. Solid content, glass chrome
Content surfaces (cards, slide bodies) are solid white with hairline borders. Glass (translucent white + backdrop blur + specular highlight) is reserved for floating chrome elements — usually not needed in static marketing materials, but available for nav-pill-style decorative elements if appropriate.

### 5. Typography carries hierarchy
Emphasis comes from **weight, size, and contrast** — never color. If something needs to stand out, make it bigger, heavier, or darker. Don't tint it.

## Token reference (copy into every HTML file)

See `tokens.css` for the complete set. Minimum tokens needed in any marketing file:

```css
:root {
  --bg-app: #F2F2F4;
  --bg-card: #FFFFFF;
  --bg-subtle: #F5F5F7;
  --bg-muted: #E8E8EB;
  --text-primary: #0A0A0B;
  --text-secondary: #3A3A3E;
  --text-muted: #6B6B70;
  --text-faint: #9A9A9F;
  --border: rgba(0,0,0,0.08);
  --accent: #0A0A0B;
  --display: 'Sora', system-ui, sans-serif;
  --body: 'Inter', system-ui, sans-serif;
}
```

## Templates

See `templates.html` for six ready-to-use slide layouts. Each is a complete `<div class="slide">` block you can copy and adapt.

| Template | Use it for |
|---|---|
| **Title** | Opening slide of a carousel. Big hook headline, subtitle, smbx.ai mark at top. |
| **Quote** | Pull-quote slide. One sentence, large type, attribution. |
| **Stat** | Single big number with context. Hero stat carousels. |
| **List** | 3–5 numbered items with headline and brief copy each. Breakdowns, processes. |
| **Comparison** | Two-column before/after or A-vs-B. "Winning" column gets black fill. |
| **CTA** | Closing slide. Call-to-action + smbx.ai wordmark + URL. |

## Workflow for a LinkedIn carousel

Follow this sequence every time:

1. **Plan the carousel.** Decide slide count (5–10), topic, and narrative arc. Common arcs: hook → problem → insight → payoff → CTA. Or: stat → 3 implications → recommendation → CTA.

2. **Read the templates.** Open `templates.html` and identify which template fits each slide. Most carousels use: 1 Title + 3–7 content slides (stats/quotes/lists) + 1 CTA.

3. **Write the HTML.** Create a single HTML file at `/mnt/user-data/outputs/[descriptive-name].html`. Include the `<head>` setup from the template, then paste and adapt each slide `<div>`.

4. **Copy is final.** If the user provides copy, use it exactly. Don't rewrite or paraphrase. If the user asks you to write copy, keep it tight — LinkedIn attention is short. Hooks should land in the first second.

5. **Render to PDF.** Read `/mnt/skills/public/pdf/SKILL.md` for the correct rendering approach. Use Puppeteer with a viewport matching the slide dimensions, DPR 2× for crisp text.

6. **Present the PDF.** Use the `present_files` tool to surface the final PDF (not the intermediate HTML).

## PDF rendering specifics

When rendering, the Puppeteer setup should be:

```javascript
await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
await page.goto(`file://${htmlPath}`);
await page.pdf({
  path: outputPath,
  width: '1080px',
  height: '1350px',
  printBackground: true,
  preferCSSPageSize: true
});
```

In the HTML, ensure page breaks:

```css
@page { size: 1080px 1350px; margin: 0; }
.slide {
  width: 1080px;
  height: 1350px;
  page-break-after: always;
  break-after: page;
  overflow: hidden;
}
.slide:last-child { page-break-after: auto; }
```

## Quality checklist

Before rendering final PDF, verify:

- [ ] Every slide is exactly 1080×1350 (or declared target size)
- [ ] Logo is plain text `smbx.ai`, no color on any letter
- [ ] No terra cotta, no accent color, no decorative hue anywhere in chrome
- [ ] Sora is used for display, Inter for body — nothing else
- [ ] Content color only appears as status dots or content-level meaning
- [ ] Solid white cards with hairline borders (`rgba(0,0,0,0.08)`)
- [ ] Hero numbers are black, not colored
- [ ] Comparison "winner" cells use black fill + white text (not green/red)
- [ ] Section labels in Sora 700, uppercase, `letter-spacing: 0.12em`, muted grey
- [ ] Body copy line-height is `1.55`–`1.65` for readability
- [ ] Margins feel generous — no crowding

## Voice and copy rules

If writing copy, these come from the brand:

- **Specific beats vague.** "$1.1M average hidden value" beats "significant value."
- **Uncomfortable truths over consulting-speak.** "75% of owners regret selling within a year" beats "selling is a major decision."
- **No exclamation marks.** Ever.
- **No emojis** unless quoting someone who used one.
- **Lowercase logos, proper case prose.** `smbx.ai` in the mark. Regular sentence case in copy.
- **Hooks in the first 3 words.** "3,000 deals screened. 1 closed." not "In today's M&A market, the statistics show that…"
- **Attribution when citing stats.** Source name at the bottom in muted grey.

## Examples of good carousel topics

This skill has been used for:
- "The $1.1M hiding in your tax returns" (add-back carousel)
- "3,000 → 1. The search funnel math." (buy-side funnel)
- "SOP 50 10 8 broke your rollover. Here's what still works." (SBA update)
- "You don't have to sell 100%. Six ways to get liquidity." (raise carousel)
- "Day 1 after the wire. 180 employees. Do you have a plan?" (PMI carousel)

## When in doubt

If you're unsure whether something matches the brand, default to:
- More grey, less color
- More space, less content per slide
- Bigger typography, simpler layouts
- The style guide (if uploaded) is authoritative

The fewer design decisions visible on a slide, the more on-brand it feels.
