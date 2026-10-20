# AuditOpus — 20 October 2026

Full audit of FitWise (`https://fitwise.stream`) at `595379c` + uncommitted header/language-switcher work, plus an organic-growth keyword study. Status scale per `AGENTS.md`: **PASS / WARN / BLOCK**.

Prior audits were moved to [`Audits/archive/`](Audits/archive/). Every prior finding was re-checked; still-open ones are carried into §3 as **PERSISTENT**.

---

## 1. Verdict

| Area                       | Status                | Summary                                                                                                                                                                |
| -------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build / tests / validators | **PASS** (after fix)  | 341 tests, 149 pages, 94 sitemap URLs, 148 internal routes, 2,914 a11y-checked controls. `npm run verify` previously failed at `format:check` — fixed (§3, A-01).      |
| Live production            | **PASS**              | Live sitemap = 94 URLs = local build. Robots, 404, `www`→apex 301, `lang="es"`, hreflang en/es/x-default all correct.                                                  |
| Security headers / TLS     | **PASS / WARN**       | HSTS, CSP, XFO DENY, nosniff, Referrer-Policy, Permissions-Policy present. CSP still needs `'unsafe-inline'`.                                                          |
| OIDC / IAM                 | **PASS / WARN**       | Trust pinned to immutable `repo:nikatsam@22520540/Website_fitwise@1407694634:environment:production`. Actions not SHA-pinned; deploy role also holds bootstrap rights. |
| Privacy / compliance       | **WARN (PERSISTENT)** | GA4 (`G-J10W58E2ZL`) loads with no privacy notice or consent.                                                                                                          |
| Search submission          | **WARN (PERSISTENT)** | Search Console step exists but no `GSC_SERVICE_ACCOUNT_JSON` / `GSC_SITE_PROPERTY` configured, so it never runs.                                                       |
| Cost                       | **PASS**              | S3 + CloudFront `PriceClass_100`, no fixed-cost resources, 0 runtime compute. Bad routes/POST die at CloudFront/S3 (404).                                              |
| Dependencies               | **PASS**              | `npm audit --omit=dev`: 0 vulnerabilities. Minor updates available.                                                                                                    |

**No BLOCK items.** Production can continue shipping.

---

## 2. Evidence (run 20-10-2026)

```text
npm run verify            -> FAIL at format:check (.kilo/agent-manager.json)  [fixed, see A-01]
npx prettier --check .    -> PASS after fix
vitest                    -> 341/341 passed
astro build               -> 149 pages, sitemap.xml 94 URLs + robots.txt
validate:seo              -> 94 sitemap URLs, 94 canonical pages
validate:links            -> 148 HTML routes, 94 indexable URLs
validate:routes           -> 70 generated / 1 deferred / 11 draft PageIntents
validate:accessibility    -> 149 pages, 2,914 controls
validate:content          -> 6/6
infra:validate            -> private S3/OAC/TLS, OIDC role scoped (offline)
astro check               -> 0 errors, 0 warnings, 1 hint (tseslint.config deprecated)
npm audit (prod)          -> 0 vulnerabilities
Live: GET /                 200, s-maxage=300, CSP/HSTS/XFO/nosniff present
Live: /sitemap.xml          94 <loc>; /robots.txt allows all + sitemap
Live: /wp-login.php, /no-such-page-xyz/, POST /  -> 404
Live: www.fitwise.stream    301 -> https://fitwise.stream/
GitHub Actions             last 5 runs success (deploy 39065978579, 17-10-2026)
```

---

## 3. Findings

### Fixed in this audit

| ID   | Finding                                                                                                                                                       | Fix                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| A-01 | `npm run verify` failed locally: Prettier scanned git-ignored `.kilo/agent-manager.json` (editor tool state). The full gate chain stopped before tests/build. | Added `.kilo/` to `.prettierignore`. Format check passes.                                      |
| A-02 | Five audit artifacts cluttered the root.                                                                                                                      | Moved to `Audits/archive/`; updated the two task files that referenced `SEO_RELEASE_AUDIT.md`. |

### Open — new

