THE PROSPECT BOARD — firms we would like to work FOR.

Nobody in this folder has hired us, so nothing in it is confidential. This is
hunt A in RESEARCH.md — read § A before filling anything in.

  register.csv   the board. Seeded and scored by:
                   npx tsx $REPO/scripts/studio/leads.mts init
                   npx tsx $REPO/scripts/studio/leads.mts rank --top 25
                   npx tsx $REPO/scripts/studio/leads.mts coverage
  COLUMNS.md     what each column means (written by `leads.mts init`)

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
