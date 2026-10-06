// Example shape only. Keep actual types centralized in the implementation.

export const source = {
  id: 'source-id',
  url: 'https://example.invalid/reference',
  title: 'Reference title',
  publisher: 'Publisher',
  accessedOn: 'YYYY-MM-DD',
  geography: 'US',
  confidence: 'high' as const,
};

export const measurement = {
  valueMm: 1400,
  kind: 'nominal' as const,
  sourceId: source.id,
};

export const pageIntent = {
  id: 'page-id',
  route: '/workspace/example/',
  family: 'object_to_space' as const,
  cluster: 'workspace' as const,
  primaryQuery: 'example fit question',
  entityIds: ['entity-a', 'entity-b'],
  status: 'draft' as const,
  justification: 'Explain the independent user value of this URL.',
};
