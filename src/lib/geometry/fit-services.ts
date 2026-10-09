import type { DimensionCheck } from '../fit';
import { buildObjectFitPlan } from './object-fit';
import { parseLength } from '../units';

export type FitServiceMode =
  | 'appliance-install'
  | 'delivery-route'
  | 'workspace-compatibility'
  | 'tv-fit'
  | 'home-gym'
  | 'storage'
  | 'pool-room';

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
  title: string;
  description: string;
  fields: FitServiceField[];
}

export type FitServiceValues = Record<string, number | string>;

export interface CompatibilityCheck {
  label: string;
  compatible: boolean;
  detail: string;
}

export interface FitServicePlan {
  checks: DimensionCheck[];
  compatibility: CompatibilityCheck[];
  assumptions: string[];
  capacity?: number;
  capacityRequested?: number;
}

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
];

export function getFitServiceDefinition(mode: FitServiceMode): FitServiceDefinition {
  const definition = FIT_SERVICE_DEFINITIONS.find((item) => item.mode === mode);
  if (!definition) throw new RangeError(`Unknown fit service mode '${mode}'.`);
  return definition;
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

export interface FitServicePlan {
  checks: DimensionCheck[];
  assumptions: string[];
  compatibility: FitServiceCompatibility[];
  capacity?: number;
  requestedQuantity?: number;
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
    default:
      throw new RangeError(`Unsupported fit service mode '${mode}'.`);
  }
}
