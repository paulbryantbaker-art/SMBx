# MODELS — the catalog, and what each slot computes

**DEFINITIVE v1.1 · 134 catalog slots · 114 executable runtime models ·
transcribed from `server/services/definitiveDealMechanicsCatalog.ts` and
`server/services/v19ModelRuntime.ts`**

There are two lists here and they are not the same list.

**The catalog (M101–M234)** is the *route map*: every mechanic DEFINITIVE knows
about, what gate it hangs off, and — critically — whether it is something we
compute, something we hand to a specialist, or something that is research only.
134 slots.

**The runtime (`MODEL.*.v1`)** is what the app *executes* deterministically:
114 models with defined inputs, defined outputs and a hashed audit record. Their
formulas are here; their calculator is not.

The two overlap but neither contains the other. A slot can be catalogued and not
executable (M105 §338(h)(10) — mapped, never computed). A runtime model can serve
several slots (`MODEL.STRUCT.EARNOUT.MC.v1` backs M111 and M112 both).

---

## The three classes — read this before using any slot

Every catalog slot carries a class, and the class is a **boundary**, not a
maturity level. It says who is allowed to produce the answer.

| Class | Count | Means | Your output |
|---|---|---|---|
| **compute** | 69 | Deterministic. Inputs → arithmetic → number. | The number, with the working shown. |
| **handoff** | 49 | A licensed person owns the conclusion. | The **supporting record** and the question to ask. Never the conclusion. |
| **research** | 14 | The rule is unsettled or the doctrine is in flux. | A framing of the question and what would resolve it. Never a position. |
| *reserved* | 2 | Numbered, unshipped. | Nothing. Do not invent it. |

**`handoff` does not mean "harder".** It means the output is not ours to sign.
M135 fairness-opinion scaffolding is `handoff` not because the math is difficult
but because a fairness opinion is a licensed product — so the model builds the
process record and supporting analysis for the person who signs it. Same for
M106 (English W&I architecture), M231 (option/ROFR triggers), and every model
whose answer would be a legal or valuation opinion.

**`research` is the honest label on live doctrine.** The LME family (M180–M184)
sits here because uptier, drop-down and double-dip are being litigated right
now. A confident answer would be a fabricated one.

**A `compute` slot still stops at THE LINE.** M232 computes the CITT screen; it
does not conclude that a transfer is taxable. Compute the mechanics, route the
determination.

---

## Reading a row

`gates` tells you when the slot is live — walk them from **GATES.md**.
`what it computes` is the actual arithmetic or screen.
The italic line is the **authority anchor** — the statute, rule or study the
mechanic rests on. It is what you cite, and it is what you re-verify: several of
these move (HSR thresholds re-index annually, OBBBA regulations are still being
issued, Delaware doctrine moves monthly). An anchor is a pointer to primary
source, never a substitute for reading it.

---

## The catalog — M101 to M234

