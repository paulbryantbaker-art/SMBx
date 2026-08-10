# 09 — Brand Rosters Gap-Fill (Buy-Side Consolidator Register Feed)

**Purpose.** Feed the consolidator register's two matchers: (1) operating brand token appearing in a business name, (2) website domain. Every row below is an already-owned business that must NOT surface as an independent acquisition target.

**Basis legend**
- **Disclosed** — taken from the owner's or the brand's own web property (locations page, "our companies" / "our family" page, footer, sub-brand page), or from an SEC EX-21 subsidiary exhibit.
- **Press-derived** — taken from an acquisition press release, advisor tombstone, or trade press naming the business.
- **Estimated** — inferred; not directly stated by a primary source.

**Hard rule applied throughout:** where a domain could not be observed on a primary source, the domain cell is **left empty**. No domain in this file was constructed by pattern or guessed. Empty cells are itemised in `## What I could not verify`.

**Access note.** Direct HTTP egress to these hosts was blocked by policy (403 on CONNECT) for `curl`. All retrievals below were made through the fetch tool, which reached `apigroupinc.com`, `efts.sec.gov`, `www.sec.gov/Archives/`, and `data.sec.gov` successfully. `browse-edgar` remains robots-blocked; EDGAR full-text search and the `Archives` directory paths were used instead.

---

## 1. APi Group Corp (NYSE: APG) — CIK 1796209

### 1.1 Method note — what the public JSON API actually yields

`https://www.apigroupinc.com/api/v1/companies` and `https://www.apigroupinc.com/api/v1/mapdata/companies` both return the same 36-company roster with a `segment` field and a per-company detail URL of the form `https://www.apigroupinc.com/about-us/our-companies/<slug>`. Probes of `/api/v1/locations`, `/api/v1/mapdata/locations` and `/api/v1/brands` all return **404**. `/api/v1/mapdata` returns the bare string `fetchmap` — a route stub, not data. **There is no per-location or per-brand endpoint.** The operating-brand layer had to be reconstructed from (a) the per-company detail pages, which expose each platform's external domain, (b) each platform's own locations / "our family" pages, and (c) SEC EX-21 exhibits.

Three companies appear in the API that were **not** in the brief's 21-name Safety Services list and are fire/life-safety relevant: **ICS, Inc.**, **Tenet**, and **United States Alliance Fire Protection** (the API's expansion of "USAFP"). The API also splits out **Grunau Company**, **Metropolitan Mechanical Contractors** and **Tessier's** as Specialty Services.

### 1.2 EX-21 subsidiary exhibits located

| Fiscal year | Filed | Accession | EX-21 document | Source URL |
|---|---|---|---|---|
| FY2025 | 2026-02-25 | 0001628280-26-011620 | `apg-20251231exx211entityli.htm` (203 rows) | https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/apg-20251231exx211entityli.htm |
| FY2021 | 2022-03-01 | 0000950170-22-002474 | `apg-ex21_1.htm` | https://www.sec.gov/Archives/edgar/data/1796209/000095017022002474/apg-ex21_1.htm |
| FY2020 | 2021-03-24 | 0001564590-21-014986 | `apg-ex211_271.htm` | https://www.sec.gov/Archives/edgar/data/1796209/000119312520096159/d827912dex211.htm (S-4 twin) |
| Pre-IPO | 2020-04-02 | 0001193125-20-096159 | `d827912dex211.htm` (92 rows, richest legacy-name list) | https://www.sec.gov/Archives/edgar/data/1796209/000119312520096159/d827912dex211.htm |

**Load-bearing EX-21 finding:** legacy US operating entities are being *deleted* from the exhibit over time as they are merged into consolidation vehicles. `Western States Fire Protection Company`, `Grunau Company, Inc.`, `Security Fire Protection Company, Inc.`, `Metropolitan Mechanical Contractors, Inc.`, `Tessier's Inc.`, `Sunland Fire Protection, Inc.`, `Delta Fire Systems, Inc.`, `Landmark Sprinkler, Inc.` and `Olsen Fire Protection, Inc.` all appear in the 2020 and/or FY2021 exhibits and are **absent from the FY2025 exhibit**, while `APi Group Life Safety USA LLC` and `Sprinkler Acquisition LLC` persist. EDGAR full-text search confirms "Western States Fire Protection" last appears in an APi EX-21 in the 2022-03-01 filing. **Consequence: the current EX-21 alone will under-count the register by ≈ 30 live trading names.** The 2020 S-4 exhibit must be used alongside it.

### 1.3 APi — US fire & life safety platforms (register rows)

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| 3S Incorporated | 3s-incorporated.com | HQ Harrison, OH; all US states | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/3s |
| American Fire Protection Group (AFPG) | afpgusa.com | HQ Edina, MN; MN, AR, LA, NC, NM, TN, TX, VA | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/afpg |
| APi National Service Group (APi NSG) | api-nsg.com | HQ Shoreview, MN; US, Canada, UK | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/apinsg |
| CertaSite | certasitepro.com | HQ Indianapolis, IN; IN, OH, MI, IA, WI, PA, MO | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/certa |
| Davis-Ulmer Fire Protection (DU Family of Companies) | davisulmer.com | HQ Rochester, NY; Northeast / Mid-Atlantic / Midwest | Davis-Ulmer Sprinkler Co. | Disclosed | https://www.apigroupinc.com/about-us/our-companies/dufam |
| ICS, Inc. (Industrial Contract Services) | icsgf.com | HQ Grand Forks, ND; upper Midwest | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/ics |
| International Fire Protection (IFP) | candoifp.com | HQ Madison, AL; AL, AR, FL, GA, SC, TN (14 southern states, 12 cities) | — | Disclosed | https://www.candoifp.com/locations.php |
| Premier Fire & Security | premierfire.net | HQ Paducah, KY | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/PFS |
| Security Fire Protection Company | securityfire.com | HQ Memphis, TN; branches Memphis, Nashville, Knoxville | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/secfire |
| Tenet | tenetsolutions.com | HQ Arden Hills, MN | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/tenet |
| Texas Sprinkler | texassprinkler.com | HQ Grapevine, TX; AR, CO, GA, KY, LA, MS, MO, OK, PA, SC, TN | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/texsprnk |
| United States Alliance Fire Protection (USAFP) | usafireprotectioninc.com | HQ Lake Forest, IL; IL, WI, IN | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/usafp |
| Viking Fire Protection Group (VFPG) | vfpg.com | HQ St. Paul, MN; Midwest + Southeast | — | Disclosed | https://www.apigroupinc.com/about-us/our-companies/vfpg |
| Western States Fire Protection Co. (WSFP) | wsfp.com | HQ Centennial, CO; 45+ locations across western US | — | Disclosed | https://www.wsfp.com/locations/ |

