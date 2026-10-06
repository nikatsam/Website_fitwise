export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface SourceRecord {
  id: string;
  url?: string;
  title: string;
  publisher: string;
  /** YYYY-MM-DD */
  accessedOn: string;
  geography?: string;
  standard?: string;
  confidence: ConfidenceLevel;
  notes?: string;
}
