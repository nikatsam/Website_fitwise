import type { Locale } from './locale';
import { interpolate, matchTemplate, translate, uiCatalog } from './text';

/** Translates fit-services studio copy (exact strings, then result templates, then shared UI). */
export function fitServicesCopy(text: string, locale: Locale): string {
  const catalog = uiCatalog(locale);
  if (!catalog) return text;
  const exact = catalog.fitServices[text];
  if (exact) return exact;
  for (const [source, target] of Object.entries(catalog.fitServicesResultTemplates)) {
    const values = matchTemplate(source, text);
    if (values) {
      if (values.structureType)
        values.structureType = fitServicesCopy(values.structureType, locale);
      return interpolate(target, values);
    }
  }
  return translate(locale, text);
}

export function fitServicesTemplate(
  text: string,
  locale: Locale,
  values: Record<string, string | number>,
): string {
  const catalog = uiCatalog(locale);
  if (!catalog) return text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
  const step = text.match(/^Step (\d+) of (\d+): (.+)$/);
  if (step) {
    const template = catalog.fitServicesTemplates['Step {n} of {total}: {title}'] ?? text;
    return interpolate(template, {
      n: step[1]!,
      total: step[2]!,
      title: fitServicesCopy(step[3]!, locale),
    });
  }
  const translatedTemplate = catalog.fitServicesTemplates[text] ?? text;
  return translatedTemplate.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return key === 'title' && typeof value === 'string'
      ? fitServicesCopy(value, locale)
      : String(value ?? '');
  });
}
