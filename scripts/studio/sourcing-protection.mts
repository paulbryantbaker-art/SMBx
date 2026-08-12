/**
 * sourcing-protection.mts — ARE THE SOURCES INDEPENDENT OF EACH OTHER?
 *
 *   npx tsx $REPO/scripts/studio/sourcing-protection.mts markets/<m>/specs/<name>.deck.mts
 *   npx tsx $REPO/scripts/studio/sourcing-protection.mts markets/<m>/master.md
 *   npx tsx $REPO/scripts/studio/sourcing-protection.mts markets/<m>/documents/<doc>.md
 *     --corpus <dir|file ...>   the research folder to trace figures through
 *     --all                     print the per-source ledger for clean lines too
 *
 * WHY THIS EXISTS. A published carousel was called AI slop on one ground: that
 * its sources all referenced each other. Nothing in the studio could have
 * caught that. `audit.mts` asks whether a figure appears in a source.
 * `verify-spec.mts` asks whether a spec is faithful to its master.
 * `retired-check.mjs` asks whether anything ships a killed figure.
 * `voice-check.mts` asks whether the sentence is plain.
 *
 * EVERY ONE OF THEM ASKS WHETHER A FIGURE HAS A SOURCE. NONE ASKS WHETHER THE
 * SOURCES ARE INDEPENDENT OF EACH OTHER. Five trade articles repeating one
 * study is five citations and one fact, and it passes every check we own.
 *
 * CALIBRATED AGAINST TWO FORENSIC AUDITS, not against a theory:
 *   markets/fire-safety/research/citation-independence-audit-2026-08-11.md
 *   markets/elevator/research/15-source-independence-check.md
 * The fire-safety deck's four bad source lines — the private agreements (p6),
 * the practice's own register (p7), the unnamed SEC exhibits (p8) and the two
 * M&A advisories dated one day apart under a card about M&A multiples (p11) —
 * are the acceptance test. The elevator decks, freshly corrected, are the
 * false-positive test.
 *
 * ── THE DISTINCTION THIS WHOLE FILE TURNS ON ──────────────────────────────
 *
 * CIRCULARITY is a defect when the referent is a MEASUREMENT. Five outlets
 * repeating one study is one fact: each retelling adds no observation.
 *
 * CORROBORATION is the opposite, and it looks identical to a naive checker.
 * When the referent is a TEXT — a code section, a statute, a court opinion —
 * every citing party derives from that text BY CONSTRUCTION, and independent
 * parties correctly reproducing it is convergent verification. It is the same
 * logic by which four manuscripts of a statute confirm its wording. More
 * reproductions is MORE evidence, not less.
 *
 * So the elevator NFPA 101 §9.4.2.2 → CMS-2786R chain is reported here as
 * CORROBORATED, in its own positive category, and never as a finding. A
 * checker that flags convergence on a code text as circularity is a checker
 * that gets switched off, and then the card that mattered scrolls past with
 * the noise.
 *
 * ── THE FIVE CARD FLAGS ───────────────────────────────────────────────────
 *   SELF                 the line cites the practice, with no instrument beside it
 *   OPAQUE               nothing on the line can be opened by a reader
 *   MONOCULTURE          every named source is one class, and none is terminal
 *                        (an issuer's own DISCLOSURE counts as terminal as to
 *                        itself — Paul, 2026-08-12 — but never as to its market)
 *   SYNDICATION RISK     two same-class non-instrument sources dated within 14 days
 *   UNDISCLOSED INTEREST an advisory or association that sells into the market
 *                        it is measuring, named without qualification
 *
 * ── AND ACROSS THE CORPUS ─────────────────────────────────────────────────
 *   ORIGIN COLLAPSE      N citations, 1 origin — the headline finding
 *   NO INSTRUMENT        support is entirely press / vendor / interested / self
 *
 * EXIT 0 clean · 1 findings · 2 COULD NOT CHECK. Exit 2 is never a pass.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { figuresNotIn } from '../../house/audit.js';

/* ── args ─────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const ALL = argv.includes('--all');
const corpusIdx = argv.findIndex(a => a === '--corpus' || a === '--against');
const corpusArgs = corpusIdx >= 0
  ? argv.slice(corpusIdx + 1).filter(a => !a.startsWith('--'))
  : [];
const targetArg = argv.find((a, i) =>
  !a.startsWith('--') && (corpusIdx < 0 || i <= corpusIdx));

/** Exit 2 is NOT a pass. Same words every time, so it cannot be misread. */
function cannotCheck(headline: string, ...detail: string[]): never {
  console.log(`\n✗ NOT CHECKED — ${headline}`);
  for (const d of detail) console.log(`  ${d}`);
  console.log('\nThe sources in this file have not been checked for independence. This is');
  console.log('NOT a pass. An unchecked artifact does not get rendered or posted.\n');
  process.exit(2);
}

if (!targetArg) {
  cannotCheck('no target given',
    'Usage: sourcing-protection.mts <spec.deck.mts|doc.md> [--corpus <dir> ...] [--all]');
}
const targetPath = path.resolve(targetArg);
if (!existsSync(targetPath)) cannotCheck(`no such file: ${targetPath}`);

const rel = (p: string) => path.relative(process.cwd(), p) || p;

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · THE CLASSIFIER
 *
 * Seven classes, and each one exists because a real audit needed the word.
 * The law here: never invent a classification you cannot justify from the
 * source text or the domain. Anything that matches nothing is `unknown`, and
 * `unknown` is reported as unclassified rather than quietly counted as good.
 * ═════════════════════════════════════════════════════════════════════════ */
type Cls = 'instrument' | 'issuer' | 'press' | 'vendor' | 'interested' | 'self'
  | 'opaque' | 'unknown';

/** Instruments split three ways, and the split is what makes corroboration
 *  detectable. `text` is a document whose WORDING is the referent — a code
 *  section, a statute, a standard, an opinion. `data` is a measurement table.
 *  `filing` is a mandatory disclosure. Only `text` (and the authorities that
 *  adopt or enforce it) can corroborate; a measurement cannot be corroborated
 *  by being re-printed. */
type Sub = 'text' | 'data' | 'filing' | 'authority' | 'mirror' | 'wire' | '';

interface Src {
  raw: string;          // the segment as printed
  cls: Cls;
  sub: Sub;
  why: string;          // the token that justified the class — always shown
  date?: Date;
  datePrecision?: 'day' | 'month' | 'year';
  openable: boolean;    // can a reader get to exactly this document?
}

/* Named domains. Every entry is a judgement someone can argue with, which is
 * why they are listed rather than inferred. Unlisted domains fall to the
 * suffix rules below and then to `unknown`. */