| Slot | Name | Class | Gates | What it computes |
|---|---|---|---|---|
| **M101** | QSBS post-OBBBA | compute | G14, G15 | Per-issuer cap, holding period, and exclusion percentage. <br>*IRC 1202, OBBBA 2025* |
| **M102** | ESOP deferral | compute | G15, G27 | 30 percent post-sale ownership and qualified replacement property timing. <br>*IRC 1042* |
| **M103** | F-reorg plus 721 contribution | compute | G15 | F-reorg sequence and contribution qualification checks. <br>*IRC 368(a)(1)(F), IRC 721* |
| **M104** | Installment sale | compute | G15 | Gross-profit ratio, recapture, pledge, and recognition schedule. <br>*IRC 453* |
| **M105** | 338(h)(10) election | compute | G15 | Deemed asset sale, adjusted grossed-up basis, and class allocation bridge. <br>*IRC 338* |
| **M106** | English warranty and indemnity architecture | handoff | G23 | Coverage limit, de minimis, basket, and exclusion schedule. <br>*UK market practice* |
| **M107** | International merger-control thresholds | compute | G23 | Turnover, asset, and substantial-lessening tests by jurisdiction. <br>*EU Merger Regulation 139/2004, UK Enterprise Act 2002* |
| **M108** | RWI primary architecture | handoff | G7, G15 | Limit, retention, exclusions, and broker-ready architecture. <br>*SRS Acquiom, RWI market studies* |
| **M109** | Working capital peg | compute | G14, G15 | Target, peg, true-up, and collar math. <br>*ABA Deal Points* |
| **M110** | English MAC | research | G23 | Framework mapping for durational-significance research. <br>*English MAC case law* |
| **M111** | Revenue earnout | compute | G15 | Metric threshold, period, probability, and expected-value schedule. <br>*ABA Deal Points, SRS Acquiom* |
| **M112** | EBITDA earnout | compute | G15 | EBITDA target, add-back policy, and expected-value schedule. <br>*ABA Deal Points, SRS Acquiom* |
| **M113** | Gross-profit earnout | compute | G15 | Gross-profit threshold and payout sensitivity. <br>*ABA Deal Points, SRS Acquiom* |
| **M114** | Customer-retention earnout | compute | G15 | Retention cohort, payout tiers, and probability-weighted value. <br>*ABA Deal Points, SRS Acquiom* |
| **M115** | Regulatory-milestone earnout | compute | G15 | Milestone trigger, date window, and payout schedule. <br>*ABA Deal Points, SRS Acquiom* |
| **M116** | Independent-sponsor tiered promote | compute | G27 | Carry tiers, catch-up, and promote allocation. <br>*fund formation market practice* |
| **M117** | Search-fund step-up | compute | G27 | Search investor step-up and promote conversion math. <br>*ETA market norms* |
| **M118** | Leveraged ESOP cash flow | compute | G27 | ESOP debt-service and trustee-facing cash-flow schedule. <br>*DOL ESOP guidance* |
| **M119** | SBA 7(a) post-SOP 50 10 8 | compute | G15 | Eligibility, cap, equity injection, and amortization checks. <br>*SBA SOP 50 10 8* |
| **M120** | Continuation-fund LP waterfall | handoff | G26 | Preference, carry reset, and rollover economics for counsel review. <br>*ILPA continuation-fund guidance* |
| **M121** | Up-C and TRA | handoff | G15 | Basis step-up and 85/15 tax receivable agreement value. <br>*IRC 754, TRA market practice* |
| **M122** | Unitranche intercreditor | handoff | G15 | First-out/last-out payment waterfall and AAL economics. <br>*LSTA model AAL* |
| **M123** | MAE durational significance | research | G7, G15 | Research scaffold for MAE facts and duration flags. <br>*Akorn, Frontier, Channel Medsystems* |
| **M124** | Ordinary-course covenant | research | G15 | Research scaffold for ordinary-course operating deviations. <br>*AB Stable* |
| **M125** | Specific performance | research | G15 | Research scaffold for remedy availability. <br>*Delaware equitable-remedy case law* |
| **M126** | SB 21 cleansing | research | G15 | Controller-cleansing decision tree for counsel review. <br>*DGCL SB 21, Rutledge v. Clearway* |
| **M127** | MFW dual-prong | handoff | G15 | Independent-committee and majority-of-minority process checklist. <br>*MFW, Match Group* |
| **M128** | HSR reportability | compute | G7 | Size-of-transaction, size-of-person, and exemption triage. <br>*15 U.S.C. 18a* |
| **M129** | EU AI Act risk tier | research | G24 | Research scaffold for EU AI Act tiering. <br>*Regulation (EU) 2024/1689* |
| **M130** | Cyber diligence | handoff | G24 | Control maturity, incident, and exposure scoring. <br>*NIST CSF* |
| **M131** | Privacy diligence | handoff | G24 | Data-map, lawful-basis, and breach-risk scoring. <br>*GDPR, CPRA* |
| **M132** | Sanctions diligence | handoff | G24 | Party, geography, and control-screening workflow. <br>*OFAC* |
| **M133** | ESG diligence | handoff | G24 | ESG exposure and disclosure-support scoring. <br>*SEC climate and ESG references* |
| **M134** | Climate diligence | handoff | G24 | Climate exposure, transition risk, and reporting scaffold. <br>*SEC climate disclosure references* |
| **M135** | Fairness-opinion scaffolding | handoff | G15 | Process and supporting-analysis record for the user advisor. <br>*fairness opinion case law, market practice* |
| **M136** | Fraudulent-transfer baseline | handoff | G15, G29 | Baseline solvency/fraudulent-transfer schedule paired with M148. <br>*11 U.S.C. 548, UFTA, UVTA* |
| **M137** | *Reserved* | — | — | — |
| **M138** | *Reserved* | — | — | — |
| **M139** | 1060 seven-class allocation | compute | G15 | Class I through VII residual allocation. <br>*IRC 1060, Treas. Reg. 1.1060* |
| **M140** | Tax-free reorganization qualification | compute | G15 | Type A/B/C/D/E/F/G plus continuity checks. <br>*IRC 368, Treas. Reg. 1.368* |
| **M141** | 251(h) eligibility and top-up | compute | G15 | Eligibility and top-up requirement checks. <br>*DGCL 251(h)* |
| **M142** | Tender offer mechanics | compute | G15 | Proration, all-holders/best-price, and 20-business-day timing. <br>*Rule 14d-10, Rule 14e-1* |
| **M143** | 355 spin and 355(e) test | research | G15 | Active-trade/business, device, and 50 percent acquisition-test scaffold. <br>*IRC 355, IRC 355(e)* |
| **M144** | Carve-out stranded-cost and TSA scoping | compute | G7, G15 | Allocated overhead, stranded cost, and transition-service schedule. <br>*market practice* |
| **M145** | 721/351 contribution plus 704(c) | compute | G15 | Built-in gain, ceiling method, and remedial-allocation math. <br>*IRC 721, IRC 351, IRC 704(c)* |
| **M146** | Cap-table waterfall | compute | G15 | Liquidation preference, participation, seniority, and anti-dilution waterfall. <br>*NVCA term sheet* |
| **M147** | PIPE 19.99 percent approval trigger | compute | G15 | Shareholder-approval threshold and discount trigger. <br>*Nasdaq Rule 5635* |
| **M148** | Three-prong solvency | handoff | G15, G28, G29 | Balance-sheet, cash-flow, and capital-adequacy tests at user inputs. <br>*11 U.S.C. 548, UVTA, Tribune* |
| **M149** | DGCL 170 distributable surplus | compute | G15 | Surplus/net-profits computation at user-supplied fair value. <br>*DGCL 170, Klang* |
| **M150** | 108 CODI plus 382 limitation | compute | G15, G29 | CODI inclusion, reduction attributes, and ownership-change limitation. <br>*IRC 108, IRC 382* |
| **M151** | 363 asset sale mechanics | handoff | G28 | Sale timeline, bid-protection cost, free-and-clear prongs, and credit-bid eligibility. <br>*11 U.S.C. 363, 11 U.S.C. 365, RadLAX, Fisker* |
| **M152** | Plan feasibility | handoff | G28 | Cash flow, DSCR, liquidity, covenant, and EBITDA-sensitivity table. <br>*11 U.S.C. 1129(a)(11)* |
| **M153** | Best-interests-of-creditors | handoff | G28 | Per-class plan recovery versus hypothetical Chapter 7 recovery. <br>*11 U.S.C. 1129(a)(7), 11 U.S.C. 726* |
| **M154** | Absolute priority rule and new value | handoff | G28 | Priority waterfall and new-value decision tree. <br>*11 U.S.C. 1129(b), 203 N. LaSalle, Castleton Plaza* |
| **M155** | Cramdown interest rate | handoff | G28 | Efficient-market/Till formula range and circuit flag. <br>*Till, MPM Silicones, Texas Grand Prairie, Topp* |
| **M156** | 1111(b) election trade-off | handoff | G28 | Election eligibility and no-election versus election value comparison. <br>*11 U.S.C. 1111(b)* |
| **M157** | 726 Chapter 7 waterfall | compute | G28 | Distribution by statutory priority and trustee-fee schedule. <br>*11 U.S.C. 507, 11 U.S.C. 726* |
| **M158** | 364 DIP sizing | handoff | G28, G29 | 13-week cash, minimum liquidity, roll-up, carve-out, and priming schedule. <br>*11 U.S.C. 364, Collier 364.06* |
| **M159** | Fulcrum security | handoff | G28 | Enterprise value through capital stack and recovery by tranche. <br>*market practice* |
| **M160** | Exchange offer and distressed-debt exchange | handoff | G29 | Participation threshold, holdout economics, and CODI exposure. <br>*Securities Act 3(a)(9), TIA 316(b)* |
| **M161** | Uptier capacity and sacred rights | research | G29 | Required-lender percentage, open-market-purchase language, and contract-risk flags. <br>*Serta Simmons, Mitel* |
| **M162** | Drop-down basket capacity | research | G29 | Investment-basket, unrestricted-subsidiary, and blocker capacity. <br>*J. Crew, Envision, Pluralsight* |
| **M163** | Double-dip and pari-plus claim multiplier | research | G29 | Claim multiplier and structural-seniority math. <br>*At Home, Trinseo, Sabre, ABA Business Law Today* |
| **M164** | RSA economics | handoff | G28, G29 | Class support, milestones, termination, fiduciary-out, and toggle schedule. <br>*11 U.S.C. 1125, Indianapolis Downs* |
| **M165** | ABC and Article 9 foreclosure recovery | handoff | G28 | Notice, sale, waterfall, assignee fee, and recovery schedule. <br>*UCC 9-610, UCC 9-611, UCC 9-615, state ABC law* |
| **M166** | Claims trading recovery | compute | G28 | Claim-purchase IRR and ultimate-recovery regression. <br>*Moody\s Ultimate Recovery Database, FRBP 3001* |
| **M167** | Subchapter V eligibility | compute | G28 | Debt-limit and small-business engagement checks. <br>*11 U.S.C. 1181-1195* |
| **M168** | Chapter 22 recidivism score | handoff | G28 | Recidivism-risk score from supplied operating and capital-structure inputs. <br>*LoPucki Bankruptcy Research Database* |
| **M169** | FIRPTA withholding | compute | G30 | 15 percent, 10 percent, or exemption withholding path. <br>*IRC 1445, Forms 8288 and 8288-A* |
| **M170** | 1031 like-kind exchange timing | compute | G30 | 45-day/180-day timing, identification rules, and boot recognition. <br>*IRC 1031* |
| **M171** | Sale-leaseback and ASC 842 | handoff | G30 | Cap rate, residual value, and finance-versus-operating classification scaffold. <br>*ASC 842* |
| **M172** | REIT 75/75/90 compliance triad | compute | G30 | Income, asset, and distribution compliance tests. <br>*IRC 856-860* |
| **M173** | Project-finance coverage suite | research | G30 | DSCR, LLCR, PLCR, and concession-model scaffold. <br>*project-finance market practice* |
| **M174** | Crypto token taxonomy | research | G30 | Howey and Project Crypto classification scaffold. <br>*SEC Project Crypto, Howey* |
| **M175** | GENIUS Act stablecoin PPS test | research | G30 | Permitted payment stablecoin framework scaffold. <br>*GENIUS Act* |
| **M176** | Digital-asset broker reporting | research | G30 | Broker-reporting and data-field scaffold. <br>*IRC 6045, T.D. 10000, Form 1099-DA* |
| **M177** | LP-secondary plus ECI withholding | handoff | G26, G30 | PSA, tri-party transfer, and withholding scaffold. <br>*IRC 1446(f), ILPA guidance* |
| **M178** | Strip-sale pricing | compute | G26, G30 | Proportionate interest pricing and retained-exposure schedule. <br>*market practice* |
| **M179** | NAV facility LTV | handoff | G26, G30 | Loan-to-value, cushion, and collateral pool schedule. <br>*NAV facility market practice* |
| **M180** | Convertible and SAFE conversion | compute | G15, G29 | Cap, discount, pre/post-money, and if-converted math. <br>*YC SAFE, market practice* |
| **M181** | Venture-debt warrant coverage | compute | G15, G29 | Warrant coverage, exercise price, and lender IRR. <br>*venture-debt market practice* |
| **M182** | ABL borrowing base | compute | G15, G29 | Eligible A/R and inventory advance-rate calculation. <br>*ABL market practice* |
| **M183** | Make-whole and call protection | compute | G15, G29 | Treasury-plus-spread make-whole and call schedule. <br>*indenture practice* |
| **M184** | Covenant basket engine | compute | G15, G29 | Restricted payment, debt, lien, and investment basket capacity. <br>*LSTA model provisions* |
| **M185** | 280G golden parachute | compute | G15 | Three-times base amount, excise-tax, deduction, and cleansing-vote math. <br>*IRC 280G* |
| **M186** | 382 NOL limitation | compute | G15 | Long-term tax-exempt rate times loss-corporation value. <br>*IRC 382* |
| **M187** | RE-heavy asset-vs-entity election | compute | G30, G2 | Asset-deal step-up, entity-deal basis, transfer-tax incidence, debt assumability, and in-place lease treatment. <br>*IRC 1001, IRC 1060, IRC 197* |
| **M188** | RE/operating-business purchase price bifurcation | compute | G30, G2 | NOI/cap-rate real-estate value, residual operating-business value, and 1060 Class V/VI/VII reconciliation. <br>*Treas. Reg. 1.338-6, IRS Form 8594* |
| **M189** | Rent-roll normalization engine | compute | G30 | Occupancy, WALT, expiry buckets, tenant concentration, market-rent delta, and stabilized rent. <br>*real estate industry practice* |
| **M190** | NOI normalization and cap-rate bridge | compute | G30 | Effective gross income less operating expenses to NOI, value equals NOI divided by cap rate, and implied cap rate. Market cap rate is pass-through input. <br>*Appraisal Institute practice* |
| **M191** | Real estate transfer and controlling-interest tax | handoff | G30, G19 | Jurisdictional CITT tax base, rate, aggregation window, and exemption checks. Contested state positions route to specialist review. <br>*CT 12-638, MD Tax-Prop 12-117, WA RCW 82.45, NY Publication 576* |
| **M192** | CAM reconciliation mechanics | compute | G30 | Gross-up, base-year, expense-stop, pro-rata share, and closing-date true-up. <br>*BOMA, real estate industry practice* |
| **M193** | Lease abstraction schema | compute | G30 | Structured capture of critical lease fields without interpreting legal enforceability. <br>*lease abstraction industry practice* |
| **M194** | OpCo/PropCo separation mechanics | handoff | G30, G2 | Bifurcated balance sheet, intercompany lease, interest limitation, and recharacterization-risk threshold schedule. <br>*IRC 163(j), IRC 856, ASC 842* |
| **M195** | Property-level escrow and holdback sizing | handoff | G30 | Issue-specific escrow sizing for environmental, PCA, title, tenant, and cost-to-cure inputs. <br>*ALTA endorsements, real estate practice norms* |
| **M196** | Title and survey process checklist | handoff | G30 | Title commitment, Schedule B-II, survey, policy, endorsement, curative-plan, and closing-protection sequencing. <br>*ALTA forms, state title statutes* |
| **M197** | Ground lease vs. fee simple mechanics | handoff | G30 | Remaining term, rent reset, reversion, leasehold mortgageability, cure rights, and financeability flag. <br>*lender practice norms* |
| **M198** | PCA reserve modeling | handoff | G30 | PCA-driven one-, five-, and twelve-year reserves plus immediate-repair escrow from pass-through report inputs. <br>*ASTM E2018, lender practice* |
| **M199** | FIRPTA withholding v1.1 | compute | G15, G30 | FIRPTA 15 percent default, residence exemption/reduced rate, 20-day filing, reduced-withholding certificate, and 1031 timing interaction. <br>*IRC 897, IRC 1445, Forms 8288, Forms 8288-A, Form 8288-B* |
| **M200** | Transaction tax master engine | compute | G2, G19 | Integrated buyer basis, seller tax, seller after-tax proceeds, gross-up gap, and fired sub-model schedule. <br>*IRC 1001, IRC 338, IRC 336, IRC 351, IRC 368, IRC 721, IRC 1060* |
| **M201** | 338(h)(10) and 336(e) gross-up math | compute | G2 | Seller asset-treatment tax delta, buyer step-up benefit, and breakeven gross-up. <br>*IRC 338(h)(10), IRC 336(e), Treas. Reg. 1.336-2* |
| **M202** | 1374 built-in gains tax | compute | G2 | Net unrealized built-in gain, five-year recognition-period cap, corporate tax, taxable-income limitation, and installment-sale treatment. <br>*IRC 1374, PATH Act 2015* |
| **M203** | Transaction cost capitalization | handoff | G2 | Bright-line date, inherently facilitative costs, success-based fee 70/30 safe harbor, and PE-owned target risk flag. <br>*IRC 195, IRC 263, Treas. Reg. 1.263(a)-5, Rev. Proc. 2011-29, INDOPCO, Letter Ruling 202308010* |
| **M204** | Imputed interest, OID, and 453A | compute | G2 | AFR-based imputed interest, OID, contingent-payment characterization, and installment receivable interest charge. <br>*IRC 483, IRC 1274, IRC 1274A, IRC 453A* |
| **M205** | SALT transaction engine | handoff | G2, G19 | State apportionment, bulk-sale compliance, successor-liability clearances, sales/use tax, and payroll-tax successor elections. <br>*UDITPA, state nexus statutes, bulk-sale acts* |
| **M206** | Indemnification ladder engine | compute | G1, G8 | Cap, basket, materiality scrape, sandbagging, carve-out, and deal-size-band math. <br>*ABA Private Target Deal Points Study 2023, ABA Model SPA* |
| **M207** | Survival period engine | compute | G1, G8 | General, fundamental, tax, fraud, and exclusive-remedy survival schedule. <br>*SRS Acquiom 2024, SRS Acquiom 2025, ABA Private Target Deal Points Study 2023* |
| **M208** | Escrow and holdback sizing | compute | G8 | General indemnity, RWI, PPA, special-purpose, and aggregate escrow sizing. <br>*SRS Acquiom Deal Terms Study 2024, SRS Acquiom Deal Terms Study 2025, ABA Private Target Deal Points Study 2023* |
| **M209** | RWI stack architecture | handoff | G8 | Retention, tower size, excess layers, exclusions, and seller-indemnity interaction. <br>*ABA Private Target Deal Points Study 2023, Marsh RWI reports, Aon RWI reports, Lockton RWI reports* |
| **M210** | Closing-statement true-up sequence | compute | G7 | Estimated statement, buyer approval, actual statement, dispute notice, negotiation, and accounting-arbitrator timeline. <br>*SRS Acquiom Working Capital PPA Study, ABA Private Target Deal Points Study 2023* |
| **M211** | Conditions-to-close logic engine | handoff | G6, G7 | Bring-down, MAE, financing, marketing-period, regulatory approval, third-party consent, and condition node logic. <br>*ABA Model SPA, HSR Act, CFIUS regulations* |
| **M212** | Termination and break/reverse-break fee engine | compute | G7 | Break-up, reverse break-up, antitrust reverse break-up, fiduciary-out, go-shop, ticking-fee, drag, and tag economics. <br>*Houlihan Lokey 2023 Transaction Termination Fee Study, Fenwick 2023 ARBF analysis, Brazen v. Bell Atlantic, In re Topps* |
| **M213** | Earnout architecture and dispute | handoff | G9 | EBITDA-definition lock, acceleration triggers, post-closing covenants, dispute forum, and tax-characterization selector. <br>*SRS Acquiom Earnout data, IRC 453, IRC 483, IRC 1274, ABA earnout reports* |
| **M214** | IP chain-of-title verification | handoff | G10 | USPTO, trademark, copyright, employee, contractor, and intervening assignment sequence. <br>*35 U.S.C. 261, Lanham Act 10, 17 U.S.C. 205, Clorox v. Chemical Bank* |
| **M215** | IP encumbrance and lien search | handoff | G10 | UCC, USPTO security agreement, and copyright office lien-search tracks. <br>*UCC Article 9, 17 U.S.C. 205, In re Peregrine, Rhone-Poulenc Agro v. DeKalb* |
| **M216** | License in/out dependency map | compute | G10 | Material license parties, scope, exclusivity, royalty, term, termination, change-of-control, sublicensing, and consent dependencies. <br>*IP licensing industry practice* |
| **M217** | Standard IP representation set | handoff | G1, G10 | Industry-scaled IP rep checklist and schedule structure for counsel drafting. <br>*ABA Model SPA IP representations* |
| **M218** | Carve-out and license-back mechanics | handoff | G10 | Assigned IP, transition license, perpetual license-back, and TSA-IP overlay. <br>*IP carve-out practice norms* |
| **M219** | Source-code and IP escrow mechanics | compute | G10 | Release triggers, deposit verification tier, and update schedule. <br>*Escode, Codekeeper, Iron Mountain escrow templates* |
| **M220** | Employee IP assignment verification | handoff | G10 | Contributor-by-contributor assignment and work-for-hire verification with state enforceability flag. <br>*California Labor Code 2870, state employee-IP statutes* |
| **M221** | OSS exposure diligence process | handoff | G10 | SCA pass-through, permissive/weak/strong copyleft classification, AGPL SaaS flag, indemnity carve-out, and escrow sizing. <br>*GPL, AGPL, LGPL, MIT, Apache, BSD, Morgan Lewis OSS guidance, Nixon Peabody OSS guidance, Morse OSS guidance* |
| **M222** | IP-specific 1060 allocation | compute | G2, G10 | Class V/VI/VII sub-allocation and residual-method cap ordering for IP-heavy deals. <br>*IRC 1060, Treas. Reg. 1.338-6(b), Treas. Reg. 1.1060-1, IRS Form 8594* |
| **M223** | Domain and trademark transfer mechanics | compute | G10 | Registrar auth-code, 60-day lock, trademark assignment recording, state trademark, social-handle, and SSL transfer steps. <br>*ICANN transfer rules, USPTO Form PTO-1594* |
| **M224** | Recording-act and priority engine | compute | G30 | State-typed race/notice/race-notice priority ordering from recording and notice facts; DE pure race, NY/CA race-notice, TX notice; unknown states defer with a table-gap flag. <br>*N.Y. Real Prop. Law 291, Cal. Civ. Code 1214, Tex. Prop. Code 13.001, 25 Del. C. 153* |
| **M225** | Title-covenant and estate/signatory model | compute | G30 | Deed-type to covenant-set map (six covenants; after-acquired title), TX seisin narrowing, and the concurrent-ownership signatory matrix incl. tenancy-by-entirety both-spouses rule. <br>*Common-law deed covenants, Tex. Prop. Code 5.023* |
| **M226** | Marketability triage | handoff | G30 | Curable / insurable-over / deal-killing bucketing of title exceptions; insurable-only contract-standard flag; any deal-killer is a hard defer — the marketability judgment is never emitted. <br>*Marketable-title common law, ALTA title practice* |
| **M227** | Risk-of-loss allocator | compute | G30 | Contract-override detection plus state default lookup: NY Risk Act seller-risk, CA/TX UVPRA, common-law equitable-conversion buyer-risk. <br>*N.Y. Gen. Oblig. Law 5-1311, Tex. Prop. Code 5.007, Cal. Civ. Code 1662, equitable conversion* |
| **M228** | Survival and merger tracker | compute | G30 | Flags every relied-on rep/indemnity/covenant lacking an express survival hook or collateral character — merger extinguishes it at closing; fraud exception noted. <br>*merger doctrine (common law)* |
| **M229** | Lease anti-assignment and change-of-control parser | handoff | G30 | Deemed-assignment detection for control transfers, consent-standard classification against the state table (CA Kendall reasonableness vs. NY as-written), recapture interplay; enforceability always routes. <br>*Kendall v. Ernest Pestana, Inc., 40 Cal.3d 488 (1985), NY assignment common law* |
| **M230** | Due-on-sale screener | compute | G30 | Garn-St. Germain residential-under-5-units exception filter; commercial and entity transfers get no consumer protection — lender consent flagged as closing critical path. <br>*12 U.S.C. 1701j-3* |
| **M231** | Option/ROFR/ROFO trigger detector | handoff | G30 | Sale vs. entity-transfer trigger analysis in both directions — the sale that triggers the right and the entity structure that may avoid it; the legal conclusion always routes to counsel. <br>*ROFR/option common law, TX strict-match construction* |
| **M232** | Controlling-interest transfer-tax and reassessment screener | compute | G30, G19 | The 50-percent entity screen: NY controlling-interest tax with 3-year aggregation, CA Prop 13 change-in-control 100-percent reassessment, TX constitutional prohibition, DE deed tax; step-transaction flag on mere-change claims. <br>*NYC Admin. Code 11-2101, NY Tax Law 1405(b)(6), Cal. Rev. & Tax. Code 60-64, Tex. Const. art. VIII 29, Matter of 105-02 Forest Hills (2025)* |
| **M233** | Permit/CO transferability and bulk-sales screener | compute | G30, G19 | CO-on-transfer and use-change screens, non-transferable permit flags by deal form, CA/NY/NJ/PA bulk-sales tax-notification applicability, CERCLA successor flag. <br>*municipal CO ordinances, UCC Art. 6 (as retained), CERCLA 107, 72 P.S. 1403* |
| **M234** | Fixture classification and UCC 9-334 priority | compute | G30, G2 | Subsection (c) real-property default, the (d) PMSI 20-day fixture-filing exception, and the (h) construction-mortgage override, with PPA reconciliation note. <br>*UCC 9-334* |
---

