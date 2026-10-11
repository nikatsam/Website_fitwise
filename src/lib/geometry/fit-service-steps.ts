import type { FitServiceField, FitServiceMode } from './fit-services';

export interface FitServiceStep {
  id: string;
  title: string;
  fields: FitServiceField[];
}

interface StepDefinition {
  id: string;
  title: string;
  fieldNames: string[];
}

const stepDefinitions: Record<FitServiceMode, StepDefinition[]> = {
  'appliance-install': [
    {
      id: 'appliance',
      title: 'Appliance dimensions',
      fieldNames: ['itemWidth', 'itemDepth', 'itemHeight'],
    },
    {
      id: 'opening',
      title: 'Installation opening',
      fieldNames: ['openingWidth', 'openingDepth', 'openingHeight'],
    },
    {
      id: 'clearances',
      title: 'Manual clearances and source',
      fieldNames: [
        'sideClearance',
        'rearClearance',
        'topClearance',
        'clearanceSource',
        'clearanceManualReference',
        'clearanceSpecReference',
      ],
    },
  ],
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
  'workspace-compatibility': [
    {
      id: 'monitor',
      title: 'Monitor size and compatibility',
      fieldNames: ['monitorWidth', 'monitorDepth', 'monitorWeight', 'monitorVesa'],
    },
    {
      id: 'desk-arm',
      title: 'Desk and arm dimensions',
      fieldNames: [
        'deskWidth',
        'deskDepth',
        'armBaseDepth',
        'deskThickness',
        'clampMin',
        'clampMax',
        'armMaxLoad',
        'armVesaPatterns',
      ],
    },
    {
      id: 'source',
      title: 'Manual and specification sources',
      fieldNames: [
        'compatibilitySource',
        'compatibilityManualReference',
        'compatibilitySpecReference',
      ],
    },
  ],
  'tv-fit': [
    { id: 'display', title: 'Display and setup', fieldNames: ['setup', 'tvWidth', 'tvHeight'] },
    {
      id: 'stand',
      title: 'Stand and console',
      fieldNames: [
        'consoleWidth',
        'consoleDepth',
        'standWidth',
        'standDepth',
        'soundbarWidth',
        'soundbarDepth',
      ],
    },
    {
      id: 'wall',
      title: 'Wall area and mount compatibility',
      fieldNames: [
        'wallAreaWidth',
        'wallAreaHeight',
        'tvWeight',
        'mountMaxLoad',
        'tvVesa',
        'mountVesaPatterns',
        'mountDataSource',
        'mountManualReference',
        'mountPageReference',
      ],
    },
  ],
  'home-gym': [
    {
      id: 'equipment',
      title: 'Equipment footprint',
      fieldNames: ['equipmentWidth', 'equipmentDepth', 'equipmentHeight'],
    },
    {
      id: 'room',
      title: 'Room and ceiling',
      fieldNames: ['roomWidth', 'roomDepth', 'ceilingHeight'],
    },
    {
      id: 'operating-zone',
      title: 'Selected operating zones',
      fieldNames: ['sideOperating', 'frontOperating', 'overheadOperating'],
    },
  ],
  storage: [
    {
      id: 'objects',
      title: 'Objects to store',
      fieldNames: ['itemWidth', 'itemDepth', 'itemHeight', 'requestedQuantity'],
    },
    {
      id: 'storage-space',
      title: 'Usable storage space',
      fieldNames: ['spaceWidth', 'spaceDepth', 'spaceHeight'],
    },
    {
      id: 'layout',
      title: 'Spacing and aisle',
      fieldNames: ['edgeClearance', 'itemGap', 'availableAisle', 'targetAisle'],
    },
  ],
  'pool-room': [
    { id: 'table', title: 'Table and cue', fieldNames: ['tableWidth', 'tableLength', 'cueLength'] },
    { id: 'room', title: 'Clear room dimensions', fieldNames: ['roomWidth', 'roomLength'] },
    { id: 'clearance', title: 'Optional selected clearance', fieldNames: ['extraClearance'] },
  ],
  'vehicle-garage': [
    {
      id: 'vehicle',
      title: 'Vehicle dimensions',
      fieldNames: ['vehicleWidth', 'vehicleLength', 'vehicleHeight'],
    },
    {
      id: 'garage',
      title: 'Garage and door opening',
      fieldNames: [
        'garageWidth',
        'garageLength',
        'garageHeight',
        'garageOpeningWidth',
        'garageOpeningHeight',
      ],
    },
    {
      id: 'access',
      title: 'Selected access space',
      fieldNames: [
        'doorProjection',
        'sideAccess',
        'frontClearance',
        'rearClearance',
        'overheadClearance',
      ],
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
  'garden-patio-dining': [
    {
      id: 'patio',
      title: 'Patio or gazebo dimensions',
      fieldNames: ['advertisedWidth', 'advertisedDepth', 'clearWidth', 'clearDepth'],
    },
    {
      id: 'furniture',
      title: 'Table and chair footprint',
      fieldNames: ['tableWidth', 'tableLength', 'chairWidth', 'chairEnvelope'],
    },
    {
      id: 'seating',
      title: 'Seating and movement space',
      fieldNames: ['chairsPerLongSide', 'chairsPerEnd', 'walkingClearance', 'orientation'],
    },
  ],
  'garden-shed-storage': [
    {
      id: 'interior',
      title: 'Shed interior',
      fieldNames: ['insideWidth', 'insideDepth', 'insideHeight'],
    },
    {
      id: 'items',
      title: 'Stored items',
      fieldNames: ['itemWidth', 'itemDepth', 'itemHeight', 'itemQuantity'],
    },
    {
      id: 'layout',
      title: 'Spacing and aisle',
      fieldNames: ['itemGap', 'aisleWidth', 'aisleTarget'],
    },
  ],
  'garden-greenhouse': [
    { id: 'plot', title: 'Usable plot', fieldNames: ['plotWidth', 'plotDepth'] },
    {
      id: 'structure',
      title: 'Greenhouse and exterior space',
      fieldNames: [
        'greenhouseWidth',
        'greenhouseDepth',
        'roofOverhangSide',
        'roofOverhangEnd',
        'maintenanceSide',
        'maintenanceEnd',
      ],
    },
    {
      id: 'interior',
      title: 'Interior layout and access',
      fieldNames: [
        'insideClearWidth',
        'stagingDepth',
        'centralAisleTarget',
        'doorClearWidth',
        'wheelbarrowWidth',
      ],
    },
  ],
  'garden-hot-tub': [
    {
      id: 'tub',
      title: 'Hot tub dimensions',
      fieldNames: ['tubWidth', 'tubDepth', 'tubHeight', 'clearHeight'],
    },
    { id: 'patio', title: 'Usable patio', fieldNames: ['patioWidth', 'patioDepth'] },
    {
      id: 'service',
      title: 'Manual service and cover space',
      fieldNames: [
        'serviceSide',
        'serviceFront',
        'coverLiftHeight',
        'serviceSpaceSource',
        'serviceManualReference',
        'serviceSpecReference',
      ],
    },
  ],
  'garden-outdoor-kitchen': [
    {
      id: 'kitchen',
      title: 'Kitchen footprint',
      fieldNames: ['runWidth', 'runDepth', 'runHeight', 'clearHeight'],
    },
    { id: 'patio', title: 'Usable patio', fieldNames: ['patioWidth', 'patioDepth'] },
    {
      id: 'work-zone',
      title: 'Selected work and service zones',
      fieldNames: ['sideService', 'frontWorkZone', 'rearService'],
    },
  ],
  'garden-play-equipment': [
    {
      id: 'equipment',
      title: 'Equipment footprint',
      fieldNames: ['equipmentWidth', 'equipmentDepth', 'equipmentHeight', 'clearHeight'],
    },
    { id: 'plot', title: 'Usable plot', fieldNames: ['plotWidth', 'plotDepth'] },
    {
      id: 'manufacturer-zone',
      title: 'Manufacturer use-zone verification',
      fieldNames: [
        'useZoneSource',
        'manualReference',
        'useZoneLeft',
        'useZoneRight',
        'useZoneFront',
        'useZoneRear',
      ],
    },
  ],
};

export function getFitServiceSteps(
  mode: FitServiceMode,
  fields: FitServiceField[],
): FitServiceStep[] {
  const definitions = stepDefinitions[mode];
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