const DOMAIN_CLASS: Record<string, [Cls, Sub, string]> = {
  /* code and case text reproduced by third parties — corroborating, not
     independent measurement */
  'law.cornell.edu': ['instrument', 'text', 'Cornell LII — code text'],
  'justia.com': ['instrument', 'text', 'Justia — code text'],
  'casetext.com': ['instrument', 'text', 'case text'],
  'courtlistener.com': ['instrument', 'text', 'court opinions'],
  'public.resource.org': ['instrument', 'text', 'public.resource.org — code text'],
  'upcodes.com': ['instrument', 'text', 'UpCodes — adopted code text'],
  'ecode360.com': ['instrument', 'text', 'municipal code text'],
  'nfpa.org': ['instrument', 'text', 'NFPA — the standard itself'],
  'asme.org': ['instrument', 'text', 'ASME — the standard itself'],
  'iccsafe.org': ['instrument', 'text', 'ICC — the model code itself'],
  'ansi.org': ['instrument', 'text', 'ANSI — the standard itself'],
  'nicet.org': ['instrument', 'authority', "certifying body's own requirement"],
  /* wires distribute the issuer's own words: not a second origin */
  'prnewswire.com': ['issuer', 'wire', 'wire — carries the issuer’s own release'],
  'businesswire.com': ['issuer', 'wire', 'wire — carries the issuer’s own release'],
  'globenewswire.com': ['issuer', 'wire', 'wire — carries the issuer’s own release'],
  'accesswire.com': ['issuer', 'wire', 'wire — carries the issuer’s own release'],
  'stocktitan.net': ['issuer', 'wire', 'republishes the issuer’s own release'],
  /* mirrors */
  'archive.org': ['unknown', 'mirror', 'mirror — classify the page it copies'],
  'scribd.com': ['unknown', 'mirror', 'mirror — classify the page it copies'],
  'slideshare.net': ['unknown', 'mirror', 'mirror — classify the page it copies'],
  /* press */
  'elevatorworld.com': ['press', '', 'trade press'],
  'sdmmag.com': ['press', '', 'trade press'],
  'securitysales.com': ['press', '', 'trade press'],
  'achrnews.com': ['press', '', 'trade press'],
  'pehub.com': ['press', '', 'trade press (paywalled)'],
  'axios.com': ['press', '', 'press'],
  'reuters.com': ['press', '', 'press'],
  'bloomberg.com': ['press', '', 'press'],
  'wsj.com': ['press', '', 'press'],
  'nytimes.com': ['press', '', 'press'],
  'forbes.com': ['press', '', 'press'],
  'cnbc.com': ['press', '', 'press'],
  'fool.com': ['press', '', 'press'],
  'investing.com': ['press', '', 'press'],
  'marketwatch.com': ['press', '', 'press'],
  'seekingalpha.com': ['press', '', 'press'],
  'barrons.com': ['press', '', 'press'],
  'bisnow.com': ['press', '', 'press'],
  'constructiondive.com': ['press', '', 'trade press'],
  'crainsnewyork.com': ['press', '', 'press'],
  /* home services — added 2026-08-12. homepros.news was the third most-cited
     domain in the home-services corpus (10 URLs) and had never been classed,
     so every figure resting on it was exempt from the collapse test. That is
     the same shape as the fire-safety failure, one table entry away. */
  'homepros.news': ['press', '', 'trade press — Homepros Media, Charlotte NC'],
  'pmmag.com': ['press', '', 'trade press — Plumbing & Mechanical'],
  'mdm.com': ['press', '', 'trade press — Modern Distribution Management'],
  'facilitiesnews.com': ['press', '', 'trade press'],
  'thehardwirenews.com': ['press', '', 'trade press'],
  'abfjournal.com': ['press', '', 'trade press — asset-based finance'],
  'dallasinnovates.com': ['press', '', 'regional press'],
  'bloomberglaw.com': ['press', '', 'press'],
  'money.com': ['press', '', 'press'],
  'yahoo.com': ['press', '', 'press — much of it syndicated wire copy'],
  /* vendors and aggregators */
  'ibisworld.com': ['vendor', '', 'market-research aggregator, paywalled'],
  'pitchbook.com': ['vendor', '', 'deal-data vendor, paywalled'],
  'statista.com': ['vendor', '', 'data aggregator'],
  'grandviewresearch.com': ['vendor', '', 'market-research firm'],
  'gminsights.com': ['vendor', '', 'market-research firm'],
  'marketsandmarkets.com': ['vendor', '', 'market-research firm'],
  'mordorintelligence.com': ['vendor', '', 'market-research firm'],
  'technavio.com': ['vendor', '', 'market-research firm'],
  'imarcgroup.com': ['vendor', '', 'market-research firm'],
  'researchandmarkets.com': ['vendor', '', 'market-research reseller'],
  'fortunebusinessinsights.com': ['vendor', '', 'market-research firm'],
  'alliedmarketresearch.com': ['vendor', '', 'market-research firm'],
  'precedenceresearch.com': ['vendor', '', 'market-research firm'],
  'verifiedmarketresearch.com': ['vendor', '', 'market-research firm'],
  'gartner.com': ['vendor', '', 'analyst firm'],
  'gfdata.com': ['vendor', '', 'private-transaction data provider, subscription'],
  'arizton.com': ['vendor', '', 'market-research firm'],
  'spglobal.com': ['vendor', '', 'data provider'],
  'tradingview.com': ['vendor', '', 'market-data aggregator'],
  'grata.com': ['vendor', '', 'company-search vendor'],
  'vantainsights.com': ['vendor', '', 'market-research firm'],
  /* consultancies publish research and sell services into the same market —
     vendor, not instrument, however well regarded the name is */
  'bain.com': ['vendor', '', 'consultancy research (Global PE Report)'],
  'mckinsey.com': ['vendor', '', 'consultancy research'],
  'grantthornton.com': ['vendor', '', 'accounting firm research'],
  'fmicorp.com': ['vendor', '', 'construction-sector consultancy'],
  /* interested parties: they sell into, or represent, the market they measure */
  'nationalelevatorindustry.org': ['interested', '', 'NEII — OEM trade association'],
  'neiep.org': ['interested', '', 'industry education programme (union/OEM joint)'],
  'iuec.org': ['interested', '', 'IUEC — the union whose roster is the figure'],
  'naesai.org': ['interested', '', 'inspector trade association'],
  'ctacquisitions.com': ['interested', '', 'M&A aggregator page'],
  /* home services — added 2026-08-12 */
  'npmapestworld.org': ['interested', '', 'NPMA — pest-control trade association'],
  'nahb.org': ['interested', '', 'NAHB — homebuilder association'],
  'nabtu.org': ['interested', '', 'building-trades union federation'],
  'acg.org': ['interested', '', 'Association for Corporate Growth'],
  'fsb.org': ['interested', '', 'small-business membership body'],
  'rmi.org': ['interested', '', 'advocacy nonprofit'],
  'jll.com': ['interested', '', 'brokerage — sells into the market it measures'],
  'axial.net': ['interested', '', 'deal marketplace'],
  'leadersedge.com': ['interested', '', 'brokerage trade body'],
  'wtwco.com': ['interested', '', 'insurance broker'],
  /* software and finance vendors selling to the trade: their benchmarks are
     marketing collateral with a number in them */
  'servicetitan.com': ['interested', '', 'field-service software — sells to the trade'],
  'getjobber.com': ['interested', '', 'field-service software — sells to the trade'],
  'simprogroup.com': ['interested', '', 'field-service software — sells to the trade'],
  'servicenation.com': ['interested', '', 'contractor membership organisation'],
  'prophetaccounting.com': ['interested', '', 'accounting firm serving HVAC'],
  'tradesly.ai': ['interested', '', 'field-service software — sells to the trade'],
  'searchlightdigital.io': ['interested', '', 'marketing agency serving the trade'],
  'angi.com': ['interested', '', 'lead marketplace'],
  'modernize.com': ['interested', '', 'lead marketplace'],
  'synchrony.com': ['interested', '', 'consumer lender to the trade'],
  'refrigerantdepot.com': ['interested', '', 'distributor'],
  'hvacpproducts.com': ['interested', '', 'distributor'],
  'pickhvac.com': ['interested', '', 'affiliate/consumer pricing site'],
  'hvacprojectcost.com': ['interested', '', 'affiliate/consumer pricing site'],
  /* law firms publish client alerts to win the work the alert describes */
  'hklaw.com': ['interested', '', 'law firm client alert'],
  'wilmerhale.com': ['interested', '', 'law firm client alert'],
  'millernash.com': ['interested', '', 'law firm client alert'],
  /* a sponsor's or operator's own site is the issuer speaking about itself */
  'apollo.com': ['issuer', '', "sponsor's own site"],
  'blackstone.com': ['issuer', '', "sponsor's own site"],
  'rentokil-initial.com': ['issuer', '', "operator's own site"],
  'aireserv.com': ['issuer', '', 'Neighborly brand site'],
  'mrrooter.com': ['issuer', '', 'Neighborly brand site'],
  'mrelectric.com': ['issuer', '', 'Neighborly brand site'],
  'mistersparky.com': ['issuer', '', 'Authority Brands site'],
  'onehourheatandair.com': ['issuer', '', 'Authority Brands site'],
  'benjaminfranklinplumbing.com': ['issuer', '', 'Authority Brands site'],
  'callmattioni.com': ['issuer', '', "operator's own site"],
  'gopaschal.com': ['issuer', '', "operator's own site"],
  /* federal statistical publishers that do not sit on a .gov host */
  'onetonline.org': ['instrument', 'authority', 'O*NET — sponsored by US DOL'],
  'newyorkfed.org': ['instrument', 'authority', 'Federal Reserve Bank of New York'],
  'stlouisfed.org': ['instrument', 'authority', 'Federal Reserve Bank of St. Louis (FRED)'],
  /* platforms whose class depends entirely on who wrote the page */
  'substack.com': ['unknown', 'mirror', 'newsletter platform — classify the author'],
  /* elevator — added 2026-08-12 when the coverage floor found this corpus 40%
     classified. The floor exists so this list gets written when a market
     OPENS, not when a post gets called slop. */
  'otis.com': ['issuer', '', "the manufacturer's own site and filings pages"],
  'kone.com': ['issuer', '', "the manufacturer's own site — inside-information releases"],
  'tkelevator.com': ['issuer', '', "the manufacturer's own site"],
  'schindler.com': ['issuer', '', "the manufacturer's own site"],
  'mitsubishielectric.com': ['issuer', '', "the manufacturer's own site"],
  'apigroupcorp.com': ['issuer', '', "the issuer's own site"],
  'q4cdn.com': ['issuer', 'wire', "IR hosting CDN — carries the issuer's own documents"],
  'stockstory.org': ['press', '', 'markets press'],
  'barchart.com': ['vendor', '', 'market-data aggregator'],
  'financialcontent.com': ['issuer', 'wire', 'syndication shell — carries wire copy'],
  'cbc.ca': ['press', '', 'press'],
  'eleconomista.es': ['press', '', 'press'],
  'habitatmag.com': ['press', '', 'trade press — co-op/condo boards'],
  'skilledtradesiq.com': ['press', '', 'trade press'],
  'elevatorblueprint.com': ['interested', '', 'industry content site'],
  'costar.com': ['vendor', '', 'real-estate data vendor'],
  'cbinsights.com': ['vendor', '', 'deal-data vendor'],
  'stax.com': ['vendor', '', 'consultancy research'],
  'naics.com': ['vendor', '', 'commercial NAICS lookup — NOT the Census'],
  'repair.org': ['interested', '', 'right-to-repair advocacy'],
  'neii.org': ['interested', '', 'NEII — OEM trade association'],
  'naec.org': ['interested', '', 'NAEC — elevator contractor association'],
  'elevatorcontractors.org': ['interested', '', 'contractor association'],
  'csagroup.org': ['instrument', 'text', 'CSA — the standard itself'],
  'credly.com': ['instrument', 'authority', 'credential registry'],
  'elaws.us': ['instrument', 'text', 'code text mirror'],
  'findlaw.com': ['instrument', 'text', 'case text'],
  'amlegal.com': ['instrument', 'text', 'municipal code text'],
  'wikipedia.org': ['unknown', 'mirror', 'tertiary — classify the citation under it'],
  'github.com': ['unknown', 'mirror', 'hosting — classify the author'],
  'archive.org': ['unknown', 'mirror', 'mirror — classify the page it copies'],
  'socrata.com': ['instrument', 'authority', 'government open-data API host'],
  'edgar.tools': ['instrument', 'authority', 'EDGAR full-text mirror'],
  'cornell.edu': ['instrument', 'text', 'Cornell LII — code text'],
  'uky.edu': ['unknown', '', 'academic host — classify by hand'],
  'wisc.edu': ['instrument', 'authority', 'state university purchasing records'],
  /* private-equity and sponsor sites in the elevator register */
  'arcline.com': ['issuer', '', "sponsor's own site"],
  'berkshirepartners.com': ['issuer', '', "sponsor's own site"],
  'aligncp.com': ['issuer', '', "sponsor's own site"],
  'carrollcapital.com': ['issuer', '', "sponsor's own site"],
  'centuryparkcapital.com': ['issuer', '', "sponsor's own site"],
  'gaugecapital.com': ['issuer', '', "sponsor's own site"],
  'hl.com': ['interested', '', 'investment bank research'],
  'bassberry.com': ['interested', '', 'law firm client alert'],
  /* elevator operators' own sites — issuer for facts about themselves */
  'mavenelevator.com': ['issuer', '', "operator's own site"],
  'americanelevator.com': ['issuer', '', "operator's own site"],
  'actionelevator.com': ['issuer', '', "operator's own site"],
  'axxiomelevator.com': ['issuer', '', "operator's own site"],
  'cedelevator.com': ['issuer', '', "operator's own site"],
  'champion-elevator.com': ['issuer', '', "operator's own site"],
  'delawareelevator.com': ['issuer', '', "operator's own site"],
  'elevatedfacilityservices.com': ['issuer', '', "operator's own site"],
  'elevatorsystems.com': ['issuer', '', "operator's own site"],
  'cibeslift.com': ['issuer', '', "manufacturer's own site"],
  'nidec.com': ['issuer', '', "component manufacturer's own site"],
  'esigr.com': ['issuer', '', "operator's own site"],
  'ascendsafetycollective.com': ['interested', '', 'industry safety group'],
  'ashe.org': ['interested', '', 'ASHE — hospital engineering association'],
  'elevatordatabase.com': ['unknown', '', 'enthusiast database — classify by hand'],
  'elevatorinfo.org': ['interested', '', 'industry information site'],
  /* elevator, second sweep — government and quasi-government hosts that the
     .gov suffix rule cannot see */
  'europa.eu': ['instrument', 'authority', 'EU institutions — DG COMP, CURIA, EUR-Lex'],
  'broward.org': ['instrument', 'authority', 'Broward County government'],
  'igchicago.org': ['instrument', 'authority', 'Chicago Inspector General'],
  'usgovcloudapi.net': ['instrument', 'authority', 'US government cloud host — meeting records'],
  'mylicense.com': ['instrument', 'authority', 'state licence-registry platform'],
  'myfloridalicense.com': ['instrument', 'authority', 'Florida DBPR licence registry'],
  'uky.edu': ['instrument', 'authority', 'University of Kentucky purchasing records'],
  'law360.com': ['press', '', 'legal trade press'],
  'vlex.es': ['instrument', 'text', 'case text'],
  'hartfordbusiness.com': ['press', '', 'regional business press'],
  'laist.com': ['press', '', 'regional press'],
  'insidermonkey.com': ['press', '', 'markets content site'],
  'gurufocus.com': ['vendor', '', 'market-data aggregator'],
  'stockanalysis.com': ['vendor', '', 'market-data aggregator'],
  'skyscrapercenter.com': ['vendor', '', 'CTBUH building database'],
  'unionfacts.com': ['interested', '', 'anti-union advocacy — LM-2 restatements'],
  'kingsiii.com': ['interested', '', 'emergency-phone vendor — sells into the trade'],
  'liftnet.com': ['interested', '', 'monitoring vendor — sells into the trade'],
  'plainhirecheck.com': ['interested', '', 'screening vendor'],
  'mebs.com': ['issuer', '', "operator's own site"],
  'specializedelevator.com': ['issuer', '', "operator's own site"],
  'urbanelevator.com': ['issuer', '', "operator's own site"],
  'teigroup.com': ['issuer', '', "operator's own site"],
  'thayerstreet.com': ['issuer', '', "sponsor's own site"],
/* fire-safety — added 2026-08-12. The corpus was 30% classified; the guard
     refused to verdict it, correctly. 188 domains classed by hand: the
     roster of operators and sponsors this market is largely built from, its
     advisors and associations, and its trade press. */
  'apigroupinc.com': ['issuer', '', 'operator’s own site'],
  'davisulmer.com': ['issuer', '', 'operator’s own site'],
  'pyebarkerfs.com': ['issuer', '', 'operator’s own site'],
  'api-nsg.com': ['issuer', '', 'operator’s own site'],
  'marmicfire.com': ['issuer', '', 'operator’s own site'],
  'certasitepro.com': ['issuer', '', 'operator’s own site'],
  'vfpg.com': ['issuer', '', 'operator’s own site'],
  'encorefireprotection.com': ['issuer', '', 'operator’s own site'],
  'wsfp.com': ['issuer', '', 'operator’s own site'],
  'afpgusa.com': ['issuer', '', 'operator’s own site'],
  'natfiresafety.com': ['issuer', '', 'operator’s own site'],
  'everonsolutions.com': ['issuer', '', 'operator’s own site'],
  'cintas.com': ['issuer', '', 'operator’s own site'],
  'zeusfireandsecurity.com': ['issuer', '', 'operator’s own site'],
  'aifire.com': ['issuer', '', 'operator’s own site'],
  'summitcompanies.com': ['issuer', '', 'operator’s own site'],
  'sciensusa.com': ['issuer', '', 'operator’s own site'],
  'candoifp.com': ['issuer', '', 'operator’s own site'],
  'adt.com': ['issuer', '', 'operator’s own site'],
  'pavion.com': ['issuer', '', 'operator’s own site'],
  'firesp.com': ['issuer', '', 'operator’s own site'],
  'orrprotection.com': ['issuer', '', 'operator’s own site'],
  'spectrum-safety.com': ['issuer', '', 'operator’s own site'],
  'ironsmithfire.com': ['issuer', '', 'operator’s own site'],
  'getzfire.com': ['issuer', '', 'operator’s own site'],
  'facilitec-sw.com': ['issuer', '', 'operator’s own site'],
  'minutemanst.com': ['issuer', '', 'operator’s own site'],
  'carrier.com': ['issuer', '', 'operator’s own site'],
  'honeywell.com': ['issuer', '', 'operator’s own site'],
  'altusfire.com': ['issuer', '', 'operator’s own site'],
  'guardianfireholdings.com': ['issuer', '', 'operator’s own site'],
  'integratedprotectionservices.com': ['issuer', '', 'operator’s own site'],
  'wmfireprotection.com': ['issuer', '', 'operator’s own site'],
  'autronicafire.com': ['issuer', '', 'operator’s own site'],
  'det-tronics.com': ['issuer', '', 'operator’s own site'],
  'marioff.com': ['issuer', '', 'operator’s own site'],
  'guardianfireprotection.com': ['issuer', '', 'operator’s own site'],
  'ars-guardian.com': ['issuer', '', 'operator’s own site'],
  'centralvalleyfire.com': ['issuer', '', 'operator’s own site'],
  'summitfiresecurity.com': ['issuer', '', 'operator’s own site'],
  'convergint.com': ['issuer', '', 'operator’s own site'],
  'impactfireservices.com': ['issuer', '', 'operator’s own site'],
  'telgian.com': ['issuer', '', 'operator’s own site'],
  'absolutefireaz.com': ['issuer', '', 'operator’s own site'],
  'securityfiresystems.com': ['issuer', '', 'operator’s own site'],
  'comfortsystemsusa.com': ['issuer', '', 'operator’s own site'],
  'kidde.com': ['issuer', '', 'operator’s own site'],
  'vfpfire.com': ['issuer', '', 'operator’s own site'],
  'grunaufire.com': ['issuer', '', 'operator’s own site'],
  'cogswellsprinkler.com': ['issuer', '', 'operator’s own site'],
  'psintegrated.com': ['issuer', '', 'operator’s own site'],
  'ironcladfireprotection.com': ['issuer', '', 'operator’s own site'],
  'tfp1.com': ['issuer', '', 'operator’s own site'],
  'kinetixfire.com': ['issuer', '', 'operator’s own site'],
  'firetron.com': ['issuer', '', 'operator’s own site'],
  'pyebarkerfire.com': ['issuer', '', 'operator’s own site'],
  'chubbfs.com': ['issuer', '', 'operator’s own site'],
  'summitfire.com': ['issuer', '', 'operator’s own site'],
  'kiddeglobalsolutions.com': ['issuer', '', 'operator’s own site'],
  'academyfire.com': ['issuer', '', 'operator’s own site'],
  'sciensbuildingsolutions.com': ['issuer', '', 'operator’s own site'],
  'vscfire.com': ['issuer', '', 'operator’s own site'],
  'coscofire.com': ['issuer', '', 'operator’s own site'],
  'firetrol.com': ['issuer', '', 'operator’s own site'],
  'security101.com': ['issuer', '', 'operator’s own site'],
  'aspyrefls.com': ['issuer', '', 'operator’s own site'],
  'spectrumsafetysolutions.com': ['issuer', '', 'operator’s own site'],
  'rollins.com': ['issuer', '', 'operator’s own site'],
  'unifirst.com': ['issuer', '', 'operator’s own site'],
  'confirmedlifesafety.com': ['issuer', '', 'operator’s own site'],
  'fpiseattle.com': ['issuer', '', 'operator’s own site'],
  'securitas.com': ['issuer', '', 'operator’s own site'],
  'stanleyblackanddecker.com': ['issuer', '', 'operator’s own site'],
  'securitastechnology.com': ['issuer', '', 'operator’s own site'],
  'kastle.com': ['issuer', '', 'operator’s own site'],
  '1752.com': ['issuer', '', 'operator’s own site'],
  'belforfranchisegroup.com': ['issuer', '', 'operator’s own site'],
  'hoodzfranchise.com': ['issuer', '', 'operator’s own site'],
  'kitchenguardfranchise.com': ['issuer', '', 'operator’s own site'],
  'usmadesupply.com': ['issuer', '', 'operator’s own site'],
  'nrg.com': ['issuer', '', 'operator’s own site'],
  'fm.com': ['issuer', '', 'operator’s own site'],
  'fsresidential.com': ['issuer', '', 'operator’s own site'],
  'riversidecompany.com': ['issuer', '', 'sponsor’s own site'],
  'leonardgreen.com': ['issuer', '', 'sponsor’s own site'],
  'kkr.com': ['issuer', '', 'sponsor’s own site'],
  'carlyle.com': ['issuer', '', 'sponsor’s own site'],
  'knoxlane.com': ['issuer', '', 'sponsor’s own site'],
  'gryphon-inv.com': ['issuer', '', 'sponsor’s own site'],
  'altas.com': ['issuer', '', 'sponsor’s own site'],
  'permira.com': ['issuer', '', 'sponsor’s own site'],
  'investcorp.com': ['issuer', '', 'sponsor’s own site'],
  'breakwaterma.com': ['issuer', '', 'sponsor’s own site'],
  'caltius.com': ['issuer', '', 'sponsor’s own site'],
  'gemspring.com': ['issuer', '', 'sponsor’s own site'],
  'percheron.com': ['issuer', '', 'sponsor’s own site'],
  'alliancebernstein.com': ['issuer', '', 'sponsor’s own site'],
  'llcp.com': ['issuer', '', 'sponsor’s own site'],
  'kirkland.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'rwbaird.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'harriswilliams.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'lincolninternational.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'meridianib.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'pmcf.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'benchmarkintl.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'morganbusinesssales.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'thecfigroup.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'generational.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'dealseam.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'valuationresearch.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'stblaw.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'davispolk.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'weil.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'lw.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'debevoise.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'koleyjessen.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'norrismclaughlin.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'deloitte.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'marsh.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'markel.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'ciab.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'latentinsure.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'verisk.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'isomitigation.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'federato.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'morganstanley.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'crunchbase.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'cushmanwakefield.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'commercialcafe.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'constrafor.com': ['interested', '', 'advisor, bank, law firm or insurer — sells into this market'],
  'nfsa.org': ['interested', '', 'trade association or advocacy body'],
  'firesprinkler.org': ['interested', '', 'trade association or advocacy body'],
  'nafed.org': ['interested', '', 'trade association or advocacy body'],
  'fssa.org': ['interested', '', 'trade association or advocacy body'],
  'restaurant.org': ['interested', '', 'trade association or advocacy body'],
  'aha.org': ['interested', '', 'trade association or advocacy body'],
  'aia.org': ['interested', '', 'trade association or advocacy body'],
  'nic.org': ['interested', '', 'trade association or advocacy body'],
  'securityindustry.org': ['interested', '', 'trade association or advocacy body'],
  'sprinklerfitters669.org': ['interested', '', 'trade association or advocacy body'],
  'homefiresprinkler.org': ['interested', '', 'trade association or advocacy body'],
  'cleanpower.org': ['interested', '', 'trade association or advocacy body'],
  'msfes.org': ['interested', '', 'trade association or advocacy body'],
  'servicetrade.com': ['interested', '', 'software or service vendor selling to the trade'],
  'inspectpoint.com': ['interested', '', 'software or service vendor selling to the trade'],
  'uptickhq.com': ['interested', '', 'software or service vendor selling to the trade'],
  'buildops.com': ['interested', '', 'software or service vendor selling to the trade'],
  'thecomplianceengine.com': ['interested', '', 'software or service vendor selling to the trade'],
  'qrfs.com': ['interested', '', 'software or service vendor selling to the trade'],
  'fireprotectionfinder.com': ['interested', '', 'software or service vendor selling to the trade'],
  'firecertacademy.com': ['interested', '', 'software or service vendor selling to the trade'],
  'contractorlicenserequirements.com': ['interested', '', 'software or service vendor selling to the trade'],
  'zeorouteplanner.com': ['interested', '', 'software or service vendor selling to the trade'],
  'vettedbiz.com': ['interested', '', 'software or service vendor selling to the trade'],
  'homeguide.com': ['interested', '', 'software or service vendor selling to the trade'],
  'memoori.com': ['interested', '', 'software or service vendor selling to the trade'],
  'securityinfowatch.com': ['press', '', 'trade or business press'],
  'securitysystemsnews.com': ['press', '', 'trade or business press'],
  'themiddlemarket.com': ['press', '', 'trade or business press'],
  'privsource.com': ['press', '', 'trade or business press'],
  'datacenterdynamics.com': ['press', '', 'trade or business press'],
  'internationalfireandsafetyjournal.com': ['press', '', 'trade or business press'],
  'fireandsafetyjournalamericas.com': ['press', '', 'trade or business press'],
  'facilitiesdive.com': ['press', '', 'trade or business press'],
  'phcppros.com': ['press', '', 'trade or business press'],
  'alternativeswatch.com': ['press', '', 'trade or business press'],
  'fsmmag.com': ['press', '', 'trade or business press'],
  'tcbmag.com': ['press', '', 'trade or business press'],
  'natlawreview.com': ['press', '', 'trade or business press'],
  'bgov.com': ['press', '', 'trade or business press'],
  'middlemarketgrowth.com': ['press', '', 'trade or business press'],
  'franchisetimes.com': ['press', '', 'trade or business press'],
  'datacenterknowledge.com': ['press', '', 'trade or business press'],
  'restaurantbusinessonline.com': ['press', '', 'trade or business press'],
  'marketsgroup.com': ['press', '', 'trade or business press'],
  'speedwellmemos.com': ['press', '', 'trade or business press'],
  'kff.org': ['vendor', '', 'research nonprofit'],
  'nclicensing.com': ['instrument', 'authority', 'state or county authority'],
  'myfloridacfo.com': ['instrument', 'authority', 'state or county authority'],
  'leegov.com': ['instrument', 'authority', 'state or county authority'],
  'flrules.org': ['instrument', 'text', 'Florida Administrative Code text'],
  'energy-storage.news': ['press', '', 'trade press — energy storage'],
  'grantthornton.co.uk': ['vendor', '', 'accounting firm research'],
  'prweb.com': ['issuer', 'wire', 'wire — carries the issuer’s own release'],
  'squarespace.com': ['unknown', 'mirror', 'site host — classify the author'],
  'municipal.codes': ['instrument', 'text', 'municipal code text'],
  'firecodes.ai': ['interested', '', 'code-lookup vendor'],
  'uptocode.build': ['interested', '', 'code-compliance vendor'],
  'smbx.ai': ['self', '', 'this practice'],
};

