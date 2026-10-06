# Data Research Prompt

Use this only when populating production-bound Fitwise data.

Goal: research and add physical measurements/clearance rules with provenance. Do not generate marketing prose.

For each value:

- distinguish exact, nominal, typical, recommended and derived;
- prefer manufacturer/standard/authoritative technical sources when applicable;
- record source URL/title/publisher/access date/geography/standard;
- record conflicts rather than silently averaging sources;
- do not infer overall product dimensions from screen diagonal alone;
- do not treat bed sizes as globally universal;
- label generic recommendations as recommendations, not physical requirements;
- convert to canonical millimetres only after preserving source meaning;
- use code for derivations and conversions where possible.

Before marking data ready:

- run dataset validation;
- inspect at least one generated page using the data;
- ensure every critical value has provenance or derivation ID;
- keep uncertain values draft/noindex rather than inventing certainty.
