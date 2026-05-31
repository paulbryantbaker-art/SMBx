# THE LINE Policy

Last updated: 2026-05-27

This is the build-time operating policy for keeping smbX and Yulia inside the software, publisher, and computational-artifact lane. It is strategy and product doctrine, not legal advice. Counsel should review Terms, pricing, marketing, and regulated workflows before paid launch and whenever a drift trigger appears.

## Core Position

smbX is software. Yulia produces deterministic models, source-grounded analysis, option sets, implications, document scaffolds, and audit packets. smbX does not act as a broker-dealer, investment adviser, business broker, law firm, CPA firm, enrolled agent, appraiser, investment bank, escrow agent, or M&A adviser.

The safe product pattern is:

`Analysis -> Options -> Implications -> User Decides`

Yulia may compare options and explain tradeoffs. Yulia must not recommend, negotiate, represent, transmit, sign, file, custody, match counterparties for a fee, or tie compensation to a transaction outcome.

## Statutory Safe Harbors

smbX is structured to fall inside three independent safe harbors. Counsel must verify and refine the verbatim language before paid launch; the rules below are the operating posture, not legal advice.

### Federal — Publisher's Exclusion (Lowe v. SEC, 472 U.S. 181 (1985))

The Investment Advisers Act of 1940 carries an implicit publisher's exclusion. *Lowe* held that publishers of bona-fide publications providing impersonal advice — without a personal advisory relationship with subscribers — are not "investment advisers" under the Act.

How smbX leans on Lowe:

- Yulia is software that produces computational outputs from user-supplied inputs. The relationship is one-software-to-many-users, not a one-to-one advisory relationship.
- Outputs are framed as worked examples, options, and implications, not personalized recommendations to act.
- The product is "bona fide" — disclaimers conspicuous, fee structure flat-software-not-fee-for-outcome.

### Texas — Self-Help Software Carve-Out (Tex. Gov't Code § 81.101(c))

Texas Government Code § 81.101(c) provides that the practice of law does not include the design, creation, publication, distribution, display, or sale (including by means of an internet website) of written materials, books, forms, computer software, or similar products **if the products clearly and conspicuously state that the products are not a substitute for the advice of an attorney.**

How smbX leans on § 81.101(c):

- Every external-facing artifact carries the "not a substitute for the advice of a licensed attorney, certified public accountant, ..." disclosure (see *Artifact Disclosure* below).
- The disclosure must be conspicuous — not buried in fine print, not hidden behind a toggle.
- Counsel should review the disclosure language verbatim against the statute before paid launch.

### North Carolina — Self-Help Legal Publications (N.C. Gen. Stat. § 84-2.2)

N.C. § 84-2.2 creates a safe harbor for self-help legal publications and software, conditioned on an operational checklist. smbX must verify with N.C. counsel before claiming the safe harbor; the playbook understanding of the conditions is:

1. The product contains a conspicuous statement that it is not a substitute for the advice of an attorney.
2. The templates and forms it produces have been reviewed by an attorney licensed in N.C. (or admitted to practice in any U.S. jurisdiction, depending on the operative reading).
3. The product is appropriate for use in N.C.
4. The publisher does not deliver personalized legal advice or interpret the legal effect of forms for a specific user.
5. The publisher registers with the N.C. State Bar.
6. The publisher pays the statutory filing fee and renews annually.
7. The publisher provides cessation notice to the State Bar if it stops operating in N.C.

**Action item:** before any paid customer in N.C., engage counsel to (a) verify the 7-condition checklist as currently codified, (b) complete the N.C. State Bar registration, and (c) confirm template-review coverage.

### Federal — § 15(b)(13) of the Securities Exchange Act of 1934

§ 15(b)(13) provides a federal exemption from broker registration for certain M&A intermediary activity. smbX **does not market itself as relying on § 15(b)(13)**. Relying on the exemption would imply smbX engages in broker activity that requires the exemption — and smbX is software, not a broker.

Operating rule:

- Marketing copy must not say "smbX operates under § 15(b)(13)," "compliant with § 15(b)(13)," or any equivalent.
- Yulia may explain § 15(b)(13) to users as part of general regulatory awareness (e.g., "the M&A broker exemption affects how your retained broker is registered"). That is different from positioning smbX itself as a § 15(b)(13)-exempt broker.
- If smbX adds a feature that would require § 15(b)(13) cover to be legal, route to counsel before shipping. The exemption is not a fallback — it is a signal that the feature is broker activity, which is a drift trigger.

### State Business-Broker Map

Approximately 17 U.S. states have business-broker registration or licensing regimes; roughly 23 have UPL statutes that could capture software depending on interpretation. Some have explicit software safe harbors (Texas, N.C., a handful of others); most fall back on general publisher's-exclusion or general practice-of-law definitions.

Operating rule: if smbX adds any feature that could be interpreted as broker activity (matching counterparties for a fee, marketing listings, transmitting offers, holding deposits, signing on behalf of a party), route to counsel before shipping — even in states without an explicit business-broker statute, and especially in the 17 with one. See `YULIA_LEGAL_REFERENCE_RESEARCH.md` for the state-level map.

### The Four-Layer "Never Even Accused" Test

A feature, fee structure, or marketing claim is inside the lane only if it passes all four:

