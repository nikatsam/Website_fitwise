// Verifies one translated chunk: every source id present, no extras, placeholders preserved.
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';
import { Console } from 'node:console';

const console = new Console(process.stdout, process.stderr);
const LOCALES = ['ja', 'de', 'fr', 'zh', 'pt'];
const ph = (t) =>
  [...t.matchAll(/\{\{?\w+\}?\}/g)]
    .map((m) => m[0])
    .sort()
    .join(',');
let failed = false;
for (const chunk of process.argv.slice(2)) {
  const source = JSON.parse(readFileSync(`scripts/i18n/source/${chunk}.json`, 'utf8'));
  for (const locale of LOCALES) {
    const file = `src/i18n/translations/${locale}/${chunk}.json`;
    if (!existsSync(file)) {
      console.log(`${chunk} ${locale}: MISSING FILE`);
      failed = true;
      continue;
    }
    const t = JSON.parse(readFileSync(file, 'utf8'));
    const ids = new Set(source.map((e) => e.id));
    const missing = source.filter((e) => t[e.id] === undefined).map((e) => e.id);
    const extra = Object.keys(t).filter((id) => !ids.has(id));
    const broken = source
      .filter((e) => t[e.id] !== undefined && ph(e.es) !== ph(t[e.id]))
      .map((e) => e.id);
    const ok = !missing.length && !extra.length && !broken.length;
    if (!ok) failed = true;
    console.log(
      `${chunk} ${locale}: ${ok ? 'ok' : `missing ${missing.join(' ')} extra ${extra.join(' ')} placeholders ${broken.join(' ')}`}`,
    );
  }
}
process.exit(failed ? 1 : 0);
