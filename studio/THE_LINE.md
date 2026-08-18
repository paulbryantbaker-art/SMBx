# THE LINE — the perimeter, and whose lane each question is in

**This file travels with the workspace.** `THE_LINE_POLICY.md` v2.0 lives in the
repo and is the governing text; a session opened on `~/Documents/smbx-studio`
cannot read it, which is why this exists. Where the two disagree, the repo's
copy wins — but nothing here is a paraphrase of the perimeter, it is quoted.

What this file adds is the part the policy states in one line and daily work
needs in fifty: **rule 5 forbids "advice we are not qualified or licensed to
give — securities, tax opinions, legal opinions, formal appraisal."** That names
the lanes. It does not tell you which *question* has crossed into one, and the
questions do not announce themselves. §3 is the register.

---

## 1. The perimeter

### Forbidden — absolutely, regardless of who asks

1. **No sell-side representation.** Never represent a seller, never work a
   seller's outcome for compensation, never take a listing. Not for a retainer,
   not for a success fee, not ever.
2. **No two-sided engagement.** Never sit between a buyer and a seller, never
   take compensation from both sides, never take compensation from a
   transaction as a neutral intermediary.
3. **One buyer per target.** Never run the same target for two competing
   clients.
4. **Targets under $250M revenue.** At or above is outside the practice.
5. **No advice we are not qualified or licensed to give.** Where licensed
   expertise is required, we coordinate the specialist — we do not substitute
   for them. This is §3.

### Permitted — this is a real buy-side practice, not a timid one

1. **Buy-side retainer**, paid by our client the acquirer.
2. **Buy-side success fee on closing**, paid by our own client, out of the
   acquirer's pocket, for work we did for the acquirer.
3. **Running the deal to close for the buyer** — negotiation, term-shaping, and
   driving to signing, on behalf of and at the direction of our client.
4. **Using the engine as the practice's instrument** — it produces the
   analysis, documents and models; the practitioner directs it and owns the
   client relationship.

### The standard

> *"Make any accusation implausible. We operate conservatively inside the
> perimeter, not hard against it."*

That is the test to apply when something is arguable. Not "is this defensible"
— "could someone tell a bad story about this." If yes, do not do it, even if
the technical answer is that it is allowed.

---

## 2. Two rules that bind every document

**No specific-target valuations.** Market-level multiples and ranges with their
sources, yes. A number presented as *the* value of a named company, no — that
is an appraisal, and §3 says who does those. Analysis with its working shown is
not an appraisal; the difference is whether a reader could disagree with an
assumption or is being asked to accept a conclusion.

**No fee talk in any client-facing document.** Not ours, not a range, not "typical".
The engagement letter carries it and nothing else does.

---

## 3. The referral register — whose lane is this?

**A referral is not a hedge, and writing it as one wastes the most valuable
thing we produce.** A client who is told *"ask your CPA about the tax"* got
nothing. A client who is told *"this is structured as an asset sale, which
changes the seller's tax outcome materially and may change the price they will
accept — your CPA needs to confirm the treatment before we counter, and the
specific question is whether §338(h)(10) is available given the entity form"*
got the most useful sentence in the document. **We know what to ask. That is the
expertise. Handing over the question fully formed is the deliverable.**

Each row below: what we may say, what crosses, who owns it, and — the column
that matters — the question to hand them.

### 3a. Tax

| | |
|---|---|
| **We may** | Model the deal both ways. Show what changes. Flag that structure drives the seller's after-tax outcome and therefore the price they will take. Say a number is *pre-tax*. |
| **We may not** | State the tax treatment, the rate, the after-tax proceeds, or whether an election is available. Not even "probably". |
| **Whose** | CPA for computation and returns; **tax counsel** for an opinion that will be relied on. |
| **Hand them** | The entity form, the ownership history, the consideration mix, and the specific election in question. |

The recurring ones: asset vs stock, §338(h)(10) and §336(e), installment
treatment under §453, QSBS eligibility and holding period, purchase-price
allocation across classes, state nexus after close, and rollover equity
treatment. **All of them are jurisdictional and all of them move with
legislation.** `house/deal.ts` carries no tax surface on purpose and a test
keeps it that way — see `PLAYBOOK.md` §5.

> The trap: tax is the single easiest line to cross by accident, because the
> arithmetic is trivial and the conclusion feels obvious. "A 20% cap-gains
> rate would put net proceeds around $X" is a tax opinion. Write "net proceeds
> depend on treatment, which the CPA needs to confirm" and hand over the facts.

### 3b. Legal — entity, contract, clause

| | |
|---|---|
| **We may** | Take a commercial position. Say what we want an earnout to *do*. Identify that a contract has a change-of-control provision and that it matters. Read a document and report what it says. |
| **We may not** | Say what a clause *means* in law, whether it is enforceable, whether a term is standard, or draft binding language. |
| **Whose** | **M&A counsel.** |
| **Hand them** | The commercial position — `PLAYBOOK.md` §5d, the term framework — plus the documents and the "Open for counsel" list. |

