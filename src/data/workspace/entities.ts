import type { DisplayEntity, DeskEntity } from '../../types';
import { deriveScreenDimensions } from '../../lib/geometry';

const SIXTEEN_NINE = { width: 16, height: 9 } as const;

/**
 * Screen-only widths (never claimed as overall device width, per
 * specs/DATA_MODEL.md §5) are computed from diagonal + aspect ratio with the
 * real derivation function, not hand-typed, so the numbers and the
 * derivationId can never drift apart.
 */
const screen24 = deriveScreenDimensions(24, SIXTEEN_NINE);
const screen27 = deriveScreenDimensions(27, SIXTEEN_NINE);
const screen32 = deriveScreenDimensions(32, SIXTEEN_NINE);
const screen34 = deriveScreenDimensions(34, { width: 21, height: 9 });
const screen49 = deriveScreenDimensions(49, { width: 32, height: 9 });

export const displayEntities: DisplayEntity[] = [
  {
    id: 'ent-display-24in-16x9',
    slug: '24-inch-16-9-monitor',
    name: '24" 16:9 monitor',
    category: 'display',
    status: 'published',
    diagonalInches: 24,
    aspectRatio: SIXTEEN_NINE,
    screenWidthMm: screen24.screenWidthMm,
    screenHeightMm: screen24.screenHeightMm,
  },
  {
    id: 'ent-display-27in-16x9',
    slug: '27-inch-16-9-monitor',
    name: '27" 16:9 monitor',
    category: 'display',
    status: 'published',
    diagonalInches: 27,
    aspectRatio: SIXTEEN_NINE,
    screenWidthMm: screen27.screenWidthMm,
    screenHeightMm: screen27.screenHeightMm,
  },
  {
    id: 'ent-display-32in-16x9',
    slug: '32-inch-16-9-monitor',
    name: '32" 16:9 monitor',
    category: 'display',
    status: 'published',
    diagonalInches: 32,
    aspectRatio: SIXTEEN_NINE,
    screenWidthMm: screen32.screenWidthMm,
    screenHeightMm: screen32.screenHeightMm,
    overallWidthMm: { valueMm: 716.1, kind: 'typical', sourceId: 'src-samsung-m7-32in' },
  },
  {
    id: 'ent-display-34in-ultrawide',
    slug: '34-inch-ultrawide-monitor',
    name: '34" 21:9 ultrawide monitor',
    category: 'display',
    status: 'published',
    diagonalInches: 34,
    aspectRatio: { width: 21, height: 9 },
    screenWidthMm: screen34.screenWidthMm,
    screenHeightMm: screen34.screenHeightMm,
    overallWidthMm: { valueMm: 814, kind: 'typical', sourceId: 'src-lg-34wp85c-34in' },
  },
  {
    id: 'ent-display-49in-superultrawide',
    slug: '49-inch-super-ultrawide-monitor',
    name: '49" 32:9 super ultrawide monitor',
    category: 'display',
    status: 'published',
    diagonalInches: 49,
    aspectRatio: { width: 32, height: 9 },
    screenWidthMm: screen49.screenWidthMm,
    screenHeightMm: screen49.screenHeightMm,
    activeWidthMm: {
      valueMm: 1195.8,
      kind: 'typical',
      sourceId: 'src-samsung-lc49hg90-49in',
      note: 'Manufacturer-stated active panel width; full outer device width with bezel is larger and not supplied by this source.',
    },
  },
];

export const deskEntities: DeskEntity[] = [
  {
    id: 'ent-desk-1200',
    slug: '120cm-desk',
    name: '120 cm reference desk',
    category: 'desk',
    status: 'published',
    widthMm: { valueMm: 1200, kind: 'nominal', sourceId: 'src-ikea-lagkapten-desk' },
    depthMm: { valueMm: 600, kind: 'nominal', sourceId: 'src-ikea-lagkapten-desk' },
  },
  {
    id: 'ent-desk-1400',
    slug: '140cm-desk',
    name: '140 cm reference desk',
    category: 'desk',
    status: 'published',
    widthMm: { valueMm: 1400, kind: 'nominal', sourceId: 'src-ikea-lagkapten-desk' },
    depthMm: { valueMm: 600, kind: 'nominal', sourceId: 'src-ikea-lagkapten-desk' },
  },
  {
    id: 'ent-desk-1600',
    slug: '160cm-desk',
    name: '160 cm reference desk',
    category: 'desk',
    status: 'published',
    widthMm: { valueMm: 1600, kind: 'nominal', sourceId: 'src-ikea-lagkapten-desk' },
    depthMm: { valueMm: 800, kind: 'nominal', sourceId: 'src-ikea-lagkapten-desk' },
  },
];
