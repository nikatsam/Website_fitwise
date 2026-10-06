import type { BedEntity, RoomScenario } from '../../types';
import { feetToMm } from '../../lib/units';

const usSourceId = 'src-sleep-foundation-us-mattress-sizes';
const ukDoubleSourceId = 'src-ikea-uk-malm-double';
const ukKingSourceId = 'src-ikea-uk-malm-king';

export const bedEntities: BedEntity[] = [
  {
    id: 'ent-bed-us-full',
    slug: 'us-full-mattress',
    name: 'US Full mattress (often called Double)',
    category: 'bed',
    status: 'published',
    geography: ['US'],
    market: 'US',
    aliases: ['US Double'],
    mattressWidthMm: { valueMm: 54 * 25.4, kind: 'nominal', sourceId: usSourceId },
    mattressLengthMm: { valueMm: 75 * 25.4, kind: 'nominal', sourceId: usSourceId },
  },
  {
    id: 'ent-bed-us-queen',
    slug: 'us-queen-mattress',
    name: 'US Queen mattress',
    category: 'bed',
    status: 'published',
    geography: ['US'],
    market: 'US',
    mattressWidthMm: { valueMm: 60 * 25.4, kind: 'nominal', sourceId: usSourceId },
    mattressLengthMm: { valueMm: 80 * 25.4, kind: 'nominal', sourceId: usSourceId },
  },
  {
    id: 'ent-bed-us-king',
    slug: 'us-king-mattress',
    name: 'US King mattress',
    category: 'bed',
    status: 'published',
    geography: ['US'],
    market: 'US',
    mattressWidthMm: { valueMm: 76 * 25.4, kind: 'nominal', sourceId: usSourceId },
    mattressLengthMm: { valueMm: 80 * 25.4, kind: 'nominal', sourceId: usSourceId },
  },
  {
    id: 'ent-bed-uk-double',
    slug: 'uk-double-mattress',
    name: 'UK Standard Double mattress',
    category: 'bed',
    status: 'published',
    geography: ['UK'],
    market: 'UK',
    mattressWidthMm: { valueMm: 1350, kind: 'nominal', sourceId: ukDoubleSourceId },
    mattressLengthMm: { valueMm: 1900, kind: 'nominal', sourceId: ukDoubleSourceId },
  },
  {
    id: 'ent-bed-uk-king',
    slug: 'uk-king-mattress',
    name: 'UK Standard King mattress',
    category: 'bed',
    status: 'published',
    geography: ['UK'],
    market: 'UK',
    mattressWidthMm: { valueMm: 1500, kind: 'nominal', sourceId: ukKingSourceId },
    mattressLengthMm: { valueMm: 2000, kind: 'nominal', sourceId: ukKingSourceId },
  },
  {
    id: 'ent-bed-uk-super-king',
    slug: 'uk-super-king-mattress',
    name: 'UK 180 × 200 cm mattress reference',
    category: 'bed',
    status: 'published',
    geography: ['UK'],
    market: 'UK',
    mattressWidthMm: {
      valueMm: 1800,
      kind: 'nominal',
      sourceId: ukKingSourceId,
      note: 'IKEA UK lists this optional MALM mattress-size variant separately from Standard King.',
    },
    mattressLengthMm: { valueMm: 2000, kind: 'nominal', sourceId: ukKingSourceId },
  },
];

const roomScenario = (feet: number) => ({
  valueMm: feetToMm(feet),
  kind: 'derived' as const,
  derivationId: 'feet-to-mm',
  note: `${feet} ft reference dimension converted at exactly 304.8 mm per foot.`,
});

export const roomScenarios: RoomScenario[] = [
  {
    id: 'ent-room-us-10x10ft',
    slug: '10x10-ft-room-us',
    name: '10 × 10 ft reference bedroom (US)',
    category: 'room',
    status: 'published',
    geography: ['US'],
    widthMm: roomScenario(10),
    lengthMm: roomScenario(10),
  },
  {
    id: 'ent-room-us-10x12ft',
    slug: '10x12-ft-room-us',
    name: '10 × 12 ft reference bedroom (US)',
    category: 'room',
    status: 'published',
    geography: ['US'],
    widthMm: roomScenario(10),
    lengthMm: roomScenario(12),
  },
  {
    id: 'ent-room-us-9x10ft',
    slug: '9x10-ft-room-us',
    name: '9 × 10 ft reference bedroom (US)',
    category: 'room',
    status: 'published',
    geography: ['US'],
    widthMm: roomScenario(9),
    lengthMm: roomScenario(10),
  },
];
