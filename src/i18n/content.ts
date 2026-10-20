import type { ContentCatalog } from './catalog-types';
import type { Locale } from './locale';

/** Build-time content catalogs (page metadata and long-form copy). Never imported by browser code. */
const modules = import.meta.glob<{ default: ContentCatalog }>('./catalogs/*.content.ts', {
  eager: true,
});
const catalogs = new Map<Locale, ContentCatalog>(
  Object.entries(modules).map(([path, module]) => [
    path.replace('./catalogs/', '').replace('.content.ts', '') as Locale,
    module.default,
  ]),
);

export function contentCatalog(locale: Locale): ContentCatalog {
  const catalog = catalogs.get(locale);
  if (!catalog) throw new Error(`Content catalog for locale '${locale}' is not available.`);
  return catalog;
}

export function hasContentCatalog(locale: Locale): boolean {
  return catalogs.has(locale);
}

/** Interpolates a `{{name}}` family-answer template from the locale's content catalog. */
export function translateFamilyText(
  locale: Locale,
  key: string,
  vars: Record<string, string | number> = {},
): string {
  const template = contentCatalog(locale).familyText.templates[key];
  if (template === undefined) throw new Error(`Missing ${locale} family template '${key}'.`);
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const value = vars[name];
    if (value === undefined) {
      throw new Error(`Missing ${locale} family-copy variable '${name}' for '${key}'.`);
    }
    return String(value);
  });
}