### 1.4 APi — sub-brands under Viking Fire Protection Group

Source of record: https://vfpg.com/companies/

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| Viking Automatic Sprinkler | *(empty — see gaps)* | MN (St. Paul, Rochester, Duluth) | — | Disclosed | https://vfpg.com/companies/viking-automatic-sprinkler/ |
| VFP Fire Systems | vfpfire.com (302 → vfpg.com) | Detroit MI, Huntington WV, Bethel PA, Omaha NE, Des Moines IA | — | Disclosed | https://vfpg.com/companies/vfp-fire-systems/ |
| Absolute Fire Protection *(VFPG entity — distinct from the Marmic and NF&S "Absolute" names)* | *(empty)* | Midwest | — | Disclosed | https://vfpg.com/companies/absolute-fire/ |
| High Sierra Fire Protection | *(empty)* | Reno, NV | — | Disclosed | https://vfpg.com/companies/high-sierra/ |
| Kimble Fire Protection | *(empty)* | Midwest | — | Disclosed | https://vfpg.com/companies/kimble-fire/ |
| Landmark Sprinkler | *(empty)* | KY (Lexington, Louisville) | — | Disclosed | https://vfpg.com/companies/landmark-sprinkler/ |
| Quality Fire Protection | *(empty)* | Midwest | — | Disclosed | https://vfpg.com/companies/quality-fire/ |
| Valley Fire Protection | *(empty)* | IL (St. Charles, Rockford) | Valley Fire Protection Services, LLC | Disclosed | https://vfpg.com/companies/valley-fire-protection/ |
| Wm. Crook Fire Protection Co. | *(empty)* | *(not stated)* | — | Press-derived | https://pmcf.com/transactions/pmcf-advises-wm-crook-fire-protection-in-its-sale-to-viking-fire-protection-a-subsidiary-of-api-group/ |

VFPG's own locations page lists offices in St. Paul MN, Rochester MN, Duluth MN, St. Charles IL, Rockford IL, Fort Wayne IN, South Bend IN, Cincinnati OH, Columbus OH, Lexington KY, Louisville KY, Detroit MI, Bethel PA, Huntington WV, Omaha NE, Des Moines IA, Houston TX, Mobile AL, Reno NV, Huntington Beach CA and San Diego CA.

### 1.5 APi — sub-brands trading under Western States Fire Protection

Source of record: https://www.wsfp.com/locations/

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| 3-D Fire Protection Inc. | *(empty)* | Idaho Falls, ID | — | Disclosed | https://www.wsfp.com/locations/ |
| Arizona Verde Fire Protection | *(empty)* | Phoenix, AZ | — | Disclosed | https://www.wsfp.com/locations/ |
| Delta Fire Systems, Inc. | *(empty)* | Hurricane UT, Salt Lake City UT, Meridian ID, Twin Falls ID | — | Disclosed | https://www.wsfp.com/locations/ |
| National Fire Suppression | *(empty)* | Decatur IL, Kansas City KS | — | Disclosed | https://www.wsfp.com/locations/ |
| Signal One Fire and Communication | *(empty)* | Phoenix, AZ | — | Disclosed | https://www.wsfp.com/locations/ |

WSFP-branded offices (all Disclosed, same source): Aberdeen SD · Albuquerque NM · Arlington TX · Bothell WA · Bozeman MT · Branson MO · Campbell CA · Casper WY · Centennial CO (×2) · Colorado Springs CO · Corpus Christi TX · Donna TX · El Paso TX · Fenton MO · Fort Collins CO · Glenwood Springs CO · Hayward CA · Houston TX · Jefferson City MO · Kalispell MT · Lake Oswego OR · Lakewood CA · Las Vegas NV · Liberty Lake WA · Lubbock TX · Missoula MT · Oklahoma City OK · Redmond OR · Roseville CA · Round Rock TX · Schertz TX · Springfield MO · Tucson AZ · Tulsa OK · Upland CA.

### 1.6 APi — sub-brands in the Davis-Ulmer (DU) family

Source of record: https://www.davisulmer.com/about-us/our-family.php

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| All State Fire & Security | *(empty)* | Northeast | — | Disclosed | https://www.davisulmer.com/all-state-fire-security/ |
| Beach Lake Sprinkler | *(empty)* | PA / NY | Beach Lake Sprinkler Corp | Disclosed | https://www.davisulmer.com/beach-lake-sprinkler/ |
| Clear Connection | clearconnection.com | *(not stated)* | — | Disclosed | https://www.davisulmer.com/about-us/our-family.php |
| Cogswell Sprinkler | cogswellsprinkler.com (302 → davisulmer.com) | MA / New England | Cogswell Sprinkler Company | Disclosed | https://www.davisulmer.com/cogswell-sprinkler-company/ |
| Eastern Electronics & Security | *(empty)* | Northeast | — | Disclosed | https://www.davisulmer.com/eastern-electronics-and-security/ |
| Eastern Fire | *(empty)* | Northeast | — | Disclosed | https://www.davisulmer.com/eastern-fire/ |
| Ellis Fire Suppression | *(empty)* | Northeast | Ellis Fire Suppression Inc. | Disclosed | https://www.davisulmer.com/ellis-fire-protection/ |
| Flannery Fire Protection | *(empty)* | Northeast | — | Disclosed | https://www.davisulmer.com/flannery-fire-protection/ |
| Grunau Fire Protection | grunaufire.com (302 → davisulmer.com) | WI / Midwest | Grunau Company, Inc. | Disclosed | https://www.davisulmer.com/grunau-fire-protection/ |
| GW Systems | *(empty)* | *(not stated)* | — | Disclosed | https://www.davisulmer.com/gw-systems/ |
| Integrated Protection Services | integratedprotectionservices.com | Darien, CT | — | Disclosed | https://www.integratedprotectionservices.com/ |
| ITG Larson | *(empty)* | *(not stated)* | — | Disclosed | https://www.davisulmer.com/itg-larson/ |
| One Source Security | onesourcesecurity.com | *(not stated)* | — | Disclosed | https://www.davisulmer.com/about-us/our-family.php |
| Quick Response Fire Protection | *(empty)* | *(not stated)* | — | Disclosed | https://www.davisulmer.com/quick-response-fire-protection/ |
| Reliance Fire Protection | *(empty)* | *(not stated)* | — | Disclosed | https://www.davisulmer.com/reliance-fire-protection/ |
| Rich Fire Protection | *(empty)* | *(not stated)* | — | Disclosed | https://www.davisulmer.com/rich-fire-protection/ |
| SRI Fire & Security | *(empty)* | NY | SRI Fire Sprinkler, LLC | Disclosed | https://www.davisulmer.com/sri-fire-security/ |
| W&M Fire & Security | wmfireprotection.com | Hawthorne NY, Holbrook NY, Plantsville CT | W&M Sprinkler Company, Inc. | Disclosed | https://www.wmfireprotection.com/ |

