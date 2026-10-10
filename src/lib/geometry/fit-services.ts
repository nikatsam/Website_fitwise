import type { DimensionCheck } from '../fit';
import { evaluateFit } from '../fit';
import { buildDiningFitPlan } from './dining';
import { buildObjectFitPlan } from './object-fit';
import { formatMeasurement } from '../units';
import { parseLength } from '../units';

export type FitServiceMode =
  | 'appliance-install'
  | 'delivery-route'
  | 'workspace-compatibility'
  | 'tv-fit'
  | 'home-gym'
  | 'storage'
  | 'pool-room'
  | 'vehicle-garage'
  | 'garden-structure'
  | 'garden-patio-dining'
  | 'garden-shed-storage'
  | 'garden-greenhouse'
  | 'garden-hot-tub'
  | 'garden-outdoor-kitchen'
  | 'garden-play-equipment';

export type FitServiceCategory = 'core' | 'garden';

export type FitServiceFieldType = 'length' | 'count' | 'decimal' | 'text' | 'select';

export interface FitServiceField {
  name: string;
  label: string;
  type: FitServiceFieldType;
  defaultValue: string;
  required?: boolean;
  min?: number;
  max?: number;
  optional?: boolean;
  showWhen?: { name: string; value: string };
  options?: Array<{ label: string; value: string }>;
}

export interface FitServiceDefinition {
  mode: FitServiceMode;
  category?: FitServiceCategory;
  title: string;
  description: string;
  fields: FitServiceField[];
}

export type FitServiceValues = Record<string, number | string>;

function getLengthDefaults(definition: FitServiceDefinition): FitServiceValues {
  return Object.fromEntries(
    definition.fields.map((field) => {
      if (field.type === 'length') {
        const parsed = parseLength(field.defaultValue);
        if (!parsed.ok) throw new Error(`Invalid default length for '${field.name}'.`);
        return [field.name, parsed.valueMm];
      }
      if (field.type === 'count' || field.type === 'decimal') {
        return [field.name, Number(field.defaultValue)];
      }
      return [field.name, field.defaultValue];
    }),
  ) as FitServiceValues;
}

const length = (
  name: string,
  label: string,
  defaultValue: string,
  optional = false,
  showWhen?: FitServiceField['showWhen'],
): FitServiceField => ({
  name,
  label,
  type: 'length',
  defaultValue,
  required: !optional,
  optional,
  showWhen,
});

const count = (
  name: string,
  label: string,
  defaultValue: string,
  min: number,
  max: number,
  showWhen?: FitServiceField['showWhen'],
): FitServiceField => ({ name, label, type: 'count', defaultValue, min, max, showWhen });

const decimal = (
  name: string,
  label: string,
  defaultValue: string,
  showWhen?: FitServiceField['showWhen'],
): FitServiceField => ({ name, label, type: 'decimal', defaultValue, min: 0, showWhen });

const text = (
  name: string,
  label: string,
  defaultValue: string,
  showWhen?: FitServiceField['showWhen'],
): FitServiceField => ({ name, label, type: 'text', defaultValue, showWhen });

const select = (
  name: string,
  label: string,
  defaultValue: string,
  options: NonNullable<FitServiceField['options']>,
): FitServiceField => ({ name, label, type: 'select', defaultValue, options });

function gardenDefinition(
  definition: Omit<FitServiceDefinition, 'category'>,
): FitServiceDefinition {
  return { ...definition, category: 'garden' };
}

