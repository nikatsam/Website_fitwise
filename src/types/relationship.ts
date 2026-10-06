export type RelationshipType =
  | 'fits_on'
  | 'fits_in'
  | 'pairs_with'
  | 'compares_to'
  | 'requires_clearance'
  | 'alternative_to'
  | 'related_to';

/** Relationships may drive related-link generation; they must not auto-create pages. */
export interface Relationship {
  id: string;
  type: RelationshipType;
  fromId: string;
  toId: string;
  confidence?: 'high' | 'medium' | 'low';
  notes?: string;
}
