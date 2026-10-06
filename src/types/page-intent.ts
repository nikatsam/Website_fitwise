export type PageFamily =
  | 'entity'
  | 'object_to_space'
  | 'space_to_object'
  | 'comparison'
  | 'clearance'
  | 'configuration'
  | 'hub';

export type ContentCluster =
  'workspace' | 'bedroom' | 'dining' | 'living' | 'appliances' | 'storage' | 'gym' | 'other';

export type PageStatus = 'draft' | 'published' | 'deferred';

/**
 * Publication intent, kept separate from entity data, so dataset growth never
 * automatically explodes the published URL count (ADR-007).
 */
export interface PageIntent {
  id: string;
  route: string;
  family: PageFamily;
  cluster: ContentCluster;
  primaryQuery: string;
  entityIds: string[];
  status: PageStatus;
  justification: string;
}
