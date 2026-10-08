import type { Millimetres } from '../../types';
import type { DimensionCheck } from '../fit';

export function calculateDoorSwingProjection(
  doorLeafWidthMm: Millimetres,
  openingAngleDegrees: number,
): Millimetres {
  if (
    !Number.isFinite(doorLeafWidthMm) ||
    doorLeafWidthMm <= 0 ||
    !Number.isFinite(openingAngleDegrees) ||
    openingAngleDegrees < 0 ||
    openingAngleDegrees > 90
  ) {
    throw new RangeError(
      'Door width must be positive and the opening angle must be between 0 and 90 degrees.',
    );
  }
  return doorLeafWidthMm * Math.sin((openingAngleDegrees * Math.PI) / 180);
}

export function buildDoorSwingCheck(input: {
  doorLeafWidthMm: Millimetres;
  openingAngleDegrees: number;
  obstacleGapMm: Millimetres;
}): DimensionCheck {
  if (!Number.isFinite(input.obstacleGapMm) || input.obstacleGapMm < 0) {
    throw new RangeError('Door-to-obstacle gap must be finite and non-negative.');
  }
  const projectionMm = calculateDoorSwingProjection(
    input.doorLeafWidthMm,
    input.openingAngleDegrees,
  );
  return {
    dimension: 'wardrobe_door_sweep',
    label: 'wardrobe door sweep',
    minimumMm: projectionMm,
    recommendedMm: projectionMm,
    availableMm: input.obstacleGapMm,
  };
}

export function buildDrawerPullOutCheck(input: {
  drawerPullOutMm: Millimetres;
  obstacleGapMm: Millimetres;
}): DimensionCheck {
  if (
    !Number.isFinite(input.drawerPullOutMm) ||
    input.drawerPullOutMm <= 0 ||
    !Number.isFinite(input.obstacleGapMm) ||
    input.obstacleGapMm < 0
  ) {
    throw new RangeError(
      'Drawer pull-out must be positive and the drawer-to-obstacle gap must be non-negative.',
    );
  }
  return {
    dimension: 'dresser_drawer_pullout',
    label: 'dresser drawer extension',
    minimumMm: input.drawerPullOutMm,
    recommendedMm: input.drawerPullOutMm,
    availableMm: input.obstacleGapMm,
  };
}