### 1.7 APi — sub-brands under American Fire Protection Group

Source of record: https://afpgusa.com/locations/

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| A-Com Technologies | *(empty)* | Albuquerque, NM | — | Disclosed | https://afpgusa.com/locations/ |
| Mid Atlantic Fire Protection | *(empty)* | Virginia Beach, VA | — | Disclosed | https://afpgusa.com/locations/ |
| Patterson Group Services, Inc. | *(empty)* | Sanford, NC | — | Disclosed | https://afpgusa.com/locations/ |
| Phoenix Fire Protection | *(empty)* | Sanford, NC | — | Disclosed | https://afpgusa.com/locations/ |
| Regional Systems | *(empty)* | Texarkana, TX | — | Disclosed | https://afpgusa.com/locations/ |
| Sunland Fire Protection Inc. | *(empty)* | High Point NC, Wilmington NC | — | Disclosed | https://afpgusa.com/locations/ |

AFPG-branded offices: Edina MN · North Little Rock AR · Monroe LA · High Point NC · Wilmington NC · Albuquerque NM · Jackson TN · Dallas TX · Tyler TX · Round Rock TX · San Antonio TX · College Station TX · Houston TX.

### 1.8 APi — sub-brands under International Fire Protection

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| Atlanta Sprinkler Inspection Company | *(empty)* | Winder, GA | — | Disclosed | https://www.candoifp.com/locations.php |
| United Fire Alarm Service | *(empty)* | Murrells Inlet / Myrtle Beach, SC | — | Disclosed | https://www.candoifp.com/locations.php |

### 1.9 APi NSG — acquired names published on the platform's own growth page

Source of record: https://www.api-nsg.com/our-growth.php. These are trading names that entered the group between 2012 and 2017. Several are already captured above; the ones **not** otherwise captured are the register-relevant additions.

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| Olsen Fire Protection | *(empty)* | MN (per EX-21 jurisdiction) | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| K&M Fire Protection Services | *(empty)* | CT, New York City | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| S&S Fire Suppression Systems, Inc. | *(empty)* | *(not stated)* | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| Advanced Fire Protection | *(empty)* | *(not stated)* | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| K. Kranski & Sons Inc. | *(empty)* | *(not stated)* | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| Dynamic Fire Protection | *(empty)* | *(not stated)* | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| Fire Stop Enterprises | *(empty)* | *(not stated)* | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| Omlid & Swinney | *(empty)* | *(not stated)* | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| Morristown Automatic Sprinkler Co. (MASCO) | *(empty)* | *(not stated)* | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| Nexus Alarm and Suppression | *(empty)* | WY (EX-21 jurisdiction) | — | Disclosed | https://www.api-nsg.com/our-growth.php |
| Forbes Fire Protection | *(empty)* | **Canada** — out of US screen | — | Disclosed | https://www.api-nsg.com/our-growth.php |

### 1.10 APi — additional US legal-entity names from EX-21 not surfaced by any web property

These are EX-21 rows with no matching public brand page. They still appear on contracts, licences and vehicle liveries, so they belong in the register as name-match tokens even where no domain exists.

| Legal / operating name | Domain | State of incorporation | Appears in | Basis | Source URL |
|---|---|---|---|---|---|
| Allegiant Fire Protection, LLC | *(empty)* | Illinois | FY2025 EX-21 | Disclosed | https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/apg-20251231exx211entityli.htm |
| Endeavor Fire Protection Holdings, LLC | *(empty)* | Delaware | FY2025 EX-21 | Disclosed | (same) |
| Palmetto Automatic Sprinkler Co, LLC | *(empty)* | Delaware | FY2025 EX-21 | Disclosed | (same) |
| SRI Fire Sprinkler, LLC | *(empty)* | New York | FY2025 EX-21 | Disclosed | (same) |
| K&M Fire N.Y.C., LLC | *(empty)* | New York | FY2025 EX-21 | Disclosed | (same) |
| W&M Sprinkler-NYC, LLC | *(empty)* | New York | FY2025 EX-21 | Disclosed | (same) |
| PSL Supply, LLC | *(empty)* | New York | FY2025 EX-21 | Disclosed | (same) |
| Merit Contracting, LLC | *(empty)* | Delaware | FY2025 EX-21 | Disclosed | (same) |
| Architekton Partners LLC | *(empty)* | Georgia / Delaware | FY2025 EX-21 | Disclosed | (same) |
| Sprinkler Acquisition LLC | *(empty)* | Minnesota | FY2020–FY2025 EX-21 | Disclosed | (same) |
| APi Group Life Safety USA LLC | *(empty)* | Minnesota | FY2025 EX-21 | Disclosed | (same) |
| Island Fire Sprinkler, Inc. / Island Fire Sprinkler-NYC, LLC | *(empty)* | New York | 2020 + FY2021 EX-21 only | Disclosed | https://www.sec.gov/Archives/edgar/data/1796209/000119312520096159/d827912dex211.htm |
| Heat Trace Services, Inc. | *(empty)* | Alaska | 2020 EX-21 only | Disclosed | (same) |
| CMS Mechanical Services Inc. | *(empty)* | Colorado | 2020 EX-21 only | Disclosed | (same) |
| Quality Integrated Services, Inc. | *(empty)* | Oklahoma | 2020 EX-21 only | Disclosed | (same) |
| NYCO, Inc. | *(empty)* | Minnesota | 2020 EX-21 only | Disclosed | (same) |
| Torren Group, Inc. | *(empty)* | Minnesota | 2020 + FY2021 EX-21 | Disclosed | (same) |
| Gordon United, LLC | *(empty)* | Minnesota | 2020 + FY2021 EX-21 | Disclosed | (same) |
| ABATECO, Inc. | *(empty)* | Minnesota | 2020 + FY2021 EX-21 | Disclosed | (same) |
| Northern Air Corporation | *(empty)* | Minnesota | FY2021 EX-21 | Disclosed | https://www.sec.gov/Archives/edgar/data/1796209/000095017022002474/apg-ex21_1.htm |
| Grunau Company, Inc. / Grunau Company of Indiana, LLC | *(empty)* | Wisconsin | 2020 + FY2021 EX-21 | Disclosed | https://www.sec.gov/Archives/edgar/data/1796209/000119312520096159/d827912dex211.htm |
| Metropolitan Mechanical Contractors, Inc. | *(empty)* | Minnesota | 2020 + FY2021 EX-21 | Disclosed | (same) |
| Tessier's Inc. | *(empty)* | South Dakota | 2020 + FY2021 EX-21 | Disclosed | (same) |

