/**
 * WORKED EXAMPLE + FIELD REFERENCE — the "2 open seats" availability one-pager.
 * This is the shape every single-image post takes. To make a new one: copy this
 * file, change the copy, point `image` at your photo (a filename you drop in
 * ./media, or a repo brand photo by bare name), then:
 *
 *   npx tsx scripts/studio/build-onepager.mts scripts/studio/decks/<name>.post.mts
 *
 * Renders standalone from repo assets (uses client/public/founder-walking.webp).
 *
 * Fields (all optional except slug + hook):
 *   slug          output basename
 *   kicker        mono brass label, top-right (e.g. 'AVAILABILITY')
 *   numeral       giant mint/green figure (e.g. '2'); omit for no number
 *   numeralLabel  small label beside it, '\n' = line break (default 'open\nseats')
 *   hook          Fraunces headline. Use a non-breaking hyphen ‑ (U+2011) to keep
 *                 a compound like buy‑side from splitting across a line.
 *   body          supporting paragraph
 *   invite        the bold, warm invitation line (THE LINE: invite, never dare)
 *   cta           mono call-to-action
 *   byline        { name, title } — defaults to Paul Baker / Buy-side corporate development
 *   image         right-panel photo; omit for a full-width text card. Resolves
 *                 ./media → ./assets → repo client/public → spec folder → CWD.
 *   imagePos      CSS object-position for the photo crop (default '50% 42%')
 *   variants      ['dark','light'] — which modes to render (default both)
 *   caption       the LinkedIn post text (written to <slug>-caption.txt)
 *
 * LAW: buy-side only, no fees/pricing, no invented numbers, invite-not-dare,
 * Paul's real photo (never altered). Warm, human, appealing.
 */
export const post = {
  slug: '2-open-seats',
  kicker: 'AVAILABILITY',
  numeral: '2',
  numeralLabel: 'open\nseats',
  hook: 'Six-month buy‑side ramp-ups for serious acquirers.',
  body: 'I stand up and run your corporate-development function — thesis, sourcing, a live pipeline, diligence support. From a standing start to deals moving.',
  invite: "We're ready to start now — if you've been meaning to get moving, I'd love to help.",
  cta: "Let's talk  →",
  byline: { name: 'Paul Baker', title: 'Buy-side corporate development' },
  image: 'founder-walking.webp',
  imagePos: '50% 42%',
  caption: [
    "I'm opening two six-month buy-side ramp-up slots for serious acquirers.",
    '',
    'Here\'s what that means: I stand up and run your corporate-development function — thesis, sourcing, a live pipeline, diligence support. From a standing start to real deals moving, in six months.',
    '',
    "We're ready to start now.",
    '',
    "If you've been meaning to get moving on acquisitions and haven't had the right person to run it — that's exactly what I do. I'd love to talk.",
    '',
    '#CorporateDevelopment #MergersAndAcquisitions #Acquisitions #PrivateEquity',
  ].join('\n'),
};
