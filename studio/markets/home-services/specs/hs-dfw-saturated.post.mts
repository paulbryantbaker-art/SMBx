/**
 * DFW — "the register said four." The corrected platform count as the
 * argument: a market read is only as good as the register behind it.
 *
 * Every figure traces to markets/home-services/master.md Part XI and A.0.4.
 * Full-width TEXT CARD — no image. The number is the graphic (DESIGN.md 8),
 * and omitting the photo panel is a real house format, not a degraded one
 * (FORMATS.md 2).
 *
 * Caption follows the reach rules established 2026-08-03: no URL in the body
 * (link goes in the first comment), U+2022 bullets because LinkedIn renders no
 * markdown, short lines, and a question close to pull comments into the first
 * 60-90 minutes.
 *
 * NOTE ON THE GUARD RAIL: verify-spec's FIG_RE only sees a figure that carries
 * a currency symbol or a unit. Almost every number on this card and in this
 * caption is a bare count — 18, 4, 34, 2,412, 1,797, 307, 280 — and is
 * INVISIBLE to it. Only "$3.6B – $6.4B" is mechanically checked. The rest were
 * checked by hand against Part XI.
 *
 * THE MESSAGE, in one line: the list you are working from is older and thinner
 * than you think, and only counting fixes that.
 */
const CAPTION = [
  'The register said four. There are eighteen.',
  '',
  'Everyone looking at Dallas–Fort Worth home services has been told the same thing. It is saturated. It is picked over. The only way in is to buy something small and fold it into what you already own.',
  '',
  'That is true. It is also not the useful part.',
  '',
  'Last week I checked all 34 entries in our consolidator register against their own published rosters, one parent at a time. Here is what Dallas–Fort Worth actually looks like:',
  '',
  '• 18 companies own a business there — not 4.',
  '• 10 are residential-side. 8 are commercial-mechanical.',
  '• 2 are headquartered inside the metro.',
  '• Apex moved its headquarters here in May and publishes no brand roster at all.',
  '',
  'So it is more crowded than anyone had written down.',
  '',
  'And at the same time:',
  '',
  '• 2,412 plumbing and HVAC establishments across the eleven counties.',
  '• 1,797 of them employ fewer than ten people.',
  '• 307 sit in the 10–249 band — the buyable middle.',
  '• Roughly 280 of those match no consolidator in the register at all.',
  '',
  'Both things are true at once. More crowded than the record showed, with several hundred businesses underneath it that nobody has claimed.',
  '',
  'A register is not a market. A register is a list of who someone remembered to write down.',
  '',
  'If you are underwriting a metro right now — how old is the map you are working from, and who built it? Curious what people are seeing. 👇',
  '',
  '(Link in the comments if you want the full Dallas–Fort Worth cut.)',
  '',
  '#MergersAndAcquisitions #PrivateEquity #HVAC #Plumbing #LowerMiddleMarket',
].join('\n');

export const post = {
  slug: 'hs-dfw-saturated',
  kicker: 'DALLAS–FORT WORTH',
  numeral: '18',
  numeralLabel: 'companies already\nbuying in one metro',
  hook: 'The register said four. There are eighteen.',
  body: 'We checked all 34 companies on our list one at a time, against what each publishes about itself. Eighteen own a business here — ten residential, eight commercial, two headquartered in the metro. At the same time, about 280 businesses of buyable size are owned by none of them. That is $3.6B – $6.4B of annual work with no owner we can identify (bounds, derived from Census CBP, 2023 — both ends carried, no midpoint).',
  invite: 'Both are true at once. You only get both by counting.',
  cta: 'smbx.ai  →',
  byline: { name: 'Paul Baker', title: 'Buy-side corporate development' },
  caption: CAPTION,
};
