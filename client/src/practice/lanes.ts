/**
 * THE HUNTING LANES — one register, two surfaces (2026-08-03, Paul: "I don't
 * see Home Services in the chips nor landscape and hardscaping").
 *
 * The landing hunt board and the hero chips both read THIS array, so a lane
 * cannot exist on one and be missing from the other — the previous
 * hand-copied chip list is exactly how five lanes covered a fourteen-lane
 * practice. Lives in its own module because Landing imports YuliaIntake:
 * either file exporting it to the other is an import cycle.
 *
 * Thesis lines are QUALITATIVE by design (zero-hallucination law: a figure
 * needs a citation, and a hero teaser is no place to carry one). The two
 * 2026-08-03 additions are lanes the practice actively hunts and publishes
 * research on.
 *
 * REGISTER PARITY SETTLED (Paul, 2026-08-07, closing the audit's "different
 * fifteen-lane sets" flag): "Landscape and hardscape are ok" — the lane
 * stands on the board WITHOUT an /industries block, deliberately, so do not
 * re-flag the asymmetry — and "Add MEP": Commercial mechanical joined the
 * board below, its thesis line taken VERBATIM from the /industries block's
 * own desk line (his copy, not improvised). It sits directly after Home
 * services, mirroring the /industries adjacency, because the line's
 * "harder to underwrite than residential" reads against the lane above it.
 */
export interface HuntLane {
  nm: string;
  th: string;
}

export const HUNT_LANES: HuntLane[] = [
  { nm: 'Home services', th: 'Need-based work in the home — recurring, fragmented, succession-heavy, and rarely brokered.' },
  { nm: 'Commercial mechanical, HVAC & plumbing', th: 'Harder to underwrite than residential, years behind it on the consolidation curve, and the difficulty is the moat.' },
  { nm: 'Landscaping & hardscaping', th: 'Commercial grounds contracts renew season after season; route density is the moat.' },
  { nm: 'Fire & life safety', th: 'NFPA 25 and 72 make inspection the law — every install becomes an annuity.' },
  { nm: 'Elevator & escalator service', th: 'Mandated inspections, sticky contract books, light capex, aging owners.' },
  { nm: 'Power & grid infrastructure services', th: 'Transformer refurb, substations, certified testing — the layer electrification runs on.' },
  { nm: 'Building automation & critical power', th: 'Controls, commissioning, cooling and backup power — recurring service where downtime isn’t an option.' },
  { nm: 'Energy-adjacent services & distribution', th: 'The electrification wave at operating-company scale — services, contracting and distribution; never minerals or generation.' },
  { nm: 'Testing, inspection & certification / NDT', th: 'Demand written into code, behind a certification moat — and succession in almost every shop.' },
  { nm: 'Environmental & industrial cleaning', th: 'Permit-gated, regulation-driven, and rarely brokered.' },
  { nm: 'Water & wastewater contract O&M', th: 'Multi-year municipal contracts — the most durable revenue in the services economy.' },
  { nm: 'Specialty & MRO distribution', th: 'Vendor authorizations and VMI programs that underwrite like contracts.' },
  { nm: 'Machine shops & precision manufacturing', th: 'AS9100 and ISO 13485 qualification cycles make revenue stick; reshoring is the tailwind.' },
  { nm: 'Food contract manufacturing & co-packing', th: 'Multi-year supply agreements, with real density in our backyard.' },
  { nm: 'Non-emergency medical transport', th: 'Recurring, reimbursement-funded trips — underwritten with eyes open.' },
  { nm: 'Revenue cycle management & medical billing', th: 'Fragmented and clean to diligence — we underwrite the niche before the number.' },
];

/** The DESKTOP hero shows a FEATURED row, not the whole board (Paul: "is
 *  there a better way to present rather than just a cloud of chat pills?").
 *  Six lanes + an "All lanes →" chip that jumps to the hunt board, where
 *  every lane sits with its thesis. Derived by name from the register so a
 *  renamed lane breaks the build here rather than silently vanishing. */
const FEATURED_NAMES = [
  'Home services',
  'Landscaping & hardscaping',
  'Fire & life safety',
  'Elevator & escalator service',
  'Water & wastewater contract O&M',
  'Specialty & MRO distribution',
];
export const FEATURED_LANES: string[] = FEATURED_NAMES.map(n => {
  const hit = HUNT_LANES.find(l => l.nm === n);
  if (!hit) throw new Error(`Featured lane not in HUNT_LANES: ${n}`);
  return hit.nm;
});

/**
 * THE FIVE BUYERS — one register, three surfaces (2026-08-08, Paul: "if I
 * click on any of these I go to book a call instead").
 *
 * Every card in the landing's who-index carried `href="#cta"`, so five
 * distinct buyer promises — "talk to us about direct deals", "about a live
 * deal", "about your search" — all landed on the same booking card. That is
 * precisely the failure the 2026-08-02 lesson already named for the nav
 * dropdown: FIVE LABELS, ONE DESTINATION READS AS BROKEN. The dropdown was
 * fixed then and each name has pointed at its own /buyers/* page since; the
 * landing cards were left behind because the Carta reference draws them as a
 * hairline grid rather than as links, and the transcription was faithful to
 * a prototype that had nowhere to send them.
 *
 * The label→href pairs lived inline inside WhoMenu. They live here now, and
 * the who-index reads the SAME array, so a sixth buyer or a renamed slug
 * cannot land on one surface and miss the other — the identical mistake the
 * hunt lanes made before HUNT_LANES existed, one file above.
 */
export interface Buyer {
  label: string;
  href: string;
}

export const BUYERS: Buyer[] = [
  { label: 'Family offices', href: '/buyers/family-offices' },
  { label: 'Independent sponsors', href: '/buyers/independent-sponsors' },
  { label: 'Search funds & solo acquirers', href: '/buyers/searchers' },
  { label: 'Operators & strategics', href: '/buyers/operators' },
  { label: 'PE firms', href: '/buyers/pe-firms' },
];

/** The who-index cards key off their own label, so a typo cannot silently
 *  fall back to the booking card — it throws at build/render instead. */
export function buyerHref(label: string): string {
  const hit = BUYERS.find(b => b.label === label);
  if (!hit) throw new Error(`Buyer label not in BUYERS: ${label}`);
  return hit.href;
}
