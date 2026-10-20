# Future Releases — Fit-Tool Roadmap

Last updated: 20 October 2026. Owner decision needed before each build.

This is the backlog of fit calculators researched but **not yet built**: the three remaining ideas from [AuditOpus20-10-2026](AuditOpus20-10-2026.md) §4 plus 21 new candidates. **The ranking below uses measured open data only.** It replaces the earlier modelled volume bands, which were estimates and have been withdrawn.

## Already delivered

| Release                | Tool                | Live routes                                                             |
| ---------------------- | ------------------- | ----------------------------------------------------------------------- |
| `eb29581` (20-10-2026) | Ceiling fan size    | `/ceiling-fan-size/` + 10x10, 10x12, 12x12, 15x15 room pages (+ `/es/`) |
| `eb29581` (20-10-2026) | Christmas tree size | `/christmas-tree-size/` + 8, 9, 10, 12 ft ceiling pages (+ `/es/`)      |

The ceiling-fan tool is the **benchmark (1.00)** for every score below. When its Search Console impressions arrive, multiply any tool's demand index by the fan's real impressions to get that tool's expected impressions (see §5).

---

## 1. Data sources (all open, no logins)

| Source                                              | What it measures                                                                                                                       | Real or estimate                                                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Google Trends** (US, past 5 years, weekly)        | Relative Google search interest for each tool's head phrase, compared against the anchor phrase `what size ceiling fan` in every batch | **Real Google data**, relative. Top 5% of weeks trimmed to remove one-off spikes (a Trends artifact in Apr 2026 hit many terms) |
| **Google Autocomplete** (a–z expansion)             | Count of distinct real long-tail searches Google suggests for the seed phrase                                                          | **Real**, a count of known queries (breadth, not volume)                                                                        |
| **Bing Autocomplete** (a–z expansion)               | Same on Bing, which also powers DuckDuckGo                                                                                             | **Real**                                                                                                                        |
| **YouTube Autocomplete** (a–z expansion)            | How-to/video demand                                                                                                                    | **Real**                                                                                                                        |
| **Live SERP sample** (one long-tail query per tool) | Who ranks: spam/scraped pages = gap; brands/calculators = hard                                                                         | **Real observation**, categorised by hand                                                                                       |

- Raw data: [`data/research/keyword-demand-2026-10-20.json`](data/research/keyword-demand-2026-10-20.json). It holds every Trends value, the monthly profile and the full list of autocomplete queries per tool.
- Reproduce: `node scripts/research/keyword-demand.mjs data/research/keyword-demand-YYYY-MM-DD.json` (about 10 minutes, no credentials).
- **Not available without an account:** absolute monthly search counts (Keyword Planner, Ahrefs, Semrush). §5 shows how our own Search Console data turns the relative index into absolute numbers.

### Score formula

`Score = (0.6 × Demand + 0.4 × Breadth) × (6 − Competition) / 5 × Fit`, normalised so the live ceiling fan = 1.00.

- **Demand** = Trends interest relative to `what size ceiling fan` (1.00 = same search interest).
- **Breadth** = unique Google + Bing long-tail queries ÷ the ceiling fan's 207.
- **Competition** = 1 (very low, spam ranks) … 5 (high, brands own it), from the SERP sample.
- **Fit** = 1.2 reuses a FitWise engine/dataset · 1.0 neutral · 0.8 zero-click risk or not a dimensional fit. This is the one judgement input, kept visible so you can override it.

---

## 2. Ranked backlog (measured)

★ = carried over from the audit.

