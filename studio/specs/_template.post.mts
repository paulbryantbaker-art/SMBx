/**
 * TEMPLATE — a figure ONE PAGE (Monolith or Portal). Copy this file, rename
 * it, fill the slots, delete the guidance you no longer need.
 *
 * The law is FORMATS.md §2.3; this is that section as a fillable spec so the
 * budgets sit next to the box you type into. Every number below was found by
 * something overrunning the page and getting clipped — they are not taste.
 *
 * BEFORE YOU WRITE COPY
 *   1. Verify every figure against its primary source. Publisher, vintage,
 *      and what the series actually measures — not what the post says it
 *      measures. A figure the reader cannot grade is a figure they cannot
 *      trust, and the vintage is the usual thing a post leaves loose.
 *   2. Say it in a unit the reader owns. "2.8 turns of EBITDA" is trade
 *      language; "40% more per dollar" is the same fact with no glossary.
 *   3. If the figure is DERIVED, register the working in this comment and in
 *      the collateral BUILD.txt — a card has no Derivations section.
 *   4. A translation must not smuggle in an assumption the source does not
 *      make. Worked dollar examples are the usual offender: they need a
 *      company size, and the source's bands may be defined on something else.
 *   5. THE LINE: buy-side throughout. Read from the acquirer's seat. Never
 *      advise a seller on positioning, never quote a fee.
 *
 * RENDER
 *   Mac:      npx tsx ../scripts/studio/build-onepager.mts specs/<name>.post.mts \
 *               --out collateral/<slug>/$(date +%F)
 *   Sandbox:  python3 scripts/studio/figure-deck.py studio/specs/<name>.post.mts \
 *               --card --ground monolith-dark --out <dir>
 *
 * The renderer PRINTS A WARNING naming any overrun in pixels. If you see one,
 * cut copy — never shrink type.
 */
export const post = {
  slug: 'change-me',

  /* 'monolith-dark' (the dark look) or 'portal-light' (the light one). */
  ground: 'monolith-dark',

  /* Mono label, top-left. Short — it is a category, not a sentence. */
  kicker: 'THE THING THIS IS ABOUT',

  /* THE PLATE FIGURE. In a unit the reader owns. Register any derivation
     here: <a> / <b> = <c>, nothing rounded, both figures the publisher's. */
  numeral: '40%',

  /* ONE LINE, ~15 CHARACTERS. The label sits beside the figure's head
     (x 753–869 from y 302 down); a second line runs into his face. Say the
     unit, not the sentence. */
  numeralLabel: 'more per dollar',

  /* ~40 CHARACTERS, 3 lines. A sentence break makes a two-beat: the turn
     changes colour automatically, so write it as two sentences when the
     second one is the payoff. A 4-line hook pushes the source under the
     foot. */
  hook: 'The payoff, in one line.',

  /* ~85 CHARACTERS, 4 lines. The evidence, plainly. */
  body: 'The two or three facts that make the hook true.',

  /* THREE KEYS, NO VALUES. At floor type a `v` string cannot fit beside a
     `k`. Keep each key to about two lines; use two points if they run long.
     Leave v as '' — it is kept in the shape for the builder, not for you. */
  points: [
    { k: 'First thing, short.', v: '' },
    { k: 'Second thing, short.', v: '' },
    { k: 'Third thing, short.', v: '' },
  ],

  /* FINE PRINT, ~100 characters, 3 lines. Publisher, vintage, and the
     source's commercial interest, in that order. It is anchored up from the
     foot, so a long one collides with the points. */
  note: 'Publisher, what was measured, vintage. What the publisher sells.',

  /* Kept for the builder; the foot renders the LOGO, not this string. */
  cta: 'smbx.ai  →',

  /* Optional: the LinkedIn post text, written out as one string. Omit it and
     no caption file is written. */
  // caption: [...].join('\n'),
};
