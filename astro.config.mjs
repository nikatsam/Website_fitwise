// @ts-check
import { defineConfig } from 'astro/config';
import { datasetValidation } from './src/lib/validation/build-integration.ts';
import { seoStaticOutputs } from './src/lib/seo/build-integration.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://fitwise.stream',
  output: 'static',
  trailingSlash: 'always',
  integrations: [datasetValidation(), seoStaticOutputs()],
});