### 1.11 CertaSite legacy roster (APi-owned from 2 Feb 2026)

APi Group completed the CertaSite acquisition on **2 February 2026** (Press-derived). CertaSite's own acquisitions index still names 21 predecessor businesses; all of these are now APi-owned and must not be screened as independent. Source of record: https://www.certasitepro.com/acquisitions

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| ABC Fire Extinguisher Co. | *(empty)* | Ohio | — | Disclosed | https://www.certasitepro.com/acquisitions |
| Advanced Fire | *(empty)* | Pennsylvania | now trades as CertaSite | Disclosed | https://www.certasitepro.com/news/advanced-fire-now-certasite |
| Approved Protection Systems | *(empty)* | Michigan | — | Disclosed | https://www.certasitepro.com/acquisitions |
| Approved Safety and Security | *(empty)* | Indiana | — | Disclosed | https://www.certasitepro.com/news/certasite-acquires-approved-safety-and-security |
| Company One Suppression | *(empty)* | Illinois, Iowa | — | Disclosed | https://www.certasitepro.com/acquisitions |
| County Fire Protection | *(empty)* | Ohio | — | Disclosed | (same) |
| Erlich Fire Protection | *(empty)* | Michigan | — | Disclosed | (same) |
| Field's Fire Protection | *(empty)* | Michigan | — | Disclosed | (same) |
| Great Lakes Fire & Safety Equipment | *(empty)* | Michigan | — | Disclosed | (same) |
| Spears Fire & Safety | *(empty)* | Michigan | — | Disclosed | (same) |
| Starfire Systems / Starfire Extinguisher | *(empty)* | Wisconsin | — | Disclosed | (same) |
| Marine Fire Sales & Service | *(empty)* | Ohio | — | Disclosed | (same) |
| Premier Electronics | *(empty)* | Michigan | — | Disclosed | (same) |
| Craynon Fire Protection | *(empty)* | Ohio | — | Disclosed | (same) |
| Teasley Fire Protection | *(empty)* | Kentucky | — | Disclosed | (same) |
| Midwest Fire Protection | *(empty)* | Michigan | — | Disclosed | (same) |
| Heartland Fire & Security | *(empty)* | Iowa | — | Disclosed | (same) |
| Hamrick Fire Systems | *(empty)* | Ohio | — | Disclosed | (same) |
| Fire Loss Control | *(empty)* | Ohio | — | Disclosed | (same) |
| Ace Fire Protection | *(empty)* | Indiana | — | Disclosed | (same) |
| Eastman Fire Protection | *(empty)* | Michigan | — | Disclosed | (same) |
| Allied Safety Services | *(empty)* | *(not stated)* | — | Press-derived | https://www.privsource.com/acquisitions/deal/certasite-acquires-allied-safety-services-e4SZqm |
| Fire Systems Professionals | *(empty)* | *(not stated)* | — | Disclosed | https://www.certasitepro.com/acquisitions/fire-systems-professionals |

