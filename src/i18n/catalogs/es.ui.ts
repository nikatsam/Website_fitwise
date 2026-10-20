import type { UiCatalog } from '../catalog-types';
import { calculatorCopyTemplates, esCalculatorCopy } from '../es-calculator-copy';
import {
  esDiningUniversalRugCopy,
  esDiningUniversalRugTemplates,
} from '../es-dining-universal-rug-copy';
import { fitStateBadgeEs } from '../es-family-copy';
import { esFanTreeCopy, esFanTreeTemplates } from '../es-fan-tree-copy';
import {
  esFitServicesCopy,
  esFitServicesTemplates,
  fitServicesResultTemplates,
} from '../es-fit-services-copy';
import { esInlineCopy, esInlineTemplates } from '../es-inline-copy';
import { ES_NAV_LINKS, ES_SHELL_STATIC } from '../es-shell-static';
import { esWorkspaceBedroomCopy } from '../es-workspace-bedroom-copy';

/** Spanish UI catalog, assembled from the hand-written Spanish source modules. */
const catalog: UiCatalog = {
  exact: {
    ...ES_SHELL_STATIC,
    ...ES_NAV_LINKS,
    ...esCalculatorCopy,
    ...esDiningUniversalRugCopy,
    ...esFanTreeCopy,
    ...esInlineCopy,
  },
  templates: {
    ...calculatorCopyTemplates,
    ...esDiningUniversalRugTemplates,
    ...esFanTreeTemplates,
    ...esInlineTemplates,
  },
  fitServices: esFitServicesCopy,
  fitServicesTemplates: esFitServicesTemplates,
  fitServicesResultTemplates,
  workspaceBedroom: esWorkspaceBedroomCopy,
  badges: fitStateBadgeEs,
};

export default catalog;