| ID   | Sev  | Finding                                                                                                                                                                                                                                                   | Recommendation                                                                                                                                     |
| ---- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| N-01 | WARN | Workflows use tag-pinned actions (`actions/checkout@v4`, `aws-actions/configure-aws-credentials@v4`, `google-github-actions/auth@v2`, `actions/github-script@v7`, `upload-artifact@v4`). `AGENTS.md §13` asks for SHA pins on security-sensitive actions. | Pin at least `configure-aws-credentials` and `google-github-actions/auth` to commit SHAs. Add Dependabot for `github-actions`.                     |
| N-02 | WARN | The Search Console step is designed for a long-lived service-account JSON key in a GitHub secret.                                                                                                                                                         | When configuring GSC, use Workload Identity Federation (keyless OIDC) instead of a JSON key.                                                       |
| N-03 | WARN | The single `FitwiseGithubDeployRole` holds both bootstrap (S3 bucket create/policy/PAB) and routine deploy rights. `AGENTS.md §5` asks for separate roles.                                                                                                | Split into a bootstrap role (manual dispatch only) and a deploy role (sync + invalidate). Low urgency: trust is already environment-pinned.        |
| N-04 | WARN | No CloudFront standard logs → S3, and no budget alarm in IaC. Traffic analytics depend only on GA4 (client-side, blocked by many users and blind to bots/scanners).                                                                                       | Enable standard logs to a private bucket with 14–30-day lifecycle; add an AWS Budget (free tier for the first two). Add the batch dashboard later. |
| N-05 | INFO | The blog pilot hotlinks a Pexels image (`images.pexels.com` allowed in CSP).                                                                                                                                                                              | Self-host the image in `public/` so it is cached and you can drop the third-party CSP origin.                                                      |
| N-06 | INFO | `www.fitwise.stream` → apex is a 301 (correct), but HSTS has no `includeSubDomains`.                                                                                                                                                                      | Optional. Add it only once you're sure every subdomain is HTTPS-only.                                                                              |
| N-07 | INFO | Six files have uncommitted changes (Header, LanguageSwitcher, theme, es shell, keyboard QA, runbook). All gates pass with them applied.                                                                                                                   | Commit them as their own change once you've reviewed them. They're separate from this audit.                                                       |
| N-08 | INFO | Minor updates available: astro 7.4.1, eslint 10.13, vitest 5.0.5, typescript-eslint 8.72, prettier 3.9.10. TypeScript 7 is a major update.                                                                                                                | Take the minor updates in one PR with a full `verify`. Hold TS 7 until `@astrojs/check` supports it.                                               |

### Open — PERSISTENT (carried from archived audits, re-validated today)

| ID   | Origin                   | Sev              | Re-validation 20-10-2026                                                                                                                                                                                   | Still open                                                                                                                                                       |
| ---- | ------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-01 | Luna 08-10               | WARN             | GA4 tag is still loaded in `src/layouts/BaseLayout.astro:100-103`. No privacy/cookie page or consent mechanism exists in `src/pages`. UK/EU visitors are in scope (UK bed-size page, `en`/`es` audiences). | **Yes.** Owner decision: (a) add a privacy notice plus consent before GA loads, or (b) replace GA4 with CloudFront-log analytics (N-04), which needs no cookies. |
| P-02 | Luna 08-10 / SEO release | WARN             | `gh secret list` shows no `GSC_SERVICE_ACCOUNT_JSON`. `GSC_SITE_PROPERTY` is not set, so the sitemap PUT is skipped every deploy. IndexNow is active.                                                      | **Yes.** Configure the GSC property and WIF auth (N-02). Without it there's no Google query data to measure the §4 ideas against.                                |
| P-03 | Luna 08-10               | INFO             | `tseslint.config` deprecation hint still appears in `eslint.config.js:6`.                                                                                                                                  | **Yes.** Migrate to `defineConfig` from `eslint/config`.                                                                                                         |
| P-04 | Luna 08-10               | INFO (by design) | Route, turn, storage-packing, garden-safety and appliance models are still deliberately approximate and rely on user-entered data, and the pages disclose this.                                            | Accepted limitation. No action needed.                                                                                                                           |
| P-05 | UX 10/11-10              | INFO             | All 14+ UX items were "READY FOR RETEST". The automated a11y validator covers UX-003 (passes), and route validation covers breadcrumbs (UX-014). No human/mobile retest has been recorded since 11-10.     | **Partially.** Run `npm run qa:keyboard` against prod and record a manual mobile retest, then close the tracker.                                                 |
| P-06 | SERP 11-10               | INFO             | Search demand is still unmeasured: no GSC data (P-02).                                                                                                                                                     | **Yes.** Same fix as P-02.                                                                                                                                       |

**Verified closed** (not carried forward): floating-point leakage in visible text (validator enforced), dual-27 desk mismatch, missing breadcrumbs, `/about/` correction channel (GitHub issue form), sitemap/robots availability, `www` canonicalisation, noindex/canonical consistency (94 = 94).

---

## 4. Organic growth: five new fit-check ideas

### 4.1 Method and confidence

