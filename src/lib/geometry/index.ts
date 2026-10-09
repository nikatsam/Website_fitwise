export {
  DERIVE_SCREEN_DIMS_FROM_DIAGONAL_ASPECT,
  deriveScreenDimensions,
  resolveMonitorWidth,
  computeConfigurationWidth,
  buildWorkspaceWidthCheck,
  buildWorkspaceDepthCheck,
  MONITOR_ASPECT_RATIOS,
  MAX_SIDE_BY_SIDE_MONITORS,
  type MonitorAspectRatioKey,
  type WorkspaceDepthCheckInput,
  type DerivedScreenDimensions,
  type MonitorWidthBasis,
  type ResolvedMonitorWidth,
  type MonitorConfigurationInput,
  type WorkspaceWidthCheckInput,
} from './workspace';
export {
  computeBedFootprint,
  applyOrientation,
  buildBedRoomChecks,
  type FrameAllowanceMm,
  type BedFootprint,
  type BedOrientation,
  type OrientedFootprint,
  type BedRoomChecksInput,
} from './bedroom';
export {
  calculateDoorSwingProjection,
  buildDoorSwingCheck,
  buildDrawerPullOutCheck,
} from './room-interactions';
export {
  buildObjectFitPlan,
  type ObjectFitInput,
  type ObjectFitPlan,
  type ObjectOrientation,
} from './object-fit';
