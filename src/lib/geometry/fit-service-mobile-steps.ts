import type { FitServiceField, FitServiceMode } from './fit-services';

export interface FitServiceMobileStep {
  id: string;
  title: string;
  fields: FitServiceField[];
}

interface StepDefinition {
  id: string;
  title: string;
  fieldNames: string[];
}

const stepDefinitions: Partial<Record<FitServiceMode, StepDefinition[]>> = {
  'delivery-route': [
    {
      id: 'item',
      title: 'Item to move',
      fieldNames: ['itemWidth', 'itemDepth', 'itemHeight'],
    },
    {
      id: 'entry',
      title: 'Entry and hallway',
      fieldNames: ['frontDoorWidth', 'frontDoorHeight', 'hallWidth'],
    },
    {
      id: 'route',
      title: 'Turns and stairs',
      fieldNames: ['turnWidth', 'turnDepth', 'stairWidth', 'stairHeadroom'],
    },
    {
      id: 'destination',
      title: 'Destination opening',
      fieldNames: ['destinationDoorWidth', 'destinationDoorHeight'],
    },
  ],
  'garden-structure': [
    {
      id: 'plan',
      title: 'Plan and structure type',
      fieldNames: ['direction', 'structureType'],
    },
    {
      id: 'plot',
      title: 'Usable plot',
      fieldNames: ['plotWidth', 'plotDepth'],
    },
    {
      id: 'structure',
      title: 'Structure or candidates',
      fieldNames: ['bodyWidth', 'bodyDepth', 'candidateSizes'],
    },
    {
      id: 'envelope',
      title: 'Roof, maintenance and access',
      fieldNames: [
        'roofOverhangSide',
        'roofOverhangFront',
        'roofOverhangRear',
        'maintenanceLeft',
        'maintenanceRight',
        'maintenanceRear',
        'maintenanceFront',
        'doorProjection',
        'doorPathAvailable',
        'doorPathTarget',
      ],
    },
  ],
};

export function getFitServiceMobileSteps(
  mode: FitServiceMode,
  fields: FitServiceField[],
): FitServiceMobileStep[] | undefined {
  const definitions = stepDefinitions[mode];
  if (!definitions) return undefined;
  const fieldsByName = new Map(fields.map((field) => [field.name, field]));
  const assigned = new Set<string>();
  const steps = definitions.map((definition) => ({
    id: definition.id,
    title: definition.title,
    fields: definition.fieldNames.flatMap((name) => {
      const field = fieldsByName.get(name);
      if (!field) return [];
      assigned.add(name);
      return [field];
    }),
  }));
  const unassigned = fields.filter((field) => !assigned.has(field.name));
  if (unassigned.length > 0) {
    steps.push({
      id: 'additional',
      title: 'Additional details',
      fields: unassigned,
    });
  }
  return steps.filter((step) => step.fields.length > 0);
}