| Rank | Tool (proposed route)                                                 |   Demand vs fan | Long-tail queries (G+B) | YouTube | Competition |   Fit |  **Score** | Peak months | Seasonality |
| ---: | --------------------------------------------------------------------- | --------------: | ----------------------: | ------: | ----------: | ----: | ---------: | ----------- | ----------: |
|    — | _Ceiling fan size (LIVE benchmark)_                                   |          _1.00_ |                   _207_ |     _4_ |         _1_ | _1.2_ | _**1.00**_ | _Jul/Jun_   |       _1.4_ |
|    1 | **Bar stool height** (`/dining/bar-stool-height/`)                    |        **2.24** |                     123 |       4 |           1 |   1.0 |   **1.32** | Apr/May     |         1.5 |
|    2 | **Curtain rod & length** (`/windows/curtain-size/`)                   |        **2.71** |                     140 |       6 |           3 |   1.0 |   **0.95** | May/Apr     |         1.1 |
|    3 | ★ **Mattress / furniture in car** (`/vehicle/mattress-in-car/`)       |          1.24 † |                     205 |       0 |           2 |   1.2 |   **0.91** | Apr/May     |         2.1 |
|    4 | **Standing / sitting desk height** (`/workspace/desk-height/`)        |            1.70 |                     145 |      12 |           3 |   1.0 |   **0.65** | Apr/May     |         2.4 |
|    5 | **Mirror size above vanity** (`/bathroom/vanity-mirror-size/`)        |            0.77 |                     141 |       5 |           1 |   1.0 |   **0.61** | Mar/May     |         1.2 |
|    6 | **Art size above bed / sofa** (`/bedroom/art-above-bed-size/`)        |            0.67 |                      94 |       0 |           1 |   1.2 |   **0.59** | Aug/Jul     |         1.2 |
|    7 | **TV mount height** (`/tv/tv-mount-height/`)                          |            0.44 |                     183 |      20 |           2 |   1.2 |   **0.49** | Nov/Dec     |         1.3 |
|    8 | ★ **Kitchen island size & clearance** (`/kitchen/island-size/`)       |            0.69 |                     191 |      13 |           3 |   1.0 |   **0.39** | Apr/May     |         1.6 |
|    9 | **Chandelier size & height** (`/dining/chandelier-size/`)             |            0.83 |                     100 |       1 |           3 |   1.0 |   **0.35** | Apr/May     |         2.5 |
|    — | _Christmas tree size (LIVE)_                                          | _0.30 (annual)_ |                   _115_ |     _3_ |         _2_ | _1.2_ | _**0.32**_ | _Nov/Dec_   |   _**5.8**_ |
|   10 | **Picture hanging height** (`/walls/picture-hanging-height/`)         |            0.27 |                 **304** |  **43** |           3 |   0.8 |   **0.30** | Jan/Mar     |         1.2 |
|   11 | **Pendant light height/spacing** (`/kitchen/pendant-spacing/`)        |            0.19 |                     133 |       3 |           2 |   1.2 |   **0.30** | May/Apr     |         1.7 |
|   12 | **Coffee table size** (`/living-room/coffee-table-size/`)             |            0.31 |                      94 |       0 |           2 |   1.2 |   **0.29** | Mar/Feb     |         1.4 |
|   13 | ★ **Sectional / sofa size for room** (`/living-room/sectional-size/`) |            0.35 |                      79 |       1 |           2 |   1.2 |   **0.29** | Mar/Feb     |         1.4 |
|   14 | **Walk-in closet size** (`/storage/walk-in-closet-size/`)             |            0.33 |                     197 |      13 |           3 |   1.0 |   **0.29** | Jan/Mar     |         1.3 |
|   15 | **AC size for room** (`/rooms/air-conditioner-size/`)                 |            1.13 |                     191 |       3 |           4 |   0.8 |   **0.28** | Jun/Jul     |         2.4 |
|   16 | **Nightstand height** (`/bedroom/nightstand-height/`)                 |            0.40 |                      55 |       1 |           2 |   1.2 |   **0.28** | May/Jun     |         1.4 |
|   17 | **Dartboard setup & room fit** (`/game-room/dartboard-setup/`)        |            0.59 |                     135 |       5 |           3 |   0.8 |   **0.25** | Dec/Jan     |         1.7 |
|   18 | **Ping pong table room size** (`/game-room/ping-pong-table-fit/`)     |          0.32 ‡ |                      53 |       1 |           2 |   1.2 |   **0.23** | Dec/Nov     |         1.4 |
|   19 | **Toilet clearance / vanity** (`/bathroom/toilet-clearance/`)         |            0.69 |                     100 |       2 |           4 |   1.0 |   **0.20** | Mar/May     |         1.2 |
|   20 | **Treadmill ceiling height** (`/home-gym/treadmill-ceiling-height/`)  |          0.25 ‡ |                       9 |       0 |           2 |   1.2 |   **0.14** | Apr/May     |         2.4 |
|   21 | **Event tent size for guests** (`/garden/tent-size-for-guests/`)      |            0.01 |                     101 |       2 |           3 |   1.0 |   **0.10** | May/Apr     |         3.7 |
|   22 | **Bunk / loft bed ceiling height**                                    |            0.00 |                      42 |      12 |           2 |   1.2 |   **0.06** | —           |           — |
|   23 | **Piano room size**                                                   |            0.01 |                      22 |       4 |           2 |   1.0 |   **0.03** | —           |           — |
|   24 | **Moving truck size**                                                 |          0.05 § |                      82 |       1 |           5 |   0.8 |   **0.02** | Jun/Apr     |         2.0 |