- **Sources used:** Google Autocomplete (`suggestqueries.google.com`, en, sampled 20-10-2026), live web SERP sampling of the lead long-tail query for each cluster, and existing site coverage (94 URLs). Ahrefs Keyword Generator/KD and the Semrush free tools render client-side and returned no data to this agent. Google Keyword Planner and GSC need owner credentials.
- **Volume figures are therefore modelled estimates**, not tool readouts. Each cluster total combines head-term breadth with the number of _programmatic_ autocomplete variants (for example `…for 12x12 room`, `…for 9 foot ceiling`) and is benchmarked against known volumes for comparable home-sizing queries. Treat them as order-of-magnitude bands. **Confirm them in Ahrefs, Semrush or Keyword Planner before building** (5 minutes per cluster).
- **Competition signal:** what actually ranks. Parasite/spam pages ranking (auto-generated subdomains, `pythonanywhere`, hijacked `wiki.` hosts) and thin Q&A pages mean Google lacks a good answer. That's the best low-competition evidence available without paid KD.
- **Exclusions:** clusters FitWise already serves (rug, bed sizes, desk/monitor, dining, TV stand, pool, garage, route, garden) and the crowded _TV size for viewing distance_ cluster (Rtings/brands dominate, high KD).

### 4.2 Evidence per idea

**1. Christmas tree size for ceiling height** (`/seasonal/christmas-tree-size/` + pages for 8, 9, 10, 12 ft ceilings)

- Autocomplete: `what size christmas tree for 9 / 8 / 12 / 18 foot ceiling`, `…should i get`, `…tree skirt`. That's a clean ceiling-height family, ideal for generated pages.
- SERP: retailer guides (Wayfair, Ballard, Balsam Hill, King of Christmas) that **disagree** (9 ft ceiling → 7.5 ft vs 8–9 ft), plus parasite pages (`vsbdev.my.ucalgary.ca`, `collabs.shop`). None of them computes stand + tree + topper clearance. FitWise's measurement-first model fits this gap exactly.
- Timing: demand peaks in Nov–Dec. **Ship by about 5 Nov 2026** to be indexed for this season. Pages keep earning every year with no maintenance.

**2. Sectional / sofa size for room** (`/living-room/sectional-size-for-room/` + `12x12`, `13x13`, `14x14`, `15x15`, `16x16`, `10x12`)

- Autocomplete: `what size sectional for 12x12 / 13x13 / 14x14 / 15x15 / 16x16 room`, `…for 9x12 rug`, `sofa size for small living room`, `couch size for living room`.
- SERP: Homestyler articles, furniture-retailer blogs, a 1stdibs answers page, and **itemfits.com** (`/fit/room/room-sectional-size`), a programmatic fit competitor and the one real rival. The sources openly contradict each other on upper limits. FitWise can answer with walkway clearance and an L/U footprint diagram, and link from the existing Rug Fit check.
- It also fills a real gap: the site has **no living-room vertical** today.

**3. Ceiling fan size for room** (`/living-room/ceiling-fan-size/` + room sizes and ceiling height → downrod)

- Autocomplete: `what size ceiling fan for bedroom / 12x12 / 10x10 / 10x12 room`, `…do i need`, `…living room`, `…12x12 bedroom`.
- SERP for `…12x12 room`: **8 of 9 results are spam pages on `wiki.dronebotworkshop.com`**, plus one Indian manufacturer blog. That's the weakest-quality SERP in this study. Retailers rank for the head term but not the long tail.
- The fit angle: blade span vs room _and_ blade-to-floor height (downrod length from ceiling height). It's measurable, factual and easy to diagram.

**4. Kitchen island size and clearance** (`/kitchen/island-size/` + `for 2 / 3 / 4 stools`, and a clearance-with-seating calculator)

- Autocomplete: `kitchen island size for 4 / 3 / 2 stools`, `…with seating`, `…with sink and dishwasher`, `…sizes uk`, `…size cm`, `kitchen island clearance requirements / with seating / dimensions`, `pendant light height over island`.
- SERP: Homestyler, Family Handyman and cabinet-retailer guides. The `…4 stools` query also surfaces spam on `pythonanywhere.com` and `lsm.works`. There's no dominant calculator that combines stools × width + overhang + walkway clearance in cm/in.
- Highest volume in this study, but also the strongest editorial competitors, so competition is medium. Ship it after ideas 1–3 have proven the template.

**5. Will a mattress / furniture fit in my car** (`/vehicle/mattress-in-car/` + `queen in SUV`, `queen in minivan`, `in cargo van`, `twin in car`)

