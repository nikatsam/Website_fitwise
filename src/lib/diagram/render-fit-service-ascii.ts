import type { FitServiceMode, FitServiceValues } from '../geometry/fit-services';
import { formatMeasurement } from '../units';

interface FitServiceScene {
  spaceLabel: string;
  objectLabel: string;
  spaceWidth: number;
  spaceDepth: number;
  objectWidth: number;
  objectDepth: number;
  zoneWidth: number;
  zoneDepth: number;
  zoneLabel: string;
  viewLabel?: string;
  note?: string;
}

export interface FitServiceAsciiPreview {
  art: string;
  description: string;
  summary: string;
}

const numberValue = (values: FitServiceValues, key: string): number => {
  const value = values[key];
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
};

const dimension = (width: number, depth: number) =>
  `${formatMeasurement(width)} x ${formatMeasurement(depth)}`;

function drawRect(
  grid: string[][],
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  line: string,
  corners = line,
): void {
  const left = Math.round(centerX - width / 2);
  const right = left + width - 1;
  const top = Math.round(centerY - height / 2);
  const bottom = top + height - 1;
  const put = (x: number, y: number, char: string) => {
    if (grid[y]?.[x] !== undefined) grid[y][x] = char;
  };

  for (let x = left + 1; x < right; x += 1) {
    put(x, top, line === '.' || line === '#' ? line : '-');
    put(x, bottom, line === '.' || line === '#' ? line : '-');
  }
  for (let y = top + 1; y < bottom; y += 1) {
    put(left, y, line === '.' || line === '#' ? line : '|');
    put(right, y, line === '.' || line === '#' ? line : '|');
  }
  put(left, top, corners === '.' || corners === '#' ? corners : '+');
  put(right, top, corners === '.' || corners === '#' ? corners : '+');
  put(left, bottom, corners === '.' || corners === '#' ? corners : '+');
  put(right, bottom, corners === '.' || corners === '#' ? corners : '+');
}