## The executable runtime — 114 models

These are the models the app computes deterministically. On disk you do the
arithmetic; what follows is the definition, so two people (or the app and a
session) get the same answer from the same inputs.

**Money is integer cents, everywhere.** Not a style preference — a
half-cent-per-line rounding drift across a purchase-price allocation is how a
Form 8594 stops reconciling.

**Every model declares its required inputs and returns `needs_inputs` when they
are absent.** It does not guess and it does not substitute a default for a
missing fact. Copy that behaviour: an output built on an invented input is worse
than no output, because it looks finished.

### Valuation — 4

| Model | Inputs | Computes |
|---|---|---|
| `VAL.SDE` | SDE, add-backs, owner comp | Normalised SDE = SDE + add-backs + owner comp. Anchor: Pepperdine PCAP 2025 |
| `VAL.EBITDA` | EBITDA, adjustments | Adjusted EBITDA = EBITDA + adjustments. Anchors: Damodaran 2026, Kroll 2024 |
| `VAL.DCF.TWOSTAGE` | FCF series, discount rate, terminal growth or exit multiple | PV of the projection + PV of terminal value |
| `VAL.TRIANGULATION` | Normalised earnings, low and high multiple | The **range**, never a point. This is the model THE LINE is built into |

### Deal economics and structure — 9
`SOURCES.USES` (reconcile to zero) · `STRUCT.NWC.PEG` (average the monthly NWC
series; also returns observed months and the low/high band) ·
`STRUCT.PPA` (§1060 seven-class residual) · `STRUCT.ROLLOVER` ·
`STRUCT.EARNOUT.MC` (Monte Carlo, backs M111 and M112) · `STRUCT.ANALYSIS` ·
`DEAL.SCORE` · `DEAL.COMPARISON` · `SENSITIVITY.MATRIX`

