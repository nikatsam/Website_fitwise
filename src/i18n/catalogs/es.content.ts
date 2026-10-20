import type { ContentCatalog } from '../catalog-types';
import {
  ES_CLEARANCE_RULE_COPY,
  familyEntityNameEs,
  familyMarketEs,
  familyOrientationEs,
  familyText,
} from '../es-family-copy';
import { ES_FEATURE_COPY } from '../es-features';
import { ES_PLANNING_COPY } from '../es-planning';
import { ES_PUBLICATIONS } from '../es-publications';
import { ES_SOURCE_NOTES } from '../es-source-notes';

/** Spanish build-time content catalog. */
const catalog: ContentCatalog = {
  publications: ES_PUBLICATIONS,
  features: ES_FEATURE_COPY,
  planning: ES_PLANNING_COPY,
  sourceNotes: ES_SOURCE_NOTES,
  entityNames: familyEntityNameEs,
  markets: familyMarketEs,
  orientations: familyOrientationEs,
  clearanceRules: ES_CLEARANCE_RULE_COPY,
  familyText,
};

export default catalog;