The line inside a deal is clean: **deal terms are commercial until they are
legal.** Working out the earnout metric, the measurement window, the escrow
amount and the peg is corp-dev. The moment the question becomes *"does this
clause do what we want"* or *"is this enforceable"*, it is counsel's.

Change-of-control provisions are the ones that bite in this practice: customer
contracts, leases, franchise agreements, licences, key supplier terms and debt
covenants can each require consent on a sale. **Finding them and listing them is
our job. Saying whether one is triggered is counsel's.**

### 3c. Real estate

Real estate is not one lane, it is five, and a deal touching property needs
several at once. The practice has codified doctrine here (V18c, `M224–M234`),
which makes it *more* important to be careful, not less: knowing the rule is
what makes it tempting to state the conclusion.

| Question | Whose | What we do |
|---|---|---|
| **What is the property worth?** | Licensed **appraiser** (MAI for commercial) | Note that the value is unestablished and that a lender will require an appraisal anyway. Never our own number. |
| **Is title clean? Who has to sign?** | **Title company / real-estate counsel** | Flag the vesting form and the risk. Order the commitment. Read the exceptions and list them. |
| **Contamination?** | **Phase I ESA consultant**, Phase II if it recommends one | Flag it as required for any property with a service bay, fuel storage, a floor drain, or a dry-cleaning or industrial history. Lenders require it; assume it is needed. |
| **Zoning / permitted use / CO?** | **Land-use counsel or the municipality** | Ask the question in writing, keep the answer. Never infer permitted use from current use. |
| **Lease terms, assignment, OpCo/PropCo** | **Real-estate counsel** | Report what the lease says. Flag assignment and change-of-control clauses. Never conclude it assigns. |

Three specifics worth carrying, because each is a deal-killer that looks like
a formality:

- **Signatory gaps.** In tenancy-by-the-entirety states, **a one-spouse
  signature conveys nothing**; in a tenancy in common, one cotenant conveys only
  their undivided share. Homestead and community-property joinder catch people
  out. Flag the vesting form and let title resolve it.
- **Risk of loss between signing and closing.** The common-law majority rule is
  equitable conversion — risk passes to the *buyer* at signing absent a statute
  or a contract term. Several states have adopted the Uniform Act and reverse
  that. It is state-specific: ask, do not assume, and get it addressed in the
  contract either way.
- **Deed type is not a formality.** A quitclaim conveys whatever the grantor
  has, including nothing, with no covenants. If a deal is papered on one,
  that is a finding, not a detail.

**Recording acts, risk-of-loss regimes and deed covenants are state law and they
differ.** The practice's constants are a starting point for asking the right
question in the right state, not an answer to give a client.

### 3d. Business valuation and appraisal

| | |
|---|---|
| **We may** | Range, with the method and the assumptions shown. Comparable multiples with their sources. What we would pay and why. |
| **We may not** | Issue an opinion of value, a fairness opinion, or a solvency opinion. |
| **Whose** | Credentialed **business appraiser** — ASA, ABV, CVA. |

The distinction is not the number, it is the framing. *"At 4.0x adjusted EBITDA
this is $1.6M, and here is what 4.0x rests on"* is analysis. *"This business is
worth $1.6M"* is an opinion of value. **A range with its working shown is always
the right form** — the same law the owner-side evaluation runs on.

Fairness opinions come up when there are outside investors, minority holders or
a fiduciary board. If anyone asks for one, that is a specialist engagement and
not something to be talked into.

### 3e. Securities

| | |
|---|---|
| **We may** | Coordinate. Describe a structure a client is considering. |
| **We may not** | Advise on whether an instrument is a security, whether an offering is exempt, who may invest, or how a raise should be structured. |
| **Whose** | **Securities counsel.** |

This one is quieter than the others because it does not look like a securities
question. It arrives as: the buyer is **syndicating equity** to fund the deal,
there is **rollover equity** for the seller, there is a **fund** behind the
buyer, or there is **seller financing with equity features**. Any of those, and
counsel is in the room. §15(b)(13) and the state M&A-broker regimes are the
practice's own exposure here — see §5.

### 3f. Licensing and regulatory — the one that kills trade deals

**This is the most under-checked item in this register and it is specific to the
verticals this practice hunts in.** In HVAC, plumbing, electrical, fire and life
safety, roofing and mechanical, the business operates on a **licence** — often
held by a named qualifying individual, not by the entity.

A change of control can require re-qualification, a new licence, or a
qualifying individual the buyer does not have. **If the licence does not survive
the close, the buyer has bought a company that cannot legally work.**

