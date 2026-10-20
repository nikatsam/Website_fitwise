import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import esContent from '../../src/i18n/catalogs/es.content';
import esUi from '../../src/i18n/catalogs/es.ui';
import { TRANSLATED_LOCALES } from '../../src/i18n/locale';
import {
  chunkLeaves,
  collectLeaves,
  placeholders,
  rebuild,
} from '../../scripts/i18n/catalog-tools';

const ROOT = path.resolve(__dirname, '../..');
const SOURCE_DIR = path.join(ROOT, 'scripts/i18n/source');
const TRANSLATIONS_DIR = path.join(ROOT, 'src/i18n/translations');
const GENERATED_DIR = path.join(ROOT, 'src/i18n/catalogs/generated');
const GENERATED_LOCALES = TRANSLATED_LOCALES.filter((locale) => locale !== 'es');

const leaves = [...collectLeaves(esUi, 'ui'), ...collectLeaves(esContent, 'content')];

function loadTranslations(locale: string): Record<string, string> {
  const dir = path.join(TRANSLATIONS_DIR, locale);
  if (!existsSync(dir)) return {};
  return Object.assign(
    {},
    ...readdirSync(dir)
      .filter((file) => file.endsWith('.json'))
      .sort()
      .map(
        (file) => JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Record<string, string>,
      ),
  );
}

function build(locale: string) {
  const translations = loadTranslations(locale);
  const missing: string[] = [];
  const ui = rebuild(esUi, 'ui', translations, missing);
  const content = rebuild(esContent, 'content', translations, missing);
  return { translations, missing, ui, content };
}

describe('locale catalogs', () => {
  it('has unique leaf ids', () => {
    expect(new Set(leaves.map((leaf) => leaf.id)).size).toBe(leaves.length);
  });

  it.runIf(process.env.I18N_EXPORT)('exports translation source chunks', () => {
    rmSync(SOURCE_DIR, { recursive: true, force: true });
    mkdirSync(SOURCE_DIR, { recursive: true });
    chunkLeaves(leaves, 9000).forEach((chunk, index) => {
      const entries = chunk.map(({ id, en, es }) => ({ id, ...(en ? { en } : {}), es }));
      writeFileSync(
        path.join(SOURCE_DIR, `${String(index + 1).padStart(2, '0')}.json`),
        `${JSON.stringify(entries, null, 1)}\n`,
      );
    });
  });

  for (const locale of GENERATED_LOCALES) {
    describe(locale, () => {
      const { translations, missing, ui, content } = build(locale);

      it('translates every leaf', () => {
        expect(missing, `${missing.length} missing ${locale} leaves`).toEqual([]);
      });

      it('has no unknown translation ids', () => {
        const known = new Set(leaves.map((leaf) => leaf.id));
        expect(Object.keys(translations).filter((id) => !known.has(id))).toEqual([]);
      });

      it('preserves placeholders', () => {
        const broken = leaves
          .filter((leaf) => translations[leaf.id] !== undefined)
          .filter((leaf) => placeholders(leaf.es) !== placeholders(translations[leaf.id]!))
          .map(
            (leaf) =>
              `${leaf.id}: ${placeholders(leaf.es)} ≠ ${placeholders(translations[leaf.id]!)}`,
          );
        expect(broken).toEqual([]);
      });

      it('generated catalogs are up to date', () => {
        const uiPath = path.join(GENERATED_DIR, `${locale}.ui.json`);
        const contentPath = path.join(GENERATED_DIR, `${locale}.content.json`);
        const uiJson = `${JSON.stringify(ui)}\n`;
        const contentJson = `${JSON.stringify(content)}\n`;
        if (process.env.I18N_WRITE) {
          mkdirSync(GENERATED_DIR, { recursive: true });
          writeFileSync(uiPath, uiJson);
          writeFileSync(contentPath, contentJson);
        }
        expect(readFileSync(uiPath, 'utf8')).toBe(uiJson);
        expect(readFileSync(contentPath, 'utf8')).toBe(contentJson);
      });
    });
  }
});
