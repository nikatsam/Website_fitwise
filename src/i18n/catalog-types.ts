/**
 * Locale catalog shapes. Spanish is assembled from the hand-written `es-*.ts`
 * modules; every other locale ships a generated JSON catalog with the exact
 * same structure (see `scripts/i18n/README.md`).
 *
 * - UiCatalog: strings the browser needs (calculators, shell, badges). Only the
 *   visitor's own locale is downloaded.
 * - ContentCatalog: page metadata and long-form copy used at build time only.
 */
import type { FitState } from '../lib/fit/engine';

export type StringMap = Readonly<Record<string, string>>;

export interface FitStateBadge {
  icon: string;
  label: string;
  meaning: string;
}

export interface UiCatalog {
  /** English source text → translation (shell, nav, calculators, inline UI). */
  exact: StringMap;
  /** English `{placeholder}` templates → translated templates. */
  templates: StringMap;
  fitServices: StringMap;
  fitServicesTemplates: StringMap;
  fitServicesResultTemplates: StringMap;
  workspaceBedroom: StringMap;
  badges: Readonly<Record<FitState, FitStateBadge>>;
}

export interface PublicationCopy {
  title: string;
  description: string;
  h1: string;
  breadcrumbLabel?: string;
  primaryQuery: string;
}

export interface FeatureCopy {
  intro: string;
  calculation: string;
  limitations: string[];
  relatedReasons?: Record<string, string>;
}

export interface PlanningCopy {
  intro: string;
  sectionTitle: string;
  factLabels: StringMap;
  assumptions: readonly string[];
}

export interface ClearanceRuleCopy {
  context?: string;
  notes?: string;
  minimumNote?: string;
  recommendedNote?: string;
}

export interface FamilyTextCopy {
  fixed: StringMap;
  templates: StringMap;
}

export interface ContentCatalog {
  publications: Readonly<Record<string, PublicationCopy>>;
  features: Readonly<Record<string, FeatureCopy>>;
  planning: Readonly<Record<string, PlanningCopy>>;
  sourceNotes: StringMap;
  entityNames: StringMap;
  markets: StringMap;
  orientations: Readonly<Record<'portrait' | 'landscape', string>>;
  clearanceRules: Readonly<Record<string, ClearanceRuleCopy>>;
  familyText: FamilyTextCopy;
}
