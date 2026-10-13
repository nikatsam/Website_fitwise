import type { DimensionCheck } from '../fit';

export type RugOrientation = 'auto' | 'width-depth' | 'depth-width';
export type RugCoverageMode = 'full-footprint' | 'front-edge';
export type RugPlacedOrientation = Exclude<RugOrientation, 'auto'>;

export interface RugFitInput {
  roomWidthMm: number;
  roomDepthMm: number;
  rugWidthMm: number;
  rugDepthMm: number;
  wallGapEachSideMm?: number;
  orientation?: RugOrientation;
  checkFurniture?: boolean;
  coverageMode?: RugCoverageMode;
  furnitureWidthMm?: number;
  furnitureDepthMm?: number;
  furnitureMarginEachSideMm?: number;
  frontOverlapMm?: number;
  frontExtensionMm?: number;
}

export interface RugFitPlan {
  orientation: RugPlacedOrientation;
  rugWidthOnRoomWidthMm: number;
  rugDepthOnRoomDepthMm: number;
  coverageMode: RugCoverageMode;
  checkFurniture: boolean;
  checks: DimensionCheck[];
}

interface RugCandidate extends RugFitPlan {
  hardFailures: number;
  targetFailures: number;
  totalMarginMm: number;
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive measurement.`);
  }
}

function assertNonNegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be finite and non-negative.`);
  }
}

function buildCandidate(
  input: RugFitInput,
  orientation: RugPlacedOrientation,
  coverageMode: RugCoverageMode,
  checkFurniture: boolean,
): RugCandidate {
  const rotated = orientation === 'depth-width';
  const rugWidthMm = rotated ? input.rugDepthMm : input.rugWidthMm;
  const rugDepthMm = rotated ? input.rugWidthMm : input.rugDepthMm;
  const wallGap = input.wallGapEachSideMm ?? 0;
  const checks: DimensionCheck[] = [
    {
      dimension: 'rug_room_width',
      label: 'rug width against room width',
      minimumMm: rugWidthMm,
      recommendedMm: rugWidthMm + wallGap * 2,
      availableMm: input.roomWidthMm,
    },
    {
      dimension: 'rug_room_depth',
      label: 'rug depth against room depth',
      minimumMm: rugDepthMm,
      recommendedMm: rugDepthMm + wallGap * 2,
      availableMm: input.roomDepthMm,
    },
  ];
  if (
    checks.some(
      (check) =>
        !Number.isFinite(check.minimumMm) ||
        !Number.isFinite(check.recommendedMm ?? check.minimumMm) ||
        !Number.isFinite(check.availableMm),
    )
  ) {
    throw new RangeError('Rug fit dimensions must remain finite.');
  }

  if (checkFurniture) {
    const furnitureWidthMm = input.furnitureWidthMm!;
    const furnitureMargin = input.furnitureMarginEachSideMm ?? 0;
    if (coverageMode === 'full-footprint') {
      const furnitureDepthMm = input.furnitureDepthMm!;
      checks.push(
        {
          dimension: 'rug_furniture_width',
          label: 'furniture/use footprint width on rug',
          minimumMm: furnitureWidthMm,
          recommendedMm: furnitureWidthMm + furnitureMargin * 2,
          availableMm: rugWidthMm,
        },
        {
          dimension: 'rug_furniture_depth',
          label: 'furniture/use footprint depth on rug',
          minimumMm: furnitureDepthMm,
          recommendedMm: furnitureDepthMm + furnitureMargin * 2,
          availableMm: rugDepthMm,
        },
      );
    } else {
      const frontOverlapMm = input.frontOverlapMm!;
      const frontExtensionMm = input.frontExtensionMm ?? 0;
      checks.push(
        {
          dimension: 'rug_front_furniture_width',
          label: 'furniture front width with selected side margin',
          minimumMm: furnitureWidthMm,
          recommendedMm: furnitureWidthMm + furnitureMargin * 2,
          availableMm: rugWidthMm,
        },
        {
          dimension: 'rug_front_edge_coverage',
          label: 'rug overlap and extension at furniture front edge',
          minimumMm: frontOverlapMm,
          recommendedMm: frontOverlapMm + frontExtensionMm,
          availableMm: rugDepthMm,
        },
      );
    }
  }

  const hardFailures = checks.filter((check) => check.minimumMm > check.availableMm).length;
  const targetFailures = checks.filter(
    (check) => (check.recommendedMm ?? check.minimumMm) > check.availableMm,
  ).length;
  const totalMarginMm = checks.reduce(
    (total, check) => total + check.availableMm - check.minimumMm,
    0,
  );
  if (!Number.isFinite(totalMarginMm)) throw new RangeError('Rug fit margins must remain finite.');

  return {
    orientation,
    rugWidthOnRoomWidthMm: rugWidthMm,
    rugDepthOnRoomDepthMm: rugDepthMm,
    coverageMode,
    checkFurniture,
    checks,
    hardFailures,
    targetFailures,
    totalMarginMm,
  };
}

