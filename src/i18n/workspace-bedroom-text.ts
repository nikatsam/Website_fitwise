import type { Locale } from './locale';
import { interpolate, matchTemplate, uiCatalog } from './text';

/** Translates workspace/bedroom calculator copy, including `{placeholder}` entries. */
export function translateWorkspaceBedroomText(locale: Locale, source: string): string {
  const catalog = uiCatalog(locale);
  if (!catalog) return source;
  const exact = catalog.workspaceBedroom[source];
  if (exact) return exact;
  for (const [template, translated] of Object.entries(catalog.workspaceBedroom)) {
    if (!template.includes('{')) continue;
    const values = matchTemplate(template, source);
    if (values) return interpolate(translated, values);
  }
  return source;
}
