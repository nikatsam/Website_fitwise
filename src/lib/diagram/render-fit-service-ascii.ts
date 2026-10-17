import type { FitServiceMode, FitServiceValues } from '../geometry/fit-services';
import { formatMeasurement, type MeasurementDisplay } from '../units';
import type { Locale } from '../../i18n/locale';

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

const dimension = (width: number, depth: number, display: MeasurementDisplay) =>
  `${formatMeasurement(width, display)} x ${formatMeasurement(depth, display)}`;

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

function sceneFor(
  mode: FitServiceMode,
  values: FitServiceValues,
  display: MeasurementDisplay,
  locale: Locale,
): FitServiceScene {
  const v = (key: string) => numberValue(values, key);
  const scene = (() => {
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
          note: `Aisle target: ${formatMeasurement(v('targetAisle'), display)}. Grid capacity is listed in the results.`,
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
          note: `Door opening: ${formatMeasurement(v('garageOpeningWidth'), display)} wide. Approach and turning path are not shown.`,
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
          note: `Aisle target: ${formatMeasurement(v('aisleTarget'), display)}. Single-layer capacity is listed in the results.`,
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
          note: `Inside aisle target: ${formatMeasurement(v('centralAisleTarget'), display)}. Staging layout is summarized in the results.`,
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
  })();
  if (locale === 'es') {
    const labels: Record<string, string> = {
      OPENING: 'ABERTURA',
      APPLIANCE: 'ELECTRODOMÉSTICO',
      'INSTALL SPACE': 'ESPACIO DE INSTALACIÓN',
      DESK: 'ESCRITORIO',
      MONITOR: 'MONITOR',
      'MONITOR + ARM BASE': 'MONITOR + BASE DEL BRAZO',
      'WALL AREA': 'ZONA DE PARED',
      TV: 'TELEVISOR',
      'FRONT ELEVATION': 'VISTA FRONTAL',
      'TV FOOTPRINT': 'HUELLA DEL TELEVISOR',
      CONSOLE: 'CONSOLA',
      'STAND + TV': 'SOPORTE + TELEVISOR',
      ROOM: 'HABITACIÓN',
      EQUIPMENT: 'EQUIPO',
      'OPERATING ZONE': 'ZONA DE FUNCIONAMIENTO',
      STORAGE: 'ALMACENAMIENTO',
      OBJECT: 'OBJETO',
      'EDGE ALLOWANCE': 'HOLGURA DEL BORDE',
      'GAME ROOM': 'SALA DE JUEGOS',
      'POOL TABLE': 'MESA DE BILLAR',
      GARAGE: 'GARAJE',
      VEHICLE: 'VEHÍCULO',
      'GARDEN PLOT': 'PARCELA DEL JARDÍN',
      CANDIDATE: 'OPCIÓN',
      STRUCTURE: 'ESTRUCTURA',
      'ROOF / ACCESS ENVELOPE': 'CONTORNO DE TECHO / ACCESO',
      'PATIO / GAZEBO': 'PATIO / GAZEBO',
      TABLE: 'MESA',
      'CHAIR / CIRCULATION ZONE': 'ZONA DE SILLAS / CIRCULACIÓN',
      'SHED INTERIOR': 'INTERIOR DEL COBERTIZO',
      'STORED ITEM': 'ARTÍCULO ALMACENADO',
      'ITEM FOOTPRINT': 'HUELLA DEL ARTÍCULO',
      GREENHOUSE: 'INVERNADERO',
      PATIO: 'PATIO',
      'HOT TUB': 'BAÑERA DE HIDROMASAJE',
      'SERVICE ACCESS ZONE': 'ZONA DE ACCESO DE SERVICIO',
      'KITCHEN RUN': 'MÓDULO DE COCINA',
      'WORK / SERVICE ZONE': 'ZONA DE TRABAJO / SERVICIO',
      'PLAY EQUIPMENT': 'EQUIPO DE JUEGO',
      'MANUFACTURER USE ZONE': 'ZONA DE USO DEL FABRICANTE',
    };
    scene.spaceLabel = labels[scene.spaceLabel] ?? scene.spaceLabel;
    scene.objectLabel = labels[scene.objectLabel] ?? scene.objectLabel;
    scene.zoneLabel = labels[scene.zoneLabel] ?? scene.zoneLabel;
    if (scene.viewLabel) scene.viewLabel = labels[scene.viewLabel] ?? scene.viewLabel;
    scene.note = scene.note
      ?.replace('Aisle target:', 'Objetivo de pasillo:')
      .replace('Inside aisle target:', 'Objetivo del pasillo interior:')
      .replace(
        'Grid capacity is listed in the results.',
        'La capacidad de la cuadrícula aparece en los resultados.',
      )
      .replace(
        'Single-layer capacity is listed in the results.',
        'La capacidad en una sola capa aparece en los resultados.',
      )
      .replace(
        'Staging layout is summarized in the results.',
        'La distribución de bancales se resume en los resultados.',
      )
      .replace('Door opening:', 'Abertura de la puerta:')
      .replace(
        'wide. Approach and turning path are not shown.',
        'de ancho. No se muestran el recorrido de aproximación ni el giro.',
      )
      .replace(
        'Candidate rectangles are listed in the results; this sketch is illustrative.',
        'Las opciones rectangulares aparecen en los resultados; este esquema es ilustrativo.',
      )
      .replace(
        'Cover-lift height is checked separately in the dimensions table.',
        'La altura necesaria para abrir la cubierta se comprueba por separado en la tabla de dimensiones.',
      )
      .replace(
        'Overhead clearance is checked separately in the dimensions table.',
        'La holgura superior se comprueba por separado en la tabla de dimensiones.',
      )
      .replace(
        'Use-zone values must come from the exact manufacturer instructions.',
        'Los valores de la zona de uso deben proceder de las instrucciones exactas del fabricante.',
      );
  }
  return scene;
}

