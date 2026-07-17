# DEFINITIVE — Legal items to confirm before publishing

Plain-English checklist. Each item is something the document currently states that
should be confirmed by looking it up (or by counsel) before the rulebook goes
public. I did **not** guess at any of these — that's the point of the list.

**How to read it:** each item says what the document claims, exactly what to
confirm, where to look, and how much it matters. There's a blank line at the end
of each to jot the answer.

**Priority key:**
- 🔴 **Must-fix-if-wrong** — this drives an answer the software gives a user, or
  credits a named outside source, so a wrong value here is a real problem.
- 🟡 **Confirm before publishing** — lower stakes, but shouldn't go public unconfirmed.

---

## 🔴 1. Bankruptcy cram-down interest rate — which appeals courts use which method (Model M155)

- **What the document says:** four federal appeals circuits (the 2nd, 5th, 6th, and 8th) use the "efficient-market" method to set a forced (cram-down) interest rate.
- **What to confirm:** whether the **5th Circuit** actually belongs on that list. There's a well-known 5th Circuit case that went the *other* way and used the "Till formula" instead.
- **Where to look:** *In re Texas Grand Prairie Hotel Realty, L.L.C.*, 710 F.3d 324 (5th Cir. 2013). Also confirm the 8th Circuit and a case cited only as "Topp."
- **Why it matters:** the software picks a method based on this list, so a 5th-Circuit user would get the wrong method. Fix: map each circuit to a real case (the 2nd = *Momentive/MPM*; the 6th = *American HomePatient*).
- **Answer:** _______________________________________________

## 🔴 2. Bankruptcy recovery formula — is it really Moody's? (Model M166)

- **What the document says:** "expected recovery ≈ 0.90 × the debt's trading price + 0.06," attributed to **Moody's Ultimate Recovery Database**.
- **What to confirm:** whether those exact numbers (0.90 and 0.06) are actually published Moody's output, or whether we came up with the formula ourselves.
- **Where to look:** Moody's Ultimate Recovery Database publications / studies.
- **Why it matters:** if the numbers aren't really Moody's, we can't credit Moody's — we'd relabel it "our own estimate, informed by Moody's data" (which is exactly how another model, M168, handles the LoPucki database).
- **Answer:** _______________________________________________

---

## 🟡 3. Washington State real-estate transfer tax — current graduated rates (Model M191)

- **What the document now says:** Washington's transfer tax is graduated (tiered), not a single flat rate, so the model routes a WA deal to a specialist rather than computing it. (I already removed the old, wrong flat 1.78% figure.)
- **What to confirm:** the current tiered state rates and the dollar breakpoints between tiers (they're inflation-adjusted and move over time). As of the 2020 change they were roughly 1.10% / 1.28% / 2.75% / 3.00%.
- **Where to look:** RCW 82.45 (Washington Real Estate Excise Tax).
- **Answer:** _______________________________________________

## 🟡 4. Small-business bankruptcy (Subchapter V) — current debt ceiling (Model M167)

- **What to confirm:** the current dollar limit to qualify for Subchapter V, after the April 2025 inflation adjustment. (The old higher CARES-Act limit expired; the figure reverted and then adjusts every three years.)
- **Where to look:** 11 U.S.C. § 1182 and the § 104 triennial inflation adjustment.
- **Answer:** _______________________________________________

## 🟡 5. FIRPTA reduced 10% rate — which subsection to cite (Models M169 / M199)

- **What the document says:** the reduced 10% foreign-seller withholding rate, cited to "§ 1445(c)(4)."
- **What to confirm:** the citation. The 10% rate and the $1M ceiling actually live in **§ 1445(a)** (added by the PATH Act of 2015, § 324), not § 1445(c)(4). The *rate itself* is correct — only the citation is likely wrong.
- **Answer:** _______________________________________________

## 🟡 6. Delaware recording act — "pure race" or "race-notice"? (Model M224)

- **What the document says:** Delaware is a "pure race" state (first to record wins, even with notice of a prior sale).
- **What to confirm:** Delaware's classification is genuinely debated — its statute contains "without notice" language that many read as making it "race-notice" instead.
- **Where to look:** 25 Del. C. § 153.
- **Answer:** _______________________________________________

## 🟡 7. New York controlling-interest transfer tax — a citation and a case (Model M232)

- **What to confirm, three things:**
  1. The exact subsection for New York's "mere change" exemption (currently cited N.Y. Tax Law § 1405(b)(6)).
  2. Whether **"Matter of 105-02 Forest Hills (2025)"** is a real, on-point decision.
  3. The document cites the **New York City** provision (NYC Admin. Code § 11-2101) for "New York" generally — but property outside the five boroughs is governed by the **statewide** tax (Tax Law Article 31), not the NYC one.
- **Answer:** _______________________________________________

## 🟡 8. Texas right-of-first-refusal "strict match" rule — a real case (Model M231)

- **What to confirm:** the document relies on a Texas "strict match" rule for rights of first refusal but cites no actual case or statute — just the phrase "exact-match rule." Confirm a real, named Texas case (or soften the language).
- **Answer:** _______________________________________________

## 🟡 9. IRS private letter ruling on deal costs — does it exist? (Model M203)

- **What to confirm:** whether **IRS Letter Ruling 202308010** is a real ruling and supports the point it's cited for.
- **Answer:** _______________________________________________

## 🟡 10. Two IP / patent title cases (Models M214 / M215)

- **What to confirm:** whether **Clorox v. Chemical Bank** is a real, on-point case about patent chain-of-title/recording (it reads more like a security-interest case — confirm or replace). Also consider adding **In re Cybernetic Services** (9th Cir. 2001), the leading case on perfecting a security interest in a patent.
- **Answer:** _______________________________________________

## 🟡 11. Deal-terms market medians — current survey figures (Models M206 / M208 / M212)

- **What to confirm:** three "market median" figures against the latest published surveys (SRS Acquiom Deal Terms Study; ABA Private Target Deal Points Study):
  - escrow size (document uses ~10%; recent surveys trend lower),
  - target break-up fee (document ~2.7%; often cited nearer 3.0–3.5%),
  - antitrust reverse break-up fee (document ~5.0%; often cited nearer ~6%).
- **Answer:** _______________________________________________

---

*Items 1 and 2 are the two that would actually block publishing if they come back
wrong. The rest should be confirmed but are lower-stakes. Everything else in the
rulebook is already fixed and verified.*
