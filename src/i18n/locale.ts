import type { Dataset } from '../lib/validation/dataset';

export const SUPPORTED_LOCALES = ['en', 'es'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LANGUAGE_PREFERENCE_KEY = 'fitwise-language-preference';

const bedSizeLanguageSet: readonly LanguageAlternate[] = [
  { language: 'en-US', href: '/bedroom/us-bed-size-dimensions/' },
  { language: 'en-GB', href: '/bedroom/uk-bed-size-dimensions/' },
  { language: 'es-US', href: '/es/bedroom/us-bed-size-dimensions/' },
  { language: 'es-GB', href: '/es/bedroom/uk-bed-size-dimensions/' },
];

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

export function localeFromPath(pathname: string): Locale {
  return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en';
}

export function pathForLocale(pathname: string, locale: Locale): string {
  const englishPath = englishPathname(pathname);
  if (locale === 'en') return englishPath;
  return englishPath === '/' ? '/es/' : `/es${englishPath}`;
}

export function englishPathname(pathname: string): string {
  if (pathname === '/es' || pathname === '/es/') return '/';
  if (pathname.startsWith('/es/')) return pathname.slice(3) || '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function languageAlternates(
  canonicalPath: string,
  currentLanguage: string,
  existing: readonly LanguageAlternate[] = [],
): LanguageAlternate[] {
  const englishPath = englishPathname(canonicalPath);
  if (bedSizeLanguageSet.some((alternate) => englishPathname(alternate.href) === englishPath)) {
    return bedSizeLanguageSet.filter((alternate) => alternate.href !== canonicalPath);
  }
  const locale = currentLanguage.startsWith('es') ? 'es' : 'en';
  const counterpart: LanguageAlternate = {
    language: locale === 'es' ? 'en' : 'es',
    href: pathForLocale(canonicalPath, locale === 'es' ? 'en' : 'es'),
  };
  const byLanguage = new Map<string, LanguageAlternate>();
  for (const alternate of existing) {
    if (alternate.language !== currentLanguage) byLanguage.set(alternate.language, alternate);
  }
  const hasEnglishRegionalEquivalent =
    locale === 'es' &&
    [...byLanguage.keys()].some((language) => language === 'en' || language.startsWith('en-'));
  if (!hasEnglishRegionalEquivalent) byLanguage.set(counterpart.language, counterpart);
  return [...byLanguage.values()];
}

export function xDefaultPath(canonicalPath: string): string {
  return pathForLocale(canonicalPath, 'en');
}

export function publishedSpanishRoutes(dataset: Dataset): LocalizedRoute[] {
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
      localizedPath: pathForLocale(disposition.route, 'es'),
      indexable: publications.get(disposition.pageIntentId)?.indexable ?? false,
    }))
    .sort((a, b) => a.localizedPath.localeCompare(b.localizedPath));
}

export function spanishRouteForPath(
  dataset: Dataset,
  pathname: string,
): LocalizedRoute | undefined {
  const englishPath = englishPathname(pathname);
  return publishedSpanishRoutes(dataset).find((route) => route.sourcePath === englishPath);
}

export function escapePathSegments(pathname: string): string {
  return pathname
    .split('/')
    .map((segment) => (segment ? encodeURIComponent(decodeURIComponent(segment)) : segment))
    .join('/');
}
