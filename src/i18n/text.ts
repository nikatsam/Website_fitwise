import { esCalculatorCopy, calculatorCopyTemplates } from './es-calculator-copy';
import { ES_NAV_LINKS, ES_SHELL_STATIC } from './es-shell-static';
import type { Locale } from './locale';

const esExactCopy: Readonly<Record<string, string>> = {
  ...ES_SHELL_STATIC,
  ...ES_NAV_LINKS,
  ...esCalculatorCopy,
};

const esTemplates: Readonly<Record<string, string>> = {
  ...calculatorCopyTemplates,
};

function matchTemplate(template: string, actual: string): Record<string, string> | undefined {
  const names: string[] = [];
  const pattern = template
    .split(/(\{\w+\})/g)
    .map((part) => {
      const placeholder = part.match(/^\{(\w+)\}$/);
      if (placeholder) {
        const [, name] = placeholder;
        names.push(name);
        return '(.+?)';
      }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  const match = actual.match(new RegExp(`^${pattern}$`, 's'));
  if (!match) return undefined;
  return Object.fromEntries(names.map((name, index) => [name, match[index + 1] ?? '']));
}

function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) => values[name] ?? `{${name}}`);
}

export function translate(locale: Locale, source: string): string {
  if (locale === 'en') return source;
  const exact = esExactCopy[source];
  if (exact) return exact;

  for (const [sourceTemplate, translatedTemplate] of Object.entries(esTemplates)) {
    const values = matchTemplate(sourceTemplate, source);
    if (values) return interpolate(translatedTemplate, values);
  }
  return source;
}

export function translateRequired(locale: Locale, source: string): string {
  if (locale === 'en') return source;
  if (Object.prototype.hasOwnProperty.call(esExactCopy, source)) return esExactCopy[source]!;
  if (Object.keys(esTemplates).some((template) => matchTemplate(template, source))) {
    return translate(locale, source);
  }
  const translated = translate(locale, source);
  if (translated === source) {
    throw new Error(`Missing Spanish translation for visible copy: '${source}'.`);
  }
  return translated;
}

export function translateTemplate(
  locale: Locale,
  sourceTemplate: string,
  values: Record<string, string | number>,
): string {
  if (locale === 'en')
    return interpolate(
      sourceTemplate,
      Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])),
    );
  const translated = esTemplates[sourceTemplate] ?? esExactCopy[sourceTemplate];
  if (!translated) throw new Error(`Missing Spanish template translation: '${sourceTemplate}'.`);
  return interpolate(
    translated,
    Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])),
  );
}
