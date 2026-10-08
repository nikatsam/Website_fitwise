import type { Measurement } from './measurement';

export type EntityStatus = 'draft' | 'published' | 'deprecated';

export interface EntityBase {
  id: string;
  slug: string;
  name: string;
  category: string;
  aliases?: string[];
  geography?: string[];
  status: EntityStatus;
}

export interface AspectRatio {
  width: number;
  height: number;
}

/**
 * Generic screen width/height derived from diagonal + aspect ratio is the SCREEN
 * only, never the overall device width. See specs/DATA_MODEL.md §5.
 */
export interface DisplayEntity extends EntityBase {
  category: 'display';
  diagonalInches?: number;
  aspectRatio?: AspectRatio;
  screenWidthMm?: Measurement;
  screenHeightMm?: Measurement;
  /** Active panel width from a manufacturer spec; excludes bezel/casing. */
  activeWidthMm?: Measurement;
  overallWidthMm?: Measurement;
  overallHeightMm?: Measurement;
  overallDepthMm?: Measurement;
  standDepthMm?: Measurement;
  standWidthMm?: Measurement;
}

export interface DeskEntity extends EntityBase {
  category: 'desk';
  widthMm: Measurement;
  depthMm?: Measurement;
  heightMm?: Measurement;
}

/** Bed sizes are never universal across markets; always state the applicable market. */
export type BedMarket = 'US' | 'UK' | 'EU' | 'AU' | 'other';

export interface FrameAllowance {
  left: Measurement;
  right: Measurement;
  head: Measurement;
  foot: Measurement;
}

export interface BedEntity extends EntityBase {
  category: 'bed';
  mattressWidthMm: Measurement;
  mattressLengthMm: Measurement;
  defaultFrameAllowanceMm?: FrameAllowance;
  frameModelName?: string;
  market: BedMarket;
}

export type FurnitureExampleType = 'office-chair' | 'bedside-table' | 'wardrobe' | 'dresser';

/** Measured product examples; these are footprints, not universal room-clearance standards. */
export interface FurnitureEntity extends EntityBase {
  category: 'furniture';
  furnitureType: FurnitureExampleType;
  market: BedMarket | 'global';
  overallWidthMm: Measurement;
  overallDepthMm: Measurement;
  overallHeightMm: Measurement;
  seatDepthMm?: Measurement;
  doorLeafWidthMm?: Measurement;
  drawerPulloutMm?: Measurement;
}

export interface RoomScenario extends EntityBase {
  category: 'room';
  widthMm: Measurement;
  lengthMm: Measurement;
  ceilingHeightMm?: Measurement;
}

export type Entity = DisplayEntity | DeskEntity | BedEntity | FurnitureEntity | RoomScenario;