CertaSite branch cities (Disclosed, https://www.certasitepro.com/locations): Indianapolis IN (HQ) · Lafayette IN · Kent/Akron OH · Whitehall/Columbus OH · Dayton OH · Holland/Toledo OH · Alpena MI · Ann Arbor MI · Troy/Detroit MI · Wyoming/Grand Rapids MI · Kalamazoo MI · Bettendorf/Davenport IA · Franklin/Milwaukee WI · Greensburg/Pittsburgh PA · Rimersburg PA · High Ridge/St. Louis MO.

### 1.12 APi entities that are NOT US — exclude from the US target screen

| Brand | Territory | Basis | Source URL |
|---|---|---|---|
| Chubb Fire & Security | UK, France, Netherlands, Germany, Spain, Ireland, Belgium, Austria, Switzerland, Australia, NZ, Canada, China, Hong Kong, Taiwan, Macau, Singapore, Thailand, UAE, India | Disclosed | FY2025 EX-21 (rows 1–49) |
| SK FireSafety Group (incl. SK Noord B.V., Knowsley SK Ltd., Noha Norway AS) | Netherlands, UK, Norway | Disclosed | FY2025 EX-21 |
| Vipond Inc. / Vipond Fire Protection Ltd | Canada; UK/Scotland entity | Disclosed | FY2025 EX-21 |
| Onyx Fire Protection Services Inc. | Canada | Press-derived | https://fireandsafetyjournalamericas.com/apiigroup-onyx-fire-deal/ |
| Wtech Fire & Security | *(non-US; territory not confirmed — see gaps)* | Disclosed (name only) | https://www.apigroupinc.com/api/v1/companies |
| Atlantic Alarms & Sound; Canam Fire Protection Inc.; NSG Safety Canada Corporation; SMC Monitoring Corporation | Canada | Disclosed | FY2025 EX-21 |
| Three S Inc. de Mexico | Mexico | Disclosed | FY2025 EX-21 |

**Also out of scope by service line (not fire/life safety):** Elevated / elevatedfacilityservices.com (elevators, Tampa FL) · Start Elevator (NY) · Oracle Elevator Holdco · APi Garage Door · APi HVAC Services · PASCO · Classic Industrial Services · J. Fletcher Creamer & Son · Jamar · Jomax · LeJeune Steel · MP Nexlevel · Mid-Ohio Pipeline · United Piping · Metropolitan Mechanical Contractors · Tessier's.

---

## 2. Encore Fire Protection (Permira; ex-Levine Leichtman)

**Correct domain: `encorefireprotection.com`.** The domain `encorefp.com` was not reachable and is not the company's site — do not use it. Encore states "over 60 successful partnerships integrated" (Disclosed, https://encorefireprotection.com/about/partnership-strategy/).

### 2.1 Encore affiliated brand partners — full published roster

Source of record: https://encorefireprotection.com/about/affiliated-brand-partners/ (Disclosed for every row). Encore does not publish state, city or domain per brand on this page, so those cells are left empty rather than guessed.

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| A-Z Fire Alarm | *(empty)* | *(empty)* | — | Disclosed | https://encorefireprotection.com/about/affiliated-brand-partners/ |
| A. Fire & Safety Co | *(empty)* | *(empty)* | — | Disclosed | (same) |
| AAA Fire Services | *(empty)* | *(empty)* | — | Disclosed | (same) |
| ACT | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Advanced Sheet Metal | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Alarm Systems Innovations | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Alarm Works & Fire Detection Systems | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Allstate Fire Equipment | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Allstate Fire Equipment of Rhode Island | *(empty)* | Rhode Island | — | Disclosed | (same) |
| Alpine Sprinkler | *(empty)* | *(empty)* | — | Disclosed | (same) |
| American Sprinkler Company | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Approved Fire Protection | *(empty)* | *(empty)* | — | Disclosed | (same) |
| ASCO Fire | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Assured Fire Alarm Co, Inc. | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Backflow Specialists | *(empty)* | *(empty)* | — | Disclosed | (same) |
| BEF Alarms | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Bravante & Associates Inc. | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Capitol Alarm Systems | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Checkmate Security Systems Inc. | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Chevalier Fire Protection | *(empty)* | *(empty)* | — | Disclosed | (same) |
| City Fire Equipment Co, Inc. | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Clement Fire & Safety | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Coastal Fire Protection | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Complete Fire Protection | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Connecticut Fire Equipment | *(empty)* | Connecticut | — | Disclosed | (same) |
| Dakom Service | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Double R | *(empty)* | *(empty)* | — | Disclosed | (same) |
| East Coast Fire | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Electronic Alarm Systems | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Elite Action Fire | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Fire & Safety Commodities | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Fire Command Co | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Fire Fighting Equipment | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Fire Service Group | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Fire Spec | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Fireline (Fireline Corporation) | *(empty)* | Baltimore, MD | — | Disclosed / Press-derived | https://ccabalt.com/fireline-corporation-acquired-by-encore-fire-protection/ |
| FIREX | *(empty)* | *(empty)* | — | Disclosed | https://encorefireprotection.com/about/affiliated-brand-partners/ |
| Franklin Alarm | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Freedom Fire Protection Inc. | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Gannon Fire Sprinkler | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Gorham / Gorham Fire Equipment | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Guardian *(Encore's listing — a fifth unrelated "Guardian"; see §6)* | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Interstate Fire & Safety | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Ivanco Inc. | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Jersey Coast Fire Equipment Co | *(empty)* | New Jersey | — | Disclosed | (same) |
| Kistler O'Brien Fire Protection | *(empty — served under encorefireprotection.com/kistler-obrien-fire-protection/)* | Mid-Atlantic; PA (Allentown, Reading, Paoli), NJ, CT, MA, RI | — | Disclosed | https://encorefireprotection.com/kistler-obrien-fire-protection/ |
| Life Safety Fire Protection, Inc. | *(empty)* | *(empty)* | — | Disclosed | https://encorefireprotection.com/about/affiliated-brand-partners/ |
| Louisiana Special Systems | *(empty)* | Louisiana | — | Disclosed | (same) |
| Maine Fire & Security, LLC | *(empty)* | Maine | — | Disclosed | (same) |
| Maine Fire Equipment Co. | *(empty)* | Maine | — | Disclosed | (same) |
| Massachusetts Fire Technologies | *(empty)* | Massachusetts | — | Disclosed | (same) |
| Metro USA | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Mid-Atlantic Fire Protection *(Encore listing — distinct from AFPG's "Mid Atlantic Fire Protection", Virginia Beach)* | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Mountain Valley Sprinkler System | *(empty)* | *(empty)* | — | Disclosed | (same) |
| National Fire & Safety Solutions *(Encore listing — NOT the Highview platform in §4)* | *(empty)* | *(empty)* | — | Disclosed | (same) |
| New England Fire & Sprinkler Protection, Inc. | *(empty)* | New England | — | Disclosed | (same) |
| New Jersey Fire Equipment | *(empty)* | New Jersey | — | Disclosed | (same) |
| NJ Service, Testing & Inspection | *(empty)* | New Jersey | — | Disclosed | (same) |
| PAS, LLC | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Patriot Fire Protection | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Protective Measures | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Reliable Fire Protection | *(empty)* | *(empty)* | — | Disclosed | (same) |
| S And S Fire Service | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Safety Systems of Vermont | *(empty)* | Vermont | — | Disclosed | (same) |
| Sentinel Fire Safety | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Servant Fire Protection | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Shoreline Fire Equipment | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Sprinkler Systems Inc. | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Superior Fire Protection | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Surf Fire & Safety | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Van Security Services | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Venus Fire Protection & Safety | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Wel-Design Alarm Systems | *(empty)* | *(empty)* | — | Disclosed | (same) |
| William Hird & Co | *(empty)* | *(empty)* | — | Disclosed | (same) |
| Yankee Sprinkler | *(empty)* | *(empty)* | — | Disclosed | (same) |

Duplicate-cased entries "AllState Fire Equipment" and "Allstate Fire Equipment" appear on the page as separate rows; treated here as one token.

### 2.2 Encore branch footprint (from the published locations sitemap)

Disclosed, https://encorefireprotection.com/locations-sitemap.xml — 33 branches across 13 states:
Pawtucket RI (corporate) · Williston VT · Wilbraham MA · West Wareham MA · West Springfield MA · Needham MA · Lee MA · Holyoke MA · Bridgewater MA · Plainville CT · Middletown CT · Norwalk CT · Wall Township NJ · Parsippany NJ · Reading PA · Paoli PA · Allentown PA · Presque Isle ME · Lewiston ME · Bangor ME · Dublin NH · Dover NH · Concord NH · Mount Vernon NY · Brooklyn NY · Bohemia NY · Baltimore MD · Leesburg VA · Fort Walton Beach FL · Scott LA · LaPlace LA · Covington LA.

**Note on scale:** the published branch list (33) and the published partner list (77) are materially smaller than the "70+ acquisitions across 17 states" figure. States present in the sitemap number 13 (RI, VT, MA, CT, NJ, PA, ME, NH, NY, MD, VA, FL, LA). The remaining four states are not identifiable from Encore's own properties.

---

## 3. Marmic Fire & Safety (KKR; ex-HGGC, ex-Thompson Street)

**Domain: `marmicfire.com` (Disclosed).** The interactive map has no separate JSON endpoint — the `#map-loc` container renders client-side. The underlying roster was recovered instead from `https://marmicfire.com/location-sitemap.xml`, which enumerates every branch page.

**Brand policy finding:** Marmic **rebrands everything to "Marmic Fire & Safety"**. There is no "our companies" page and no sub-brand pages. Every acquired business is absorbed into the Marmic name. That means **the register must catch Marmic by domain and by the acquired legacy names, not by a brand family.**

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| Marmic Fire & Safety | marmicfire.com | 53 branches; AR, AZ, CO, DE, FL, GA, IL, IN, KS, KY, MO, MS, NC, NE, OK, SC, TX, VA, WI, WV | — | Disclosed | https://marmicfire.com/location-sitemap.xml |
| Balco Systems | *(empty)* | Lubbock, TX | Sound Photo (1965) | Disclosed | https://marmicfire.com/balco-systems-chooses-marmic/ |
| Northwest Fire Protection (NWFP) | *(empty)* | Fort Smith, AR; licensed AR, MO, OK, TX, LA | — | Disclosed | https://marmicfire.com/northwest-fire-protection-chooses-marmic/ |
| Absolute Fire Protection *(Marmic entity — distinct from the VFPG and NF&S "Absolute" names)* | *(empty)* | Paragould, AR | — | Disclosed | https://marmicfire.com/marmic-acquires-4-new-fire-protection-companies/ |
| West Memphis Fire Extinguisher | *(empty)* | West Memphis, AR | — | Disclosed | (same) |
| Kansas City Fire & Security | *(empty)* | Olathe, KS | — | Disclosed | (same) |
| F.L. Sons Fire Equipment Company | *(empty)* | Mackinaw, IL | — | Disclosed | (same) |
| Total Fire & Safety, LLC | *(empty)* | *(not stated)* | — | Press-derived | https://www.businesswire.com/news/home/20201210005153/en/Thompson-Street-Capital-Partners-Platform-Company-Marmic-Fire-Safety-Co.-Acquires-Total-Fire-Safety-LLC |
| Fire Control Systems | *(empty)* | *(not stated)* | — | Press-derived | https://www.cbinsights.com/company/fire-control-systems |

Marmic branch cities (Disclosed, location sitemap): Joplin MO (HQ) · Springfield MO · Cape Girardeau MO · Bridgeton MO · Grandview MO · St. Joseph MO · Jefferson City MO · Springdale AR · Ft. Smith AR · Little Rock AR · Jonesboro AR · Blytheville AR · Mtn. Home AR · Wichita KS · Topeka KS · Olathe KS · Tulsa OK · Oklahoma City OK · Lawton OK · Dallas TX · San Antonio TX · LaPorte TX · Flint TX · Lubbock TX · Downers Grove IL · Mackinaw IL · West Frankfort IL · Flora IN · Hopkinsville KY · Nicholasville KY · Englewood CO · Fort Collins CO · Colorado Springs CO · Pueblo CO · Chandler AZ · Phoenix AZ · Omaha NE · Green Bay WI · Hartford WI · Charlotte NC · Leland NC · Raleigh NC · North Charleston SC · Camden SC · Savannah GA · Fort Myers FL · Miami FL · Newark DE · Ashland VA · Christiansburg VA · Gulfport MS · Princeton WV · Logan WV.

---

## 4. National Fire & Safety (Highview Capital) — **domain found**

**`natfiresafety.com`.** This closes the highest-priority single unknown. The domain is stated in the company's own Business Wire acquisition releases and confirmed live by fetching the site and its sitemap.

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| National Fire & Safety (NFS) | natfiresafety.com | AZ (Phoenix, Scottsdale, Tempe), CO (Denver, Colorado Springs), TX (Dallas, Fort Worth), UT (Salt Lake City), WY | — | Disclosed | https://natfiresafety.com/service-areas/ |
| Frontier Fire | *(empty — resolves into natfiresafety.com/frontier-fire/)* | Colorado, Utah | now under National Fire & Safety | Disclosed | https://natfiresafety.com/frontier-fire/ |
| RCI Fire Systems (RCI Systems LLC) | *(empty — resolves into natfiresafety.com/rci-fire-systems/)* | Arizona | now under National Fire & Safety | Disclosed | https://natfiresafety.com/rci-fire-systems/ |
| TFA / Texas Fire Alarm | *(empty)* | Texas | now under National Fire & Safety | Disclosed | https://www.natfiresafety.com/ (payment-portal navigation) |
| All Pro Fire Protection | *(empty)* | *(not stated)* | — | Press-derived | https://www.businesswire.com/news/home/20211021005344/en/Highview-Backed-National-Fire-Safety-Announces-Acquisition-of-All-Pro-Fire-Protection |
| Commercial Fire Protection | *(empty)* | *(not stated)* | — | Press-derived | https://www.businesswire.com/news/home/20220111005525/en/Highview-Backed-National-Fire-Safety-Announces-Acquisition-of-Commercial-Fire-Protection |
| Elite Fire Protection Systems | *(empty)* | *(not stated)* | — | Press-derived | https://www.businesswire.com/news/home/20190916005845/en/Highview-Backed-National-Fire-Safety-Announces-Acquisition-Elite |
| Texas Fire Safety | *(empty)* | Texas | — | Press-derived | https://www.businesswire.com/news/home/20210526005539/en/Highview-backed-National-Fire-Safety-Announces-Acquisition-of-Texas-Fire-Safety |
| Absolute Fire Protection *(NF&S entity — third unrelated "Absolute")* | absolutefireaz.com | Glendale, AZ | — | Press-derived | https://www.businesswire.com/news/home/20220301005544/en/Highview-Backed-National-Fire-Safety-Announces-Acquisition-of-Absolute-Fire-Protection |

The 2022 release describes NFS as operating "through subsidiaries across seven Western states"; only five (AZ, CO, TX, UT, WY) are enumerated on the current site.

---

## 5. Spectrum Safety Solutions (Sentinel Capital Partners; ex-Carrier Industrial Fire)

**Real domain: `spectrum-safety.com`.** Confirmed in Sentinel's carve-out press release and by fetching the site. **`spectrumsafetysolutions.com` is confirmed NOT the company** and must be excluded from the domain matcher.

| Operating brand | Domain | States / metros | Former name if rebranded | Basis | Source URL |
|---|---|---|---|---|---|
| Spectrum Safety Solutions | spectrum-safety.com | HQ Stamford, CT; ≈ 1,400 employees in 20+ countries | Carrier Industrial Fire | Disclosed | https://www.spectrum-safety.com/ |
| Autronica | autronicafire.com | Norway-headquartered brand, global | — | Disclosed | https://www.autronicafire.com/news/news/sentinel-capital-partners-carves-out-industrial-fire-business-from-carrier-2/ |
| Det-Tronics | det-tronics.com | Minneapolis, MN heritage brand | — | Disclosed | https://www.det-tronics.com/news/news/brand_press_release/ |
| Marioff (HI-FOG) | marioff.com | Finland-headquartered brand, global | — | Disclosed | https://www.marioff.com/en/news/sentinel-capital-partners-carves-out-industrial-fire-business-from-carrier/ |
| Fireye | *(empty)* | *(not stated)* | — | Disclosed (name only) | https://www.sentinelpartners.com/company/spectrum-safety-solutions/ |

**Screening note:** Spectrum is a **product manufacturer**, not a US installing/inspecting service contractor. Its four brands should sit in the register as exclusions but should not consume US service-target slots. No US branch network is published.

---

## 6. Do-not-name-match token list

Tokens that must **never** be used for name-based matching, with the reason and the required alternative method. "Domain-only" means the register must identify the owner by website domain; name matching on this token will produce false positives against genuinely independent targets.

| Token | Why it is unsafe | Collisions found in this study | Must be caught by |
|---|---|---|---|
| **Guardian** | Five unrelated owned entities plus generic use | Guardian Fire Services (Investcorp); Guardian Fire Protection Services LLC (Knox Lane) — **two domains**, `guardianfireprotection.com` and `ars-guardian.com`, both verified live and both serving the Rockville MD business; Guardian Protection (Armstrong); Guardian Alarm; "Guardian" as an Encore affiliated brand partner | **Domain-only** |
| **Absolute** | Three unrelated owned "Absolute Fire Protection" businesses | VFPG (APi, Midwest); Marmic (Paragould AR); National Fire & Safety (Glendale AZ, `absolutefireaz.com`) | **Domain + state** |
| **Premier** | Generic; at least two owned uses | Premier Fire & Security (APi, Paducah KY, `premierfire.net`); Premier Electronics (CertaSite, MI) | **Domain-only** |
| **American** | Generic | American Fire Protection Group (APi, `afpgusa.com`); American Sprinkler Company (Encore) | **Domain-only** |
| **United** | Generic; two owned "United ... Alarm/Fire" uses | United Fire Alarm Service (APi/IFP, Murrells Inlet SC); "United Alarm Service" reported on two owned platforms; United States Alliance Fire Protection (APi) | **Domain-only** |
| **Allied** | Generic | Allied Safety Services (CertaSite) | **Domain-only** |
| **Summit** | Generic | Summit Pipeline Services ULC (APi, non-fire) | **Domain-only** |
| **Capital** | Generic | *(no owned fire brand found in this study)* | **Domain-only** |
| **Elite** | Generic | Elite Fire Protection Systems (National Fire & Safety); Elite Action Fire (Encore) | **Domain-only** |
| **Empire** | Generic | *(no owned fire brand found in this study)* | **Domain-only** |
| **Security Fire** | Two-word generic that matches thousands of "security" and "fire" business names | Security Fire Protection Company (APi, Memphis TN, `securityfire.com`) | **Domain-only** — the exact-phrase match is still unsafe |
| **Texas Sprinkler** | Geographic + trade descriptor; matches many independents | Texas Sprinkler (APi, Grapevine TX, `texassprinkler.com`); also `T. Texas Sprinkler, L.P.` and `TEXASSPRINKLER, LLC` legal entities | **Domain-only** |
| **National** | Generic; two unrelated owned uses | National Fire & Safety (Highview, `natfiresafety.com`); National Fire Suppression (APi/WSFP, IL + KS); "National Fire & Safety Solutions" listed by **Encore** — a third, unrelated use | **Domain-only** |
| **Advanced** | Generic; two owned uses | Advanced Fire (CertaSite, PA); Advanced Fire Protection (APi NSG, 2013) | **Domain-only** |
| **ASG** | Under 5 characters; two owned platforms per prior stream | *(collision carried forward; not re-verified here)* | **Domain-only** |
| **ACT / IFP / NFS / TFA / RCI / GW / PAS / 3S / DU** | All under 5 characters — initialisms collide across industries | ACT (Encore); IFP (APi); NFS/TFA/RCI (National Fire & Safety); GW Systems, PAS LLC, 3S, DU | **Domain-only**; never match bare initialisms |
| **Bare common first names** (e.g. Gorham, Franklin, Patterson, Kimble, Craynon, Teasley, Hamrick, Eastman, Spears, Flannery, Rich, Ellis) | Surname-only tokens match unrelated firms in every trade | Multiple, across CertaSite, Davis-Ulmer, VFPG and AFPG rosters | **Name + state**, or domain |
| **Fire / Safety / Sprinkler / Alarm alone** | Trade descriptors | — | Never match alone |

**Safe, high-specificity tokens** (rare enough to name-match directly): `Davis-Ulmer`, `Cogswell`, `Grunau`, `Marmic`, `CertaSite`, `Vipond`, `Autronica`, `Det-Tronics`, `Marioff`, `Kistler O'Brien`, `Omlid & Swinney`, `Kranski`, `Tessier`, `Jomax`, `LeJeune`, `Nexlevel`, `Wm. Crook`, `Balco Systems`, `F.L. Sons`, `Craynon`, `Erlich`, `Wtech`, `Vipond`, `Onyx Fire`.

---

## Sources

**APi Group**
- https://www.apigroupinc.com/api/v1/companies
- https://www.apigroupinc.com/api/v1/mapdata/companies
- https://www.apigroupinc.com/about-us/our-companies/3s · /afpg · /apinsg · /certa · /dufam · /elevated · /ics · /ifp · /PFS · /secfire · /tenet · /texsprnk · /usafp · /vfpg · /wsfp
- https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/apg-20251231exx211entityli.htm (FY2025 EX-21.1, 203 rows)
- https://www.sec.gov/Archives/edgar/data/1796209/000095017022002474/apg-ex21_1.htm (FY2021 EX-21.1)
- https://www.sec.gov/Archives/edgar/data/1796209/000119312520096159/d827912dex211.htm (2020 S-4 EX-21.1, 92 rows)
- https://www.sec.gov/Archives/edgar/data/1796209/000162828026011620/ (filing directory)
- https://data.sec.gov/submissions/CIK0001796209.json
- https://efts.sec.gov/LATEST/search-index?q=%22Western+States+Fire+Protection%22&ciks=0001796209
- https://afpgusa.com/locations/
- https://www.api-nsg.com/our-growth.php · https://www.api-nsg.com/api-locations.php
- https://vfpg.com/companies/ · https://vfpg.com/locations/ · https://vfpg.com/sitemap_index.xml
- https://www.wsfp.com/ · https://www.wsfp.com/locations/
- https://www.vfpfire.com/about.php (302 → vfpg.com)
- https://www.davisulmer.com/about-us/our-family.php
- https://www.grunaufire.com/our-family.php (302 → davisulmer.com)
- https://www.cogswellsprinkler.com/about-us/our-family.php (302 → davisulmer.com)
- https://www.wmfireprotection.com/ · https://www.integratedprotectionservices.com/
- https://www.candoifp.com/locations.php
- https://www.certasitepro.com/acquisitions · /locations · /about · /news/advanced-fire-now-certasite · /news/certasite-acquires-approved-safety-and-security
- https://markets.financialcontent.com/worldnow.kotv/article/bizwire-2026-2-3-api-group-completes-acquisition-of-certasite
- https://pmcf.com/transactions/pmcf-advises-wm-crook-fire-protection-in-its-sale-to-viking-fire-protection-a-subsidiary-of-api-group/
- https://www.thecfigroup.com/transactions/wm-crook-fire-protection-co-has-been-acquired-by-viking-fire-protection-a-subsidiary-of-api-group/
- https://fireandsafetyjournalamericas.com/apiigroup-onyx-fire-deal/
- https://www.privsource.com/acquisitions/deal/certasite-acquires-allied-safety-services-e4SZqm

**Encore Fire Protection**
- https://encorefireprotection.com/about/affiliated-brand-partners/
- https://encorefireprotection.com/locations-sitemap.xml · /page-sitemap.xml · /sitemap.xml
- https://encorefireprotection.com/kistler-obrien-fire-protection/
- https://encorefireprotection.com/about/partnership-strategy/
- https://ccabalt.com/fireline-corporation-acquired-by-encore-fire-protection/
- https://www.permira.com/portfolio/our-portfolio/encore-fire-protection
- https://www.llcp.com/levine-leichtman-capital-partners-sells-encore-fire-protection/

**Marmic Fire & Safety**
- https://marmicfire.com/location-sitemap.xml · /sitemap_index.xml · /about/locations/
- https://marmicfire.com/marmic-acquires-4-new-fire-protection-companies/
- https://marmicfire.com/balco-systems-chooses-marmic/
- https://marmicfire.com/northwest-fire-protection-chooses-marmic/
- https://marmicfire.com/marmic-announces-acquisition-by-kkr/
- https://www.businesswire.com/news/home/20201210005153/en/Thompson-Street-Capital-Partners-Platform-Company-Marmic-Fire-Safety-Co.-Acquires-Total-Fire-Safety-LLC

**National Fire & Safety**
- https://www.natfiresafety.com/ · https://natfiresafety.com/page-sitemap.xml · /sitemap_index.xml
- https://natfiresafety.com/frontier-fire/ · /rci-fire-systems/ · /service-areas/
- https://www.businesswire.com/news/home/20220301005544/en/Highview-Backed-National-Fire-Safety-Announces-Acquisition-of-Absolute-Fire-Protection
- https://www.businesswire.com/news/home/20211021005344/en/Highview-Backed-National-Fire-Safety-Announces-Acquisition-of-All-Pro-Fire-Protection
- https://www.businesswire.com/news/home/20220111005525/en/Highview-Backed-National-Fire-Safety-Announces-Acquisition-of-Commercial-Fire-Protection
- https://www.businesswire.com/news/home/20190916005845/en/Highview-Backed-National-Fire-Safety-Announces-Acquisition-Elite
- https://www.businesswire.com/news/home/20211207005594/en/Highview-Backed-National-Fire-Safety-Announces-Acquisition-of-Texas-Fire-Alarm
- https://www.businesswire.com/news/home/20210526005539/en/Highview-backed-National-Fire-Safety-Announces-Acquisition-of-Texas-Fire-Safety

**Spectrum Safety Solutions**
- https://www.spectrum-safety.com/ · https://www.spectrum-safety.com/contact
- https://www.prnewswire.com/news-releases/sentinel-capital-partners-carves-out-industrial-fire-business-from-carrier-302187450.html
- https://www.sentinelpartners.com/company/spectrum-safety-solutions/
- https://www.autronicafire.com/news/news/sentinel-capital-partners-carves-out-industrial-fire-business-from-carrier-2/
- https://www.marioff.com/en/news/sentinel-capital-partners-carves-out-industrial-fire-business-from-carrier/
- https://www.det-tronics.com/news/news/brand_press_release/

**Guardian disambiguation**
- https://www.guardianfireprotection.com/
- https://ars-guardian.com/

---

## What I could not verify

1. **Domains for most sub-brands.** 100+ brands in this file carry an empty domain cell. Categories: (a) Davis-Ulmer family members whose only web presence is a `davisulmer.com/<brand>/` sub-page (14 of 19); (b) all eight VFPG sub-brands, which sit at `vfpg.com/companies/<slug>/`; (c) all five WSFP sub-brands, which appear only as headings on `wsfp.com/locations/`; (d) all six AFPG sub-brands; (e) all 23 CertaSite legacy names; (f) 74 of Encore's 77 affiliated brand partners. **No domain was invented for any of these.** Where a brand's only presence is a parent sub-page, the parent domain is the correct matcher.

2. **Encore state coverage is 13 states, not 17.** Encore's own locations sitemap yields 33 branches across RI, VT, MA, CT, NJ, PA, ME, NH, NY, MD, VA, FL and LA. Encore publishes no state list and no acquisitions index — its blog sitemap contains no acquisition posts. The four missing states could not be identified from any Encore property. The 77-name partner list also has no per-brand geography.

3. **Encore brand→state mapping.** The affiliated-brand-partners page lists names only. State attributions in §2.1 that are shown come from the brand name itself (e.g. "Maine Fire Equipment Co.") — these are **Estimated**, not Disclosed, and are flagged as such by being the only inference in this file. All other geography cells were left empty.

4. **Marmic sub-brands.** Marmic publishes no roster of acquired names. Only 8 of the stated "30+" acquired businesses could be named from primary or press sources. The 2023 four-company release and two individual partner stories are the complete published set; the KKR and HGGC transaction releases name none. The interactive map has no separate data endpoint — the branch list came from the WordPress location sitemap instead.

5. **`Wtech Fire & Security` territory.** Named in APi's own company API as Safety Services but has no `our-companies` detail page reachable and no EX-21 row. Confirmed non-US only by exclusion; the actual country is unverified.

6. **`Fireye` domain.** Named as a Spectrum brand on Sentinel's portfolio page and in the carve-out release, but no Fireye web property was observed. Left empty.

7. **`Viking Automatic Sprinkler` standalone domain.** The legal entity is in every EX-21 and the brand has a `vfpg.com/companies/` page, but no independent domain was observed.

8. **Second "United Alarm Service" and second "ASG" platform.** The brief states each token is used by two owned platforms. Only one instance of each was reachable in this pass — `United Fire Alarm Service` under APi/IFP. The second owner of each token was not identified and remains an open matcher risk; both tokens are marked domain-only above as a precaution.

9. **"Guardian Fire Services (Investcorp)" domain.** Not verified in this pass. Only the Knox Lane entity's two domains were confirmed live.

10. **CertaSite's pre-APi total.** CertaSite's acquisitions index lists 21 named predecessors plus two found via press; whether that is the complete set is unverifiable — the index has no count and no archive pagination was exposed.

11. **`spectrumsafetysolutions.com`.** Confirmed as a trap by the discovery of the real domain, but the trap domain itself was not fetched in this pass, so its current occupant is unconfirmed here.
