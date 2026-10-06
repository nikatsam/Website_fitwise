# Post-Launch Search Expansion Prompt

This prompt is for a future agent after Search Console data exists.

Input required:

- current Search Console page/query export;
- current `PageIntent` dataset;
- current cluster performance summary.

Goal: decide what to improve or publish next without creating thin permutations.

Process:

1. Group queries by intent, not exact wording.
2. Identify existing pages with high impressions and average positions roughly 5–20; prioritize improving these before creating new URLs.
3. Identify unexpected recurring query patterns that have independent decision value.
4. Check whether a hub page can satisfy the pattern before proposing a dedicated route.
5. Check for cannibalization with existing pages.
6. Score candidate work on demand evidence, current rankability, structured-data reuse, internal-link value and uniqueness.
7. Add a new `PageIntent` only when the route has a clear independent answer/visual/decision matrix.
8. Record Search Console evidence in `PageIntent.justification`.

Never create pages solely by expanding every numeric combination.
