import type { AstroIntegration } from 'astro';
import { dataset } from '../../data';
import { validateDataset, formatValidationResult } from './dataset';

/**
 * Fails the production build before any pages are generated if the dataset
 * violates a specs/DATA_MODEL.md §9 invariant (T005 acceptance criterion:
 * "Production build calls validator before generating pages").
 */
export function datasetValidation(): AstroIntegration {
  return {
    name: 'fitwise-dataset-validation',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const result = validateDataset(dataset);
        const report = formatValidationResult(result);

        if (!result.valid) {
          logger.error(report);
          throw new Error(
            `Dataset validation failed with ${result.errors.length} error(s). See log above.`,
          );
        }

        if (result.warnings.length > 0) {
          logger.warn(report);
        } else {
          logger.info(report);
        }
      },
    },
  };
}