**Data caveats**

- † Mixed intent: "mattress in car" Trends interest includes car camping. Long-tail breadth (205 queries such as `will a queen mattress fit in an suv`) is the cleaner signal. Treat its demand as ≈0.8 (the median-based value) until Search Console confirms.
- ‡ Broad proxy phrase: the exact phrase is below the Trends threshold, so `ping pong table dimensions` / `treadmill height` were used. Real fit-intent demand is lower.
- § Understated: people search brand phrasing (`what size uhaul`), and U-Haul and Penske own the results anyway.
- **Seasonality** = peak month ÷ average month. The Christmas tree's 0.32 annual score hides a **5.8× December peak (≈1.7× the fan at peak)**. Seasonal tools should be judged in season.
- **Picture hanging height** has the most long-tail queries (304) and YouTube demand (43) in the set, but a low head-phrase Trends value and zero-click snippets (57 in). It suits a strong variant-page set rather than a single head-term page.

### What the measured data changed vs the earlier estimates

- **Promoted:** bar stool height (#3 → #1), curtain size (#6 → #2), mattress in car (#16 → #3), desk height (#8 → #4), mirror (#10 → #5).
- **Demoted:** TV mount height (#1 → #7), sectional (#4 → #13), coffee table (#5 → #12). Their demand is about a third of the fan's.
- **Confirmed weak:** bunk bed, piano, moving truck, tent (Trends ≈ 0).

---

## 3. Proposed release waves (re-ordered by measured score)

| Wave  | Theme                    | Tools (rank)                                                                          | Sum of scores | Timing (from Trends peaks)                                      |
| ----- | ------------------------ | ------------------------------------------------------------------------------------- | ------------: | --------------------------------------------------------------- |
| **A** | Kitchen & dining seating | Bar stool height (1), Kitchen island (8), Chandelier (9), Pendant (11)                |          2.36 | **Ship by Feb 2027**, before the Apr/May peak                   |
| **B** | Windows, walls & bath    | Curtain size (2), Mirror over vanity (5), Art above bed/sofa (6), Picture height (10) |          2.45 | Ship by Mar 2027, before the Apr/May peak                       |
| **C** | Moving & vehicle         | Mattress in car (3), extending `/vehicle/`                                            |          0.91 | Ship by Mar 2027, before the Apr/May moving season              |
| **D** | Workspace                | Desk height (4), extending `/workspace/`                                              |          0.65 | Jan 2027 (New Year setups), peak Apr/May                        |
| **E** | Living room              | TV mount height (7), Coffee table (12), Sectional (13)                                |          1.07 | TV mount by **mid-Nov 2026** (Nov/Dec peak); others by Feb 2027 |
| **F** | Opportunistic            | Walk-in closet, AC size, nightstand, dartboard, ping pong, toilet clearance           |             — | After A–E results                                               |
| —     | Parked                   | Treadmill, tent, bunk bed, piano, moving truck                                        |             — | Re-run the research script in 6 months                          |

The only time-critical item right now is **TV mount height** (Nov/Dec peak, already have `/tv/`). Everything else peaks in spring, so there's time to build properly.

### Build checklist (from the fan/tree release)

- [ ] Pure geometry module + unit tests, with cited defaults as editable inputs, never as rules.
- [ ] A source record with URL + Spanish note; the limitations list states what the tool doesn't model.
- [ ] One canonical tool page + 4–6 variant pages, **picked from the real autocomplete list in the research JSON**. Each variant states its own computed answer (no doorway pages).
- [ ] English + Spanish copy, nav link, related links from the parent hub.
- [ ] `npm run verify` + headless Chrome QA (English and Spanish, 390 px); deploy with `confirm_deploy=true`.
- [ ] Request indexing for the canonical URL first, then variants; resubmit the sitemap.
- [ ] **Kill rule:** if a cluster has < 1k impressions/month after 90 days, stop adding variants to it.

---

## 4. Evidence notes (top 6)

- **Bar stool height:** Trends 2.24× the fan. 123 real long-tail queries (`…for 36 counter`, `…42 counter`, `…90cm counter`). The SERP sample is almost entirely scraped clone pages, the weakest competition measured. The rule of a 10–12 in seat-to-counter gap is consistent across sources.
- **Curtain size:** the highest Trends demand (2.71×) and 140 long-tail queries (`…for 72 inch window`, `…sliding glass door`, `…8/9 foot ceilings`). Product listings, not answers, dominate the SERP.
- **Mattress in car:** 205 long-tail queries (the second-most after picture hanging). The SERP is itemfits plus thin blogs. It reuses the vehicle tool and bed datasets.
- **Desk height:** Trends 1.70× with 145 queries (`standing desk height for 5'7`, `…6'2`). Omni and desky.ca compete, so competition is medium.
- **Mirror over vanity:** Trends 0.77× and 141 queries. The SERP is scraped pages plus one retailer blog.
- **Art above bed/sofa:** Trends 0.67× and 94 queries. Parasite pages (`ocus.com`, `scratcher.io`) rank. It reuses bed-size data.

SERP samples (20-10-2026): [dartcounter](https://dartcounter.net/darts-manual/dartboard-height-distance), [Omni standing desk](https://www.omnicalculator.com/everyday-life/standing-desk-height), [Omni tent](https://omnicalculator.com/everyday-life/tent-size), [Maxim chandelier](https://www.maximlighting.com/chandelier-size-calculator), [HomeGuide closets](https://homeguide.com/articles/walk-in-closet-dimensions), [aircondlounge](https://aircondlounge.com/air-conditioner-size-12x12-room/), [Chairish nightstand](https://www.chairish.com/blog/how-tall-should-a-nightstand-be/), [Public Storage](https://publicstorage.com/size-guide/10x10-storage-unit), [treadmillreviewguru](https://www.treadmillreviewguru.com/proper-ceiling-heights-for-treadmills/), [homebilliards](https://homebilliards.ca/resources/ping-pong-table-room-size-guide), [itemfits bunk bed](https://itemfits.com/fit/room/room-bunk-bed-size), [Edward Martin mirror](https://www.edwardmartin.com/blogs/information/how-big-a-mirror-should-be-over-a-vanity), [unfnshed coffee table](https://unfnshed.com/blogs/news/coffee-table-size-guide).

---

## 5. Turning the index into real traffic numbers

Open sources give **relative** demand only; Google doesn't publish absolute counts without an account. Our own site closes that gap:

1. In 4–8 weeks, read Search Console impressions for `/ceiling-fan-size/` (all its variants) = **F** per month.
2. **Expected impressions for any tool ≈ Demand × F**, adjusted by the breadth ratio for long-tail-heavy clusters.
3. Re-run `scripts/research/keyword-demand.mjs` every 6 months and after each release, and update this table.

## 6. Known issues to fix alongside the next wave

- The mobile step navigator squeezes its status text into a narrow column on all calculators, including Rug. This was there before the fan/tree release.
- Search Console API sitemap submission isn't configured (audit P-02/N-02). Manual URL inspection is the stopgap.

## COST NOTES

Every proposed tool is static pre-rendered HTML + client-side JS on the existing S3/CloudFront stack. Fixed recurring resources: none. Idle cost: £0/$0. The research script runs locally and calls only public endpoints, so it has no AWS cost.
