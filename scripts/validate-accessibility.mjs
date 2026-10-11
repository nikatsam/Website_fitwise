import { readdir, readFile } from 'node:fs/promises';
import { Console } from 'node:console';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(projectRoot, 'dist');
const console = new Console(process.stdout, process.stderr);
const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const interactiveRoles = new Set([
  'button',
  'checkbox',
  'combobox',
  'img',
  'image',
  'listbox',
  'menuitem',
  'radio',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'textbox',
]);
const genericAccessibleName =
  /^\s*\[?\s*(?:input|select|textarea|button|checkbox|radio|text box|text field|textbox|control)\s*\]?\s*$/i;

function parseAttributes(source) {
  const attributes = new Map();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

function parseHtml(source) {
  const root = { tag: '#root', attributes: new Map(), parent: null, children: [], text: '' };
  const stack = [root];
  const tokens = source.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][^>]*>|[^<]+/gi);

  for (const [token] of tokens) {
    if (token.startsWith('<!--') || token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const closingTag = token.slice(2, -1).trim().toLowerCase();
      const index = stack.findLastIndex((node) => node.tag === closingTag);
      if (index > 0) stack.length = index;
      continue;
    }
    if (token.startsWith('<')) {
      const openingTag = token.match(/^<([a-z][^\s/>]*)/i);
      if (!openingTag) continue;
      const tag = openingTag[1].toLowerCase();
      const attributesStart = openingTag[0].length;
      const node = {
        tag,
        attributes: parseAttributes(token.slice(attributesStart, -1).replace(/\/$/, '')),
        parent: stack.at(-1),
        children: [],
        text: '',
      };
      node.parent.children.push(node);
      if (!voidElements.has(tag) && !token.endsWith('/>')) stack.push(node);
      continue;
    }
    stack.at(-1).text += token;
  }

  const nodes = [];
  const visit = (node) => {
    nodes.push(node);
    for (const child of node.children) visit(child);
  };
  visit(root);
  return nodes;
}

function textContent(node) {
  return `${node.text}${node.children.map(textContent).join(' ')}`.replace(/\s+/g, ' ').trim();
}

function ancestor(node, predicate) {
  for (let current = node.parent; current; current = current.parent) {
    if (predicate(current)) return current;
  }
  return null;
}

