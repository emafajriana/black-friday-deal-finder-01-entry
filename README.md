# DealDrop — Black Friday Deal Finder

[![Rank](https://make.fun/badge/black-friday-deal-finder-01/emafajriana/black-friday-deal-finder-01-entry/rank.svg)](https://make.fun/c/black-friday-deal-finder-01/leaderboard)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/emafajriana/black-friday-deal-finder-01-entry/reward.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/c/black-friday-deal-finder-01)

A static Black Friday deal finder for the [make.fun bounty](https://make.fun/c/black-friday-deal-finder-01): **51 real deals**, found and price-checked by hand on Black Friday itself, 27 November 2026.

Every deal carries its product, store, store link, sale price, usual price, discount, check time and the source it was read in — plus an honest verdict on whether it is really a deal (`New low`, `Strong deal`, `Routine sale`, or `Check the was price`, with the evidence in plain words on the deal page).

## The site

- `app/` — plain static files, no build step, no network: `index.html` + `main.js` (hash routing), `data.js` (the 51 deals), `views.js` (list and deal pages), `filters.js` (search, filter, sort, verdicts), `style.css`.
- Search and filters by category, store and discount, sorted by biggest % off, most dollars saved, price or A–Z. Filters live in the hash, so a filtered view has its own address. A phone layout is included.
- `screenshots/` — four real renders of the site running: the list, one deal page, a filtered view (Walmart, sorted by dollars saved), and the phone layout.
- `main.ts` (Node 22, standard library only) copies `app/` + `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build /output
```

## Sources

Prices were read on 27 November 2026 from the stores' own pages and from deals roundups that name the store: Tom's Guide, TechRadar, Best Buy's Black Friday release, Yahoo Shopping, DealNews (Walmart Top 100), SvrDeals (Walmart verified list), DansDeals, SooMuch (price-checked on the store's own site), and the Medium Black Friday roundup. Every deal's source is named on its page, and the full source list is in `STATE.md` in the build directory. Prices can change — check the store page before you buy.