function renderRoutePreview(
  values: FitServiceValues,
  display: MeasurementDisplay,
  locale: Locale,
): FitServiceAsciiPreview {
  const points = [
    [locale === 'es' ? 'PUERTA' : 'FRONT DOOR', 'frontDoorWidth'],
    [locale === 'es' ? 'PASILLO' : 'HALL', 'hallWidth'],
    [locale === 'es' ? 'GIRO' : 'TURN', 'turnWidth'],
    [locale === 'es' ? 'ESCALERA' : 'STAIRS', 'stairWidth'],
    [locale === 'es' ? 'DESTINO' : 'DEST. DOOR', 'destinationDoorWidth'],
  ] as const;
  const segments = points.map(([label, key]) => {
    const width = formatMeasurement(numberValue(values, key), display);
    return `${label}: ${width}`;
  });
  const art = [
    locale === 'es' ? 'RECORRIDO DE ANCHO LIBRE (ESQUEMA)' : 'CLEAR-WIDTH ROUTE (SCHEMATIC)',
    '+----------+   +------+   +------+',
    locale === 'es' ? '| PUERTA   |-->|PASILLO|-->| GIRO |' : '| FRONT    |-->| HALL |-->| TURN |',
    locale === 'es' ? '|          |   |       |   |      |' : '| DOOR     |   |      |   |      |',
    '+----------+   +------+   +--+---+',
    '                              |',
    '                         +----v---+   +----------+',
    locale === 'es'
      ? '                         |ESCALERA|-->|DESTINO  |'
      : '                         | STAIRS |-->| DEST.    |',
    locale === 'es'
      ? '                         |        |   |         |'
      : '                         |        |   | DOOR     |',
    '                         +--------+   +----------+',
  ].join('\n');
  return {
    art,
    description:
      locale === 'es'
        ? `Esquema de la ruta de entrega. ${segments.join('; ')}. Las alturas y la profundidad de giro se comprueban en los resultados.`
        : `Delivery route schematic. ${segments.join('; ')}. Heights and turn depth are checked in the results.`,
    summary: `${segments.join(' | ')}. ${locale === 'es' ? 'Las alturas, la profundidad del descansillo y la altura libre de la escalera aparecen en los resultados.' : 'Heights, landing depth and stair headroom are in the results.'}`,
  };
}

export function renderFitServiceAsciiPreview(
  mode: FitServiceMode,
  values: FitServiceValues,
  display: MeasurementDisplay = 'metric',
  locale: Locale = 'en',
): FitServiceAsciiPreview {
  if (mode === 'delivery-route') return renderRoutePreview(values, display, locale);

  const scene = sceneFor(mode, values, display, locale);
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

  const viewLabel = scene.viewLabel ?? (locale === 'es' ? 'PLANO DESDE ARRIBA' : 'TOP-DOWN PLAN');
  const art = [
    `${viewLabel} (${locale === 'es' ? 'ESQUEMA, NO A ESCALA' : 'SCHEMATIC, NOT TO SCALE'})`,
    `${locale === 'es' ? 'ESPACIO' : 'SPACE'}: ${scene.spaceLabel}`,
    ...grid.map((row) => row.join('').replace(/\s+$/, '')),
    `${locale === 'es' ? 'OBJETO' : 'OBJECT'}: ${scene.objectLabel} (${dimension(scene.objectWidth, scene.objectDepth, display)})`,
    `${locale === 'es' ? 'ZONA' : 'ZONE'}: . . . ${scene.zoneLabel}`,
  ].join('\n');
  const summary = [
    `${scene.spaceLabel}: ${dimension(scene.spaceWidth, scene.spaceDepth, display)}`,
    `${scene.objectLabel}: ${dimension(scene.objectWidth, scene.objectDepth, display)}`,
    `${scene.zoneLabel}: ${dimension(targetWidth, targetDepth, display)}`,
    scene.note,
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    art,
    description:
      locale === 'es'
        ? `Esquema ${viewLabel.toLowerCase()}, no a escala. ${summary}`
        : `${viewLabel.toLowerCase()} schematic, not to scale. ${summary}`,
    summary,
  };
}
