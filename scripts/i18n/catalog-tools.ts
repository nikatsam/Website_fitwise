/**
 * Locale catalog tooling. The Spanish catalogs (hand-written `es-*.ts`) are the
 * structural source: every other locale is a set of translated leaf strings
 * keyed by a stable id derived from the leaf's path in that structure.
 *
 *   I18N_EXPORT=1 npx vitest run tests/unit/i18n-catalogs.test.ts   → scripts/i18n/source/*.json
 *   I18N_WRITE=1  npx vitest run tests/unit/i18n-catalogs.test.ts   → src/i18n/catalogs/generated/*.json
 *
 * Without flags the test verifies every locale is complete and up to date.
 */
import { createHash } from 'node:crypto';

export type Leaf = { id: string; path: (string | number)[]; es: string; en?: string };

/** Maps whose keys are English source text (used as translator context). */
const ENGLISH_KEYED = new Set([
  'exact',
  'templates',
  'fitServices',
  'fitServicesTemplates',
  'fitServicesResultTemplates',
  'workspaceBedroom',
  'factLabels',
]);

const HAS_LETTER = /\p{L}/u;

export function leafId(path: (string | number)[]): string {
  return createHash('sha1').update(JSON.stringify(path)).digest('hex').slice(0, 12);
}

/** Collects translatable string leaves (strings containing at least one letter). */
export function collectLeaves(root: unknown, prefix: string): Leaf[] {
  const leaves: Leaf[] = [];
  const walk = (value: unknown, path: (string | number)[]) => {
    if (typeof value === 'string') {
      if (!HAS_LETTER.test(value)) return;
      const parent = path.at(-2);
      const key = path.at(-1);
      const en = typeof parent === 'string' && ENGLISH_KEYED.has(parent) ? String(key) : undefined;
      leaves.push({ id: leafId(path), path, es: value, ...(en ? { en } : {}) });
      return;
    }
    if (Array.isArray(value)) value.forEach((item, index) => walk(item, [...path, index]));
    else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) walk(item, [...path, key]);
    }
  };
  walk(root, [prefix]);
  return leaves;
}

/** Rebuilds a catalog with the Spanish structure and translated leaves. */
export function rebuild<T>(
  root: T,
  prefix: string,
  translations: Readonly<Record<string, string>>,
  missing: string[],
): T {
  const walk = (value: unknown, path: (string | number)[]): unknown => {
    if (typeof value === 'string') {
      if (!HAS_LETTER.test(value)) return value;
      const id = leafId(path);
      const translated = translations[id];
      if (translated === undefined) {
        missing.push(id);
        return value;
      }
      return translated;
    }
    if (Array.isArray(value)) return value.map((item, index) => walk(item, [...path, index]));
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, walk(item, [...path, key])]),
      );
    }
    return value;
  };
  return walk(root, [prefix]) as T;
}

/** `{name}` and `{{name}}` placeholders, as a sorted multiset string. */
export function placeholders(text: string): string {
  return [...text.matchAll(/\{\{?\w+\}?\}/g)]
    .map((match) => match[0])
    .sort()
    .join(',');
}

/** Splits leaves into chunks of roughly `maxChars` of source text. */
export function chunkLeaves(leaves: Leaf[], maxChars: number): Leaf[][] {
  const chunks: Leaf[][] = [];
  let current: Leaf[] = [];
  let size = 0;
  for (const leaf of leaves) {
    const cost = leaf.es.length + (leaf.en?.length ?? 0) + 40;
    if (current.length > 0 && size + cost > maxChars) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(leaf);
    size += cost;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}
