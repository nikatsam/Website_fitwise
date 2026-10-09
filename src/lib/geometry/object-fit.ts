import type { DimensionCheck } from '../fit';

export type ObjectOrientation = 'auto' | 'width-depth' | 'depth-width';

export interface ObjectFitInput {
  objectWidthMm: number;
  objectDepthMm: number;
  objectHeightMm: number;
  spaceWidthMm: number;
  spaceDepthMm: number;
  spaceHeightMm: number;
  clearanceEachSideMm?: number;
  orientation?: ObjectOrientation;
  doorwayWidthMm?: number;
  doorwayHeightMm?: number;
  corridorWidthMm?: number;
  requestedQuantity?: number;
  itemGapMm?: number;
}

export interface ObjectFitPlan {
  orientation: Exclude<ObjectOrientation, 'auto'>;
  checks: DimensionCheck[];
  quantityCapacity: number;
  quantityOrientation: Exclude<ObjectOrientation, 'auto'>;
  requestedQuantity?: number;
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number.`);
  }
}

function countGrid(available: number, item: number, gap: number): number {
  return Math.max(0, Math.floor((available + gap) / (item + gap)));
}

/** Builds explicit room, access-route and single-layer quantity checks from user dimensions. */
export function buildObjectFitPlan(input: ObjectFitInput): ObjectFitPlan {
  const positiveFields: (keyof ObjectFitInput)[] = [
    'objectWidthMm',
    'objectDepthMm',
    'objectHeightMm',
    'spaceWidthMm',
    'spaceDepthMm',
    'spaceHeightMm',
  ];
  for (const field of positiveFields) assertPositive(input[field] as number, field);

  const clearance = input.clearanceEachSideMm ?? 0;
  const gap = input.itemGapMm ?? 0;
  for (const [name, value] of [
    ['clearanceEachSideMm', clearance],
    ['itemGapMm', gap],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} must be finite and non-negative.`);
    }
  }
  if (
    input.requestedQuantity !== undefined &&
    (!Number.isInteger(input.requestedQuantity) || input.requestedQuantity < 1)
  ) {
    throw new RangeError('requestedQuantity must be a positive integer.');
  }

  const orientations: Exclude<ObjectOrientation, 'auto'>[] =
    input.orientation === 'width-depth'
      ? ['width-depth']
      : input.orientation === 'depth-width'
        ? ['depth-width']
        : ['width-depth', 'depth-width'];
  const roomCandidates = orientations.map((orientation) => {
    const width = orientation === 'width-depth' ? input.objectWidthMm : input.objectDepthMm;
    const depth = orientation === 'width-depth' ? input.objectDepthMm : input.objectWidthMm;
    const checks: DimensionCheck[] = [
      {
        dimension: 'space_width',
        label: 'space width',
        minimumMm: width,
        recommendedMm: width + clearance * 2,
        availableMm: input.spaceWidthMm,
      },
      {
        dimension: 'space_depth',
        label: 'space depth',
        minimumMm: depth,
        recommendedMm: depth + clearance * 2,
        availableMm: input.spaceDepthMm,
      },
      {
        dimension: 'space_height',
        label: 'space height',
        minimumMm: input.objectHeightMm,
        availableMm: input.spaceHeightMm,
      },
    ];
    const hardFailures = checks.filter((check) => check.minimumMm > check.availableMm).length;
    const recommendedFailures = checks.filter(
      (check) => (check.recommendedMm ?? check.minimumMm) > check.availableMm,
    ).length;
    const totalMargin = checks.reduce((sum, check) => sum + check.availableMm - check.minimumMm, 0);
    return { orientation, checks, hardFailures, recommendedFailures, totalMargin };
  });
  roomCandidates.sort(
    (a, b) =>
      a.hardFailures - b.hardFailures ||
      a.recommendedFailures - b.recommendedFailures ||
      b.totalMargin - a.totalMargin,
  );
  const selected = roomCandidates[0]!;
  const checks = [...selected.checks];

  if (input.doorwayWidthMm !== undefined || input.doorwayHeightMm !== undefined) {
    assertPositive(input.doorwayWidthMm ?? NaN, 'doorwayWidthMm');
    assertPositive(input.doorwayHeightMm ?? NaN, 'doorwayHeightMm');
    checks.push(
      {
        dimension: 'doorway_width',
        label: 'upright doorway width (narrow face)',
        minimumMm: Math.min(input.objectWidthMm, input.objectDepthMm),
        availableMm: input.doorwayWidthMm!,
      },
      {
        dimension: 'doorway_height',
        label: 'doorway height (upright, no tilt)',
        minimumMm: input.objectHeightMm,
        availableMm: input.doorwayHeightMm!,
      },
    );
  }

  if (input.corridorWidthMm !== undefined) {
    assertPositive(input.corridorWidthMm, 'corridorWidthMm');
    checks.push({
      dimension: 'corridor_width',
      label: 'corridor width (upright, narrow face)',
      minimumMm: Math.min(input.objectWidthMm, input.objectDepthMm),
      availableMm: input.corridorWidthMm,
    });
  }

  const usableWidth = input.spaceWidthMm - clearance * 2;
  const usableDepth = input.spaceDepthMm - clearance * 2;
  const capacities = [
    {
      orientation: 'width-depth' as const,
      count:
        input.objectHeightMm > input.spaceHeightMm
          ? 0
          : countGrid(usableWidth, input.objectWidthMm, gap) *
            countGrid(usableDepth, input.objectDepthMm, gap),
    },
    {
      orientation: 'depth-width' as const,
      count:
        input.objectHeightMm > input.spaceHeightMm
          ? 0
          : countGrid(usableWidth, input.objectDepthMm, gap) *
            countGrid(usableDepth, input.objectWidthMm, gap),
    },
  ].sort((a, b) => b.count - a.count);

  return {
    orientation: selected.orientation,
    checks,
    quantityCapacity: capacities[0]!.count,
    quantityOrientation: capacities[0]!.orientation,
    ...(input.requestedQuantity === undefined
      ? {}
      : { requestedQuantity: input.requestedQuantity }),
  };
}
