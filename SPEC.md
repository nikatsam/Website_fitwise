# Fitwise.stream — Master Product Specification

## 1. Product definition

Fitwise.stream is a visual reference and decision product for **physical size, space, clearance and fit**.

Core proposition:

> Know what fits before you buy, arrange or move it.

The product should answer two directions of the same problem:

1. **Object → Space:** What size space does this object/configuration require?
2. **Space → Object:** What objects/configurations fit in this available space?

Initial launch clusters:

- Workspace: monitor(s) ↔ desk.
- Bedroom: bed/furniture ↔ room.

Later expansion clusters:

- complete workspace layouts;
- dining tables ↔ dining rooms;
- sofas/coffee tables/TVs ↔ living rooms;
- furniture/appliances ↔ doorways and delivery routes;
- appliances ↔ cabinets/closets/openings;
- storage ↔ shelves/cabinets;
- home gym equipment ↔ room/ceiling clearances;
- TV ↔ wall/stand/viewing distance;
- selected vehicle ↔ garage fit only after data/maintenance validation.

## 2. Product principles

### P1 — Fit, not just dimensions

A 27-inch monitor width is a fact. Fitwise's value is explaining whether one or more monitors, stands, speakers and margins fit a desk.

### P2 — Visual before verbose

Where a geometry question can be represented as a scale-aware diagram, diagram + result + numbers should precede long prose.

### P3 — Structured data is the core asset

Content pages should be generated from canonical entity and relationship data. Prose must not become the only store of measurements.

### P4 — Static delivery

Normal page requests must resolve to static HTML/CSS/JS/assets. Calculation logic runs client-side.

### P5 — Publish selectively

A mathematically possible page is not automatically a valid SEO page. Dedicated pages require clear independent intent/value.

## 3. Primary users

### U1 — Purchase planner

Wants to know if an object will fit before buying it.

Examples:

- Can two 27-inch monitors fit on a 140 cm desk?
- Will a king bed work in my 10×12 room?

### U2 — Layout planner

Already owns items and wants to arrange a room/workspace.

### U3 — Moving/delivery planner

Later-phase user who needs to know whether furniture/appliances pass through openings/routes.

## 4. Core user stories

- As a visitor, I can select/enter a desk width and monitor configuration and immediately see whether it fits.
- As a visitor, I can see the assumptions used to calculate fit.
- As a visitor, I can switch between metric and imperial units without changing the underlying result.
- As a visitor, I can see a scale-aware diagram of object(s) inside the available space.
- As a visitor, I can navigate to related comparisons and fit scenarios.
- As a search visitor, I land directly on a useful static page for my question without first using a generic calculator.

## 5. Initial page families

### 5.1 Entity/reference

Examples:

- `/workspace/monitor-size-chart/`
- `/workspace/27-inch-monitor-dimensions/`
- `/bedroom/king-bed-dimensions/`

Use selectively; these support decision pages rather than defining the site.

### 5.2 Object → space

Examples:

- `/workspace/desk-size-for-dual-monitors/`
- `/workspace/desk-size-for-two-27-inch-monitors/`
- `/bedroom/minimum-room-size-for-king-bed/`

### 5.3 Space → object

Examples:

- `/workspace/what-fits-on-a-140cm-desk/`
- `/bedroom/what-bed-fits-a-10x12-room/`

### 5.4 Comparison

Examples:

- `/workspace/120cm-vs-140cm-desk/`
- `/workspace/27-vs-32-inch-monitor-size/`
- `/bedroom/king-vs-queen-room-space/`

### 5.5 Clearance

Examples:

- `/workspace/desk-depth-for-monitor/`
- `/workspace/desk-chair-clearance/`
- `/bedroom/clearance-around-bed/`
- `/bedroom/bed-to-wardrobe-clearance/`

### 5.6 Configuration

Examples:

- `/workspace/dual-monitors-and-laptop-desk-size/`
- `/bedroom/king-bed-two-nightstands-room-size/`

### 5.7 Hub/matrix

Examples:

- `/workspace/desk-size-guide/`
- `/bedroom/what-size-bed-fits-my-room/`

