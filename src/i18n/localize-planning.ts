import type { Dataset } from '../lib/validation/dataset';
import type { FamilyAnswer, FamilyFact } from '../lib/content/build-family-answer';
import { formatMeasurement } from '../lib/units';
import { familyEntityNameEs, familyMarketEs } from './es-family-copy';
import { ES_PLANNING_COPY } from './es-planning';
import { translate } from './text';

function factText(fact: FamilyFact | undefined): string {
  if (!fact) return '';
  if (fact.valueText !== undefined) return fact.valueText;
  return fact.valueMm === undefined ? '' : formatMeasurement(fact.valueMm);
}

function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}

function matchTemplate(template: string, value: string): Record<string, string> | undefined {
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
  const match = value.match(new RegExp(`^${pattern}$`));
  if (!match) return undefined;
  const variables = Object.fromEntries(names.map((name, index) => [name, match[index + 1] ?? '']));
  return variables;
}

export function localizeFurniturePlanningAnswer(
  pageIntentId: string,
  answer: FamilyAnswer,
  dataset: Dataset,
): FamilyAnswer {
  const copy = ES_PLANNING_COPY[pageIntentId];
  if (!copy) throw new Error(`Missing Spanish sourced-planning copy for '${pageIntentId}'.`);
  const facts = answer.sections.flatMap((section) => section.facts);
  const valueFor = (label: string) => factText(facts.find((fact) => fact.label === label));
  const intent = dataset.pageIntents.find((item) => item.id === pageIntentId);
  const entities =
    intent?.entityIds
      .map((id) => dataset.entities.find((entity) => entity.id === id))
      .filter((entity): entity is NonNullable<typeof entity> => entity !== undefined) ?? [];
  const bed = entities.find((entity) => entity.category === 'bed');
  const furniture = entities.find((entity) => entity.category === 'furniture');
  const bedName = bed ? (familyEntityNameEs[bed.id] ?? bed.name) : '';
  const furnitureName = furniture ? (familyEntityNameEs[furniture.id] ?? furniture.name) : '';

  const valuesById: Record<string, Record<string, string>> = {
    'pi-p015-desk-depth-for-monitor': {
      standDepth: valueFor('Monitor depth with stand'),
      displayDepth: valueFor('Monitor body depth without stand'),
      deskDepth: valueFor('Nominal reference desk depth'),
      remainingSurface: valueFor('Desktop surface in front of stand if flush to rear edge'),
    },
    'pi-p018-desk-chair-clearance': {
      chairWidth: valueFor('Maximum listed outer width'),
      chairDepth: valueFor('Maximum listed overall depth'),
    },
    'pi-p034-space-bed-wardrobe': {
      doorWidth: valueFor('One hinged door leaf'),
      doorSweep: valueFor('Door projection at 90 degrees'),
    },
    'pi-p035-bed-dresser-clearance': {
      dresserDepth: valueFor('Dresser closed depth'),
      drawerPullout: valueFor('Drawer pull-out'),
      wallToFront: valueFor('Wall to fully extended drawer front (dresser flush to wall)'),
    },
    'pi-p036-king-bed-nightstands-room': {
      bedName,
      tableName: furnitureName,
      combinedWidth: valueFor('Combined width (bed + two tables, zero gaps)'),
    },
    'pi-p037-queen-bed-nightstands-room': {
      bedName,
      tableName: furnitureName,
      combinedWidth: valueFor('Combined width (bed + two tables, zero gaps)'),
    },
  };
  const interpolatedIntro = interpolate(copy.intro, valuesById[pageIntentId] ?? {});
  const localizedSections = answer.sections.map((section) => ({
    ...section,
    title: copy.sectionTitle,
    facts: section.facts.map((fact) => {
      let label = copy.factLabels[fact.label];
      if (!label) {
        for (const [pattern, localized] of Object.entries(copy.factLabels)) {
          const values = matchTemplate(pattern, fact.label);
          if (values) {
            label = interpolate(localized, values);
            break;
          }
        }
      }
      if (!label)
        throw new Error(
          `Missing Spanish label for sourced planning fact '${fact.label}' (${pageIntentId}).`,
        );
      const note = fact.note ? translate('es', fact.note) : undefined;
      if (fact.note && note === fact.note) {
        throw new Error(
          `Missing Spanish fact-note translation for '${fact.label}' (${pageIntentId}).`,
        );
      }
      return {
        ...fact,
        label,
        ...(note ? { note } : {}),
        ...(fact.label === 'Market' && fact.valueText
          ? { valueText: familyMarketEs[fact.valueText] ?? fact.valueText }
          : {}),
      };
    }),
    assumptions: [...copy.assumptions],
  }));
  const localizedSourceIds = new Set(answer.sources.map((source) => source.id));
  const localizedSources = dataset.sources.filter((source) => localizedSourceIds.has(source.id));
  return {
    intro: interpolatedIntro,
    sections: localizedSections,
    sources: localizedSources,
  };
}
