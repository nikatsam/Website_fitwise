import type {
  SourceRecord,
  DisplayEntity,
  DeskEntity,
  BedEntity,
  RoomScenario,
  ClearanceRule,
  Relationship,
  PageIntent,
  SeoPublication,
} from '../../../src/types';

/**
 * Minimal, internally-consistent sample dataset. Every object here must satisfy
 * its declared type — that is the compile-time half of T004's acceptance
 * criteria. Runtime cross-record invariants (unique ids, valid sourceIds,
 * positive dimensions, etc.) are enforced by the T005 build-time validator,
 * not by these types alone.
 */

export const sources: SourceRecord[] = [
  {
    id: 'src-vesa-2024',
    url: 'https://www.vesa.org/',
    title: 'VESA Mounting Interface Standard',
    publisher: 'VESA',
    accessedOn: '2026-10-01',
    geography: 'global',
    standard: 'VESA MIS',
    confidence: 'high',
  },
  {
    id: 'src-sleep-foundation-uk-beds',
    url: 'https://www.sleepfoundation.org/',
    title: 'UK Standard Bed Sizes',
    publisher: 'Sleep Foundation',
    accessedOn: '2026-10-01',
    geography: 'UK',
    confidence: 'medium',
  },
  {
    id: 'src-fitwise-internal-convention',
    title: 'Fitwise internal reference-size and clearance convention',
    publisher: 'Fitwise.stream',
    accessedOn: '2026-10-06',
    confidence: 'medium',
    notes:
      'Internally documented round-number reference sizes and comfort-clearance recommendations used when no single external standard applies; see specs/DATA_MODEL.md §2.',
  },
];

export const displayEntities: DisplayEntity[] = [
  {
    id: 'ent-display-27in-16x9',
    slug: '27-inch-16-9-monitor',
    name: '27" 16:9 monitor',
    category: 'display',
    status: 'published',
    diagonalInches: 27,
    aspectRatio: { width: 16, height: 9 },
    screenWidthMm: {
      valueMm: 598,
      kind: 'derived',
      derivationId: 'derive-screen-dims-from-diagonal-aspect',
    },
    screenHeightMm: {
      valueMm: 336,
      kind: 'derived',
      derivationId: 'derive-screen-dims-from-diagonal-aspect',
    },
    overallWidthMm: { valueMm: 613, kind: 'typical', sourceId: 'src-vesa-2024' },
    standDepthMm: { valueMm: 200, kind: 'typical', sourceId: 'src-vesa-2024' },
  },
];

export const deskEntities: DeskEntity[] = [
  {
    id: 'ent-desk-1400',
    slug: '140cm-desk',
    name: '140 cm reference desk',
    category: 'desk',
    status: 'published',
    widthMm: { valueMm: 1400, kind: 'nominal', sourceId: 'src-fitwise-internal-convention' },
    depthMm: { valueMm: 700, kind: 'nominal', sourceId: 'src-fitwise-internal-convention' },
  },
];

export const bedEntities: BedEntity[] = [
  {
    id: 'ent-bed-uk-king',
    slug: 'uk-king-bed',
    name: 'UK King bed',
    category: 'bed',
    status: 'published',
    market: 'UK',
    mattressWidthMm: { valueMm: 1500, kind: 'exact', sourceId: 'src-sleep-foundation-uk-beds' },
    mattressLengthMm: { valueMm: 2000, kind: 'exact', sourceId: 'src-sleep-foundation-uk-beds' },
    defaultFrameAllowanceMm: {
      left: { valueMm: 50, kind: 'typical', sourceId: 'src-fitwise-internal-convention' },
      right: { valueMm: 50, kind: 'typical', sourceId: 'src-fitwise-internal-convention' },
      head: { valueMm: 30, kind: 'typical', sourceId: 'src-fitwise-internal-convention' },
      foot: { valueMm: 30, kind: 'typical', sourceId: 'src-fitwise-internal-convention' },
    },
  },
];

export const roomScenarios: RoomScenario[] = [
  {
    id: 'ent-room-10x12ft',
    slug: '10x12-ft-room',
    name: '10 x 12 ft room',
    category: 'room',
    status: 'published',
    widthMm: { valueMm: 3048, kind: 'nominal', sourceId: 'src-fitwise-internal-convention' },
    lengthMm: { valueMm: 3658, kind: 'nominal', sourceId: 'src-fitwise-internal-convention' },
  },
];

export const clearanceRules: ClearanceRule[] = [
  {
    id: 'clr-desk-side-margin',
    context: 'workspace',
    targetCategory: 'desk',
    dimension: 'left',
    minimumMm: { valueMm: 0, kind: 'recommended', sourceId: 'src-fitwise-internal-convention' },
    recommendedMm: {
      valueMm: 38,
      kind: 'recommended',
      sourceId: 'src-fitwise-internal-convention',
    },
    sourceIds: ['src-vesa-2024'],
  },
];

export const relationships: Relationship[] = [
  {
    id: 'rel-display-fits-on-desk',
    type: 'fits_on',
    fromId: 'ent-display-27in-16x9',
    toId: 'ent-desk-1400',
    confidence: 'high',
  },
];

export const pageIntents: PageIntent[] = [
  {
    id: 'pi-workspace-hub',
    route: '/workspace/',
    family: 'hub',
    cluster: 'workspace',
    primaryQuery: 'workspace fit guides',
    entityIds: [],
    status: 'published',
    justification: 'Parent hub for workspace fit guides.',
  },
  {
    id: 'pi-desk-size-for-two-27in-monitors',
    route: '/workspace/desk-size-for-two-27-inch-monitors/',
    family: 'object_to_space',
    cluster: 'workspace',
    primaryQuery: 'desk size for two 27 inch monitors',
    entityIds: ['ent-display-27in-16x9', 'ent-desk-1400'],
    status: 'published',
    justification: 'High-intent purchase-planning query with independent search demand.',
  },
];

export const routeDispositions = [
  {
    pageIntentId: 'pi-workspace-hub',
    route: '/workspace/',
    intentStatus: 'published',
    disposition: 'generated',
    renderer: 'family',
  },
  {
    pageIntentId: 'pi-desk-size-for-two-27in-monitors',
    route: '/workspace/desk-size-for-two-27-inch-monitors/',
    intentStatus: 'published',
    disposition: 'generated',
    renderer: 'static',
  },
] as const;

export const seoPublications: SeoPublication[] = [
  {
    pageIntentId: 'pi-workspace-hub',
    indexable: true,
    title: 'Workspace Fit Guides — Fitwise',
    description: 'Browse data-backed workspace fit guides.',
    h1: 'Workspace fit guides',
    canonicalPath: '/workspace/',
    publishedOn: '2026-10-06',
    breadcrumbIds: [],
    relatedPageIds: [],
    market: 'global',
    language: 'en',
    sourceIds: [],
  },
  {
    pageIntentId: 'pi-desk-size-for-two-27in-monitors',
    indexable: true,
    title: 'What Desk Size Fits Two 27-Inch Monitors? — Fitwise',
    description:
      'See the minimum and recommended desk width for two 27-inch monitors side by side, with a scale diagram.',
    h1: 'Desk size for two 27-inch monitors',
    canonicalPath: '/workspace/desk-size-for-two-27-inch-monitors/',
    publishedOn: '2026-10-06',
    breadcrumbIds: ['pi-workspace-hub'],
    relatedPageIds: [],
    market: 'global',
    language: 'en',
    sourceIds: ['src-vesa-2024'],
  },
];
