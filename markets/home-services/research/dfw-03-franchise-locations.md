<!-- run: 03 | hunt: B | date: 2026-08-01
     query: public location finders for the six Neighborly and Authority Brands
            HVAC / plumbing / electrical franchise brands, filtered to the
            eleven-county Dallas–Fort Worth–Arlington MSA
     tool: web search + fetch, franchisor sites only
     coverage row: 6 — the franchise-encumbered line -->

# DFW franchise-operated locations — Neighborly and Authority Brands

**Why this run existed.** A franchisee is an independently owned business that
carries a franchise agreement. It is neither platform-owned nor plainly
independent, and it had no line in the banding. Sorting these into either bucket
silently corrupts the market structure — into "platform-owned" it inflates
saturation, into "independent" it inflates the acquirable residual with
businesses that come encumbered.

**All six location finders were enumerable.** No brand had to be abandoned.

## Counts, by franchisor

| Brand | Franchisor | Trade | DFW MSA businesses |
|---|---|---|---|
| Aire Serv | Neighborly (KKR) | HVAC | 8 |
| Mr. Rooter | Neighborly (KKR) | Plumbing | 6 |
| Mr. Electric | Neighborly (KKR) | Electrical | 10 |
| One Hour Heating & Air Conditioning | Authority Brands (Apax + BCI) | HVAC | 5 |
| Benjamin Franklin Plumbing | Authority Brands (Apax + BCI) | Plumbing | 6 |
| Mister Sparky | Authority Brands (Apax + BCI) | Electrical | 2 |
| **Total** | | | **37** |

Neighborly subtotal 24; Authority Brands subtotal 13. **These are counts of what
each franchisor's own finder displayed on 2026-08-01, not certified totals.**

## The cut that matters for a 238220 denominator

NAICS 238220 is *Plumbing, Heating, and Air-Conditioning Contractors*. Electrical
contractors are **238210** and sit outside this study's code entirely. So the
franchise line against a 238220 denominator is not 37:

| In scope for NAICS 238220 | Count |
|---|---|
| HVAC — Aire Serv 8 + One Hour 5 | **13** |
| Plumbing — Mr. Rooter 6 + Benjamin Franklin 6 | **12** |
| **238220 total** | **25** |
| *Out of code — electrical (238210): Mr. Electric 10 + Mister Sparky 2* | *12* |

For a residential HVAC thesis specifically, the number is **13**.

## Locations, as displayed

### Aire Serv (8)
Dallas · Fort Worth · Denton · Flower Mound · Frisco · McKinney · Rockwall ·
Weatherford — each at `aireserv.com/<city>/`

### Mr. Rooter (6)
Dallas (located Farmers Branch) · Fort Worth · Denton · Frisco · Rockwall
(103 N Goliad Ste 104) · Waxahachie territory (operating from Ennis,
209 W Crockett St Ste A)

### Mr. Electric (10)
Dallas (8500 N Stemmons Fwy) · Arlington (1201 N Watson Rd) · Frisco (2770 Main
St Ste 275) · Garland (3256 Southern Dr) · Denton (2220 San Jacinto) · West Fort
Worth (located Burleson) · McKinney · Parker and Wise County (located Azle) ·
Mansfield (1015 E Dallas St) · Waxahachie (300 N Interstate 35 E Rd)

### One Hour Heating & Air Conditioning (5)
Aubrey and Celina (located Aubrey, 1518 Navo Rd) · Decatur and West Denton
(located Justin, 17521 Matany Rd) · Ellis County (located Red Oak, 233 E Ovilla
Rd) · Fort Worth (2535 Brennan Ave) · Frisco (2770 Main St Ste 229)

### Benjamin Franklin Plumbing (6)
Arlington (7501 US Hwy 287) · Kaufman and Ennis (located Balch Springs) ·
Decatur (220 West Side Dr) · Duncanville (1019 Explorer St) · Fort Worth
(located Mansfield, 99 Regency Pkwy) · Dallas (located Plano, 1100 Jupiter Rd)

### Mister Sparky (2)
Dallas Fort Worth (located Irving, 4827 W Royal Ln) · Mansfield (400 Industrial
Blvd)

## Four things that will break a screen if they are not carried forward

**1. The franchise trade name does not give the location.** Benjamin Franklin "of
Dallas" is in Plano. "Of Fort Worth" is in Mansfield. "Of Kaufman and Ennis" is
in Balch Springs. Mr. Rooter "of Dallas" is in Farmers Branch. Mr. Electric "of
West Fort Worth" is in Burleson. Any screen that keys county or city off the
business name will misplace all of these.

**2. Location count is not business count, and the gap is large.** Each
Neighborly hub covers many cities through SEO pages that route back to one
franchise. Aire Serv of Fort Worth alone claims Arlington, Bedford, Benbrook,
Colleyville, Euless, Grapevine, Haltom City, Haslet, Hurst, Keller, Kennedale,
Lake Worth, Mansfield, North Richland Hills, Saginaw, Southlake, Western Hills,
White Settlement and Edgecliff Village — about nineteen city pages, one business.
The Neighborly state index carries 300-plus Texas city links; counting those
would have produced a wildly inflated number. **The 37 above counts franchise
businesses, which is the right unit for a target list.**

**3. One duplicate was caught and removed.** `mrelectric.com/weatherford/`
renders as Mr. Electric of West Fort Worth with a canonical path of
`fort-worth/geo/weatherford` — the same franchise, not a second one. Counting the
slug would have made Mr. Electric 11.

**4. Multi-brand operators are real and are not visible from these pages.** One
Hour of Frisco (2770 Main St Ste 229) and Mr. Electric of Frisco (2770 Main St
Ste 275) share a building across competing franchise systems — more likely a
shared executive-suite address than one operator, and flagged rather than
asserted. The pattern is unambiguous just outside the MSA, where One Hour of
Sherman and Mister Sparky of Sherman share 1017 S Sam Rayburn Fwy, and Benjamin
Franklin and Mister Sparky of San Antonio share 12829 Wetmore Rd. Expect the same
inside DFW. **Where one franchisee runs two brands, 37 businesses are fewer than
37 owners**, and the acquirable-entity count is lower still.

## Geographic exclusions applied

All Sherman locations were excluded across three brands — Grayson County sits in
the Sherman–Denison MSA, not DFW. Houston, Austin, San Antonio, Waco, Tyler,
Corpus Christi, Midland, Amarillo, El Paso and Lubbock likewise.

## Sources

Franchisor sites only. Retrieved 2026-08-01.

- https://www.aireserv.com/locations/texas/
- https://www.mrrooter.com/locations/texas/
- https://www.mrelectric.com/locations/texas/
- https://www.onehourheatandair.com/locations/texas/
- https://www.benjaminfranklinplumbing.com/locations/texas/
- https://www.mistersparky.com/locations/texas/

Plus the individual franchise pages named inline above.

## What we don't know yet

- **How many of the 37 share an owner.** The franchisor pages do not name
  franchisees, so the owner count is below 37 by an unmeasured amount.
- **Neighborly street addresses.** Its hub pages publish the business name and
  usually not an address, so Neighborly geography here rests on franchise name
  plus claimed cities. Authority Brands publishes a full address for every one.
- **Whether any franchisee also operates non-franchised businesses**, which is
  common in the trades and would change what an acquirer is actually buying.
- **Franchise agreement terms** — transfer rights, territory, term, royalty.
  None of it is public, and all of it decides whether these are acquirable at all.
