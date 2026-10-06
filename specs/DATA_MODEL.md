# Data Model Specification

## 1. Principle

The data model is the core of Fitwise.stream. Pages are projections of entities, measurements, standards, recommendations and relationships.

Do not encode important dimensions only in prose.

## 2. Canonical measurement representation

Use millimetres internally.

```ts
type Millimetres = number;
```

For measured values:

```ts
type Measurement = {
  valueMm: number;
  kind: 'exact' | 'nominal' | 'typical' | 'recommended' | 'derived';
  sourceId?: string;
  derivationId?: string;
  note?: string;
};
```

Rules:

- `exact`, `nominal`, `typical`, `recommended` externally sourced values require `sourceId` unless defined by a documented internal standard/rule with provenance.
- `derived` requires `derivationId`.
- Values must be > 0 unless a schema explicitly allows zero clearance.

## 3. Source record

```ts
type SourceRecord = {
  id: string;
  url?: string;
  title: string;
  publisher: string;
  accessedOn: string; // YYYY-MM-DD
  geography?: string;
  standard?: string;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
};
```

Production publication rules:

- `low` confidence may not be the sole source of a critical physical dimension.
- Conflicting values require a note explaining which value was selected and why.

## 4. Entity base

```ts
type EntityBase = {
  id: string;
  slug: string;
  name: string;
  category: string;
  aliases?: string[];
  geography?: string[];
  status: 'draft' | 'published' | 'deprecated';
};
```

## 5. Initial entity types

### Monitor/display reference

```ts
type DisplayEntity = EntityBase & {
  category: 'display';
  diagonalInches?: number;
  aspectRatio?: { width: number; height: number };
  screenWidthMm?: Measurement;
  screenHeightMm?: Measurement;
  activeWidthMm?: Measurement; // active panel only; bezel/casing excluded
  overallWidthMm?: Measurement;
  overallHeightMm?: Measurement;
  standDepthMm?: Measurement;
  standWidthMm?: Measurement;
};
```

Generic size pages may use mathematically derived **screen** width/height from diagonal + aspect ratio. Never label this as overall device width. A manufacturer-reported `activeWidthMm` is panel-only and must not be used as `overallWidthMm` or as a complete device footprint.

### Desk reference

```ts
type DeskEntity = EntityBase & {
  category: 'desk';
  widthMm: Measurement;
  depthMm?: Measurement;
  heightMm?: Measurement;
};
```

Can represent standard/reference widths (e.g. 1200, 1400, 1600 mm) rather than products.

### Bed reference

```ts
type BedEntity = EntityBase & {
  category: 'bed';
  mattressWidthMm: Measurement;
  mattressLengthMm: Measurement;
  defaultFrameAllowanceMm?: {
    left: Measurement;
    right: Measurement;
    head: Measurement;
    foot: Measurement;
  };
  market: 'US' | 'UK' | 'EU' | 'AU' | 'other';
};
```

Bed sizes must never be assumed universal across markets. Routes/content must state the applicable geography.

### Room reference

Rooms are usually user-entered, but static common-size scenarios may be represented as:

```ts
type RoomScenario = EntityBase & {
  category: 'room';
  widthMm: Measurement;
  lengthMm: Measurement;
  ceilingHeightMm?: Measurement;
};
```

## 6. Clearance rules

```ts
type ClearanceRule = {
  id: string;
  context: string;
  targetCategory: string;
  dimension: 'left' | 'right' | 'front' | 'back' | 'top' | 'between';
  minimumMm?: Measurement;
  recommendedMm?: Measurement;
  sourceIds: string[];
  notes?: string;
};
```

A distinction between **minimum physical clearance** and **recommended comfortable clearance** is important because it powers `tight` vs `fits` semantics.

## 7. Relationship model

```ts
type Relationship = {
  id: string;
  type:
    | 'fits_on'
    | 'fits_in'
    | 'pairs_with'
    | 'compares_to'
    | 'requires_clearance'
    | 'alternative_to'
    | 'related_to';
  fromId: string;
  toId: string;
  confidence?: 'high' | 'medium' | 'low';
  notes?: string;
};
```

Relationships may drive related links but should not automatically create indexable pages.

## 8. Page-intent record

Maintain publication intent separately from entity data.

```ts
type PageIntent = {
  id: string;
  route: string;
  family:
    | 'entity'
    | 'object_to_space'
    | 'space_to_object'
    | 'comparison'
    | 'clearance'
    | 'configuration'
    | 'hub';
  cluster:
    'workspace' | 'bedroom' | 'dining' | 'living' | 'appliances' | 'storage' | 'gym' | 'other';
  primaryQuery: string;
  entityIds: string[];
  status: 'draft' | 'published' | 'deferred';
  justification: string;
};
```

This prevents dataset growth from automatically exploding the URL count.

### 8.1. Route disposition manifest

`PageIntent.status` is preserved from the source content map and is not, by itself, sufficient to publish a route. Every intent also has a separate `RouteDispositionRecord` in `src/data/route-dispositions.json`:

```ts
type RouteDispositionRecord =
  | {
      pageIntentId: string;
      route: string;
      intentStatus: 'published';
      disposition: 'generated';
      renderer: 'family' | 'static';
    }
  | {
      pageIntentId: string;
      route: string;
      intentStatus: 'published';
      disposition: 'deferred';
      reason: string;
    }
  | { pageIntentId: string; route: string; intentStatus: 'draft'; disposition: 'draft' }
  | {
      pageIntentId: string;
      route: string;
      intentStatus: 'deferred';
      disposition: 'deferred';
      reason: string;
    };
```

The build validator requires exactly one matching disposition per PageIntent. A published intent is either generated by a data-backed family renderer or an audited static route, or explicitly deferred with a reason. Draft/deferred routes must not exist in the public build. A generated route is not necessarily indexable: that remains a separate decision in its SEO publication envelope.

## 9. Validation invariants

Build must fail when:

- duplicate IDs or slugs exist;
- a published page references a missing entity;
- a source ID is missing;
- required dimensions are <= 0;
- a derived measurement has no derivation rule;
- a published bed entity lacks geography/market;
- canonical route duplicates another page;
- relationship endpoint IDs are invalid.

Warnings, not build failures, may be used for:

- low confidence on non-critical supporting values;
- unusual rounding;
- missing optional metadata.

## 10. Derivations

Derivation functions must be code, tested and named.

Examples:

- 16:9 screen width/height from diagonal;
- unit conversion;
- rotated rectangle projected width for angled monitor layouts;
- total configuration width from items + gaps + margins.

Each derivation should have a stable ID so UI/content can explain assumptions.

## 11. SEO/publication envelope (v0.2.0)

Extend the existing `PageIntent` model using the exact fields and semantics in `TECHNICAL_SEO_PLAYBOOK.md` §2: indexable, title, description, h1, canonicalPath, publishedOn, significantlyModifiedOn, breadcrumbIds, relatedPageIds, market/language, sourceIds and optional imagePath/intentEvidence. The SEO publication envelope is separate from physical object data but joins by PageIntent ID. Published indexable records MUST provide valid metadata/ancestors; unverified drafts MUST NOT generate live URLs. T004/T005/T014 are responsible for implementation and validation of these fields. An editorial material-change log, not build timestamp, controls sitemap lastmod.