### Financing and credit — 8
`LBO.SBA` (DSCR-driven, SOP 50 10 8) · `LBO.LMM` · `DSCR.STRESS` ·
`COVENANT.COMPLIANCE` · `CAPTABLE.DILUTION` · `FINANCE.ABL.BORROWING_BASE` ·
`FINANCE.COVENANT_BASKETS` · `FINANCE.MAKE_WHOLE_CALL`

### Venture and fund — 5
`FINANCE.CONVERTIBLE_SAFE` · `FINANCE.VENTURE_DEBT_WARRANT` ·
`FINANCE.NAV_FACILITY` · `SECONDARIES.LP_ECI` · `SECONDARIES.STRIP_SALE`

### Tax — 11
`TAX.TRANSACTION.MASTER` · `TAX.STRUCTURE` · `TAX.1060.ALLOCATION` ·
`TAX.GROSSUP.338_336` · `TAX.382.NOL_LIMIT` · `TAX.BIG.1374` ·
`TAX.280G.PARACHUTE` · `TAX.IMPUTED_INTEREST_OID` · `TAX.TRANSACTION_COSTS` ·
`TAX.SALT_TRANSACTION` · `TAX.355.SPIN_RESEARCH` *(research)* — **TAX.md**

### Legal economics — 9
`LEGAL.INDEMNITY.LADDER` · `LEGAL.ESCROW.HOLDBACK` · `LEGAL.SURVIVAL.PERIODS` ·
`LEGAL.RWI_STACK` · `LEGAL.CONDITIONS.LOGIC` · `LEGAL.CLOSING_TRUEUP.SEQUENCE` ·
`LEGAL.TERMINATION.FEES` · `LEGAL.EARNOUT_ARCHITECTURE` ·
`LEGAL.HALTSCAN` — **LEGAL.md**