function sceneFor(mode: FitServiceMode, values: FitServiceValues): FitServiceScene {
  const v = (key: string) => numberValue(values, key);
  switch (mode) {
    case 'appliance-install':
      return {
        spaceLabel: 'OPENING',
        objectLabel: 'APPLIANCE',
        spaceWidth: v('openingWidth'),
        spaceDepth: v('openingDepth'),
        objectWidth: v('itemWidth'),
        objectDepth: v('itemDepth'),
        zoneWidth: v('itemWidth') + 2 * v('sideClearance'),
        zoneDepth: v('itemDepth') + v('rearClearance'),
        zoneLabel: 'INSTALL SPACE',
      };
    case 'workspace-compatibility':
      return {
        spaceLabel: 'DESK',
        objectLabel: 'MONITOR',
        spaceWidth: v('deskWidth'),
        spaceDepth: v('deskDepth'),
        objectWidth: v('monitorWidth'),
        objectDepth: v('monitorDepth') + v('armBaseDepth'),
        zoneWidth: v('monitorWidth'),
        zoneDepth: v('monitorDepth') + v('armBaseDepth'),
        zoneLabel: 'MONITOR + ARM BASE',
      };
    case 'tv-fit':
      if (values.setup === 'wall') {
        return {
          spaceLabel: 'WALL AREA',
          objectLabel: 'TV',
          viewLabel: 'FRONT ELEVATION',
          spaceWidth: v('wallAreaWidth'),
          spaceDepth: v('wallAreaHeight'),
          objectWidth: v('tvWidth'),
          objectDepth: v('tvHeight'),
          zoneWidth: v('tvWidth'),
          zoneDepth: v('tvHeight'),
          zoneLabel: 'TV FOOTPRINT',
        };
      }
      return {
        spaceLabel: 'CONSOLE',
        objectLabel: 'STAND + TV',
        spaceWidth: v('consoleWidth'),
        spaceDepth: v('consoleDepth'),
        objectWidth: Math.max(v('standWidth'), v('tvWidth')),
        objectDepth: v('standDepth'),
        zoneWidth: Math.max(v('standWidth'), v('tvWidth')),
        zoneDepth: v('standDepth'),
        zoneLabel: 'STAND / TV FOOTPRINT',
      };
    case 'home-gym':
      return {
        spaceLabel: 'ROOM',
        objectLabel: 'EQUIPMENT',
        spaceWidth: v('roomWidth'),
        spaceDepth: v('roomDepth'),
        objectWidth: v('equipmentWidth'),
        objectDepth: v('equipmentDepth'),
        zoneWidth: v('equipmentWidth') + 2 * v('sideOperating'),
        zoneDepth: v('equipmentDepth') + v('frontOperating'),
        zoneLabel: 'OPERATING ZONE',
      };
    case 'storage':
      return {
        spaceLabel: 'STORAGE',
        objectLabel: 'OBJECT',
        spaceWidth: v('spaceWidth'),
        spaceDepth: v('spaceDepth'),
        objectWidth: v('itemWidth'),
        objectDepth: v('itemDepth'),
        zoneWidth: v('itemWidth') + 2 * v('edgeClearance'),
        zoneDepth: v('itemDepth') + 2 * v('edgeClearance'),
        zoneLabel: 'EDGE ALLOWANCE',
        note: `Aisle target: ${formatMeasurement(v('targetAisle'))}. Grid capacity is listed in the results.`,
      };
    case 'pool-room':
      return {
        spaceLabel: 'GAME ROOM',
        objectLabel: 'POOL TABLE',
        spaceWidth: v('roomWidth'),
        spaceDepth: v('roomLength'),
        objectWidth: v('tableWidth'),
        objectDepth: v('tableLength'),
        zoneWidth: v('tableWidth') + 2 * (v('cueLength') + v('extraClearance')),
        zoneDepth: v('tableLength') + 2 * (v('cueLength') + v('extraClearance')),
        zoneLabel: 'CUE-LENGTH ENVELOPE',
      };
    case 'vehicle-garage': {
      const doorAccess = v('vehicleWidth') + 2 * (v('doorProjection') + v('sideAccess'));
      return {
        spaceLabel: 'GARAGE',
        objectLabel: 'VEHICLE',
        spaceWidth: v('garageWidth'),
        spaceDepth: v('garageLength'),
        objectWidth: v('vehicleWidth'),
        objectDepth: v('vehicleLength'),
        zoneWidth: doorAccess,
        zoneDepth: v('vehicleLength') + v('frontClearance') + v('rearClearance'),
        zoneLabel: 'OPEN-DOOR / PARKING ZONE',
        note: `Door opening: ${formatMeasurement(v('garageOpeningWidth'))} wide. Approach and turning path are not shown.`,
      };
    }
    case 'garden-structure': {
      const bodyWidth = v('bodyWidth') || v('plotWidth') * 0.55;
      const bodyDepth = v('bodyDepth') || v('plotDepth') * 0.4;
      return {
        spaceLabel: 'GARDEN PLOT',
        objectLabel: values.direction === 'plot-to-structure' ? 'CANDIDATE' : 'STRUCTURE',
        spaceWidth: v('plotWidth'),
        spaceDepth: v('plotDepth'),
        objectWidth: bodyWidth,
        objectDepth: bodyDepth,
        zoneWidth: bodyWidth + 2 * (v('roofOverhangSide') + v('maintenanceLeft')),
        zoneDepth:
          bodyDepth +
          v('roofOverhangFront') +
          v('roofOverhangRear') +
          v('doorProjection') +
          v('maintenanceFront') +
          v('maintenanceRear'),
        zoneLabel: 'ROOF / ACCESS ENVELOPE',
        note:
          values.direction === 'plot-to-structure'
            ? 'Candidate rectangles are listed in the results; this sketch is illustrative.'
            : undefined,
      };
    }
    case 'garden-patio-dining':
      return {
        spaceLabel: 'PATIO / GAZEBO',
        objectLabel: 'TABLE',
        spaceWidth: v('clearWidth'),
        spaceDepth: v('clearDepth'),
        objectWidth: v('tableWidth'),
        objectDepth: v('tableLength'),
        zoneWidth: v('tableWidth') + 2 * (v('chairWidth') + v('walkingClearance')),
        zoneDepth: v('tableLength') + 2 * (v('chairEnvelope') + v('walkingClearance')),
        zoneLabel: 'CHAIR / CIRCULATION ZONE',
      };
    case 'garden-shed-storage':
      return {
        spaceLabel: 'SHED INTERIOR',
        objectLabel: 'STORED ITEM',
        spaceWidth: v('insideWidth'),
        spaceDepth: v('insideDepth'),
        objectWidth: v('itemWidth'),
        objectDepth: v('itemDepth'),
        zoneWidth: v('itemWidth') + v('itemGap'),
        zoneDepth: v('itemDepth') + v('itemGap'),
        zoneLabel: 'ITEM FOOTPRINT',
        note: `Aisle target: ${formatMeasurement(v('aisleTarget'))}. Single-layer capacity is listed in the results.`,
      };
    case 'garden-greenhouse':
      return {
        spaceLabel: 'GARDEN PLOT',
        objectLabel: 'GREENHOUSE',
        spaceWidth: v('plotWidth'),
        spaceDepth: v('plotDepth'),
        objectWidth: v('greenhouseWidth'),
        objectDepth: v('greenhouseDepth'),
        zoneWidth: v('greenhouseWidth') + 2 * (v('roofOverhangSide') + v('maintenanceSide')),
        zoneDepth: v('greenhouseDepth') + 2 * (v('roofOverhangEnd') + v('maintenanceEnd')),
        zoneLabel: 'ROOF / MAINTENANCE ZONE',
        note: `Inside aisle target: ${formatMeasurement(v('centralAisleTarget'))}. Staging layout is summarized in the results.`,
      };
    case 'garden-hot-tub':
      return {
        spaceLabel: 'PATIO',
        objectLabel: 'HOT TUB',
        spaceWidth: v('patioWidth'),
        spaceDepth: v('patioDepth'),
        objectWidth: v('tubWidth'),
        objectDepth: v('tubDepth'),
        zoneWidth: v('tubWidth') + 2 * v('serviceSide'),
        zoneDepth: v('tubDepth') + v('serviceFront'),
        zoneLabel: 'SERVICE ACCESS ZONE',
        note: 'Cover-lift height is checked separately in the dimensions table.',
      };
    case 'garden-outdoor-kitchen':
      return {
        spaceLabel: 'PATIO',
        objectLabel: 'KITCHEN RUN',
        spaceWidth: v('patioWidth'),
        spaceDepth: v('patioDepth'),
        objectWidth: v('runWidth'),
        objectDepth: v('runDepth'),
        zoneWidth: v('runWidth') + 2 * v('sideService'),
        zoneDepth: v('runDepth') + v('frontWorkZone') + v('rearService'),
        zoneLabel: 'WORK / SERVICE ZONE',
        note: 'Overhead clearance is checked separately in the dimensions table.',
      };
    case 'garden-play-equipment':
      return {
        spaceLabel: 'GARDEN PLOT',
        objectLabel: 'PLAY EQUIPMENT',
        spaceWidth: v('plotWidth'),
        spaceDepth: v('plotDepth'),
        objectWidth: v('equipmentWidth'),
        objectDepth: v('equipmentDepth'),
        zoneWidth: v('equipmentWidth') + v('useZoneLeft') + v('useZoneRight'),
        zoneDepth: v('equipmentDepth') + v('useZoneFront') + v('useZoneRear'),
        zoneLabel: 'MANUFACTURER USE ZONE',
        note: 'Use-zone values must come from the exact manufacturer instructions.',
      };
    default:
      throw new RangeError(`No ASCII preview is defined for fit-service mode '${mode}'.`);
  }
}