/** Checks a rectangular rug against a rectangular room and a user-entered coverage relationship. */
export function buildRugFitPlan(input: RugFitInput): RugFitPlan {
  for (const [name, value] of [
    ['roomWidthMm', input.roomWidthMm],
    ['roomDepthMm', input.roomDepthMm],
    ['rugWidthMm', input.rugWidthMm],
    ['rugDepthMm', input.rugDepthMm],
  ] as const) {
    assertPositive(value, name);
  }

  const wallGap = input.wallGapEachSideMm ?? 0;
  assertNonNegative(wallGap, 'wallGapEachSideMm');
  if (
    input.orientation !== undefined &&
    !['auto', 'width-depth', 'depth-width'].includes(input.orientation)
  ) {
    throw new RangeError(`Unsupported rug orientation '${input.orientation}'.`);
  }

  const checkFurniture = input.checkFurniture ?? true;
  const coverageMode = input.coverageMode ?? 'full-footprint';
  if (coverageMode !== 'full-footprint' && coverageMode !== 'front-edge') {
    throw new RangeError(`Unsupported rug coverage mode '${coverageMode}'.`);
  }

  if (checkFurniture) {
    assertPositive(input.furnitureWidthMm ?? Number.NaN, 'furnitureWidthMm');
    assertPositive(input.furnitureDepthMm ?? Number.NaN, 'furnitureDepthMm');
    assertNonNegative(input.furnitureMarginEachSideMm ?? 0, 'furnitureMarginEachSideMm');
    if (coverageMode === 'front-edge') {
      const overlap = input.frontOverlapMm ?? Number.NaN;
      const furnitureDepth = input.furnitureDepthMm!;
      assertPositive(overlap, 'frontOverlapMm');
      assertNonNegative(input.frontExtensionMm ?? 0, 'frontExtensionMm');
      if (overlap > furnitureDepth) {
        throw new RangeError('frontOverlapMm cannot exceed furnitureDepthMm.');
      }
    }
  }

  const orientations: RugPlacedOrientation[] =
    input.orientation === 'width-depth'
      ? ['width-depth']
      : input.orientation === 'depth-width'
        ? ['depth-width']
        : ['width-depth', 'depth-width'];
  const candidates = orientations.map((orientation) =>
    buildCandidate(input, orientation, coverageMode, checkFurniture),
  );
  candidates.sort(
    (first, second) =>
      first.hardFailures - second.hardFailures ||
      first.targetFailures - second.targetFailures ||
      second.totalMarginMm - first.totalMarginMm,
  );
  const best = candidates[0]!;
  return {
    orientation: best.orientation,
    rugWidthOnRoomWidthMm: best.rugWidthOnRoomWidthMm,
    rugDepthOnRoomDepthMm: best.rugDepthOnRoomDepthMm,
    coverageMode: best.coverageMode,
    checkFurniture: best.checkFurniture,
    checks: best.checks,
  };
}
