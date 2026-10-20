import type { UiCatalog } from './catalog-types';
import { localeFromLanguage, TRANSLATED_LOCALES, type Locale } from './locale';

/**
 * UI translation registry. Catalogs are code-split per locale: in the browser
 * only the page's own locale is downloaded (top-level await below); at build
 * time and in tests every locale is loaded.
 */
const loaders = import.meta.glob<{ default: UiCatalog }>('./catalogs/*.ui.ts');
const catalogs = new Map<Locale, UiCatalog>();

async function loadCatalog(locale: Locale): Promise<void> {
  const loader = loaders[`./catalogs/${locale}.ui.ts`];
  if (loader) catalogs.set(locale, (await loader()).default);
}

const pageLanguage =
  typeof document === 'undefined' ? '' : (document.documentElement.getAttribute('lang') ?? '');
if (pageLanguage) {
  const pageLocale = localeFromLanguage(pageLanguage);
  if (pageLocale !== 'en') await loadCatalog(pageLocale);
} else {
  await Promise.all(TRANSLATED_LOCALES.map(loadCatalog));
}

/** The loaded UI catalog for a locale (undefined for English or when not loaded). */
export function uiCatalog(locale: Locale): UiCatalog | undefined {
  return locale === 'en' ? undefined : catalogs.get(locale);
}

function requireCatalog(locale: Locale): UiCatalog {
  const catalog = catalogs.get(locale);
  if (!catalog) throw new Error(`UI catalog for locale '${locale}' is not loaded.`);
  return catalog;
}

const templateCache = new Map<string, { pattern: RegExp; names: string[] }>();

export function matchTemplate(
  template: string,
  actual: string,
): Record<string, string> | undefined {
  let compiled = templateCache.get(template);
  if (!compiled) {
    const names: string[] = [];
    const source = template
      .split(/(\{\w+\})/g)
      .map((part) => {
        const placeholder = part.match(/^\{(\w+)\}$/);
        if (placeholder) {
          names.push(placeholder[1]!);
          return '(.+?)';
        }
        return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('');
    compiled = { pattern: new RegExp(`^${source}$`, 's'), names };
    templateCache.set(template, compiled);
  }
  const match = actual.match(compiled.pattern);
  if (!match) return undefined;
  return Object.fromEntries(compiled.names.map((name, index) => [name, match[index + 1] ?? '']));
}

export function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => values[name] ?? `{${name}}`);
}

export function translate(locale: Locale, source: string): string {
  if (locale === 'en') return source;
  const catalog = catalogs.get(locale);
  if (!catalog) return source;
  const exact = catalog.exact[source];
  if (exact) return exact;
  for (const [sourceTemplate, translatedTemplate] of Object.entries(catalog.templates)) {
    const values = matchTemplate(sourceTemplate, source);
    if (values) return interpolate(translatedTemplate, values);
  }
  return source;
}

export function translateRequired(locale: Locale, source: string): string {
  if (locale === 'en') return source;
  const catalog = requireCatalog(locale);
  if (Object.prototype.hasOwnProperty.call(catalog.exact, source)) return catalog.exact[source]!;
  if (Object.keys(catalog.templates).some((template) => matchTemplate(template, source))) {
    return translate(locale, source);
  }
  throw new Error(`Missing ${locale} translation for visible copy: '${source}'.`);
}

export function translateTemplate(
  locale: Locale,
  sourceTemplate: string,
  values: Record<string, string | number>,
): string {
  const stringValues = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, String(value)]),
  );
  if (locale === 'en') return interpolate(sourceTemplate, stringValues);
  const catalog = requireCatalog(locale);
  const translated = catalog.templates[sourceTemplate] ?? catalog.exact[sourceTemplate];
  if (!translated) {
    throw new Error(`Missing ${locale} template translation: '${sourceTemplate}'.`);
  }
  return interpolate(translated, stringValues);
}
