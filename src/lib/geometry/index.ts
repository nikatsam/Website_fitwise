export {
  DERIVE_SCREEN_DIMS_FROM_DIAGONAL_ASPECT,
  deriveScreenDimensions,
  resolveMonitorWidth,
  computeConfigurationWidth,
  buildWorkspaceWidthCheck,
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