export function auditAccessibilityHtml(source) {
  const nodes = parseHtml(source);
  const ids = new Map();
  for (const node of nodes) {
    const id = node.attributes.get('id');
    if (id) ids.set(id, [...(ids.get(id) ?? []), node]);
  }

  const labelsByFor = new Map();
  for (const label of nodes.filter((node) => node.tag === 'label')) {
    const target = label.attributes.get('for');
    if (target) labelsByFor.set(target, [...(labelsByFor.get(target) ?? []), label]);
  }

  const controls = nodes.filter((node) => {
    if (
      node.tag === 'button' ||
      node.tag === 'select' ||
      node.tag === 'textarea' ||
      node.tag === 'summary'
    ) {
      return true;
    }
    if (node.tag === 'input') return node.attributes.get('type')?.toLowerCase() !== 'hidden';
    return interactiveRoles.has(node.attributes.get('role') ?? '');
  });
  const hasCalculatorShell = nodes.some((node) => node.attributes.has('data-calculator-shell'));
  const hasBeforeYouStart = nodes.some((node) => node.attributes.has('data-before-you-start'));
  const hasFitCalculator = nodes.some((node) => {
    const classes = node.attributes.get('class')?.split(/\s+/) ?? [];
    return [
      'workspace-fitcheck',
      'bedroom-fitcheck',
      'universal-fitcheck',
      'dining-fitcheck',
      'fit-services__form',
    ].some((className) => classes.includes(className));
  });

  const controlName = (control) => {
    const ariaLabel = control.attributes.get('aria-label')?.trim();
    if (ariaLabel) return ariaLabel;
    const labelledBy = (control.attributes.get('aria-labelledby') ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => textContent(ids.get(id)?.[0] ?? { text: '', children: [] }))
      .filter(Boolean)
      .join(' ');
    if (labelledBy) return labelledBy;
    const id = control.attributes.get('id');
    const explicitLabels = (labelsByFor.get(id) ?? []).map(textContent).filter(Boolean);
    const wrappedLabel = textContent(
      ancestor(control, (node) => node.tag === 'label') ?? {
        text: '',
        children: [],
      },
    );
    if (explicitLabels.length) return explicitLabels.join(' ');
    if (wrappedLabel) return wrappedLabel;
    if (control.tag === 'button' || control.tag === 'summary') return textContent(control);
    if (control.attributes.get('role') === 'button') return textContent(control);
    if (control.tag === 'input') {
      const type = control.attributes.get('type')?.toLowerCase();
      if (type === 'image') return control.attributes.get('alt')?.trim() ?? '';
      if (['button', 'submit', 'reset'].includes(type))
        return control.attributes.get('value')?.trim() ?? '';
    }
    return '';
  };

  const unnamed = controls
    .filter((control) => !controlName(control))
    .map((control) => `${control.tag}#${control.attributes.get('id') ?? '(no id)'}`);
  const genericNames = controls
    .map((control) => ({ control, name: controlName(control) }))
    .filter(({ name }) => genericAccessibleName.test(name))
    .map(
      ({ control, name }) => `${control.tag}#${control.attributes.get('id') ?? '(no id)'}: ${name}`,
    );
  const millimetreOnlyLabels = controls
    .map((control) => ({ control, name: controlName(control) }))
    .filter(({ name }) => /\(\s*mm\s*\)\s*$/i.test(name))
    .map(
      ({ control, name }) => `${control.tag}#${control.attributes.get('id') ?? '(no id)'}: ${name}`,
    );
  const duplicateIds = [...ids].filter(([, elements]) => elements.length > 1).map(([id]) => id);
  const brokenDescriptions = controls.flatMap((control) =>
    (control.attributes.get('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .filter((id) => !ids.has(id))
      .map((id) => `${control.attributes.get('id') ?? control.tag}: ${id}`),
  );
  const describedByIds = new Set(
    controls.flatMap((control) =>
      (control.attributes.get('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
    ),
  );
  const unassociatedMeasurementHelp = nodes
    .filter((node) =>
      (node.attributes.get('class')?.split(/\s+/) ?? []).includes('measurement-help__summary'),
    )
    .map((node) => node.attributes.get('id'))
    .filter((id) => id && !describedByIds.has(id));

  const choiceGroups = new Map();
  for (const control of controls) {
    if (control.tag !== 'input') continue;
    const type = control.attributes.get('type')?.toLowerCase();
    const name = control.attributes.get('name');
    if (!['checkbox', 'radio'].includes(type) || !name) continue;
    const groupKey = `${type}:${name}`;
    choiceGroups.set(groupKey, [...(choiceGroups.get(groupKey) ?? []), control]);
  }
  const ungroupedChoices = [...choiceGroups]
    .filter(
      ([, members]) =>
        members.length > 1 &&
        members.some((control) => {
          const group = ancestor(
            control,
            (node) => node.tag === 'fieldset' || node.attributes.get('role') === 'group',
          );
          if (!group) return true;
          const legend = group.children.find((child) => child.tag === 'legend');
          return (
            !textContent(legend ?? { text: '', children: [] }) &&
            !group.attributes.get('aria-label') &&
            !group.attributes.get('aria-labelledby')
          );
        }),
    )
    .map(([name]) => name);

  return {
    controls: controls.length,
    missingCalculatorShell: hasFitCalculator && !hasCalculatorShell,
    missingBeforeYouStart: hasFitCalculator && !hasBeforeYouStart,
    unnamed,
    genericNames,
    millimetreOnlyLabels,
    duplicateIds,
    brokenDescriptions,
    unassociatedMeasurementHelp,
    ungroupedChoices,
  };
}

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory()
        ? htmlFiles(fullPath)
        : entry.name.endsWith('.html')
          ? [fullPath]
          : [];
    }),
  );
  return nested.flat();
}

async function validateBuiltHtml() {
  const files = await htmlFiles(distRoot);
  const failures = [];
  let controlCount = 0;

  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const result = auditAccessibilityHtml(html);
    controlCount += result.controls;
    const route = `/${path.relative(distRoot, file).replaceAll(path.sep, '/')}`.replace(
      /index\.html$/,
      '',
    );
    if (
      result.unnamed.length ||
      result.genericNames.length ||
      result.millimetreOnlyLabels.length ||
      result.duplicateIds.length ||
      result.brokenDescriptions.length ||
      result.unassociatedMeasurementHelp.length ||
      result.ungroupedChoices.length ||
      result.missingCalculatorShell ||
      result.missingBeforeYouStart
    ) {
      failures.push({ route, ...result });
    }
  }

  if (failures.length) {
    console.error(`Accessibility HTML validation failed on ${failures.length} route(s):`);
    for (const failure of failures) console.error(JSON.stringify(failure));
    process.exitCode = 1;
  } else {
    console.log(
      `Accessibility HTML validation passed for ${files.length} pages and ${controlCount} interactive controls: names, non-generic/non-mm-only names, unique IDs, describedby references, labeled choice groups and associated measurement help.`,
    );
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await validateBuiltHtml();
}