/** Registrable domain: strip www, keep one label above the public suffix, and
 *  handle the two-part suffixes (co.uk, com.au, gov.uk …) by hand. No
 *  dependencies, so no public-suffix list — this covers what the corpus has. */
const TWO_PART = new Set(['co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'or', 'ne', 'go', 'gob']);
function registrable(host: string): string {
  const h = host.toLowerCase().replace(/^www\d?\./, '').replace(/:\d+$/, '');
  const p = h.split('.');
  if (p.length <= 2) return h;
  const tld = p[p.length - 1], sld = p[p.length - 2];
  if (tld.length === 2 && TWO_PART.has(sld)) return p.slice(-3).join('.');
  return p.slice(-2).join('.');
}

function classifyDomain(host: string): { cls: Cls; sub: Sub; why: string } {
  const d = registrable(host);
  const named = DOMAIN_CLASS[d];
  if (named) return { cls: named[0], sub: named[1], why: named[2] };
  /* Suffix rules. A .gov or .mil host is a government publication; that is the
     one inference safe enough to make without naming the site. */
  if (/\.gov$/.test(d) || /\.gov\.[a-z]{2}$/.test(d) || /\.mil$/.test(d))
    return { cls: 'instrument', sub: 'authority', why: 'government publisher (.gov)' };
  if (/\.us$/.test(d) && /(state|city|county|dob|dol)/.test(host))
    return { cls: 'instrument', sub: 'authority', why: 'state or city publisher' };
  if (/^(ir|investors?)\./.test(host) || /investors?\.[a-z]/.test(host))
    return { cls: 'issuer', sub: '', why: 'investor-relations host' };
  /* Advisory and sponsor sites: interested in the market they price. The token
     has to be in the DOMAIN, not merely somewhere on the page. */
  if (/(capital|partners|advisors?|advisory|equity|mergers|acquisitions|manda|ibanking)/.test(d))
    return { cls: 'interested', sub: '', why: 'advisory or sponsor domain' };
  if (/\.edu$/.test(d)) return { cls: 'unknown', sub: '', why: 'academic host — classify by hand' };
  return { cls: 'unknown', sub: '', why: 'unrecognised domain' };
}

/* ── dates in a source line ───────────────────────────────────────────────
 * Syndication risk is a DATE test: two houses of the same class publishing
 * one day apart is the signature of one number moving through a trade cycle.
 * So the dates have to come out of the line, and their precision has to be
 * kept — "Feb 2026" and "2 Feb 2026" are not the same evidence about timing. */
const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8,
  oct: 9, nov: 10, dec: 11,
};
const MONTH_RE = '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*';
const D_M_Y = new RegExp(`\\b(\\d{1,2})\\s+${MONTH_RE}\\.?\\s+(\\d{4})\\b`, 'i');
const M_D_Y = new RegExp(`\\b${MONTH_RE}\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`, 'i');
const M_Y = new RegExp(`\\b${MONTH_RE}\\.?\\s+(\\d{4})\\b`, 'i');
const ISO = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const Y = /\b(19|20)\d{2}\b/;

function parseDate(s: string): { date: Date; precision: 'day' | 'month' | 'year' } | undefined {
  let m: RegExpMatchArray | null;
  if ((m = s.match(ISO)))
    return { date: new Date(+m[1], +m[2] - 1, +m[3]), precision: 'day' };
  if ((m = s.match(D_M_Y)))
    return { date: new Date(+m[3], MONTHS[m[2].slice(0, 3).toLowerCase()], +m[1]), precision: 'day' };
  if ((m = s.match(M_D_Y)))
    return { date: new Date(+m[3], MONTHS[m[1].slice(0, 3).toLowerCase()], +m[2]), precision: 'day' };
  if ((m = s.match(M_Y)))
    return { date: new Date(+m[2], MONTHS[m[1].slice(0, 3).toLowerCase()], 1), precision: 'month' };
  if ((m = s.match(Y))) return { date: new Date(+m[0], 0, 1), precision: 'year' };
  return undefined;
}
/** The date, removed, so the classifier reads the party and not the calendar. */
const stripDate = (s: string) => s
  .replace(new RegExp(`\\b\\d{1,2}\\s+${MONTH_RE}\\.?\\s+\\d{4}\\b`, 'ig'), ' ')
  .replace(new RegExp(`\\b${MONTH_RE}\\.?\\s+\\d{1,2},?\\s+\\d{4}\\b`, 'ig'), ' ')
  .replace(new RegExp(`\\b${MONTH_RE}\\.?\\s+\\d{4}\\b`, 'ig'), ' ')
  .replace(/\b\d{4}\s*[–—-]\s*\d{4}\b/g, ' ')
  .replace(/\bas at\b|\bas of\b|\bcaptured\b|\bretrieved\b/ig, ' ')
  .replace(/\s{2,}/g, ' ').trim();

/* ── the text classifier ──────────────────────────────────────────────────
 * Ordered. An earlier rule wins, and the order encodes the practice's own
 * judgements: a statute cited by an association is still a statute. */
const RULES: [RegExp, Cls, Sub, string][] = [
  /* NAMED OPACITY RUNS FIRST. "industry M&A reports (est.)" contains the word
     M&A and is not an advisory; "IBISWorld / U.S. Census / industry reports
     (avg.)" contains the word Census and is not a Census table. A phrase that
     names nothing is opaque before it is anything else, and `(est.)`/`(avg.)`
     is the deck telling you on its face that the figure is an average across
     sources it will not name. */
  [/\bindustry (?:data|reports?|sources?|estimates?|figures?)\b|\bvarious sources?\b|\bproprietary\b|\bconfidential\b|\bon file\b|\bunnamed\b|\binternal\b|\bmarket participants?\b|\bpractitioner interviews?\b/i, 'opaque', '', 'names no document'],
  [/\(\s*est\.?\s*\)|\(\s*avg\.?\s*\)|\(\s*estimated?\s*\)|\bblended\b/i, 'opaque', '', 'an average across unnamed sources'],
  /* instruments whose referent is a TEXT — the corroboration carriers */
  [/§|\bsec(?:tion)?\.?\s?\d+[.\-–]\d/i, 'instrument', 'text', 'section identifier'],
  [/\b(?:RCW|WAC|CFR|U\.?S\.?C\.?|TAC|CCR|OAC|NYCRR|USCA|ORS|NRS)\b/, 'instrument', 'text', 'statute or administrative code'],
  [/\b(?:stat|code)\.?\s*(?:§|ann\.|\d)/i, 'instrument', 'text', 'statute citation'],
  [/\bAdm(?:in)?\.?\s*Code\b|\bAdministrative Code\b|\bRule\s+\d/i, 'instrument', 'text', 'administrative code'],
  [/\bNFPA\s*\d|\bASME\s*A?1?7|\bASTM\b|\bANSI\b|\bUL\s*\d|\bIEEE\s*\d/i, 'instrument', 'text', 'consensus standard'],
  [/\bIFC\b|\bIBC\b|\bIRC\b|\bNEC\b|\b(?:fire|building|mechanical|electrical) code\b/i, 'instrument', 'text', 'model or adopted code'],
  [/\bIn re\b|\bv\.\s|\b\d+(?:st|nd|rd|th)\s+Cir\.|\bF\.\s?(?:2d|3d|Supp)\b|\bopinion\b|\blitigation\b/i, 'instrument', 'text', 'court opinion'],
  [/\bprevailing wage\b|\bDIR\b|\bOSHA\b|\bEPA\b|\bFTC\b|\bDOJ\b/i, 'instrument', 'authority', 'regulator'],
  [/\b\d{1,3}[A-Z]{0,3}-\d{1,4}[.\-–]\d/, 'instrument', 'text', 'code-style identifier'],
  /* mandatory filings */
  [/\b10-K\b|\b10-Q\b|\b8-K\b|\bS-1\b|\bDEF\s?14A\b|\bForm\s+\d|\b20-F\b/i, 'instrument', 'filing', 'SEC filing'],
  [/\bexhibit\s*\d|\bEX-\d|\baccession\b/i, 'instrument', 'filing', 'filing exhibit'],
  /* a regulator's or authority's own instrument */
  [/\bCMS-\d|\btag\s+K\d|\bstate fire marshal\b|\bfire marshal\b/i, 'instrument', 'authority', "regulator's own instrument"],
  [/\bsolicitation\b|\bcontract\s+\S*\d|\bdocket\b|\bpermit\s+\d|\bdetermination\b/i, 'instrument', 'authority', 'public record with an identifier'],
  [/\bcity of\b|\bcounty of\b|\bdep(?:ar)?t(?:ment)?\.?\s+of\b|\bdob\b|\bstate of\b/i, 'instrument', 'authority', 'government publisher'],
  /* government measurement */
  [/\bcensus\b|\bBLS\b|\bOEWS\b|\bQCEW\b|\bNAICS\b|\bopen data\b|\bcounty business patterns\b|\bAmerican Community Survey\b|\bSOC\s?\d/i, 'instrument', 'data', 'government statistical table'],
  /* the practice itself */
  [/\bsmbx\b|\bour (?:own )?(?:register|screen|computation|arithmetic)\b|\bconsolidator register\b|\bhouse (?:arithmetic|estimate|derivation)\b|\bprior (?:work|note|assessment)\b/i, 'self', '', 'the practice’s own work'],
  /* research vendors and aggregators */
  [/\bIBISWorld\b|\bPitchBook\b|\bStatista\b|\bGrand\s?View\b|\bGM\s?Insights\b|\bMarketsandMarkets\b|\bMordor\b|\bTechnavio\b|\bIMARC\b|\bFrost\s?&\s?Sullivan\b|\bGartner\b|\bForrester\b/i, 'vendor', '', 'market-research vendor'],
  [/\bmarket research\b|\bresearch firm\b|\bdata provider\b/i, 'vendor', '', 'market-research vendor'],
  /* interested parties */
  [/\bM&A\b|\bmergers?\b(?!\s+of\b)|\badvisor(?:s|y)?\b|\bsell-side\b|\binvestment bank\b/i, 'interested', '', 'transaction advisory'],
  [/\bPartners\b|\bCapital\b|\bHoldings\b|\bEquity\b/, 'interested', '', 'advisory or sponsor'],
  [/\bassociation\b|\binstitute\b|\bcouncil\b|\balliance\b|\bfederation\b|\bsociety\b|\bunion\b|\bNEII\b|\bIUEC\b/i, 'interested', '', 'trade body or union'],
  /* the issuer talking about itself */
  [/\binvestor day\b|\bearnings call\b|\bQ[1-4]\s*(?:20\d\d\s*)?call\b|\bpress release\b|\bannual report\b|\binside-information\b|\binvestor (?:relations|presentation|deck)\b|\bmanagement estimate\b|\bshareholder letter\b/i, 'issuer', '', 'the issuer’s own event'],
  [/\bbrand pages?\b|\bcompany (?:site|page|website)s?\b|\bcorporate site\b/i, 'issuer', '', 'company self-publication'],
  /* press */
  [/\bmagazine\b|\bjournal\b|\bgazette\b|\bnewspaper\b|\btrade press\b|\bnews\b|\btimes\b|\bweekly\b|\breport(?:ed|ing) by\b/i, 'press', '', 'press'],
];

/** A handle is anything that gets a reader to EXACTLY this document: a section
 *  or docket number, an exhibit, an accession, a URL — or a named publisher
 *  plus a day-precision date, which identifies one publication. A bare year or
 *  a bare month does not; "SEC exhibits, July 2026" names no exhibit. */
function hasHandle(text: string, d?: { precision: string }): boolean {
  if (/https?:\/\//i.test(text)) return true;
  if (/§|\bno\.\s*\d|\b[A-Z]{1,4}[-–]?\d{2,}/.test(text)) return true;   // docket / form / code ids
  if (/\b\d+[.:\-]\d+/.test(text)) return true;                          // 901.6, 18.160, 61C-5.0015
  if (/\b(?:10-K|10-Q|8-K|S-1|20-F|DEF\s?14A)\b/i.test(text)) return true;
  if (/\bexhibit\s*\d|\baccession\b/i.test(text)) return true;
  if (/`[^`]{3,}`/.test(text)) return true;                              // a code-formatted id
  if (/\b(?=[a-z0-9]*\d)[a-z0-9]{2,}-[a-z0-9]{2,}\b/i.test(text)) return true;  // resource ids: e5aq-a4j2
  if (/\bNFPA\s*\d|\bASME\s*A?\d|\bUL\s*\d|\bSOC\s?\d/i.test(text)) return true;
  if (d?.precision === 'day') return true;                               // one dated publication
  /* A named government series WITH A VINTAGE is one openable table: "BLS OEWS,
     May 2023" gets a reader to a release. The bare container does not — "U.S.
     Census" names a census bureau, not a table, and that distinction is the
     whole difference between the fire-safety and home-services source lines. */
  if (d && /\b(census|BLS|OEWS|QCEW|NAICS|open data|county business patterns)\b/i.test(text)) return true;
  return false;
}

function classifyText(rawIn: string, lineDate?: { date: Date; precision: 'day' | 'month' | 'year' }): Src {
  const raw = rawIn.trim();
  const own = parseDate(raw);
  const d = own ?? lineDate;
  const text = stripDate(raw);
  let cls: Cls = 'unknown', sub: Sub = '', why = 'no recognised class';
  for (const [re, c, s, w] of RULES) {
    if (re.test(text)) { cls = c; sub = s; why = w; break; }
  }
  const openable = cls === 'opaque' ? false : hasHandle(text, d);
  /* An instrument you cannot open is not an instrument. This one rule is what
     turns "Company brand pages and SEC exhibits, July 2026" into a finding:
     the words name a filing class, and the line names no filing. */
  if (!openable && (cls === 'instrument' || cls === 'unknown')) {
    return {
      raw, cls: 'opaque', sub: '', openable: false,
      why: cls === 'instrument'
        ? `names an instrument class (${why}) but no instrument`
        : 'names nothing a reader can open',
      date: d?.date, datePrecision: d?.precision,
    };
  }
  return { raw, cls, sub, why, openable, date: d?.date, datePrecision: d?.precision };
}

/** A source line is one or more sources. Split on the separators the house
 *  style uses — `;` and `·` — never on `,`, because "Rockville, MD, 31 January
 *  2024" is one source and three commas. A segment that is ONLY a date belongs
 *  to the line, not to a source of its own. */
function splitSources(line: string): Src[] {
  const sep = /https?:\/\//.test(line)
    ? /\s*[;·|]\s*|\s+—\s+/                 // a URL owns its slashes
    : /\s*[;·|]\s*|\s+—\s+|\s+\/\s+/;
  const parts = line.split(sep).map(s => s.trim()).filter(Boolean);
  const dateOnly = (s: string) => !!parseDate(s) && stripDate(s).replace(/[(),.]/g, '').trim().length === 0;
  const trailing = parts.filter(dateOnly).map(parseDate).filter(Boolean)[0] as
    { date: Date; precision: 'day' | 'month' | 'year' } | undefined;
  return parts.filter(p => !dateOnly(p)).map(p => classifyText(p, trailing));
}

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · THE CARD SOURCE-LINE TEST
 * ═════════════════════════════════════════════════════════════════════════ */
type Flag = 'SELF' | 'OPAQUE' | 'MONOCULTURE' | 'SYNDICATION' | 'INTEREST' | 'NO INSTRUMENT';
interface LineResult {
  where: string;
  line: string;
  srcs: Src[];
  flags: { flag: Flag; detail: string; fix: string }[];
  corroborated?: string;
  notes: string[];
}

const CLASS_LABEL: Record<Cls, string> = {
  instrument: 'instrument', issuer: 'issuer', press: 'press', vendor: 'vendor',
  interested: 'interested', self: 'self', opaque: 'opaque', unknown: 'unclassified',
};

/** Words that would count as having told the reader who the source is. Looked
 *  for in the PAGE COPY, not in the source line — a firm's own name is not a
 *  disclosure of its interest. */
const QUALIFIERS = /\b(trade association|association|union|advisory|advisor|sell-side|vendor|interested|management estimate|its own|their own|whose|sells|represents|marketing)\b/i;

function testLine(where: string, line: string, copy: string): LineResult {
  const srcs = splitSources(line);
  const res: LineResult = { where, line, srcs, flags: [], notes: [] };
  if (!srcs.length) return res;

  const instruments = srcs.filter(s => s.cls === 'instrument');
  /* THE ISSUER RULE (Paul, 2026-08-12: "yes, we cite what they said").
     A company's own regulated disclosure IS the primary source for facts
     about that company. Otis stating Otis's service margin is terminal — no
     government table restates a filer's segment result, and demanding one
     would mean the best evidence that exists cannot satisfy the check.

     THE BOUNDARY, and it is the whole of the difference: this holds for what
     the issuer says ABOUT ITSELF. A filer's claim about the SIZE OF ITS
     MARKET is the filer citing someone else, or estimating — not a
     disclosure, and not terminal. No class system can see that distinction;
     it is a scope question, it is the "relabelled total" failure pattern from
     job 2, and it stays a human read. What the machine can see is whether a
     DISCLOSURE is named on the line at all, so that is what it tests. */
  const DISCLOSURE = new RegExp([
    /10-?K|10-?Q|8-?K|20-?F|6-?K|S-1|DEF ?14A|EX-99|form [0-9]|accession|EDGAR/.source,
    /proxy|prospectus|offering circular|exhibit/.source,
    /annual report|interim report|half-year|quarterly report/.source,
    /inside[- ]information|regulatory (?:release|announcement)/.source,
    /* An earnings call and an investor day are Reg FD events: the company on
       the record about itself, transcribed and archived. The house writes them
       as "Q4 2025 call" and "investor day, 21 May 2025", so the pattern has to
       recognise the house's own shorthand or the rule only works on paper. */
    /earnings (?:call|release)|(?:Q[1-4]|FY) ?\d{0,4} (?:call|results|earnings)/.source,
    /investor day|capital markets day|analyst day/.source,
  ].join('|'), 'i');
  const disclosures = srcs.filter(s => s.cls === 'issuer' && DISCLOSURE.test(s.raw));
  const terminal = [...instruments, ...disclosures];
  const named = srcs.filter(s => s.cls !== 'opaque');
  const classes = new Set(named.map(s => s.cls));

  /* ── the corroboration exception, and it runs FIRST ────────────────────
   * If a named TEXT instrument is on the line and every other named source is
   * also a text or the authority that adopts or enforces it, the parties are
   * converging on one document whose wording is the referent. That is
   * corroboration. It suppresses the collapse flags, because flagging it is
   * how a guard gets switched off.                                         */
  const texts = instruments.filter(s => s.sub === 'text');
  const enforcers = instruments.filter(s => s.sub === 'text' || s.sub === 'authority');
  if (texts.length && enforcers.length >= 2 && enforcers.length === instruments.length) {
    const shared = sharedIdentifier(srcs.map(s => s.raw));
    res.corroborated = shared
      ? `${enforcers.length} parties on the same identifier (${shared})`
      : `${texts.length === enforcers.length ? 'separate jurisdictions' : 'a code text and the authority enforcing it'}`;
  }

  /* SELF — the practice citing itself. Not a finding when a named instrument
     sits beside it: "NFPA 25, 72, 10 and 96; smbX, July 2026" labels the
     ARITHMETIC, not the frequencies, and that is how a house derivation
     should be cited. */
  const selfs = srcs.filter(s => s.cls === 'self');
  if (selfs.length && !instruments.length) {
    res.flags.push({
      flag: 'SELF',
      detail: `cites the practice — ${selfs.map(s => `"${s.raw}"`).join(', ')} — and nothing a reader can open`,
      fix: 'Publish the underlying compilation, or put one checkable anchor on the card beside it.',
    });
  } else if (selfs.length) {
    res.notes.push(`house work cited beside a named instrument — a disclosed derivation, not a self-citation`);
  }

  /* OPAQUE — line level. One unreadable segment beside a statute is a bad
     habit; a line where NOTHING can be opened is the finding. */
  if (!named.length || srcs.every(s => !s.openable)) {
    if (!selfs.length) res.flags.push({
      flag: 'OPAQUE',
      detail: `nothing on this line can be opened: ${srcs.map(s => `"${s.raw}" (${s.why})`).join('; ')}`,
      fix: 'Name one handle per source — a section, a docket or solicitation number, an exhibit, a table id, or a dated URL.',
    });
  }

  /* MONOCULTURE / NO INSTRUMENT — nothing terminal underneath.
     The issuer case needs TWO segments before it counts: a company's own
     regulated release about itself is primary as to itself, and flagging a
     single one of those is noise. Two dated events from one issuer is the
     shape that reads as two data points and is one. */
  const alreadyOpaque = res.flags.some(f => f.flag === 'OPAQUE');
  if (disclosures.length && !instruments.length)
    res.notes.push(`terminal on the issuer's own disclosure — ${disclosures.map(d => d.raw).join('; ')}. Primary as to the filer itself; NOT a source for the size of its market.`);
  if (!terminal.length && named.length && !selfs.length && !alreadyOpaque &&
      res.corroborated === undefined) {
    const onlyClass = classes.size === 1 ? [...classes][0] : null;
    const enough = onlyClass === 'issuer' ? named.length >= 2 : named.length >= 1;
    if (onlyClass && enough) {
      res.flags.push({
        flag: 'MONOCULTURE',
        detail: `${named.length} source(s), all ${CLASS_LABEL[onlyClass]}, no instrument among them`
          + (onlyClass === 'issuer' ? ' — two dated events from one class can be one origin' : ''),
        fix: 'Put one terminal document underneath: the statute, the filing, the table, the docket.',
      });
    } else if (!onlyClass) {
      res.flags.push({
        flag: 'NO INSTRUMENT',
        detail: `support is ${[...classes].map(c => CLASS_LABEL[c]).join(' + ')} — nothing terminal`,
        fix: 'Put one terminal document underneath: the statute, the filing, the table, the docket.',
      });
    }
  }

  /* SYNDICATION RISK — the date test. Same non-instrument class, day-precision
     dates within a fortnight: that is one number moving through a trade cycle,
     printed as two independent citations. */
  const dated = srcs.filter(s => s.date && s.datePrecision === 'day' && s.cls !== 'instrument' && s.cls !== 'opaque');
  for (let i = 0; i < dated.length; i++) {
    for (let j = i + 1; j < dated.length; j++) {
      if (dated[i].cls !== dated[j].cls) continue;
      const days = Math.abs(+dated[i].date! - +dated[j].date!) / 86400000;
      if (days <= 14) {
        res.flags.push({
          flag: 'SYNDICATION',
          detail: `"${dated[i].raw}" and "${dated[j].raw}" — two ${CLASS_LABEL[dated[i].cls]} sources ${Math.round(days)} day(s) apart`,
          fix: 'Two houses publishing in the same week is one trade cycle. Name the origin they both drew on, or drop one.',
        });
      }
    }
  }

  /* UNDISCLOSED INTEREST */
  const interested = srcs.filter(s => s.cls === 'interested');
  if (interested.length) {
    if (QUALIFIERS.test(copy)) {
      res.notes.push(`interest is disclosed in the body copy, not on the source line — move it to the line`);
    } else {
      res.flags.push({
        flag: 'INTEREST',
        detail: `${interested.map(s => `"${s.raw}" (${s.why})`).join('; ')} — named without qualification`,
        fix: 'Say what they are on the line: "sell-side advisory", "trade association", "the union whose roster this is".',
      });
    }
  }
  return res;
}

/** The token two citations share — "901.6" in `IFC §901.6; NYC Fire Code (2022),
 *  FC 901.6`. Shared identifiers are the cleanest evidence of convergence on
 *  one text, so they are named in the output rather than merely counted. */
function sharedIdentifier(parts: string[]): string | null {
  if (parts.length < 2) return null;
  const ids = parts.map(p => new Set((p.match(/\d+(?:[.\-–:]\d+)+|\b[A-Z]{2,6}\s?\d{2,}\b/g) ?? [])));
  for (const id of ids[0]) if (ids.slice(1).some(s => s.has(id))) return id;
  return null;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · ORIGIN COLLAPSE ACROSS THE RESEARCH CORPUS
 *
 * The figure grammar is `house/audit.ts`'s and is not redefined here — same
 * discipline as verify-spec.mts. Only the equality KEY is local, and it
 * mirrors that file's `normFig`; if the grammar changes, this changes with it.
 * ═════════════════════════════════════════════════════════════════════════ */
const figuresIn = (t: string) => figuresNotIn(t, '');
const figKey = (f: string) => f.toLowerCase().replace(/,/g, '').replace(/\s+/g, '')
  .replace(/billion/, 'b').replace(/million/, 'm').replace(/trillion/, 't').replace(/bn/, 'b');

const URL_RE = /https?:\/\/[^\s)<>\]"'`]+/gi;

interface Cite { file: string; line: number; domains: string[]; scope: string; context: string; }

function loadCorpus(roots: string[]): { files: string[]; unreadable: string[] } {
  const files: string[] = [], unreadable: string[] = [];
  const TEXT = /\.(md|markdown|txt|text)$/i;
  for (const r of roots) {
    if (!existsSync(r)) continue;
    if (statSync(r).isDirectory()) {
      for (const f of readdirSync(r)) {
        const p = path.join(r, f);
        if (!statSync(p).isFile()) continue;
        (TEXT.test(f) ? files : unreadable).push(p);
      }
    } else (TEXT.test(r) ? files : unreadable).push(r);
  }
  return { files, unreadable };
}

/** A figure too common to trace. `$3`, `6%` and `2x` appear in every corpus in
 *  a dozen unrelated sentences, and "16 citations, 1 origin" about a
 *  single-digit dollar amount is arithmetic on coincidence. Two significant
 *  digits is the floor for saying two lines are carrying the same fact. */
const traceable = (fig: string) => (fig.match(/\d/g) ?? []).length >= 2;

/** Index every figure in the corpus against the origins that support it.
 *
 *  ATTRIBUTION IS THE WEAK JOINT AND IT IS SCOPED, NOT GUESSED. Three scopes,
 *  narrowest first, and the narrowest that has a URL wins:
 *
 *    line    the URL is on the line with the figure — unambiguous
 *    name    the line NAMES a party the corpus links elsewhere. Research
 *            tables print "Capstone Partners" in a cell and keep the URL in a
 *            reference list at the bottom, so a URL-only rule attributes
 *            almost nothing in exactly the files that matter most. The
 *            vocabulary is built from the corpus's OWN domains — no list of
 *            company names is invented here.
 *    block   the URL is in the same paragraph (contiguous non-blank lines) —
 *            these files put the link under the sentence it supports
 *    section the URL is under the same heading, AND that heading carries at
 *            most three distinct domains. A section sourced to a dozen places
 *            attributes nothing: crediting a figure at the top of a run to a
 *            footnote at the bottom is how a checker invents a finding.
 *
 *  A figure site carries the SET of candidate origins in its scope, not one
 *  guess. A set can only make a collapse look less like a collapse, which is
 *  the direction an error should run. Sites with no URL in any scope are
 *  reported as UNATTRIBUTED and excluded from the counts. */
function indexCorpus(files: string[]) {
  const index = new Map<string, Cite[]>();
  let urlCount = 0;
  const domainsOf = (l: string): string[] => {
    const out: string[] = [];
    for (const u of l.match(URL_RE) ?? []) {
      urlCount++;
      try { out.push(registrable(new URL(u).hostname)); } catch { /* not a URL we can read */ }
    }
    return out;
  };
  /* The party vocabulary, built from the corpus's own links. `pehub.com` →
     "pehub", which matches "PE Hub" once punctuation and spaces are stripped.
     Four characters minimum, and the generic hostnames are excluded, because
     "data" or "news" appearing in a sentence is not a citation. */
  const GENERIC = new Set(['data', 'apps', 'info', 'home', 'news', 'blog', 'docs', 'main',
    'site', 'file', 'link', 'page', 'open', 'city', 'state', 'gov', 'www', 'archive', 'about',
    'search', 'media', 'public', 'store', 'group', 'online', 'report', 'reports', 'market']);
  const vocab = new Map<string, string>();
  const texts = files.map(f => readFileSync(f, 'utf8'));
  for (const t of texts) for (const u of t.match(URL_RE) ?? []) {
    try {
      const d = registrable(new URL(u).hostname);
      const key = d.split('.')[0].replace(/[^a-z0-9]/g, '');
      if (key.length >= 4 && !GENERIC.has(key)) vocab.set(key, d);
    } catch { /* not a URL we can read */ }
  }

  files.forEach((f, fi) => {
    const lines = texts[fi].split('\n');
    const perLine = lines.map(domainsOf);
    const named = lines.map(l => {
      const flat = l.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (flat.length < 4) return [];
      const out: string[] = [];
      for (const [key, d] of vocab) if (flat.includes(key)) out.push(d);
      return [...new Set(out)];
    });
    /* block and section spans */
    const blockOf: number[] = [], sectionOf: number[] = [];
    let b = 0, s = 0;
    lines.forEach((l, i) => {
      if (!l.trim()) b = i + 1;
      if (/^#{1,6}\s/.test(l)) { s = i; b = i; }
      blockOf[i] = b; sectionOf[i] = s;
    });
    const gather = (ids: number[], want: number) => {
      const set = new Set<string>();
      for (let i = 0; i < lines.length; i++) if (ids[i] === want) for (const d of perLine[i]) set.add(d);
      return [...set];
    };
    const blockCache = new Map<number, string[]>(), sectionCache = new Map<number, string[]>();
    lines.forEach((l, i) => {
      const figs = figuresIn(l).filter(traceable);
      if (!figs.length) return;
      let domains = perLine[i], scope = 'line';
      if (!domains.length && named[i].length) { domains = named[i]; scope = 'name'; }
      if (!domains.length) {
        if (!blockCache.has(blockOf[i])) blockCache.set(blockOf[i], gather(blockOf, blockOf[i]));
        domains = blockCache.get(blockOf[i])!; scope = 'block';
      }
      if (!domains.length) {
        if (!sectionCache.has(sectionOf[i])) sectionCache.set(sectionOf[i], gather(sectionOf, sectionOf[i]));
        const sec = sectionCache.get(sectionOf[i])!;
        domains = sec.length && sec.length <= 3 ? sec : []; scope = 'section';
      }
      if (!domains.length) scope = 'unattributed';
      for (const fig of new Set(figs.map(figKey))) {
        const arr = index.get(fig) ?? [];
        arr.push({
          file: path.basename(f), line: i + 1, domains, scope,
          context: l.trim().replace(/\s+/g, ' ').slice(0, 84),
        });
        index.set(fig, arr);
      }
    });
  });
  return { index, urlCount };
}

/** Does the evidence around a figure converge on one named text? Statute and
 *  standard identifiers in the citing lines are the tell. Two different
 *  domains both quoting `§9.4.2.2` is corroboration and must not be reported
 *  as collapse. */
const INSTRUMENT_ID = /§\s?\d+[\d.\-–]*|\bNFPA\s*\d+|\bASME\s*A?\d[\d.\-]*|\bA17\.\d|\b(?:RCW|WAC|CFR|USC|TAC|CCR|OAC)\s*[\d.\-–:]+|\bCMS-\d+\w*/gi;
function convergesOnText(cites: Cite[]): string | null {
  const byId = new Map<string, Set<string>>();
  for (const c of cites) {
    for (const m of c.context.match(INSTRUMENT_ID) ?? []) {
      const id = m.replace(/\s+/g, ' ').trim().toLowerCase();
      const set = byId.get(id) ?? new Set<string>();
      for (const p of c.domains.length ? c.domains : [c.file]) set.add(p);
      byId.set(id, set);
    }
  }
  for (const [id, parties] of byId) if (parties.size >= 2) return id;
  return null;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · LOAD THE TARGET
 * ═════════════════════════════════════════════════════════════════════════ */
interface Surface { where: string; source?: string; copy: string; figures: string[]; }

const SPEC = /\.(deck|post)\.mts$/;
const surfaces: Surface[] = [];
let shape = '';

const SKIP = new Set(['image', 'imagePos', 'slug', 'kind', 'style', 'tagColor', 'variants', 'h', 'source', 'connector', 'name']);
function copyOf(node: any, out: string[] = []): string[] {
  if (node == null) return out;
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out; }
  if (Array.isArray(node)) { node.forEach(v => copyOf(v, out)); return out; }
  if (typeof node !== 'object') return out;
  for (const [k, v] of Object.entries(node)) if (!SKIP.has(k)) copyOf(v, out);
  return out;
}

if (SPEC.test(targetPath)) {
  let mod: any;
  try {
    mod = await import(pathToFileURL(targetPath).href);
  } catch (err: any) {
    cannotCheck('the spec would not import', String(err?.message ?? err).split('\n')[0],
      'The builder imports this file the same way, so it would not render either.');
  }
  const art = mod.deck ?? mod.post;
  if (!art) cannotCheck('the spec exports neither `deck` nor `post`',
    `exports found: ${Object.keys(mod).join(', ') || '(none)'}`);
  shape = mod.deck ? 'deck' : 'post';
  if (art.pages) {
    art.pages.forEach((p: any, i: number) => {
      const copy = copyOf(p).join(' ');
      surfaces.push({
        where: `page ${i + 1}  ${p.kind ?? '?'}${p.tag ? `  ${p.tag}` : ''}`,
        source: typeof p.source === 'string' && p.source.trim() ? p.source.trim() : undefined,
        copy, figures: figuresIn(copy),
      });
    });
  } else {
    const copy = copyOf(art).join(' ');
    surfaces.push({ where: 'card', source: art.source, copy, figures: figuresIn(copy) });
  }
  /* The cover and the closer carry figures and have no source: slot at all.
     Named, not checked — the same honesty verify-spec.mts applies. */
  for (const k of ['cover', 'closer', 'caption']) {
    if (!art[k]) continue;
    const copy = copyOf(art[k]).join(' ');
    if (figuresIn(copy).length) surfaces.push({ where: `${k} (no source: slot)`, copy, figures: figuresIn(copy) });
  }
} else if (/\.(md|markdown|txt)$/i.test(targetPath)) {
  shape = 'document';
  const md = readFileSync(targetPath, 'utf8');
  const lines = md.split('\n');
  lines.forEach((l, i) => {
    const m = l.match(/^\s*(?:[-*>]\s*)?(?:\*\*)?\s*(?:source|sources|citation|cited|basis)s?\b(?:\*\*)?\s*[::]\s*(.+)$/i);
    if (m && m[1].trim().length > 3) {
      const ctx = lines.slice(Math.max(0, i - 3), i + 1).join(' ');
      surfaces.push({ where: `line ${i + 1}`, source: m[1].trim().replace(/\*\*/g, ''), copy: ctx, figures: figuresIn(ctx) });
    }
  });
  /* The whole document's figures still get the corpus treatment below. */
  surfaces.push({ where: '(whole document)', copy: md, figures: figuresIn(md) });
} else {
  cannotCheck(`not a spec or a document: ${path.basename(targetPath)}`,
    'This checks .deck.mts, .post.mts and .md files.');
}

/* ── the corpus to trace through ──────────────────────────────────────── */
let corpusRoots: string[] = corpusArgs.map(a => path.resolve(a));
let corpusWhy = corpusArgs.length ? 'given with --corpus' : '';
if (!corpusRoots.length) {
  const marketDir = SPEC.test(targetPath)
    ? path.resolve(path.dirname(targetPath), '..')
    : path.dirname(targetPath).endsWith('documents')
      ? path.resolve(path.dirname(targetPath), '..')
      : path.dirname(targetPath);
  for (const d of ['research', 'sources']) {
    const p = path.join(marketDir, d);
    if (existsSync(p)) { corpusRoots.push(p); corpusWhy = 'sibling of the target'; }
  }
}
if (!corpusRoots.length) {
  /* A spec living outside a market folder — the engine's own decks/ — still
     names its market in its filename. Match it against the market folders
     under the working directory. */
  const base = path.basename(targetPath).replace(/\.(deck|post)\.mts$|\.md$/, '');
  const marketsDir = path.resolve('markets');
  if (existsSync(marketsDir)) {
    for (const m of readdirSync(marketsDir)) {
      if (!base.startsWith(m)) continue;
      const p = path.join(marketsDir, m, 'research');
      if (existsSync(p)) { corpusRoots.push(p); corpusWhy = `inferred from the filename → markets/${m}`; }
    }
  }
}
const { files: corpusFiles, unreadable } = loadCorpus(corpusRoots);
const { index: figIndex, urlCount } = corpusFiles.length ? indexCorpus(corpusFiles) : { index: new Map<string, Cite[]>(), urlCount: 0 };
const allOrigins = new Set<string>();
for (const cites of figIndex.values()) for (const c of cites) for (const d of c.domains) allOrigins.add(d);

/* ══════════════════════════════════════════════════════════════════════════
 * 5 · RUN
 * ═════════════════════════════════════════════════════════════════════════ */
console.log(`\nSourcing protection  ${rel(targetPath)}`);
console.log(`Shape                ${shape}${shape === 'deck' ? ` · ${surfaces.filter(s => s.source).length} card(s) with a source: line` : ''}`);
console.log(corpusFiles.length
  ? `Corpus               ${rel(corpusRoots[0])}${corpusRoots.length > 1 ? ` +${corpusRoots.length - 1}` : ''} · ${corpusFiles.length} file(s) · ${urlCount} URL(s) · ${allOrigins.size} distinct origin(s)`
  : `Corpus               NOT CHECKED — no research corpus found. Origin collapse was not tested.`);
if (corpusWhy && corpusFiles.length) console.log(`                     ${corpusWhy}`);
/* ── classification coverage — computed before anything is judged ────────
   THE FLOOR (2026-08-12). On this date both home-services documents printed
   ✓ CLEAN while 53 of the corpus's 70 origins were unclassified — including
   homepros.news, the third most-cited domain in the corpus. The script's rule
   of never asserting a collapse on a domain it cannot class is correct per
   figure and catastrophic in aggregate: at 53-of-70 the silence had swallowed
   the check, and `unclassified` was doing the work of `sound`. One lookup-table
   pass later the same files showed 2 collapses and 21 no-instrument findings.

   So coverage is now a precondition of the verdict, not a courtesy line. A run
   below the floor CANNOT print CLEAN — it prints NOT ESTABLISHED and exits 3,
   which is a refusal, not a pass and not a finding. The fix is always the
   same and takes minutes: class the named domains in DOMAIN_CLASS. */
const COVERAGE_FLOOR = 0.9;
let unclassifiedOrigins: string[] = [];
let classifiedShare = 1;
if (allOrigins.size) {
  /* Item one of the job: classify every source in the corpus, not only the
     ones a card happens to name. An origin mix with no instruments in it is
     the market's risk profile before any single figure is looked at. */
  const profile = new Map<string, number>();
  for (const d of allOrigins) {
    const c = CLASS_LABEL[classifyDomain(d).cls];
    profile.set(c, (profile.get(c) ?? 0) + 1);
    if (c === 'unclassified') unclassifiedOrigins.push(d);
  }
  classifiedShare = 1 - unclassifiedOrigins.length / allOrigins.size;
  const order = ['instrument', 'issuer', 'press', 'vendor', 'interested', 'self', 'unclassified'];
  console.log(`Origins              ${order.filter(k => profile.get(k))
    .map(k => `${k} ${profile.get(k)}`).join(' · ')}`);
  console.log(`Coverage             ${(classifiedShare * 100).toFixed(0)}% of origins classified (floor ${COVERAGE_FLOOR * 100}% — below it, CLEAN is impossible)`);
}
for (const u of unreadable) console.log(`                     · ${path.basename(u)}  NOT READ (no text layer)`);

/* ── the card source lines ────────────────────────────────────────────── */
const results: LineResult[] = [];
let noSource = 0;
for (const s of surfaces) {
  if (s.where === '(whole document)') continue;
  if (!s.source) {
    if (s.figures.length && !/no source: slot/.test(s.where)) noSource++;
    continue;
  }
  results.push(testLine(s.where, s.source, s.copy));
}
const flagged = results.filter(r => r.flags.length);
const corroborated = results.filter(r => r.corroborated && !r.flags.length);

/* ── origin collapse ──────────────────────────────────────────────────── */
interface Collapse {
  fig: string; where: string; cites: Cite[]; attributed: Cite[]; origins: string[];
  wires: string[]; corroboration: string | null; classes: Map<string, Cls>;
}
const collapses: Collapse[] = [];
const noInstrument: Collapse[] = [];
const corroboratedFigs: Collapse[] = [];
const singleInstrument: Collapse[] = [];
const singleUnclassified: Collapse[] = [];
let tracedFigures = 0, attributedCites = 0, totalCites = 0;

if (corpusFiles.length) {
  const seen = new Set<string>();
  for (const s of surfaces) {
    for (const fig of s.figures) {
      const k = figKey(fig);
      if (seen.has(k) || !traceable(fig)) continue;
      seen.add(k);
      const cites = figIndex.get(k);
      if (!cites || cites.length < 2) continue;
      tracedFigures++;
      totalCites += cites.length;
      const classes = new Map<string, Cls>();
      const origins = new Set<string>(), wires = new Set<string>();
      const attributed = cites.filter(c => c.domains.length);
      attributedCites += attributed.length;
      for (const c of attributed) for (const d of c.domains) {
        const { cls, sub } = classifyDomain(d);
        classes.set(d, cls);
        if (sub === 'wire' || sub === 'mirror') wires.add(d); else origins.add(d);
      }
      const conv = convergesOnText(cites);
      const row: Collapse = {
        fig, where: s.where, cites, attributed, origins: [...origins], wires: [...wires],
        corroboration: conv, classes,
      };
      /* The corroboration exception, at corpus scale: two different parties
         quoting the same code section is convergence on a text. Report it
         positively and never as collapse. */
      if (conv && origins.size <= 1 && attributed.length >= 2) { corroboratedFigs.push(row); continue; }
      if (conv) continue;
      /* Collapse needs enough attributed citations to mean anything. Three
         citations landing on one domain is the "six citations, one origin"
         shape; two is a coincidence waiting to be called a finding.

         AND THE ONE ORIGIN HAS TO BE THE KIND THAT CAN MISLEAD. Six citations
         of one Census table is one primary source cited six times, which is
         what good work looks like; the illusion this check exists to break is
         many citations of a NON-terminal origin. So a lone instrument origin
         is reported positively and never as a finding. */
      const RELAY: Cls[] = ['press', 'vendor', 'interested', 'self'];
      const soleCls = origins.size === 1 ? classifyDomain([...origins][0]).cls : null;
      if (origins.size <= 1 && attributed.length >= 3) {
        /* Only a RELAY class can create the illusion this check exists to
           break. Six citations of one Census table, or of the filer's own
           disclosure about itself, is one primary source cited six times —
           which is what good work looks like. And an origin whose class this
           script cannot establish is reported as unestablished, never asserted
           to be a syndication origin. */
        if (soleCls && RELAY.includes(soleCls)) collapses.push(row);
        else if (soleCls === 'instrument' || soleCls === 'issuer') singleInstrument.push(row);
        else singleUnclassified.push(row);
        continue;
      }
      /* "No instrument underneath" is a claim about ALL the support. One
         unrecognised origin and the claim cannot be made — it may be the
         statute. Unclassified is reported as unclassified. */
      const cls = [...classes.values()];
      /* Same rule at corpus scale: an issuer origin is terminal as to itself.
         The corpus cannot see whether the citing line named a filing, so it
         takes the issuer class as terminal and reports it — visibly — rather
         than calling a filer's own result unsupported. */
      if (attributed.length >= 3 && origins.size >= 1 &&
        cls.every(c => c !== 'unknown') &&
        !cls.some(c => c === 'instrument' || c === 'issuer') &&
        cls.some(c => RELAY.includes(c)))
        noInstrument.push(row);
    }
  }
}

/* ── counts ───────────────────────────────────────────────────────────── */
const n = (x: number) => String(x).padStart(4);
console.log(`\nSource lines   ${n(results.length)} checked`);
console.log(`               ${n(flagged.length)} FLAGGED`);
console.log(`               ${n(corroborated.length)} corroborated — a named text, reproduced by more than one party`);
if (noSource) console.log(`               ${n(noSource)} surface(s) carrying a figure with no source: line (verify-spec.mts owns this)`);
if (corpusFiles.length) {
  console.log(`Figures        ${n(tracedFigures)} traced through the corpus · ${totalCites} citing line(s), ${attributedCites} with an origin near enough to name`);
  console.log(`               ${n(collapses.length)} ORIGIN COLLAPSE — many citations, one origin`);
  console.log(`               ${n(noInstrument.length)} NO INSTRUMENT — press/vendor/interested/self all the way down`);
  if (singleUnclassified.length)
    console.log(`               ${n(singleUnclassified.length)} single-origin on a domain this script cannot class — BLOCKS CLEAN until classed`);
  if (corroboratedFigs.length || singleInstrument.length)
    console.log(`               ${n(corroboratedFigs.length + singleInstrument.length)} single-origin and sound — a named text, or one instrument cited often`);
} else {
  console.log(`Figures             ORIGIN COLLAPSE NOT CHECKED — no corpus`);
}

/* ── findings ─────────────────────────────────────────────────────────── */
const CAP = 10;
if (flagged.length) {
  console.log('\n── card source lines ─────────────────────────────────────────');
  for (const r of flagged) {
    console.log(`\n  ${r.where}`);
    console.log(`    source: ${r.line}`);
    for (const s of r.srcs) console.log(`      · ${CLASS_LABEL[s.cls].padEnd(12)} ${s.raw}   (${s.why})`);
    for (const f of r.flags) {
      console.log(`    ✗ ${f.flag.padEnd(13)} ${f.detail}`);
      console.log(`      → ${f.fix}`);
    }
    for (const note of r.notes) console.log(`    · ${note}`);
  }
}

if (corroborated.length || corroboratedFigs.length || singleInstrument.length) {
  console.log('\n── corroborated (NOT a finding) ──────────────────────────────');
  console.log('  The referent is a TEXT, and independent parties reproducing a text is');
  console.log('  convergent verification — the same logic by which four manuscripts of a');
  console.log('  statute confirm its wording. Circularity is a defect when the referent is');
  console.log('  a MEASUREMENT, because a retelling adds no observation. These are not that.');
  for (const r of corroborated) {
    console.log(`    ✓ ${r.where.padEnd(28)} ${r.line}`);
    console.log(`      ${r.corroborated}`);
  }
  for (const c of corroboratedFigs.slice(0, CAP)) {
    console.log(`    ✓ ${c.fig.padEnd(28)} ${c.attributed.length} citations converge on ${c.corroboration}`);
    console.log(`      one origin by domain, but the referent is that text — convergence, not collapse`);
  }
  for (const c of singleInstrument.slice(0, CAP)) {
    console.log(`    ✓ ${c.fig.padEnd(28)} ${c.attributed.length} citations, 1 origin — ${c.origins[0]}`);
    console.log(`      one origin, and it is an instrument. Cited often is not cited circularly.`);
  }
}

if (collapses.length) {
  console.log('\n── origin collapse ───────────────────────────────────────────');
  for (const c of collapses.slice(0, CAP)) {
    const origin = c.origins[0] ?? '(none)';
    const cls = c.origins.length ? CLASS_LABEL[c.classes.get(c.origins[0]) ?? 'unknown'] : 'unclassified';
    console.log(`\n  ✗ ${c.fig}   ${c.attributed.length} citations, ${c.origins.length} origin${c.origins.length === 1 ? '' : 's'}`);
    console.log(`      on ${c.where}`);
    console.log(`      origin: ${origin} (${cls})${c.wires.length ? ` · via ${c.wires.join(', ')} — distribution, not a second origin` : ''}`);
    for (const cite of c.attributed.slice(0, 4))
      console.log(`      · ${cite.file}:${cite.line}  [${cite.domains.join(', ')} · by ${cite.scope}]  ${cite.context}`);
    if (c.attributed.length > 4) console.log(`      · … and ${c.attributed.length - 4} more citing line(s) on the same origin`);
    const un = c.cites.length - c.attributed.length;
    if (un) console.log(`      · ${un} further citing line(s) with no URL near them — unattributed, not counted`);
  }
  if (collapses.length > CAP) console.log(`\n  … and ${collapses.length - CAP} more figure(s) of the same shape.`);
}

if (noInstrument.length) {
  console.log('\n── no instrument underneath ──────────────────────────────────');
  console.log('  Nothing terminal. However many citations there are, none of them is a');
  console.log('  statute, a filing, a government table or a court opinion.');
  for (const c of noInstrument.slice(0, CAP)) {
    const mix = [...new Set([...c.classes.values()].map(v => CLASS_LABEL[v]))].join(' + ');
    console.log(`    ✗ ${c.fig.padEnd(12)} ${c.attributed.length} citation(s) · ${c.origins.length} origin(s) · ${mix}`);
    console.log(`      ${c.origins.join(', ')}`);
  }
  if (noInstrument.length > CAP) console.log(`    … and ${noInstrument.length - CAP} more.`);
}

if (ALL && singleUnclassified.length) {
  console.log('\n── single origin, class not established ──────────────────────');
  console.log('  Not a finding. This script will not call a domain it does not recognise');
  console.log('  a syndication origin. Class these by hand, or add them to DOMAIN_CLASS.');
  for (const c of singleUnclassified) {
    console.log(`    · ${c.fig.padEnd(12)} ${c.attributed.length} citations, 1 origin — ${c.origins[0]}`);
  }
}

if (ALL) {
  console.log('\n── every source line, classified ─────────────────────────────');
  for (const r of results) {
    console.log(`  ${r.where}`);
    console.log(`    ${r.line}`);
    for (const s of r.srcs) console.log(`      ${CLASS_LABEL[s.cls].padEnd(12)}${s.sub ? `/${s.sub}`.padEnd(11) : ''.padEnd(11)} ${s.raw}   (${s.why})`);
  }
}

/* ── the closing, and the part that matters ───────────────────────────── */
const findings = flagged.length + collapses.length + noInstrument.length;
const belowFloor = allOrigins.size > 0 && classifiedShare < COVERAGE_FLOOR;
const blindFigures = singleUnclassified.length;
console.log('\n──────────────────────────────────────────────────────────────');

if (belowFloor || (!findings && blindFigures)) {
  /* The refusal. Distinct from a finding: nothing is known to be wrong — the
     point is that not enough is KNOWN for a verdict either way, and a verdict
     issued blind reads exactly like a verdict issued sighted. */
  console.log(`✗ NOT ESTABLISHED — this run cannot verdict this file.`);
  if (belowFloor) {
    console.log(`  ${unclassifiedOrigins.length} of ${allOrigins.size} corpus origins are unclassified (${(classifiedShare * 100).toFixed(0)}% coverage, floor ${COVERAGE_FLOOR * 100}%).`);
    console.log('  Every collapse and no-instrument test is silent on an unclassified domain,');
    console.log('  so below the floor those silences ARE the result. Class these in');
    console.log('  DOMAIN_CLASS (scripts/studio/sourcing-protection.mts) and re-run:');
    for (const d of unclassifiedOrigins.slice(0, 25)) console.log(`    · ${d}`);
    if (unclassifiedOrigins.length > 25) console.log(`    · … and ${unclassifiedOrigins.length - 25} more`);
  }
  if (blindFigures) {
    console.log(`  ${blindFigures} figure(s) rest solely on a domain this script cannot class —`);
    console.log('  each is either a collapse or sound, and it cannot say which:');
    for (const c of singleUnclassified.slice(0, CAP)) console.log(`    · ${c.fig.padEnd(12)} ${c.attributed.length} citations, 1 origin — ${c.origins[0]}`);
  }
  if (findings) console.log(`  (${findings} finding(s) above stand regardless — fix those too.)`);
} else if (!findings) {
  console.log('✓ CLEAN — every source line names something a reader can open, no class');
  console.log('  monoculture, no figure collapses to a single origin, and the corpus is');
  console.log(`  ${(classifiedShare * 100).toFixed(0)}% classified — this verdict was issued sighted, not blind.`);
} else {
  console.log(`✗ ${findings} finding(s). This is not ready to post.`);
  console.log('  A source line is the only evidence most readers ever see. Fix the line,');
  console.log('  not the research: the fire-safety corpus was strong and the CARDS were');
  console.log('  what got the work called slop.');
}

console.log('\nWhat this cannot do, and it is most of what matters:');
console.log("  · An issuer's disclosure counts as terminal AS TO ITSELF. It cannot see");
console.log('    whether the figure is a fact about the filer or a claim about the filer\'s');
console.log('    MARKET — the second is the filer citing someone else, and is not terminal.');
console.log('    That is a scope question and it stays a human read.');
console.log('  · It cannot tell whether a source actually SUPPORTS the claim. A card can');
console.log('    cite a statute that says something else, and this passes it. Fire-safety');
console.log('    p9 cited the right state for the wrong credential and would clear here.');
console.log('  · It cannot catch a wrong sentence assembled from right figures. The');
console.log('    elevator "Service is 35% of sales" error — 35% is New Equipment, service');
console.log('    is 65% — was two verified numbers in a false sentence. Every component');
console.log('    passed every check we own. No source check would ever have caught it.');
console.log('  · It classifies by the words on the line and the domain in the URL. A');
console.log('    source it cannot recognise is reported as unclassified, never as sound.');
console.log('  · Origin attribution is scoped, not certain: the URL on the line, else a');
console.log('    party the corpus links elsewhere, else the paragraph, else a narrow');
console.log('    section. Every collapse prints its citing lines — check them.');
console.log('  · It will not assert a collapse on a domain it cannot class, and it will');
console.log('    not say "no instrument underneath" while a supporting origin is');
console.log('    unclassified. Both silences are deliberate; --all shows what it stayed');
console.log('    quiet about. Figures under two significant digits are not traced.');
console.log('  · It reads the source lines a spec PRINTS. A surface with no source: slot');
console.log('    — a cover, a closer, a caption — is named above and checked by nobody.');
if (!corpusFiles.length) {
  console.log('  · NO CORPUS WAS FOUND. Origin collapse and the instrument test DID NOT RUN.');
  console.log('    Pass --corpus <dir>. Card source lines were checked; nothing else was.');
}
console.log('');

/* Exit 0 clean · 1 findings · 2 usage · 3 NOT ESTABLISHED (coverage refusal).
   3 is not a pass. A caller that treats nonzero as "do not post" needs no
   change; a caller that distinguishes can tell a defect from a blind spot. */
process.exit(findings ? 1 : (belowFloor || blindFigures) ? 3 : 0);
