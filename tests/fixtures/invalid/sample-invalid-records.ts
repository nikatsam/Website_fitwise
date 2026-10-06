/**
 * Invalid record examples, one per build-time invariant listed in
 * specs/DATA_MODEL.md §9. These are deliberately typed as `Record<string, unknown>`
 * rather than the real entity/record interfaces, because each one violates a
 * rule the T005 build-time validator (not the TypeScript compiler) must catch.
 * T005's validator tests should iterate this list and assert each one fails.
 */
export interface InvalidRecordCase {
  /** Matches the specs/DATA_MODEL.md §9 invariant this case violates. */
  violates: string;
  description: string;
  data: Record<string, unknown>;
}

export const invalidRecordCases: InvalidRecordCase[] = [
  {
    violates: 'duplicate IDs or slugs exist',
    description: 'Two desk entities share the same id.',
    data: {
      duplicates: [
        { id: 'ent-desk-1400', slug: '140cm-desk', category: 'desk' },
        { id: 'ent-desk-1400', slug: '140cm-desk-alt', category: 'desk' },
      ],
    },
  },
  {
    violates: 'a published page references a missing entity',
    description: 'PageIntent entityIds reference an id with no matching entity record.',
    data: {
      id: 'pi-broken-ref',
      status: 'published',
      entityIds: ['ent-does-not-exist'],
    },
  },
  {
    violates: 'a source ID is missing',
    description: "A 'typical' measurement omits sourceId and is not a documented internal rule.",
    data: {
      valueMm: 613,
      kind: 'typical',
    },
  },
  {
    violates: 'required dimensions are <= 0',
    description: 'Desk width is zero.',
    data: {
      id: 'ent-desk-zero',
      widthMm: { valueMm: 0, kind: 'nominal' },
    },
  },
  {
    violates: 'a derived measurement has no derivation rule',
    description: "Measurement kind is 'derived' but derivationId is missing.",
    data: {
      valueMm: 598,
      kind: 'derived',
    },
  },
  {
    violates: 'a published bed entity lacks geography/market',
    description: "Published bed entity omits the required 'market' field.",
    data: {
      id: 'ent-bed-no-market',
      category: 'bed',
      status: 'published',
      mattressWidthMm: { valueMm: 1500, kind: 'exact', sourceId: 'src-sleep-foundation-uk-beds' },
      mattressLengthMm: { valueMm: 2000, kind: 'exact', sourceId: 'src-sleep-foundation-uk-beds' },
    },
  },
  {
    violates: 'canonical route duplicates another page',
    description: 'Two PageIntent records share the same route.',
    data: {
      duplicates: [
        { id: 'pi-a', route: '/workspace/desk-size-for-dual-monitors/' },
        { id: 'pi-b', route: '/workspace/desk-size-for-dual-monitors/' },
      ],
    },
  },
  {
    violates: 'relationship endpoint IDs are invalid',
    description: 'Relationship fromId does not match any known entity id.',
    data: {
      id: 'rel-broken',
      type: 'fits_on',
      fromId: 'ent-does-not-exist',
      toId: 'ent-desk-1400',
    },
  },
];
