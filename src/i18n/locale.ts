import type { Dataset } from '../lib/validation/dataset';

/**
 * Site locales. English is the unprefixed default; every other locale lives
 * under `/<code>/` with an identical route tree. Chinese is Simplified
 * Mandarin (zh-Hans); Portuguese is Brazilian (pt-BR), the largest audiences.
 */
export const SUPPORTED_LOCALES = ['en', 'es', 'ja', 'de', 'fr', 'zh', 'pt'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type TranslatedLocale = Exclude<Locale, 'en'>;
export const TRANSLATED_LOCALES = SUPPORTED_LOCALES.filter(
  (locale): locale is TranslatedLocale => locale !== 'en',
);
export const DEFAULT_LOCALE: Locale = 'en';
export const LANGUAGE_PREFERENCE_KEY = 'fitwise-language-preference';

export interface LocaleMeta {
  /** hreflang / html lang value. */
  hreflang: string;
  /** Open Graph locale. */
  ogLocale: string;
  /** Language name in its own language, for the switcher. */
  nativeName: string;
  /** Short switcher badge. */
  badge: string;
}

export const LOCALE_META: Readonly<Record<Locale, LocaleMeta>> = {
  en: { hreflang: 'en', ogLocale: 'en_US', nativeName: 'English', badge: 'EN' },
  es: { hreflang: 'es', ogLocale: 'es_ES', nativeName: 'Español', badge: 'ES' },
  ja: { hreflang: 'ja', ogLocale: 'ja_JP', nativeName: '日本語', badge: 'JA' },
  de: { hreflang: 'de', ogLocale: 'de_DE', nativeName: 'Deutsch', badge: 'DE' },
  fr: { hreflang: 'fr', ogLocale: 'fr_FR', nativeName: 'Français', badge: 'FR' },
  zh: { hreflang: 'zh-Hans', ogLocale: 'zh_CN', nativeName: '简体中文', badge: '中文' },
  pt: { hreflang: 'pt-BR', ogLocale: 'pt_BR', nativeName: 'Português (Brasil)', badge: 'PT' },
};

/** Regional variants for the paired US/UK bed-size pages (English and Spanish only). */
const REGIONAL_BED_PAGES: Readonly<Record<string, 'US' | 'GB'>> = {
  '/bedroom/us-bed-size-dimensions/': 'US',
  '/bedroom/uk-bed-size-dimensions/': 'GB',
};

export interface LocalizedRoute {
  pageIntentId: string;
  sourcePath: string;
  localizedPath: string;
  indexable: boolean;
}

export interface LanguageAlternate {
  language: string;
  href: string;
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Maps an html `lang` / hreflang value (e.g. `zh-Hans`, `pt-BR`, `es-US`) to a site locale. */
export function localeFromLanguage(language: string | undefined | null): Locale {
  const primary = (language ?? '').toLowerCase().split('-')[0];
  return isLocale(primary) ? primary : 'en';
}

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split('/').filter(Boolean)[0];
  return first && first !== 'en' && isLocale(first) ? first : 'en';
}

export function englishPathname(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const locale = localeFromPath(normalized);
  if (locale === 'en') return normalized;
  const rest = normalized.slice(locale.length + 1);
  return rest === '' || rest === '/' ? '/' : rest;
}

export function pathForLocale(pathname: string, locale: Locale): string {
  const englishPath = englishPathname(pathname);
  if (locale === 'en') return englishPath;
  return englishPath === '/' ? `/${locale}/` : `/${locale}${englishPath}`;
}

/** hreflang for a page in a given locale (regional tags only for the US/UK bed pages). */
export function hreflangFor(pathname: string, locale: Locale): string {
  const region = REGIONAL_BED_PAGES[englishPathname(pathname)];
  if (region && (locale === 'en' || locale === 'es')) return `${locale}-${region}`;
  return LOCALE_META[locale].hreflang;
}

/** Every other-language equivalent of a canonical path (the current one excluded). */
export function languageAlternates(
  canonicalPath: string,
  currentLanguage: string,
  existing: readonly LanguageAlternate[] = [],
): LanguageAlternate[] {
  const current = localeFromLanguage(currentLanguage);
  const byLanguage = new Map<string, LanguageAlternate>();
  const coveredLocales = new Set<Locale>();
  for (const alternate of existing) {
    if (alternate.language === currentLanguage) continue;
    byLanguage.set(alternate.language, alternate);
    coveredLocales.add(localeFromLanguage(alternate.language));
  }
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === current || coveredLocales.has(locale)) continue;
    const language = hreflangFor(canonicalPath, locale);
    if (!byLanguage.has(language)) {
      byLanguage.set(language, { language, href: pathForLocale(canonicalPath, locale) });
    }
  }
  return [...byLanguage.values()];
}

export function xDefaultPath(canonicalPath: string): string {
  return pathForLocale(canonicalPath, 'en');
}

/** Published generated routes, mapped into one locale's URL space. */
export function publishedLocalizedRoutes(dataset: Dataset, locale: Locale): LocalizedRoute[] {
  const dispositions = dataset.routeDispositions.filter(
    (disposition) =>
      disposition.intentStatus === 'published' && disposition.disposition === 'generated',
  );
  const publications = new Map(
    dataset.seoPublications.map((publication) => [publication.pageIntentId, publication]),
  );
  return dispositions
    .map((disposition) => ({
      pageIntentId: disposition.pageIntentId,
      sourcePath: disposition.route,
      localizedPath: pathForLocale(disposition.route, locale),
      indexable: publications.get(disposition.pageIntentId)?.indexable ?? false,
    }))
    .sort((a, b) => a.localizedPath.localeCompare(b.localizedPath));
}

/** @deprecated Use publishedLocalizedRoutes(dataset, 'es'). */
export function publishedSpanishRoutes(dataset: Dataset): LocalizedRoute[] {
  return publishedLocalizedRoutes(dataset, 'es');
}

export function escapePathSegments(pathname: string): string {
  return pathname
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(decodeURIComponent(segment)) : segment))
    .join('/');
}