export const FIT_SERVICE_DEFINITIONS: FitServiceDefinition[] = [
  {
    mode: 'appliance-install',
    title: 'Appliance → opening and installation space',
    description:
      'Compare measured appliance dimensions with a cabinet or alcove and separately enter manual-based installation margins.',
    fields: [
      length('itemWidth', 'Appliance outside width', '600 mm'),
      length('itemDepth', 'Appliance outside depth', '650 mm'),
      length('itemHeight', 'Appliance outside height', '850 mm'),
      length('openingWidth', 'Clear opening width', '650 mm'),
      length('openingDepth', 'Usable opening depth', '700 mm'),
      length('openingHeight', 'Clear opening height', '900 mm'),
      length('sideClearance', 'Manual-required clearance on each side', '0 mm', true),
      length('rearClearance', 'Manual-required rear/service clearance', '0 mm', true),
      length('topClearance', 'Manual-required top clearance', '0 mm', true),
    ],
  },
  {
    mode: 'delivery-route',
    title: 'Object → delivery route',
    description:
      'Compare an upright item with door, hall, turn, stair and destination bottlenecks using dimensions you measure.',
    fields: [
      length('itemWidth', 'Item outside width, including packaging', '900 mm'),
      length('itemDepth', 'Item outside depth, including packaging', '700 mm'),
      length('itemHeight', 'Item outside height, including packaging', '1800 mm'),
      length('frontDoorWidth', 'Front door clear width', '900 mm'),
      length('frontDoorHeight', 'Front door clear height', '2000 mm'),
      length('hallWidth', 'Narrowest hall width', '1000 mm'),
      length('turnWidth', 'Turn landing clear width', '1800 mm'),
      length('turnDepth', 'Turn landing clear depth', '1800 mm'),
      length('stairWidth', 'Staircase clear width', '900 mm'),
      length('stairHeadroom', 'Minimum stair headroom', '2100 mm'),
      length('destinationDoorWidth', 'Destination door clear width', '900 mm'),
      length('destinationDoorHeight', 'Destination door clear height', '2000 mm'),
    ],
  },
  {
    mode: 'workspace-compatibility',
    title: 'Monitor ↔ arm ↔ desk compatibility',
    description:
      'Check monitor footprint, arm base, desk depth/thickness, load rating and an exact VESA pattern from the device manuals.',
    fields: [
      length('monitorWidth', 'Monitor outside width', '615 mm'),
      length('monitorDepth', 'Monitor outside depth', '250 mm'),
      length('deskWidth', 'Usable desk width', '1400 mm'),
      length('deskDepth', 'Usable desk depth', '700 mm'),
      length('armBaseDepth', 'Arm base/clamp depth on desk', '150 mm', true),
      length('deskThickness', 'Measured desk thickness at clamp', '25 mm'),
      length('clampMin', 'Arm clamp minimum thickness', '10 mm'),
      length('clampMax', 'Arm clamp maximum thickness', '80 mm'),
      decimal('monitorWeight', 'Monitor weight (kg)', '8'),
      decimal('armMaxLoad', 'Arm rated maximum load (kg)', '12'),
      text('monitorVesa', 'Monitor VESA pattern (for example 100x100)', '100x100'),
      text(
        'armVesaPatterns',
        'Exact VESA patterns supported by arm (comma separated)',
        '75x75, 100x100',
      ),
    ],
  },
  {
    mode: 'tv-fit',
    title: 'TV → stand or wall',
    description:
      'Check actual outside dimensions against a console or mounting area; wall mode also checks the exact mount pattern and weight rating.',
    fields: [
      select('setup', 'Installation type', 'stand', [
        { label: 'TV on a stand/console', value: 'stand' },
        { label: 'Wall-mounted TV', value: 'wall' },
      ]),
      length('tvWidth', 'TV outside width', '1230 mm'),
      length('tvHeight', 'TV outside height', '710 mm'),
      length('consoleWidth', 'Console usable width', '1400 mm', false, {
        name: 'setup',
        value: 'stand',
      }),
      length('consoleDepth', 'Console usable depth', '400 mm', false, {
        name: 'setup',
        value: 'stand',
      }),
      length('standWidth', 'Stand outside width', '650 mm', false, {
        name: 'setup',
        value: 'stand',
      }),
      length('standDepth', 'Stand outside depth', '300 mm', false, {
        name: 'setup',
        value: 'stand',
      }),
      length('soundbarWidth', 'Soundbar outside width (0 if not used)', '0 mm', true, {
        name: 'setup',
        value: 'stand',
      }),
      length('soundbarDepth', 'Soundbar outside depth (0 if not used)', '0 mm', true, {
        name: 'setup',
        value: 'stand',
      }),
      length('wallAreaWidth', 'Clear wall/alcove width', '1600 mm', false, {
        name: 'setup',
        value: 'wall',
      }),
      length('wallAreaHeight', 'Clear wall/alcove height', '1200 mm', false, {
        name: 'setup',
        value: 'wall',
      }),
      decimal('tvWeight', 'TV weight without stand (kg)', '22', { name: 'setup', value: 'wall' }),
      decimal('mountMaxLoad', 'Wall mount rated maximum load (kg)', '35', {
        name: 'setup',
        value: 'wall',
      }),
      text('tvVesa', 'TV VESA pattern', '400x300', { name: 'setup', value: 'wall' }),
      text(
        'mountVesaPatterns',
        'Exact VESA patterns supported by mount (comma separated)',
        '200x200, 400x300, 400x400',
        { name: 'setup', value: 'wall' },
      ),
    ],
  },
  {
    mode: 'home-gym',
    title: 'Equipment → home gym room',
    description:
      'Compare equipment footprint and ceiling height, then add operating zones that you select for the specific exercise and manual.',
    fields: [
      length('equipmentWidth', 'Equipment outside width', '1200 mm'),
      length('equipmentDepth', 'Equipment outside depth', '1800 mm'),
      length('equipmentHeight', 'Equipment outside height', '2100 mm'),
      length('roomWidth', 'Room inside width', '4000 mm'),
      length('roomDepth', 'Room inside depth', '4500 mm'),
      length('ceilingHeight', 'Clear ceiling height', '2500 mm'),
      length('sideOperating', 'Extra operating zone on each side (user selected)', '500 mm'),
      length('frontOperating', 'Extra operating space in front (user selected)', '1000 mm'),
      length('overheadOperating', 'Extra overhead space (manual/user selected)', '0 mm'),
    ],
  },
  {
    mode: 'storage',
    title: 'Objects → storage unit',
    description:
      'Estimate how many equal rectangular objects fit in one layer; enter a measured usable interior and aisle target.',
    fields: [
      length('itemWidth', 'Object outside width', '600 mm'),
      length('itemDepth', 'Object outside depth', '400 mm'),
      length('itemHeight', 'Object outside height', '500 mm'),
      length('spaceWidth', 'Usable storage width', '2400 mm'),
      length('spaceDepth', 'Usable storage depth', '1800 mm'),
      length('spaceHeight', 'Usable storage height', '2200 mm'),
      length('edgeClearance', 'Space reserved at each outer edge', '0 mm', true),
      length('itemGap', 'Gap between adjacent objects', '50 mm', true),
      count('requestedQuantity', 'Objects to store', '8', 1, 100),
      length('availableAisle', 'Measured aisle width', '900 mm', true),
      length('targetAisle', 'Aisle target you selected', '900 mm'),
    ],
  },
  {
    mode: 'pool-room',
    title: 'Pool table → game room',
    description:
      'Compare the measured table and cue length with room dimensions; cue clearance is calculated from the actual cue you enter.',
    fields: [
      length('tableWidth', 'Pool table outside width', '1400 mm'),
      length('tableLength', 'Pool table outside length', '2500 mm'),
      length('cueLength', 'Cue length', '1450 mm'),
      length('roomWidth', 'Room inside width', '4400 mm'),
      length('roomLength', 'Room inside length', '5500 mm'),
      length('extraClearance', 'Additional space beyond cue length (user selected)', '0 mm', true),
    ],
  },
  {
    mode: 'vehicle-garage',
    title: 'Vehicle → garage and access space',
    description:
      'Compare your measured vehicle, garage opening and parking space, then add door-access and overhead zones you choose.',
    fields: [
      length(
        'vehicleWidth',
        'Vehicle outside width in parking configuration (include mirrors/accessories as measured)',
        '1900 mm',
      ),
      length('vehicleLength', 'Vehicle outside length', '4800 mm'),
      length('vehicleHeight', 'Vehicle outside height (include roof equipment)', '1800 mm'),
      length('garageWidth', 'Garage clear inside width', '3600 mm'),
      length('garageLength', 'Garage clear inside depth', '6000 mm'),
      length('garageHeight', 'Garage clear ceiling height', '2400 mm'),
      length('garageOpeningWidth', 'Garage door clear opening width', '2400 mm'),
      length('garageOpeningHeight', 'Garage door clear opening height', '2200 mm'),
      length(
        'doorProjection',
        'Vehicle door projection beyond body on each side (measured)',
        '400 mm',
        true,
      ),
      length('sideAccess', 'Extra access space beyond open door (user selected)', '300 mm', true),
      length(
        'frontClearance',
        'Extra space in front of parked vehicle (user selected)',
        '500 mm',
        true,
      ),
      length('rearClearance', 'Extra space behind parked vehicle (user selected)', '500 mm', true),
      length('overheadClearance', 'Extra overhead space (user/manual selected)', '200 mm', true),
    ],
  },
  gardenDefinition({
    mode: 'garden-structure',
    title: 'Structure → garden / reverse sizing',
    description:
      'Check a shed, gazebo/pergola or garden office against a measured plot, or compare candidate structure footprints with your available space.',
    fields: [
      select('direction', 'Planning direction', 'structure-to-plot', [
        { label: 'I have a structure size', value: 'structure-to-plot' },
        { label: 'I have a plot and want to compare sizes', value: 'plot-to-structure' },
      ]),
      select('structureType', 'Structure type', 'shed', [
        { label: 'Shed', value: 'Shed' },
        { label: 'Gazebo or pergola', value: 'Gazebo/pergola' },
        { label: 'Garden office', value: 'Garden office' },
      ]),
      length('plotWidth', 'Usable plot width', '4.8 m'),
      length('plotDepth', 'Usable plot depth', '6.2 m'),
      length('bodyWidth', 'Structure body outside width', '2.44 m', false, {
        name: 'direction',
        value: 'structure-to-plot',
      }),
      length('bodyDepth', 'Structure body outside depth', '1.83 m', false, {
        name: 'direction',
        value: 'structure-to-plot',
      }),
      length('roofOverhangSide', 'Roof overhang beyond body on each side', '80 mm', true),
      length('roofOverhangFront', 'Front roof overhang', '80 mm', true),
      length('roofOverhangRear', 'Rear roof overhang', '80 mm', true),
      length('maintenanceLeft', 'Selected maintenance clearance on left', '400 mm', true),
      length('maintenanceRight', 'Selected maintenance clearance on right', '400 mm', true),
      length('maintenanceFront', 'Selected access space at front', '700 mm', true),
      length('maintenanceRear', 'Selected maintenance clearance at rear', '500 mm', true),
      length('doorProjection', 'Measured door projection beyond the front wall', '760 mm', true),
      length('doorPathAvailable', 'Measured clear path to the door', '1600 mm', true),
      length(
        'doorPathTarget',
        'Extra path width you selected beyond the door projection',
        '700 mm',
        true,
      ),
      text(
        'candidateSizes',
        'Candidate body sizes, separated by semicolons (width x depth with units)',
        '1.8 m x 1.2 m; 2.4 m x 1.8 m; 3.0 m x 1.8 m; 3.0 m x 2.4 m; 3.6 m x 2.4 m',
        { name: 'direction', value: 'plot-to-structure' },
      ),
    ],
  }),
  gardenDefinition({
    mode: 'garden-patio-dining',
    title: 'Patio furniture → patio or gazebo',
    description:
      'Reuse the dining table/chair envelope against a measured patio or actual gazebo post-to-post clearance.',
    fields: [
      length('advertisedWidth', 'Advertised gazebo/structure width (reference only)', '3.0 m'),
      length('advertisedDepth', 'Advertised gazebo/structure depth (reference only)', '3.0 m'),
      length('clearWidth', 'Usable clear width between posts/obstacles', '2.86 m'),
      length('clearDepth', 'Usable clear depth between posts/obstacles', '2.86 m'),
      length('tableWidth', 'Table outside width', '900 mm'),
      length('tableLength', 'Table outside length', '1800 mm'),
      length('chairWidth', 'Measured chair width along table edge', '450 mm'),
      length('chairEnvelope', 'Pulled-out chair envelope from table edge', '550 mm'),
      count('chairsPerLongSide', 'Chairs per long side', '2', 0, 6),
      count('chairsPerEnd', 'Chairs at each end', '1', 0, 2),
      length('walkingClearance', 'Extra user-selected circulation beyond chairs', '400 mm', true),
      select('orientation', 'Table orientation', 'depth-width', [
        { label: 'Try both orientations', value: 'auto' },
        { label: 'Table width along patio width', value: 'width-depth' },
        { label: 'Rotate table 90 degrees', value: 'depth-width' },
      ]),
    ],
  }),
  gardenDefinition({
    mode: 'garden-shed-storage',
    title: 'Shed interior storage',
    description:
      'Estimate a single-layer grid for repeated equal items inside a measured shed while preserving an aisle target.',
    fields: [
      length('insideWidth', 'Shed clear inside width', '2350 mm'),
      length('insideDepth', 'Shed clear inside depth', '1750 mm'),
      length('insideHeight', 'Shed clear inside height', '2000 mm'),
      length('itemWidth', 'One stored item outside width', '600 mm'),
      length('itemDepth', 'One stored item outside depth', '800 mm'),
      length('itemHeight', 'One stored item outside height', '1200 mm'),
      count('itemQuantity', 'Number of identical items', '2', 1, 100),
      length('itemGap', 'Gap between identical items', '0 mm', true),
      length('aisleWidth', 'Measured clear aisle width', '700 mm', true),
      length('aisleTarget', 'Aisle width you selected', '600 mm'),
    ],
  }),
  gardenDefinition({
    mode: 'garden-greenhouse',
    title: 'Greenhouse → garden with staging and aisle',
    description:
      'Check the exterior greenhouse envelope against the plot and the interior staging/central aisle layout against the clear inside width.',
    fields: [
      length('plotWidth', 'Usable plot width', '4.0 m'),
      length('plotDepth', 'Usable plot depth', '5.0 m'),
      length('greenhouseWidth', 'Greenhouse outside width', '2.4 m'),
      length('greenhouseDepth', 'Greenhouse outside depth', '3.0 m'),
      length('roofOverhangSide', 'Roof/eave overhang on each side', '50 mm', true),
      length('roofOverhangEnd', 'Roof/eave overhang at each end', '50 mm', true),
      length('maintenanceSide', 'User-selected maintenance space on each side', '500 mm', true),
      length('maintenanceEnd', 'User-selected maintenance space at each end', '500 mm', true),
      length('insideClearWidth', 'Greenhouse clear inside width', '2200 mm'),
      length('stagingDepth', 'Staging/bench depth on each side', '450 mm', true),
      length('centralAisleTarget', 'Central aisle width target you selected', '600 mm'),
      length('doorClearWidth', 'Greenhouse door clear width', '700 mm'),
      length(
        'wheelbarrowWidth',
        'Equipment width to pass through door (0 if not checked)',
        '600 mm',
        true,
      ),
    ],
  }),
  gardenDefinition({
    mode: 'garden-hot-tub',
    title: 'Hot tub → patio with manual service access',
    description:
      'Compare the tub footprint with the patio and add the service/cover clearances required by your exact tub manual.',
    fields: [
      length('tubWidth', 'Hot tub outside width', '2200 mm'),
      length('tubDepth', 'Hot tub outside depth', '2200 mm'),
      length('tubHeight', 'Hot tub outside height', '950 mm'),
      length('clearHeight', 'Clear overhead height above patio', '3 m'),
      length('patioWidth', 'Usable patio width', '4.0 m'),
      length('patioDepth', 'Usable patio depth', '4.0 m'),
      length('serviceSide', 'Manual-required service space on each side', '500 mm', true),
      length('serviceFront', 'Manual-required access at the service panel', '800 mm', true),
      length('coverLiftHeight', 'Cover-removal/lift space above tub (manual/user)', '500 mm', true),
    ],
  }),
  gardenDefinition({
    mode: 'garden-outdoor-kitchen',
    title: 'Outdoor kitchen → patio with work/service zones',
    description:
      'Check the measured kitchen run and user/manual-selected working and service spaces against a patio.',
    fields: [
      length('runWidth', 'Outdoor kitchen run outside width', '2400 mm'),
      length('runDepth', 'Outdoor kitchen outside depth', '700 mm'),
      length('runHeight', 'Outdoor kitchen height', '950 mm'),
      length('clearHeight', 'Clear overhead height above kitchen area', '3 m'),
      length('patioWidth', 'Usable patio width', '4.0 m'),
      length('patioDepth', 'Usable patio depth', '4.0 m'),
      length('sideService', 'Manual-required side/service space each side', '300 mm', true),
      length('frontWorkZone', 'Working space in front (manual/user selected)', '1000 mm', true),
      length('rearService', 'Rear service space (manual/user selected)', '0 mm', true),
    ],
  }),
  gardenDefinition({
    mode: 'garden-play-equipment',
    title: 'Play equipment → garden (manufacturer use zone)',
    description:
      'Compare the equipment footprint and manufacturer-specified use zone with a plot. No generic child-safety clearance is supplied.',
    fields: [
      length('equipmentWidth', 'Equipment outside width', '2500 mm'),
      length('equipmentDepth', 'Equipment outside depth', '2500 mm'),
      length('equipmentHeight', 'Equipment outside height', '2200 mm'),
      length('clearHeight', 'Clear overhead height (0 if open sky)', '0 mm', true),
      length('plotWidth', 'Usable plot width', '5.0 m'),
      length('plotDepth', 'Usable plot depth', '5.0 m'),
      select('useZoneSource', 'Use-zone source status', 'not-verified', [
        { label: 'Not yet checked against manufacturer instructions', value: 'not-verified' },
        { label: 'I entered the exact manufacturer use zone', value: 'manual' },
      ]),
      text(
        'manualReference',
        'Manual/model reference for use zone (required for a complete check)',
        'not entered',
        { name: 'useZoneSource', value: 'manual' },
      ),
      length('useZoneLeft', 'Manufacturer use zone left', '500 mm', true),
      length('useZoneRight', 'Manufacturer use zone right', '500 mm', true),
      length('useZoneFront', 'Manufacturer use zone front', '500 mm', true),
      length('useZoneRear', 'Manufacturer use zone rear', '500 mm', true),
    ],
  }),
];