Hub pages intentionally absorb many low-value permutations until real demand justifies dedicated pages.

## 6. MVP functionality

### Required

- Static route generation from structured data.
- Unit system toggle: metric and imperial.
- Fit result engine with at least `fits`, `tight`, `does_not_fit` states.
- Explicit assumption display.
- Scale-aware SVG/HTML diagrams for desk/monitor and bed/room.
- Related-content links generated from relationships.
- Metadata/canonical/Open Graph support.
- Breadcrumbs.
- JSON-LD where appropriate.
- Sitemap and robots.
- Build-time data validation.
- Responsive accessible UI.

### Not required for MVP

- Accounts.
- Saved layouts.
- User-submitted data.
- Server database.
- Runtime AI.
- Comments.
- Community features.
- Product affiliate feeds.
- Search backend.

## 7. Initial content target

Launch target: 40–50 pages total.

Preferred balance:

- 18–22 workspace/monitor/desk pages.
- 18–22 bedroom/bed/room pages.
- 3–6 methodology/hub/about pages.

Do not increase launch count by splitting minor query variants into separate URLs.

See `data/INITIAL_CONTENT_MAP.csv`.

## 8. Data quality requirement

Every externally sourced measurement must include:

- source URL or source identifier;
- source title/publisher;
- access/verification date;
- geography/standard context where relevant;
- confidence category;
- notes about whether the value is exact, nominal, typical or recommended.

Derived screen widths, conversions and clearances must identify formulas/assumptions.

## 9. Calculation semantics

### Fit categories

The first version uses three semantic states:

- `fits`: required footprint plus target recommended clearance <= available space.
- `tight`: hard physical footprint fits but recommended clearance is not fully met.
- `does_not_fit`: physical footprint exceeds available space.

Do not reduce all questions to width-only fit when depth, height, door swing, chair pull-out or other dimensions materially matter.

### Canonical units

Use millimetres internally for linear measurements.

- Store canonical exact/nominal values as integer or safe decimal millimetres.
- Convert for display at the edge.
- Round only for display, never during intermediate fit calculation.

## 10. Performance objectives

For production-like local builds:

- Static HTML first paint; JS enhances interactions.
- Avoid shipping framework hydration for static content.
- Keep core route JS small and route-scoped.
- Images/diagrams should be SVG or optimized raster where appropriate.
- No blocking third-party scripts for MVP.

## 11. SEO objectives

- Each page has a singular intent and non-duplicated title/H1.
- A visitor receives the direct answer before extensive explanatory copy.
- Internal links reflect real entity relationships.
- Canonical URLs are stable.
- Similar query variants consolidate into hubs unless independently useful.
- No indexable filtered/faceted URL explosion.

## 12. Analytics after deployment

Analytics is optional for local MVP but the production design must be compatible with privacy-minimal analytics.

Primary SEO operating loop after launch:

1. Observe Search Console impressions and queries.
2. Improve pages ranking positions ~5–20 before creating adjacent pages.
3. Create dedicated pages only for query patterns with demonstrated demand and independent value.
4. Allocate 60–70% of new content to clusters that earn impressions/links.

## 13. Deployment target

After local acceptance, deploy as:

`fitwise.stream → CloudFront → private S3 origin`

TLS certificate through ACM. DNS may stay at the existing registrar/DNS provider or move to Route 53; the architecture must not assume Route 53 is mandatory.

Serverless APIs may be added later only for features that truly require server execution.

## 12. SEO publication architecture (amendment v0.2.0)

Follow `specs/TECHNICAL_SEO_PLAYBOOK.md`, `specs/SEO_AUTOMATED_GATES.md`, `specs/SEO_CONTENT_GROWTH.md` and `specs/SEARCH_ENGINE_OPERATIONS.md`. The core PageIntent registry owns the publication state and trusted modification date; derive static routes, canonicals, breadcrumbs, internal links and sitemap from the same published dataset. Launch gates must check these invariants offline before AWS. Production-only submission/verification is a separate post-launch operation. No runtime AI or API needed for search visibility.