1. **Flat software pricing.** Subscription, included credits, fixed per-artifact software fee, fixed pass-through. Never a percentage of deal value, success fee, contingent fee, equity, warrant, referral fee, or any compensation that varies with transaction outcome.
2. **No deal touch.** No counterparty contact, no marketplace match-making for a fee, no transmission of executable documents, no escrow/wire/custody, no signing on behalf of a party.
3. **No holding-out.** Marketing does not claim or imply broker, dealer, investment adviser, attorney, CPA, enrolled agent, appraiser, or M&A adviser status.
4. **Conspicuous artifact disclosure.** Every external-facing artifact carries the standard disclosure (see below).

If any one layer fails, the feature is a drift trigger. Stop and route to counsel.

## Pricing Firewall

Allowed:
- Monthly or annual SaaS subscriptions.
- Included plan credits used as software budget controls.
- Flat per-artifact software fees charged when a computation or artifact is generated.
- Fixed software/data API pass-through fees at cost or cost-plus-fixed.
- Fixed white-label or substrate licenses.

Forbidden:
- Any percentage of deal value.
- Any success fee, closing fee, or deferred fee payable only at close.
- Any rebate or refund because a deal does not close.
- Any equity, warrant, or deal-linked consideration from a customer's target or counterparty.
- Any referral fee from buyers, sellers, lenders, brokers, or service providers.
- Any pricing tier based on deal size, deal value, or deal outcome.

The pricing firewall is the single keystone protection. SEC enforcement against unregistered M&A intermediaries lines up on transaction-based compensation (Ranieri Partners ~$375K disgorgement, StraightPath, VCP $540K, Trigg $211K, among others). The common factor is fees tied to deal outcome. Flat software pricing is what makes smbX defensible across all three statutory safe harbors above simultaneously. Do not break the firewall to capture short-term revenue.

The locked price ladder is in [SMBX_PRICING_LOCKED.md](SMBX_PRICING_LOCKED.md): Free / $99 Solo / $249 Pro / $749 Team / $3,000+ Enterprise. All monthly subscriptions.

## Yulia Hard Refusals

Yulia must refuse or route to professional review when asked to:
- Negotiate on behalf of any party.
- Represent any party.
- Contact, message, solicit, introduce, or transmit materials to a counterparty.
- Find, match, or introduce a buyer or seller for compensation.
- Sign, transmit for execution, file, or submit transaction documents.
- Accept, hold, transmit, release, or direct funds, securities, escrow, wires, or deal proceeds.
- Give a legal opinion, tax opinion, fairness opinion, solvency opinion, appraisal, audit, review, compilation, or qualified appraisal.
- Tell the user what they should bid, accept, sign, file, or close.
- Promise a deal result, valuation result, tax result, financing result, closing, return, savings, or buyer outcome.

Preferred refusal shape:

```text
I can model the options and show the implications, but smbX does not [regulated action].
Here are the decision frameworks and source-backed tradeoffs. Your licensed professional and you decide the final action.
```

## Artifact Disclosure

Every external-facing artifact should include a conspicuous disclosure substantially like:

```text
This artifact is software-generated computational output produced by smbX from user-provided inputs. It is informational only and is not a substitute for the advice of a licensed attorney, certified public accountant, enrolled agent, registered broker-dealer, registered investment adviser, business broker, or credentialed appraiser. smbX is not a law firm, accounting firm, broker-dealer, investment adviser, business broker, or appraiser. The user is solely responsible for all decisions, filings, signatures, and outcomes. Consult a licensed professional for advice on your specific situation.
```

Artifact labels:
- Tax outputs: "Tax Computation - Worked Example" or "Tax-Structure Scenario Model"; never "tax opinion."
- Legal/agreement outputs: "Computational Example" or "Drafting Scaffold"; never "legal opinion" or execution-ready legal advice.
- QoE outputs: "QoE-Style Analytical Adjustments"; never "audit," "review," "compilation," or attest work.
- Valuation outputs: "Valuation Model Output - Worked Example"; never "appraisal," "USPAP appraisal," "qualified appraisal," or "fair-market-value opinion."
- Closing/funds-flow outputs: "Closing Arithmetic Scaffold"; never wire, escrow, or closing authority.

## Marketing Language

Avoid:
- "We negotiate," "we close deals," "our advisers," "our bankers," "our brokers."
- "We find buyers/sellers," "we get you the best deal," "guaranteed close," "guaranteed savings."
- "Investment banking services," "legal advice," "tax advice," "tax opinion," "legal opinion," "appraisal."
- "Recommendation," "you should," "best option," when discussing regulated transaction decisions.

Use:
- "Software," "computational tooling," "deal-intelligence software."
- "Models," "artifacts," "worked examples," "analytical workbench."
- "Citation-validated," "version-pinned," "deterministic," "audit-trail-stamped."
- "Options and implications for your professionals to review."

## Recordkeeping

For model-backed or external-facing outputs, preserve:
- Inputs and source references.
- Model/spec/methodology versions.
- Citation refs and freshness state.
- Output hash and audit id.
- Options shown and user selections.
- Disclaimers displayed.
- Fee charged and proof it was not deal-value, close, or outcome based.

## Drift Triggers

Stop and route to counsel before building or shipping:
- Buyer/seller marketplace, listing, matching, or introduction features.
- Counterparty messaging, transmission, negotiation, or signing.
- Escrow, wire, payment, proceeds, or securities handling.
- Any paid provider referral rail.
- Per-deal-value pricing, closing-contingent pricing, success fees, equity, warrants, or refund-if-no-close offers.
- Any artifact intended to be filed with the IRS, SEC, court, or state agency as a stand-alone professional product.
- Any human smbX review that applies bespoke professional judgment to a specific customer's deal.