export function getFitServiceDefinition(mode: FitServiceMode): FitServiceDefinition {
  const definition = FIT_SERVICE_DEFINITIONS.find((item) => item.mode === mode);
  if (!definition) throw new RangeError(`Unknown fit service mode '${mode}'.`);
  return definition;
}

export function getFitServiceDefinitions(category: FitServiceCategory): FitServiceDefinition[] {
  return FIT_SERVICE_DEFINITIONS.filter(
    (definition) => (definition.category ?? 'core') === category,
  );
}

export function getFitServiceDefaults(mode: FitServiceMode): FitServiceValues {
  return getLengthDefaults(getFitServiceDefinition(mode));
}

export function getFitServiceModeForRoute(mode: string | null): FitServiceMode | null {
  return FIT_SERVICE_DEFINITIONS.some((definition) => definition.mode === mode)
    ? (mode as FitServiceMode)
    : null;
}

export interface FitServiceCompatibility {
  label: string;
  compatible: boolean;
  detail: string;
}

export interface FitServiceCandidate {
  label: string;
  state: 'fits' | 'tight' | 'does_not_fit';
  detail: string;
}

export interface FitServicePlan {
  checks: DimensionCheck[];
  assumptions: string[];
  compatibility: FitServiceCompatibility[];
  capacity?: number;
  capacityRequested?: number;
  extra?: string;
  candidates?: FitServiceCandidate[];
  reviewRequired?: string[];
}

