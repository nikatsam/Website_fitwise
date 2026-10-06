# Architecture Specification

## 1. Architectural goal

Fitwise.stream must behave like a product while retaining the operational simplicity of a static site.

### Local architecture

```text
Structured data (local)
        ↓
Build-time validation
        ↓
Astro static generation
        ↓
HTML + CSS + route-scoped JS + SVG
        ↓
Local filesystem / local static preview
```

### Production architecture

```text
Visitor
  ↓ HTTPS
CloudFront
  ↓ signed origin access (OAC)
Private S3 bucket
  ↓
Static HTML/CSS/JS/SVG/assets
```

No server is required to render a page.

## 2. Suggested repository structure

```text
fitwise/
├─ astro.config.*
├─ package.json
├─ tsconfig.json
├─ public/
│  ├─ robots.txt (or generated equivalent)
│  └─ icons/
├─ src/
│  ├─ components/
│  │  ├─ layout/
│  │  ├─ fit/
│  │  ├─ diagrams/
│  │  ├─ content/
│  │  └─ seo/
│  ├─ data/
│  │  ├─ entities/
│  │  ├─ relationships/
│  │  └─ sources/
│  ├─ lib/
│  │  ├─ units/
│  │  ├─ fit/
│  │  ├─ geometry/
│  │  ├─ validation/
│  │  └─ seo/
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ workspace/
│  │  └─ bedroom/
│  ├─ styles/
│  └─ types/
├─ scripts/
│  ├─ validate-data.*
│  ├─ validate-links.*
│  └─ validate-seo.*
├─ tests/
│  ├─ unit/
│  ├─ fixtures/
│  └─ smoke/
└─ infra/                 # created only in AWS phase
   └─ ...
```

This is a suggested shape, not a requirement to create empty abstractions. Prefer fewer files until separation is justified.

## 3. Rendering strategy

### Static HTML

Every indexable page must produce meaningful HTML at build time, including:

- H1;
- immediate answer or reference result;
- dimensions/assumptions in text;
- related links;
- explanatory content;
- canonical metadata.

JavaScript must not be required for search engines or basic users to obtain the principal answer.

### Progressive enhancement

Browser JavaScript may enable:

- changing dimensions;
- unit switching;
- changing monitor angles/stand assumptions;
- toggling furniture configuration;
- live SVG updates;
- interactive fit-state recalculation.

## 4. Core modules

### `units`

Responsibilities:

- mm ↔ cm;
- mm ↔ metres;
- mm ↔ decimal inches;
- mm ↔ feet/inches display;
- input parsing;
- deterministic formatting.

### `fit`

Responsibilities:

- generic fit-state evaluation;
- hard physical footprint;
- recommended clearance envelope;
- dimension-specific diagnostics;
- human-readable reason codes.

The engine should return structured results, not preformatted prose.

Example conceptual output:

```ts
{
  state: 'tight',
  hardFit: true,
  recommendedFit: false,
  marginsMm: { left: 38, right: 38, front: 410, back: 0 },
  failedRecommendations: ['side_clearance'],
  assumptions: ['monitor_stands_included']
}
```

### `geometry/workspace`

Compute monitor/display footprint based on:

- physical width/height;
- count;
- gap;
- yaw angle when supported;
- stand or arm footprint assumptions;
- optional laptop/speakers in later tasks.

Avoid pretending diagonal size alone gives exact product dimensions. Generic monitor dimensions derived from aspect ratio should be labelled as screen-only/nominal unless bezel/stand dimensions are separately sourced.

### `geometry/bedroom`

Compute:

- bed footprint;
- frame allowance;
- side clearances;
- foot clearance;
- optional nightstand/dresser/wardrobe zones;
- room-fit state.

### `diagrams`

Use SVG or semantic HTML/CSS for scale-aware diagrams. Requirements:

- scale is relative within each diagram;
- dimension labels remain legible;
- diagram has accessible text equivalent;
- result does not depend on color alone;
- small-screen fallback remains useful.

## 5. Data loading strategy

Initial data should be imported at build time. Avoid runtime fetch calls for small canonical datasets.

If dataset size eventually becomes large, the architecture may emit per-page static JSON chunks. This is not needed for v1.

## 6. Caching assumptions

All generated assets should be cacheable at the CDN.

Recommended production convention:

- content-hashed CSS/JS/assets: long immutable cache;
- HTML: shorter cache with revalidation/invalidation on deployment;
- sitemap/robots: short cache.

Exact CloudFront policies belong in the AWS deployment phase.

## 7. Error handling

- Invalid production data should fail the build, not degrade silently.
- User-entered impossible values should produce inline validation, not exceptions.
- Calculation modules should be deterministic and side-effect-free where practical.

## 8. Browser support

Target evergreen browsers. Core textual answers must remain available without JavaScript. No legacy-browser polyfill burden unless analytics prove a need.