`LEGAL.INDEMNITY.LADDER` is worth stating in full because its defaults are the
ABA market and they are what you argue from:

```
general cap      10.5% of TV   (0.5% when RWI is present — the retention strip)
basket           0.5% of TV    deductible
fundamental reps capped at transaction value
fraud            uncapped, or counsel-defined
materiality scrape  on by default
sandbagging      silent → the state default governs (see LEGAL.md)
```

`LEGAL.HALTSCAN` is the one to run habitually: it scans the working state
against the always-halt categories and returns what must route to counsel before
anything else ships.

### Real property — 28
The largest family. `RE.TITLE_COVENANT_SIGNATORY` · `RE.RECORDING_PRIORITY` ·
`RE.RISK_OF_LOSS` · `RE.MARKETABILITY_TRIAGE` · `RE.SURVIVAL_MERGER` ·
`RE.TITLE_SURVEY.CHECKLIST` · `RE.LEASE_ABSTRACTION` ·
`RE.LEASE_COC_ASSIGNMENT` · `RE.GROUND_LEASE.MECHANICS` · `RE.CAM.TRUEUP` ·
`RE.RENT_ROLL.NORMALIZE` · `RE.NOI.CAP_RATE_BRIDGE` · `RE.PCA.RESERVES` ·
`RE.PROPERTY_ESCROW.HOLDBACK` · `RE.CITT.TRANSFER_TAX` ·
`RE.CITT_REASSESSMENT_SCREEN` · `RE.PERMIT_CO_BULK_SALES` · `RE.FIXTURE_9334` ·
`RE.PREEMPTIVE_RIGHT_TRIGGER` · `RE.DUE_ON_SALE` · `RE.1031.TIMING` ·
`RE.FIRPTA.WITHHOLDING` (+ `.V11`) · `RE.ASSET_ENTITY.ELECTION` ·
`RE.OPCO_PROPCO.SEPARATION` · `RE.OPBUS.BIFURCATION` ·
`RE.SALE_LEASEBACK.ASC842` · `RE.REIT.COMPLIANCE` — **REAL_ESTATE.md**