function getNumber(values: FitServiceValues, key: string): number {
  const value = values[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError(`${key} must be a finite number.`);
  }
  return value;
}

function positive(values: FitServiceValues, key: string): number {
  const value = getNumber(values, key);
  if (value <= 0) throw new RangeError(`${key} must be greater than zero.`);
  return value;
}

function nonNegative(values: FitServiceValues, key: string): number {
  const value = getNumber(values, key);
  if (value < 0) throw new RangeError(`${key} must be non-negative.`);
  return value;
}

function textValue(values: FitServiceValues, key: string): string {
  const value = values[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new RangeError(`${key} must contain a value.`);
  }
  return value.trim();
}

function dimension(
  dimensionName: string,
  label: string,
  minimumMm: number,
  availableMm: number,
  recommendedMm?: number,
): DimensionCheck {
  return {
    dimension: dimensionName,
    label,
    minimumMm,
    ...(recommendedMm === undefined ? {} : { recommendedMm }),
    availableMm,
  };
}

function compatiblePattern(required: string, supported: string): boolean {
  return supported
    .split(',')
    .map((pattern) => pattern.trim().toLowerCase())
    .filter(Boolean)
    .includes(required.trim().toLowerCase());
}

function parseCandidateSizes(source: string): Array<{
  label: string;
  widthMm: number;
  depthMm: number;
}> {
  const candidates = source
    .split(/[;\n]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((label) => {
      const dimensions = label.split(/\s*[x×]\s*/i);
      if (dimensions.length !== 2) {
        throw new RangeError(`Candidate '${label}' must be width × depth with units.`);
      }
      const width = parseLength(dimensions[0]!);
      const depth = parseLength(dimensions[1]!);
      if (!width.ok || !depth.ok || width.valueMm <= 0 || depth.valueMm <= 0) {
        throw new RangeError(`Candidate '${label}' needs two positive dimensions with units.`);
      }
      return { label, widthMm: width.valueMm, depthMm: depth.valueMm };
    });
  if (candidates.length === 0) throw new RangeError('Enter at least one candidate structure size.');
  return candidates;
}

/** Builds the physical dimensions and explicit compatibility rules for all fit-service modes. */
export function buildFitServicePlan(
  mode: FitServiceMode,
  values: FitServiceValues,
): FitServicePlan {
  switch (mode) {
    case 'appliance-install': {
      const width = positive(values, 'itemWidth');
      const depth = positive(values, 'itemDepth');
      const height = positive(values, 'itemHeight');
      const openingWidth = positive(values, 'openingWidth');
      const openingDepth = positive(values, 'openingDepth');
      const openingHeight = positive(values, 'openingHeight');
      const side = nonNegative(values, 'sideClearance');
      const rear = nonNegative(values, 'rearClearance');
      const top = nonNegative(values, 'topClearance');
      return {
        checks: [
          dimension(
            'appliance_width',
            'appliance and side installation space',
            width,
            openingWidth,
            width + side * 2,
          ),
          dimension(
            'appliance_depth',
            'appliance and rear/service installation space',
            depth,
            openingDepth,
            depth + rear,
          ),
          dimension(
            'appliance_height',
            'appliance and top installation space',
            height,
            openingHeight,
            height + top,
          ),
        ],
        compatibility: [],
        assumptions: [
          'Opening values are clear usable interior dimensions, not outside cabinet dimensions.',
          'Installation clearances are user-entered from the exact model manual. Zero means no extra installation margin was included; Fitwise supplies no default safety or ventilation minimum.',
          'This mode does not model hoses, plugs, doors, packaging or delivery route.',
        ],
      };
    }
    case 'delivery-route': {
      const width = positive(values, 'itemWidth');
      const depth = positive(values, 'itemDepth');
      const height = positive(values, 'itemHeight');
      const narrowFace = Math.min(width, depth);
      const turnDiagonal = Math.hypot(width, depth);
      if (!Number.isFinite(turnDiagonal))
        throw new RangeError('Item turning envelope must be finite.');
      return {
        checks: [
          dimension(
            'front_door_width',
            'front door width (upright, no tilt)',
            narrowFace,
            positive(values, 'frontDoorWidth'),
          ),
          dimension(
            'front_door_height',
            'front door height (upright, no tilt)',
            height,
            positive(values, 'frontDoorHeight'),
          ),
          dimension(
            'hall_width',
            'hall clear width (upright)',
            narrowFace,
            positive(values, 'hallWidth'),
          ),
          dimension(
            'turn_width',
            'turn landing width (conservative diagonal envelope)',
            turnDiagonal,
            positive(values, 'turnWidth'),
          ),
          dimension(
            'turn_depth',
            'turn landing depth (conservative diagonal envelope)',
            turnDiagonal,
            positive(values, 'turnDepth'),
          ),
          dimension(
            'stair_width',
            'stair clear width (upright)',
            narrowFace,
            positive(values, 'stairWidth'),
          ),
          dimension(
            'stair_headroom',
            'stair headroom (upright, no tilt)',
            height,
            positive(values, 'stairHeadroom'),
          ),
          dimension(
            'destination_door_width',
            'destination door width (upright)',
            narrowFace,
            positive(values, 'destinationDoorWidth'),
          ),
          dimension(
            'destination_door_height',
            'destination door height (upright, no tilt)',
            height,
            positive(values, 'destinationDoorHeight'),
          ),
        ],
        compatibility: [],
        assumptions: [
          'The item is carried upright and may be yawed so its narrower base dimension faces across an opening.',
          'A 90-degree turn uses a conservative circumscribed diagonal envelope, which can reject paths that skilled movers might negotiate; it is not a motion simulation.',
          'Stairs are checked only for clear width and headroom. Tilt, lifting path, slope, handrails, landings between flights, packaging flex and door hardware are not simulated.',
        ],
      };
    }
    case 'workspace-compatibility': {
      const monitorWidth = positive(values, 'monitorWidth');
      const monitorDepth = positive(values, 'monitorDepth');
      const deskWidth = positive(values, 'deskWidth');
      const deskDepth = positive(values, 'deskDepth');
      const armBaseDepth = nonNegative(values, 'armBaseDepth');
      const thickness = positive(values, 'deskThickness');
      const clampMin = positive(values, 'clampMin');
      const clampMax = positive(values, 'clampMax');
      const weight = positive(values, 'monitorWeight');
      const armMaxLoad = positive(values, 'armMaxLoad');
      const monitorVesa = textValue(values, 'monitorVesa');
      const armVesaPatterns = textValue(values, 'armVesaPatterns');
      if (clampMin > clampMax) throw new RangeError('Clamp minimum cannot exceed clamp maximum.');
      return {
        checks: [
          dimension('monitor_desk_width', 'monitor width on desk', monitorWidth, deskWidth),
          dimension(
            'monitor_desk_depth',
            'monitor and arm base depth on desk',
            monitorDepth + armBaseDepth,
            deskDepth,
          ),
          dimension('desk_clamp_min', 'desk thickness above clamp minimum', clampMin, thickness),
          dimension('desk_clamp_max', 'desk thickness below clamp maximum', thickness, clampMax),
        ],
        compatibility: [
          {
            label: 'Monitor weight within arm rating',
            compatible: weight <= armMaxLoad,
            detail: `${weight} kg monitor versus ${armMaxLoad} kg arm rating.`,
          },
          {
            label: 'VESA pattern supported',
            compatible: compatiblePattern(monitorVesa, armVesaPatterns),
            detail: `${monitorVesa} required; checked against the comma-separated arm pattern list.`,
          },
        ],
        assumptions: [
          'Use the monitor without its stand for weight and outer dimensions; the entered arm-base depth is added to the monitor depth on the desk.',
          'VESA compatibility requires an exact pattern match in the supported-pattern list. Confirm adapters, fasteners and model-specific limits with the manuals.',
          'The result does not model arm reach, joint collision, edge clamp shape or wall clearance.',
        ],
      };
    }
    case 'tv-fit': {
      const setup = textValue(values, 'setup');
      const tvWidth = positive(values, 'tvWidth');
      const tvHeight = positive(values, 'tvHeight');
      if (setup === 'stand') {
        const consoleWidth = positive(values, 'consoleWidth');
        const consoleDepth = positive(values, 'consoleDepth');
        const standWidth = positive(values, 'standWidth');
        const standDepth = positive(values, 'standDepth');
        const soundbarWidth = nonNegative(values, 'soundbarWidth');
        const soundbarDepth = nonNegative(values, 'soundbarDepth');
        const checks = [
          dimension('tv_console_width', 'TV width on console', tvWidth, consoleWidth),
          dimension(
            'stand_console_width',
            'stand footprint width on console',
            standWidth,
            consoleWidth,
          ),
          dimension(
            'stand_console_depth',
            'stand footprint depth on console',
            standDepth,
            consoleDepth,
          ),
        ];
        if (soundbarWidth > 0)
          checks.push(
            dimension(
              'soundbar_console_width',
              'soundbar width on console',
              soundbarWidth,
              consoleWidth,
            ),
          );
        if (soundbarDepth > 0)
          checks.push(
            dimension(
              'soundbar_console_depth',
              'soundbar depth on console',
              soundbarDepth,
              consoleDepth,
            ),
          );
        return {
          checks,
          compatibility: [],
          assumptions: [
            'TV and stand dimensions are user-entered outside measurements, not inferred from advertised diagonal size.',
            'TV, stand and soundbar each fit the console surface independently; their combined placement and overlap are not optimized.',
            'This mode does not check viewing distance, wall mount patterns, cables or ventilation.',
          ],
        };
      }
      if (setup === 'wall') {
        const vesa = textValue(values, 'tvVesa');
        const mountPatterns = textValue(values, 'mountVesaPatterns');
        const tvWeight = positive(values, 'tvWeight');
        const mountMax = positive(values, 'mountMaxLoad');
        return {
          checks: [
            dimension(
              'tv_wall_width',
              'TV width in wall/alcove area',
              tvWidth,
              positive(values, 'wallAreaWidth'),
            ),
            dimension(
              'tv_wall_height',
              'TV height in wall/alcove area',
              tvHeight,
              positive(values, 'wallAreaHeight'),
            ),
          ],
          compatibility: [
            {
              label: 'TV VESA pattern supported',
              compatible: compatiblePattern(vesa, mountPatterns),
              detail: `${vesa} required; checked against the mount's supported-pattern list.`,
            },
            {
              label: 'TV weight within mount rating',
              compatible: tvWeight <= mountMax,
              detail: `${tvWeight} kg TV versus ${mountMax} kg mount rating.`,
            },
          ],
          assumptions: [
            'TV outside width and height, mount limits and VESA pattern must be taken from the exact model manuals.',
            'The wall check is rectangular only and does not establish stud, substrate, fastener or electrical suitability.',
          ],
        };
      }
      throw new RangeError(`Unsupported TV setup '${setup}'.`);
    }
    case 'home-gym': {
      const width = positive(values, 'equipmentWidth');
      const depth = positive(values, 'equipmentDepth');
      const height = positive(values, 'equipmentHeight');
      const side = nonNegative(values, 'sideOperating');
      const front = nonNegative(values, 'frontOperating');
      const overhead = nonNegative(values, 'overheadOperating');
      return {
        checks: [
          dimension(
            'gym_room_width',
            'equipment and side operating space',
            width,
            positive(values, 'roomWidth'),
            width + side * 2,
          ),
          dimension(
            'gym_room_depth',
            'equipment and front operating space',
            depth,
            positive(values, 'roomDepth'),
            depth + front,
          ),
          dimension(
            'gym_room_height',
            'equipment and overhead space',
            height,
            positive(values, 'ceilingHeight'),
            height + overhead,
          ),
        ],
        compatibility: [],
        assumptions: [
          'Operating and overhead spaces are user-selected or copied from the exact equipment manual; no Fitwise safety zone is inferred.',
          'The calculation does not model movement trajectories, flooring, anchoring, noise or safe lifting practice.',
        ],
      };
    }
    case 'storage': {
      const requestedQuantity = getNumber(values, 'requestedQuantity');
      if (
        !Number.isInteger(requestedQuantity) ||
        requestedQuantity < 1 ||
        requestedQuantity > 100
      ) {
        throw new RangeError('requestedQuantity must be a whole number from 1 to 100.');
      }
      const aisleTarget = positive(values, 'targetAisle');
      const availableAisle = nonNegative(values, 'availableAisle');
      const fit = buildObjectFitPlan({
        objectWidthMm: positive(values, 'itemWidth'),
        objectDepthMm: positive(values, 'itemDepth'),
        objectHeightMm: positive(values, 'itemHeight'),
        spaceWidthMm: positive(values, 'spaceWidth'),
        spaceDepthMm: positive(values, 'spaceDepth'),
        spaceHeightMm: positive(values, 'spaceHeight'),
        clearanceEachSideMm: nonNegative(values, 'edgeClearance'),
        itemGapMm: nonNegative(values, 'itemGap'),
      });
      return {
        checks: [
          ...fit.checks,
          dimension(
            'storage_aisle',
            'measured aisle against selected aisle target',
            aisleTarget,
            availableAisle,
          ),
        ],
        compatibility: [
          {
            label: 'Requested count fits in a single layer',
            compatible: fit.quantityCapacity >= requestedQuantity,
            detail: `Estimated grid capacity ${fit.quantityCapacity}; requested ${requestedQuantity}.`,
          },
        ],
        assumptions: [
          'Capacity is a rectangular single-layer grid estimate across both floor orientations.',
          'Stacking, load rating, mixed objects, supports and aisle routing are not modeled.',
          'The aisle target is user-selected, not an accessibility or building-code claim.',
        ],
        capacity: fit.quantityCapacity,
        capacityRequested: requestedQuantity,
      };
    }
    case 'pool-room': {
      const tableWidth = positive(values, 'tableWidth');
      const tableLength = positive(values, 'tableLength');
      const cue = positive(values, 'cueLength');
      const extra = nonNegative(values, 'extraClearance');
      return {
        checks: [
          dimension(
            'pool_room_width',
            'table plus cue-length clearance across room',
            tableWidth + cue * 2,
            positive(values, 'roomWidth'),
            tableWidth + (cue + extra) * 2,
          ),
          dimension(
            'pool_room_length',
            'table plus cue-length clearance along room',
            tableLength + cue * 2,
            positive(values, 'roomLength'),
            tableLength + (cue + extra) * 2,
          ),
        ],
        compatibility: [],
        assumptions: [
          'Cue length is the measured cue used for play. The envelope reserves cue length at each table edge.',
          'The extra margin is user-selected. The model does not simulate angled shots, player stance, cue elevation, table pockets or other furniture.',
        ],
      };
    }
    case 'vehicle-garage': {
      const width = positive(values, 'vehicleWidth');
      const length = positive(values, 'vehicleLength');
      const height = positive(values, 'vehicleHeight');
      const doorProjection = nonNegative(values, 'doorProjection');
      const sideAccess = nonNegative(values, 'sideAccess');
      const frontClearance = nonNegative(values, 'frontClearance');
      const rearClearance = nonNegative(values, 'rearClearance');
      const overheadClearance = nonNegative(values, 'overheadClearance');
      const doorAccessWidth = width + (doorProjection + sideAccess) * 2;
      if (!Number.isFinite(doorAccessWidth)) {
        throw new RangeError('Vehicle door-access envelope must remain finite.');
      }
      return {
        checks: [
          dimension(
            'vehicle_garage_width',
            'vehicle and open-door access width',
            width,
            positive(values, 'garageWidth'),
            doorAccessWidth,
          ),
          dimension(
            'vehicle_garage_length',
            'parked vehicle length and selected front/rear space',
            length,
            positive(values, 'garageLength'),
            length + frontClearance + rearClearance,
          ),
          dimension(
            'vehicle_garage_height',
            'vehicle height and selected overhead space',
            height,
            positive(values, 'garageHeight'),
            height + overheadClearance,
          ),
          dimension(
            'vehicle_door_opening_width',
            'vehicle width at garage door opening',
            width,
            positive(values, 'garageOpeningWidth'),
          ),
          dimension(
            'vehicle_door_opening_height',
            'vehicle height at garage door opening',
            height,
            positive(values, 'garageOpeningHeight'),
          ),
        ],
        compatibility: [],
        assumptions: [
          'Vehicle dimensions are user-entered for the actual mirror/accessory configuration. Fitwise has no vehicle specification database in this mode.',
          'Door projection and extra access/parking/overhead space are user-selected measurements, not universal parking, safety or accessibility standards.',
          'The check does not model driveway approach angle, steering path, ramps, lift equipment, garage-door tracks, mirrors folding, or opening/closing maneuvers.',
        ],
      };
    }
    case 'garden-structure': {
      const direction = textValue(values, 'direction');
      const structureType = textValue(values, 'structureType');
      const plotWidth = positive(values, 'plotWidth');
      const plotDepth = positive(values, 'plotDepth');
      const overhangSide = nonNegative(values, 'roofOverhangSide');
      const overhangFront = nonNegative(values, 'roofOverhangFront');
      const overhangRear = nonNegative(values, 'roofOverhangRear');
      const maintenanceLeft = nonNegative(values, 'maintenanceLeft');
      const maintenanceRight = nonNegative(values, 'maintenanceRight');
      const maintenanceFront = nonNegative(values, 'maintenanceFront');
      const maintenanceRear = nonNegative(values, 'maintenanceRear');
      const doorProjection = nonNegative(values, 'doorProjection');
      const doorPathAvailable = nonNegative(values, 'doorPathAvailable');
      const doorPathTarget = nonNegative(values, 'doorPathTarget');
      const assumptions = [
        'Use the structure body outside dimensions and actual roof/eave overhang, not retailer nameplate size. Plot dimensions are the usable measured rectangle.',
        'Maintenance clearances and the door path are user-selected. They are not planning-permission, building-code or universal access requirements.',
        'The model is a 2D rectangular envelope. It does not test slopes, fences, trees, foundations, roof runoff, anchoring or planning permission.',
      ];
      const buildChecks = (bodyWidth: number, bodyDepth: number): DimensionCheck[] => [
        dimension(
          'garden_structure_width',
          'roof footprint width and side maintenance space',
          bodyWidth + overhangSide * 2,
          plotWidth,
          bodyWidth + overhangSide * 2 + maintenanceLeft + maintenanceRight,
        ),
        dimension(
          'garden_structure_depth',
          'roof footprint depth, door swing and front/rear access',
          bodyDepth + overhangFront + overhangRear + doorProjection,
          plotDepth,
          bodyDepth +
            overhangFront +
            overhangRear +
            doorProjection +
            maintenanceFront +
            maintenanceRear,
        ),
        dimension(
          'garden_structure_door_path',
          'door projection and selected approach path width',
          doorProjection,
          doorPathAvailable,
          doorProjection + doorPathTarget,
        ),
      ];

      if (direction === 'structure-to-plot') {
        const bodyWidth = positive(values, 'bodyWidth');
        const bodyDepth = positive(values, 'bodyDepth');
        return {
          checks: buildChecks(bodyWidth, bodyDepth),
          compatibility: [],
          assumptions,
          extra: `${structureType} body footprint ${formatMeasurement(bodyWidth)} × ${formatMeasurement(bodyDepth)}; roof, maintenance and door-access envelopes are checked separately.`,
        };
      }
      if (direction !== 'plot-to-structure') {
        throw new RangeError(`Unsupported garden structure direction '${direction}'.`);
      }
      const candidates = parseCandidateSizes(textValue(values, 'candidateSizes')).map(
        (candidate) => {
          const checks = buildChecks(candidate.widthMm, candidate.depthMm);
          const result = evaluateFit(checks);
          return {
            ...candidate,
            checks,
            state: result.state,
            area: candidate.widthMm * candidate.depthMm,
          };
        },
      );
      const rank = { fits: 0, tight: 1, does_not_fit: 2 } as const;
      candidates.sort((a, b) => rank[a.state] - rank[b.state] || b.area - a.area);
      const best = candidates[0]!;
      const maxBodyWidth = Math.max(
        0,
        plotWidth - overhangSide * 2 - maintenanceLeft - maintenanceRight,
      );
      const maxBodyDepth = Math.max(
        0,
        plotDepth -
          overhangFront -
          overhangRear -
          doorProjection -
          maintenanceFront -
          maintenanceRear,
      );
      return {
        checks: best.checks,
        compatibility: [],
        assumptions,
        candidates: candidates.map((candidate) => ({
          label: candidate.label,
          state: candidate.state,
          detail:
            candidate.state === 'fits'
              ? 'Fits physical envelope and all selected targets.'
              : candidate.state === 'tight'
                ? 'Physical footprint fits, but one or more selected targets are short.'
                : 'Does not fit the physical plot/door-path dimensions.',
        })),
        extra: `After your overhang, maintenance and door-path inputs, the maximum rectangular body envelope is about ${formatMeasurement(maxBodyWidth)} × ${formatMeasurement(maxBodyDepth)}. The “best candidate” is the largest option from your entered list that meets the selected targets when any do.`,
      };
    }
    case 'garden-patio-dining': {
      const advertisedWidth = positive(values, 'advertisedWidth');
      const advertisedDepth = positive(values, 'advertisedDepth');
      const clearWidth = positive(values, 'clearWidth');
      const clearDepth = positive(values, 'clearDepth');
      const plan = buildDiningFitPlan({
        roomWidthMm: clearWidth,
        roomLengthMm: clearDepth,
        tableWidthMm: positive(values, 'tableWidth'),
        tableLengthMm: positive(values, 'tableLength'),
        chairWidthMm: positive(values, 'chairWidth'),
        chairEnvelopeDepthMm: positive(values, 'chairEnvelope'),
        chairsPerLongSide: getNumber(values, 'chairsPerLongSide'),
        chairsPerEnd: getNumber(values, 'chairsPerEnd'),
        walkingClearanceMm: nonNegative(values, 'walkingClearance'),
        orientation: textValue(values, 'orientation') as 'auto' | 'width-depth' | 'depth-width',
      });
      return {
        checks: plan.checks,
        compatibility: [],
        assumptions: [
          'The dining model reuses the rectangular table/chair envelope. Chair/table values are measured examples; the movement target is user-selected.',
          'Actual clear post-to-post width/depth are used as available space; the advertised roof footprint is shown for comparison only.',
          'Roof legs, guy ropes, sidewalls, rain/runoff, anchoring and non-rectangular patios are not modeled.',
        ],
        extra: `Advertised footprint: ${formatMeasurement(advertisedWidth)} × ${formatMeasurement(advertisedDepth)}. Clear post-to-post space used by the calculation: ${formatMeasurement(clearWidth)} × ${formatMeasurement(clearDepth)}.`,
      };
    }
    case 'garden-shed-storage': {
      const requestedQuantity = getNumber(values, 'itemQuantity');
      if (
        !Number.isInteger(requestedQuantity) ||
        requestedQuantity < 1 ||
        requestedQuantity > 100
      ) {
        throw new RangeError('itemQuantity must be a whole number from 1 to 100.');
      }
      const fit = buildObjectFitPlan({
        objectWidthMm: positive(values, 'itemWidth'),
        objectDepthMm: positive(values, 'itemDepth'),
        objectHeightMm: positive(values, 'itemHeight'),
        spaceWidthMm: positive(values, 'insideWidth'),
        spaceDepthMm: positive(values, 'insideDepth'),
        spaceHeightMm: positive(values, 'insideHeight'),
        itemGapMm: nonNegative(values, 'itemGap'),
        requestedQuantity,
      });
      return {
        checks: [
          ...fit.checks,
          dimension(
            'shed_storage_aisle',
            'clear aisle against selected target',
            positive(values, 'aisleTarget'),
            nonNegative(values, 'aisleWidth'),
          ),
        ],
        compatibility: [
          {
            label: 'Requested repeated-item count fits in one layer',
            compatible: fit.quantityCapacity >= requestedQuantity,
            detail: `Single-layer grid capacity ${fit.quantityCapacity}; ${requestedQuantity} requested.`,
          },
        ],
        assumptions: [
          'This initial shed planner fits repeated identical rectangular items in a single layer. It does not place mixed mower/bike/shelf footprints together.',
          'Stacking, wall hooks, load limits, door swing and route to the stored item are not modeled.',
          'The clear aisle is a user-selected target, not a regulatory or universal minimum.',
        ],
        capacity: fit.quantityCapacity,
        capacityRequested: requestedQuantity,
      };
    }
    case 'garden-greenhouse': {
      const insideWidth = positive(values, 'insideClearWidth');
      const staging = nonNegative(values, 'stagingDepth');
      const aisleAvailable = Math.max(0, insideWidth - staging * 2);
      const wheelbarrowWidth = nonNegative(values, 'wheelbarrowWidth');
      const checks: DimensionCheck[] = [
        dimension(
          'greenhouse_plot_width',
          'greenhouse roof footprint and side maintenance space',
          positive(values, 'greenhouseWidth') + nonNegative(values, 'roofOverhangSide') * 2,
          positive(values, 'plotWidth'),
          positive(values, 'greenhouseWidth') +
            nonNegative(values, 'roofOverhangSide') * 2 +
            nonNegative(values, 'maintenanceSide') * 2,
        ),
        dimension(
          'greenhouse_plot_depth',
          'greenhouse roof footprint and end maintenance space',
          positive(values, 'greenhouseDepth') + nonNegative(values, 'roofOverhangEnd') * 2,
          positive(values, 'plotDepth'),
          positive(values, 'greenhouseDepth') +
            nonNegative(values, 'roofOverhangEnd') * 2 +
            nonNegative(values, 'maintenanceEnd') * 2,
        ),
        dimension(
          'greenhouse_central_aisle',
          'central aisle after staging benches',
          0,
          aisleAvailable,
          positive(values, 'centralAisleTarget'),
        ),
      ];
      if (wheelbarrowWidth > 0) {
        checks.push(
          dimension(
            'greenhouse_door_width',
            'wheelbarrow width through greenhouse door',
            wheelbarrowWidth,
            positive(values, 'doorClearWidth'),
          ),
        );
      }
      return {
        checks,
        compatibility: [],
        assumptions: [
          'Staging depth is entered on each side; the remaining clear width is compared with a user-selected central aisle target.',
          'Ventilation, sunlight, temperature, drainage, glazing, wind loading and foundations are outside this footprint calculation.',
          'Outside maintenance space is user-selected, not a horticultural or building-code minimum.',
        ],
        extra: `Clear aisle after the entered staging depth: ${formatMeasurement(aisleAvailable)}.`,
      };
    }
    case 'garden-hot-tub': {
      const width = positive(values, 'tubWidth');
      const depth = positive(values, 'tubDepth');
      const height = positive(values, 'tubHeight');
      const side = nonNegative(values, 'serviceSide');
      const front = nonNegative(values, 'serviceFront');
      const overhead = nonNegative(values, 'coverLiftHeight');
      return {
        checks: [
          dimension(
            'hot_tub_patio_width',
            'tub footprint and side service space',
            width,
            positive(values, 'patioWidth'),
            width + side * 2,
          ),
          dimension(
            'hot_tub_patio_depth',
            'tub footprint and front service space',
            depth,
            positive(values, 'patioDepth'),
            depth + front,
          ),
          dimension(
            'hot_tub_overhead',
            'cover lift/overhead space',
            height,
            positive(values, 'clearHeight'),
            height + overhead,
          ),
        ],
        compatibility: [],
        assumptions: [
          'Service-panel and cover-removal clearances must come from the exact tub manual; zeros omit those optional targets.',
          'No filled-water weight, base strength, drainage, electrical or access-path assessment is made.',
          'The extra cover lift space is user/manual selected, not a generic overhead minimum.',
        ],
      };
    }
    case 'garden-outdoor-kitchen': {
      const width = positive(values, 'runWidth');
      const depth = positive(values, 'runDepth');
      const height = positive(values, 'runHeight');
      const side = nonNegative(values, 'sideService');
      const front = nonNegative(values, 'frontWorkZone');
      const rear = nonNegative(values, 'rearService');
      return {
        checks: [
          dimension(
            'outdoor_kitchen_patio_width',
            'kitchen run and side service space',
            width,
            positive(values, 'patioWidth'),
            width + side * 2,
          ),
          dimension(
            'outdoor_kitchen_patio_depth',
            'kitchen run and working/service depth',
            depth,
            positive(values, 'patioDepth'),
            depth + front + rear,
          ),
          dimension(
            'outdoor_kitchen_height',
            'kitchen run height in clear overhead space',
            height,
            positive(values, 'clearHeight'),
          ),
        ],
        compatibility: [],
        assumptions: [
          'Service and work zones are user-entered or copied from the exact appliance/module manuals.',
          'Gas, electrical, heat, fire separation, ventilation, drainage and structural support are not assessed.',
          'No universal outdoor-kitchen working clearance is supplied.',
        ],
      };
    }
    case 'garden-play-equipment': {
      const width = positive(values, 'equipmentWidth');
      const depth = positive(values, 'equipmentDepth');
      const height = positive(values, 'equipmentHeight');
      const zones = {
        left: nonNegative(values, 'useZoneLeft'),
        right: nonNegative(values, 'useZoneRight'),
        front: nonNegative(values, 'useZoneFront'),
        rear: nonNegative(values, 'useZoneRear'),
      };
      const source = textValue(values, 'useZoneSource');
      const reference = String(values.manualReference ?? '').trim();
      const useZoneVerified =
        source === 'manual' &&
        reference.length > 0 &&
        reference.toLowerCase() !== 'not entered' &&
        Object.values(zones).every((zone) => zone > 0);
      const clearHeight = nonNegative(values, 'clearHeight');
      const checks = [
        dimension(
          'play_plot_width',
          'equipment footprint and manufacturer use zone width',
          width,
          positive(values, 'plotWidth'),
          width + zones.left + zones.right,
        ),
        dimension(
          'play_plot_depth',
          'equipment footprint and manufacturer use zone depth',
          depth,
          positive(values, 'plotDepth'),
          depth + zones.front + zones.rear,
        ),
      ];
      if (clearHeight > 0) {
        checks.push(
          dimension(
            'play_equipment_height',
            'equipment height and overhead clearance',
            height,
            clearHeight,
          ),
        );
      }
      return {
        checks,
        compatibility: [],
        assumptions: [
          'The equipment use zone is safety-sensitive and must be copied from the exact manufacturer manual; Fitwise supplies no generic use-zone dimensions.',
          'A physical footprint fit does not establish safe fall zones, impact surface, anchors, overhead hazards or supervision requirements.',
        ],
        reviewRequired: useZoneVerified
          ? []
          : [
              'Manufacturer use-zone dimensions and a manual/model reference are required before treating this as a complete play-space assessment.',
            ],
      };
    }
    default:
      throw new RangeError(`Unsupported fit service mode '${mode}'.`);
  }
}
