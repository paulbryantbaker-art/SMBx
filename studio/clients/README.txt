THE PROSPECT BOARD — firms we would like to work FOR.

Nobody in this folder has hired us, so nothing in it is confidential. This is
hunt A in RESEARCH.md — read § A before filling anything in.

  candidates.csv THE FUNNEL. Everything sourced but not yet primary-source
                 verified — 161 rows as of 2026-08-18. NEVER pushed to the app.
                 A row is promoted into crm-bundle/02_organizations.csv when it
                 is verified against a primary source, and `register_match`
                 says which existing row it must merge into if any.

  crm-bundle/    THE LIVING BUY-SIDE REGISTER (moved here 2026-08-18).
                 139 organizations (81 + the 2026-08-18 reconcile: 58 VERIFIED
                 appended, 6 merged — see reconcile/2026-08-18/), 91 contacts,
                 and the outreach plan. This is
                 the record of truth for the FACTS about who we would serve.
                 Read crm-bundle/COLUMNS.md before editing anything in it —
                 it says which columns git owns and which the app owns, and
                 why changing a firm string is currently a destructive act.

                 Push it to the app — either way lands on the same
                 idempotent loader (/api/crm/import-bundle):
                   · in the app: Leads → "Load the register from CSVs",
                     pick crm-bundle/*.csv (2026-08-18; no terminal, no token)
                   · or from a terminal:
                       cd $REPO/studio/clients
                       SMBX_TOKEN=… npx tsx $REPO/scripts/studio/push-crm.mts

                 The importer carries the 2026-08-18 columns (account_type,
                 sponsor_parent → sponsor, verticals_active → trades, states,
                 platform_count, texas_exposure, trigger, verification) — the
                 first six ride in the account's notes, the two named land in
                 their own columns. Contacts are NOT reconciled yet: the 58
                 new organizations reach the app with no named person.

                 One-way door: facts flow git → app, never back. Stage, next
                 action, touches and activity are the app's and are never
                 overwritten by a push.

  register.csv   the leads.mts board. NOT YET CREATED, and note that it is a
                 DIFFERENT SCHEMA from crm-bundle/02_organizations.csv — the
                 16-column register house/leads.ts scores (firm, segment,
                 website, hq_city, hq_state, trades, dfw, grade, buyer_moment,
                 product_fit, key_person, key_person_title, sponsor, evidence,
                 source_url, notes). Do not point leads.mts at the bundle; the
                 columns do not line up and it will read blanks.
                   npx tsx $REPO/scripts/studio/leads.mts init
                   npx tsx $REPO/scripts/studio/leads.mts rank --top 25
                   npx tsx $REPO/scripts/studio/leads.mts coverage
  COLUMNS.md     what each register.csv column means (written by `leads.mts init`)

buyer_moment is the column that decides the ranking, and it is the only hard
part. `thesis_no_flow` — they have declared what they want to own and cannot
fill it — is the sale. `has_both` is an impressive firm that already has this
function in-house, and it is the hardest sale on the list, so the scorer ranks
it low on purpose. A board that looks wrong as a prestige list is the model
working.

clients/ and deals/ are not two names for the same thing. A firm crosses from
here to deals/<engagement>/ when there is an engagement, and that is the only
relationship between the two folders. Everything in deals/ is confidential;
nothing in here is.