### Restructuring — 16 *(G28)*
`RESTRUCTURING.SOLVENCY.THREE_PRONG` (the gate trigger itself) ·
`.363_SALE` · `.DIP_SIZING` · `.CH7_WATERFALL` · `.APR_NEW_VALUE` ·
`.CRAMDOWN_RATE` · `.PLAN_FEASIBILITY` · `.FULCRUM_SECURITY` ·
`.CLAIMS_TRADING` · `.EXCHANGE_OFFER` · `.RSA_ECONOMICS` · `.BIOC` ·
`.1111B_ELECTION` · `.ABC_ARTICLE9` · `.SUBCHAPTER_V_ELIGIBILITY` ·
`.CHAPTER22.RECIDIVISM`

### Liability management — 3 *(G29, all research-only)*
`LME.UPTIER.RESEARCH` · `LME.DROPDOWN.RESEARCH` · `LME.DOUBLEDIP.RESEARCH`.
The `.RESEARCH` suffix is load-bearing — these frame a question, they do not
answer one.

### Digital assets — 3 *(research-only)*
`CRYPTO.TOKEN_TAXONOMY` · `CRYPTO.BROKER_REPORTING` · `CRYPTO.STABLECOIN_PPS`

### Diligence, market and post-close — 8
`QOE.LITE` · `DEALKILL.PROB` · `HSR.TRIAGE` · `TIMELINE.MC` ·
`MARKET.CONTEXT` · `BUYER.FIT` · `PMI.VALUE.CREATION` ·
`PROJECT_FINANCE.COVERAGE_RESEARCH` *(research)*

---

## Composing a stack

A **model stack** is the set of models one deal needs. It composes
deterministically from league × deal type × structure × industry ×
jurisdiction, in four layers:

1. **Primary** — the principal output (the LBO, the valuation)
2. **Supporting** — what the primary needs as inputs or cross-checks
3. **Tax / legal economic** — the dollar translation of the provisions
4. **Sensitivity** — the stress tests, built in rather than bolted on

Worked stacks for the in-lane leagues are in **VALUATION.md**. The rule that
matters here: **layer 3 is not optional and is not "the legal review".** An
indemnity cap, a §1060 allocation and a state tax leakage are each a number that
changes what the deal is worth, and a stack that stops at layer 2 has priced the
business rather than the deal.

---

## Where a model stops

Every model in every class stops at the same place:

> **A number is not an opinion.** Compute it, cite it, and route the
> determination.

The one-line test before an output leaves the folder: *if this were wrong, would
the person relying on it need a licensed professional to have signed it?* If
yes, the model produced the supporting record and someone else produces the
conclusion. That is not a hedge — it is the product.