| | |
|---|---|
| **We may** | Identify the licence, the holder, and the fact that change of control may affect it. Ask the licensing board in writing. Make it a diligence item and a closing condition. |
| **We may not** | Conclude the licence transfers, or that a qualifying individual satisfies the requirement. |
| **Whose** | The **state licensing board** for the rule; **counsel** for what it means for this deal. |

Related and routinely missed: DOT authority for fleets, EPA §608 refrigerant
certification, alarm and low-voltage licences (often a separate regime),
bonding capacity, and contractor registration in each municipality worked.

**Put it early in the diligence sequence.** It is cheap to check and it is
disqualifying — exactly the shape that `PLAYBOOK.md` §5c says goes before the
expensive work.

### 3g. Employment, benefits and immigration

| | |
|---|---|
| **We may** | Report headcount, comp, classification as *stated*, and turnover. Flag concentration in key people. |
| **We may not** | Opine on worker classification, wage-and-hour exposure, non-compete enforceability, plan compliance, or visa status. |
| **Whose** | **Employment counsel**; **ERISA counsel** for plans; a **benefits consultant** for costing. |

The recurring ones: 1099 vs W-2 classification (endemic in the trades and a
real successor-liability item), unpaid overtime, non-competes for technicians
where enforceability varies sharply by state, multiemployer pension withdrawal
liability, and 401(k) plan defects. Successor liability means **the buyer can
inherit these**, so they are diligence items, not seller problems.

### 3h. Insurance and risk

| | |
|---|---|
| **We may** | List the policies, limits and claims history as *reported*. Flag a gap. |
| **We may not** | Advise on adequacy of coverage, or whether a claim is covered. |
| **Whose** | **Commercial broker**; **RWI underwriter** where reps-and-warranties insurance is contemplated. |

Bring the broker in early where the target does hazardous work — the premium
and the exclusions can change the deal, and finding out at closing is finding
out too late.

### 3i. Accounting and quality of earnings

| | |
|---|---|
| **We may** | Read the financials and reconcile them. Recompute a figure and show the working. Flag an add-back that looks unsupported. |
| **We may not** | Attest, audit, or issue a QoE. |
| **Whose** | **CPA** — QoE for a transaction, audit where one is required. |

Our recomputation is analysis; the QoE is the product a lender and an IC rely
on. `earningsSource` in a deal spec should name the QoE once it exists, and
until it does, every figure in the model inherits whatever the seller's own
books are worth.

---

## 4. How to write a referral

The pattern, in every document:

> **[What we found.] [Why it matters commercially.] [Who owns the question.]
> [The exact question to put to them.]**

Worked:

> The company operates under a mechanical contractor licence held personally by
> the founder, who is retiring at close. **Whether that licence survives a
> change of control — and whether the buyer's existing qualifier satisfies the
> state requirement — is a question for the licensing board, in writing, before
> the LOI expires.** If it does not survive, the buyer owns a business that
> cannot pull permits, so we have made it a closing condition rather than a
> diligence item.

Never:

> *"Buyer should consult appropriate professionals regarding licensing."*

The first sentence is why someone pays a retainer. The second is a disclaimer,
and a document full of them reads as someone with nothing to say.

**Do not stack disclaimers.** One clear statement of whose lane it is, at the
point the question arises, beats a paragraph at the end. The standing appendix
in the report template already carries the general statement.

---

## 5. The practice's own exposure

Two open items, and neither is a session's to resolve:

- **§15(b)(13) M&A broker exemption and state M&A-broker registration.** Moving
  from analysis to *running a negotiation to close for a success fee* is the
  exact activity those regimes care about. Counsel confirmation is pending —
  see `THE_LINE_POLICY.md` §"THE ONE THING TO CONFIRM WITH COUNSEL". Until it
  lands, nothing changes about how we work, but do not write anything that
  characterises the practice's regulatory status.
- **Never describe a competitor**, and never characterise what a bank, broker
  or another advisor may or may not do. Describe our work. The copy law in
  `CLAUDE.md` covers it and it applies to client documents too.

---

## 6. Catching yourself

The tell is a **conclusion where a question belongs**. Six phrasings that mean
the line has already been crossed:

| If you wrote… | You have… |
|---|---|
| "the tax treatment will be…" / "net of tax…" | given a tax opinion |
| "this clause means…" / "this is standard / enforceable" | given a legal opinion |
| "the property is worth…" / "the business is worth…" | given an appraisal |
| "the licence will transfer" | answered a regulatory question |
| "coverage is adequate" | given insurance advice |
| "the seller should…" | advised the other side |

That last one is the perimeter itself, not a specialist question, and it is the
easiest to do by accident when a deal is going well and everyone is being
helpful. **We advise the buyer.** Observing that a seller's advisor will
probably want something is fine; telling the seller what to do is not, and it
is the fact pattern the whole buy-side-only posture exists to make impossible.

**When it is genuinely unclear:** write the finding, name the lane you think it
is in, and flag it for Paul rather than deciding. An unnecessary referral costs
a sentence. The other error costs the perimeter.