- Autocomplete: `will a mattress fit in a cargo van / uhaul van / minivan / my car`, `will a queen mattress fit in an suv`, `will a twin mattress fit…`.
- SERP: a Puffy blog post, **itemfits.com** (several programmatic pages), vandimensions.com and autoroamer.com. These are all thin pages, and the sources disagree on midsize SUVs. The site already has `/vehicle/` and the bed-size datasets, so reuse is high and build cost low. The key inputs are seats-down cargo length, width between wheel wells, and hatch opening.

**Alternates, not ranked:** art size above bed/couch (`what size art above queen / king bed`; SERP is full of `ocus.com`/`scratcher.io` parasite pages, so very low competition, but lower intent) and chandelier size calculator (moderate volume, simple formula competitors).

### 4.3 Ranking table

Volumes are **estimated US monthly cluster totals** (head + programmatic long tail), see §4.1. Opportunity = volume score × (6 − competition score) × fit/reuse multiplier.

| Rank | Idea                                      | Est. US searches / mo (cluster)         | Seasonality                        | Competition (SERP quality)                                 | Uniqueness / gap                                   | Reuse of existing FitWise code/data           | Opportunity           |
| ---: | ----------------------------------------- | --------------------------------------- | ---------------------------------- | ---------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------- | --------------------- |
|    1 | Ceiling fan size for room + downrod       | **20k–40k**                             | Spring/summer peak                 | **Very low** on long tail (spam wiki dominates)            | High: no room + ceiling-height fit tool ranks      | Medium (room dims; new fan dataset)           | ★★★★★                 |
|    2 | Christmas tree size for ceiling height    | **15k–40k Nov–Dec** (≈4k–8k annual avg) | Strong Q4                          | **Low**: retailer guides disagree, parasites rank          | Very high: no stand + topper clearance calculator  | High (height check = existing envelope logic) | ★★★★★ (time-critical) |
|    3 | Sectional / sofa size for room            | **8k–15k**                              | Flat                               | **Low–Med**: retailer blogs + itemfits                     | High: new living-room vertical; diagram + walkway  | High (rug-fit, clearance engine)              | ★★★★☆                 |
|    4 | Kitchen island size & clearance           | **20k–35k**                             | Spring peak                        | **Medium**: Family Handyman, Homestyler, cabinet retailers | Medium–High: combined stool + clearance calculator | Medium (dining clearance logic)               | ★★★★☆                 |
|    5 | Mattress / furniture fit in car, SUV, van | **4k–10k**                              | Peaks with moving season (May–Aug) | **Low**: itemfits + thin blogs                             | Medium: itemfits overlaps                          | Very high (vehicle + bed datasets)            | ★★★☆☆                 |

### 4.4 Build guidance (applies to all five)

- Static, pre-rendered Astro pages only. No new runtime or AWS cost. Each cluster is one hub calculator plus 4–6 generated long-tail pages from `PageIntent`, following the existing family pattern. Watch for thin/doorway risk: generate a variant only when it gives a different, computed answer.
- Every page needs: a unique title and meta, a self-canonical, BreadcrumbList, a `HowTo` or `FAQPage` JSON-LD only when the content is genuinely visible on the page, an `en`/`es` hreflang pair, and links from the related existing hub (Rug Fit → Sectional, Bedroom → Ceiling fan / Mattress-in-car, Dining → Kitchen island, Vehicle → Mattress).
- Set up measurement before launch: fix P-02 (GSC) so impressions and position can be tracked per cluster. Treat as success if a cluster reaches ≥1k impressions/month within 90 days. If it doesn't, stop generating more variants for that cluster.
- Suggested order: **Christmas tree (now, seasonal deadline) → Ceiling fan → Sectional → Kitchen island → Mattress-in-car.**

---

## 5. Next actions (priority)

1. Commit this audit, the archive move and the `.prettierignore` fix (separately from the uncommitted header work, N-07).
2. Make the owner decision on P-01 (consent/privacy, or swap GA4 for log analytics).
3. Configure Search Console with WIF (P-02, N-02).
4. Build idea #1 (Christmas tree) by about 5 Nov 2026, then #3 (ceiling fan) and #2 (sectional).
5. SHA-pin the AWS/Google auth actions, add CloudFront logs and a budget alarm (N-01, N-04).

## COST NOTES

Fixed recurring resources: none. Idle-cost target: £0/$0 (met). Usage-based: S3 requests/storage, CloudFront transfer. Primary cost driver: CloudFront egress (9.5 MB build, cached). Bot-amplification risk: low (static only; junk paths 404 at the edge). Log-retention cost: none today. N-04 would add pennies/month with a 14–30-day lifecycle. Kill switches: N/A (no compute). The five proposed ideas add static pages only and no fixed cost.
