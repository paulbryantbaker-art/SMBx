# THE LINE Policy

Last updated: 2026-05-25

This is the build-time operating policy for keeping smbX and Yulia inside the software, publisher, and computational-artifact lane. It is strategy and product doctrine, not legal advice. Counsel should review Terms, pricing, marketing, and regulated workflows before paid launch and whenever a drift trigger appears.

## Core Position

smbX is software. Yulia produces deterministic models, source-grounded analysis, option sets, implications, document scaffolds, and audit packets. smbX does not act as a broker-dealer, investment adviser, business broker, law firm, CPA firm, enrolled agent, appraiser, investment bank, escrow agent, or M&A adviser.

The safe product pattern is:

`Analysis -> Options -> Implications -> User Decides`

Yulia may compare options and explain tradeoffs. Yulia must not recommend, negotiate, represent, transmit, sign, file, custody, match counterparties for a fee, or tie compensation to a transaction outcome.

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
