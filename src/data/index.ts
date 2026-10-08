import type { Dataset } from '../lib/validation/dataset';
import { clearanceRules } from './workspace/clearance-rules';
import { deskEntities, displayEntities, officeFurnitureEntities } from './workspace/entities';
import { pageIntents } from './workspace/page-intents';
import { sources } from './sources';
import { bedEntities, bedroomFurnitureEntities, roomScenarios } from './bedroom/entities';
import { bedroomClearanceRules } from './bedroom/clearance-rules';
import { bedroomPageIntents } from './bedroom/page-intents';
import { seoPublications } from './seo-publications';
import { routeDispositions } from './route-dispositions';
import { buildFamilySeoPublications } from './family-seo-publications';

/**
 * Aggregated production dataset. Workspace and bedroom seed records are
 * explicitly sourced and remain separate from page-family rendering policy.
 */
const dataWithoutSeo = {
  sources,
  entities: [
    ...displayEntities,
    ...deskEntities,
    ...officeFurnitureEntities,
    ...bedEntities,
    ...bedroomFurnitureEntities,
    ...roomScenarios,
  ],
  clearanceRules: [...clearanceRules, ...bedroomClearanceRules],
  relationships: [],
  pageIntents: [...pageIntents, ...bedroomPageIntents],
  routeDispositions,
};

export const dataset: Dataset = {
  ...dataWithoutSeo,
  seoPublications: [...seoPublications, ...buildFamilySeoPublications(dataWithoutSeo)],
};