function renderRoutePreview(values: FitServiceValues): FitServiceAsciiPreview {
  const points = [
    ['FRONT DOOR', 'frontDoorWidth'],
    ['HALL', 'hallWidth'],
    ['TURN', 'turnWidth'],
    ['STAIRS', 'stairWidth'],
    ['DEST. DOOR', 'destinationDoorWidth'],
  ] as const;
  const segments = points.map(([label, key]) => {
    const width = formatMeasurement(numberValue(values, key));
    return `${label}: ${width}`;
  });
  const art = [
    'CLEAR-WIDTH ROUTE (SCHEMATIC)',
    '+----------+   +------+   +------+',
    '| FRONT    |-->| HALL |-->| TURN |',
    '| DOOR     |   |      |   |      |',
    '+----------+   +------+   +--+---+',
    '                              |',
    '                         +----v---+   +----------+',
    '                         | STAIRS |-->| DEST.    |',
    '                         |        |   | DOOR     |',
    '                         +--------+   +----------+',
  ].join('\n');
  return {
    art,
    description: `Delivery route schematic. ${segments.join('; ')}. Heights and turn depth are checked in the results.`,
    summary: `${segments.join(' | ')}. Heights, landing depth and stair headroom are in the results.`,
  };
}

export function renderFitServiceAsciiPreview(
  mode: FitServiceMode,
  values: FitServiceValues,
): FitServiceAsciiPreview {
  if (mode === 'delivery-route') return renderRoutePreview(values);

  const scene = sceneFor(mode, values);
  const targetWidth = Math.max(scene.zoneWidth, scene.objectWidth);
  const targetDepth = Math.max(scene.zoneDepth, scene.objectDepth);
  const scaleWidth = 26 / Math.max(scene.spaceWidth, targetWidth, 1);
  const scaleDepth = 9 / Math.max(scene.spaceDepth, targetDepth, 1);
  const canvasWidth = 36;
  const canvasHeight = 13;
  const centerX = Math.floor(canvasWidth / 2);
  const centerY = Math.floor(canvasHeight / 2);
  const grid = Array.from({ length: canvasHeight }, () => Array(canvasWidth).fill(' '));
  const widthCells = (width: number) => Math.max(8, Math.round(width * scaleWidth));
  const heightCells = (depth: number) => Math.max(4, Math.round(depth * scaleDepth));

  drawRect(grid, centerX, centerY, widthCells(targetWidth), heightCells(targetDepth), '.', '.');
  const objectWidth = widthCells(scene.objectWidth);
  const objectHeight = heightCells(scene.objectDepth);
  drawRect(grid, centerX, centerY, objectWidth, objectHeight, '#');
  if (objectWidth >= scene.objectLabel.length + 4 && objectHeight >= 3) {
    const label = scene.objectLabel.slice(0, objectWidth - 4);
    const start = centerX - Math.floor((label.length + 2) / 2);
    for (const [offset, char] of [...`[${label}]`].entries()) {
      if (grid[centerY][start + offset] !== undefined) grid[centerY][start + offset] = char;
    }
  }
  drawRect(
    grid,
    centerX,
    centerY,
    widthCells(scene.spaceWidth),
    heightCells(scene.spaceDepth),
    '-',
  );

  const viewLabel = scene.viewLabel ?? 'TOP-DOWN PLAN';
  const art = [
    `${viewLabel} (SCHEMATIC, NOT TO SCALE)`,
    `SPACE: ${scene.spaceLabel}`,
    ...grid.map((row) => row.join('').replace(/\s+$/, '')),
    `OBJECT: ${scene.objectLabel} (${dimension(scene.objectWidth, scene.objectDepth)})`,
    `ZONE: . . . ${scene.zoneLabel}`,
  ].join('\n');
  const summary = [
    `${scene.spaceLabel}: ${dimension(scene.spaceWidth, scene.spaceDepth)}`,
    `${scene.objectLabel}: ${dimension(scene.objectWidth, scene.objectDepth)}`,
    `${scene.zoneLabel}: ${dimension(targetWidth, targetDepth)}`,
    scene.note,
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    art,
    description: `${viewLabel.toLowerCase()} schematic, not to scale. ${summary}`,
    summary,
  };
}
