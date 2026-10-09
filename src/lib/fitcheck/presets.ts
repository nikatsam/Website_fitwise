import { bedEntities, bedroomFurnitureEntities } from '../../data/bedroom/entities';
import type { FrameAllowanceMm } from '../geometry/bedroom';

const zeroFrame: FrameAllowanceMm = { left: 0, right: 0, head: 0, foot: 0 };

export interface BedroomFitPreset {
  key: string;
  label: string;
  market: string;
  mattressWidthMm: number;
  mattressLengthMm: number;
  frameAllowanceMm: FrameAllowanceMm;
  frameModelName?: string;
  note: string;
}

export const BEDROOM_FIT_PRESETS: BedroomFitPreset[] = [
  {
    key: 'custom-mattress',
    label: 'Custom mattress (editable sample dimensions)',
    market: 'global',
    mattressWidthMm: 1600,
    mattressLengthMm: 2000,
    frameAllowanceMm: { ...zeroFrame },
    note: 'The 1600 × 2000 mm starting values are editable examples, not a universal mattress size.',
  },
  ...bedEntities
    .filter((bed) => bed.status === 'published')
    .flatMap((bed) => {
      const mattressOnly: BedroomFitPreset = {
        key: `${bed.id}-mattress`,
        label: `${bed.name} (mattress only)`,
        market: bed.market,
        mattressWidthMm: bed.mattressWidthMm.valueMm,
        mattressLengthMm: bed.mattressLengthMm.valueMm,
        frameAllowanceMm: { ...zeroFrame },
        note: 'No outer frame has been measured for this option.',
      };
      if (!bed.defaultFrameAllowanceMm || !bed.frameModelName) return [mattressOnly];
      const withSourceFrame: BedroomFitPreset = {
        key: `${bed.id}-frame`,
        label: `${bed.name} in ${bed.frameModelName}`,
        market: bed.market,
        mattressWidthMm: bed.mattressWidthMm.valueMm,
        mattressLengthMm: bed.mattressLengthMm.valueMm,
        frameModelName: bed.frameModelName,
        frameAllowanceMm: {
          left: bed.defaultFrameAllowanceMm.left.valueMm,
          right: bed.defaultFrameAllowanceMm.right.valueMm,
          head: bed.defaultFrameAllowanceMm.head.valueMm,
          foot: bed.defaultFrameAllowanceMm.foot.valueMm,
        },
        note: `Frame allowance is derived from ${bed.frameModelName} published outer dimensions; other models vary.`,
      };
      return [mattressOnly, withSourceFrame];
    }),
];

export const DEFAULT_BEDROOM_FIT_PRESET_KEY = 'custom-mattress';
export const HEMNES_BEDSIDE_PRESET = bedroomFurnitureEntities.find(
  (entity) => entity.id === 'ent-furniture-hemnes-bedside-46x35',
)!;
export const PAX_DOOR_LEAF_WIDTH_MM = bedroomFurnitureEntities.find(
  (entity) => entity.id === 'ent-furniture-pax-grimo-wardrobe',
)!.doorLeafWidthMm!.valueMm;
export const HEMNES_DRAWER_PULL_OUT_MM = bedroomFurnitureEntities.find(
  (entity) => entity.id === 'ent-furniture-hemnes-8-drawer-dresser',
)!.drawerPulloutMm!.valueMm;
