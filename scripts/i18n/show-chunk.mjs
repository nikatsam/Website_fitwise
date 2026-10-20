// Prints a source chunk compactly for translators: "id<TAB>EN|ES<TAB>text".
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { Console } from 'node:console';

const console = new Console(process.stdout, process.stderr);
const entries = JSON.parse(readFileSync(`scripts/i18n/source/${process.argv[2]}.json`, 'utf8'));
for (const { id, en, es } of entries) {
  console.log(`${id}\t${en ? 'EN' : 'ES'}\t${(en ?? es).replace(/\n/g, '\n')}`);
}
