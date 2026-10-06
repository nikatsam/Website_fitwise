import type { SourceRecord } from '../types';

/**
 * Shared source registry. Every non-derived Measurement anywhere in the
 * dataset must cite one of these ids (specs/AGENT_INSTRUCTIONS.md §6).
 * Researched 2026-10-06 via live web search; re-verify before relying on
 * exact figures for anything beyond a "typical" approximation — individual
 * products vary.
 */
export const sources: SourceRecord[] = [
  {
    id: 'src-ikea-lagkapten-desk',
    url: 'https://www.ikea.com/de/en/cat/table-bar-system-11811/',
    title: 'LAGKAPTEN desk / table top range',
    publisher: 'IKEA',
    accessedOn: '2026-10-06',
    geography: 'global',
    confidence: 'medium',
    notes:
      'LAGKAPTEN table tops are commonly sold at 120x60 cm, 140x60 cm and 160x80 cm; used here as representative common desk sizes, not as claims about every desk on the market.',
  },
  {
    id: 'src-samsung-m7-32in',
    url: 'https://productsupport.johnlewis.com/customer/device/Samsung/SmartMonitorM7',
    title: 'Samsung Smart Monitor M7 (32") specifications',
    publisher: 'Samsung (retailer-hosted spec sheet)',
    accessedOn: '2026-10-06',
    geography: 'global',
    confidence: 'medium',
    notes:
      'Dimensions without stand: 716.1 x 424.5 x 41.8 mm (W x H x D). One representative 32" model, not a category average.',
  },
  {
    id: 'src-lg-34wp85c-34in',
    url: 'https://www.lg.com/hk_en/monitor/lg-34wp85c-b',
    title: 'LG 34WP85C-B 34" UltraWide QHD Curved Monitor specifications',
    publisher: 'LG Electronics',
    accessedOn: '2026-10-06',
    geography: 'global',
    confidence: 'high',
    notes: 'Manufacturer-stated width without stand: 814.0 mm. One representative 34" 21:9 model.',
  },
  {
    id: 'src-samsung-lc49hg90-49in',
    url: 'https://www.samsung.com/au/monitors/c49hg90/',
    title: 'Samsung CHG90 49" Ultra-Wide Curved QLED Gaming Monitor specifications',
    publisher: 'Samsung',
    accessedOn: '2026-10-06',
    geography: 'global',
    confidence: 'medium',
    notes:
      'Manufacturer-stated active display width: 1195.8 mm. This is the screen/active area, not the full device width including bezel, which is slightly larger.',
  },
  {
    id: 'src-osha-monitor-viewing-distance',
    url: 'https://www.osha.gov/etools/computer-workstations/components/monitors',
    title: 'Computer Workstations eTool — Monitors',
    publisher: 'U.S. Department of Labor, Occupational Safety and Health Administration (OSHA)',
    accessedOn: '2026-10-06',
    geography: 'US',
    standard: 'OSHA computer workstation eTool',
    confidence: 'high',
    notes: 'Preferred eye-to-screen viewing distance: 20-40 inches (approx. 500-1000 mm).',
  },
  {
    id: 'src-fitwise-internal-convention',
    title: 'Fitwise internal reference-size and clearance convention',
    publisher: 'Fitwise.stream',
    accessedOn: '2026-10-06',
    confidence: 'medium',
    notes:
      'Internally documented round-number reference sizes and comfort-clearance recommendations used when no single external standard applies; see specs/DATA_MODEL.md §2.',
  },
  {
    id: 'src-sleep-foundation-us-mattress-sizes',
    url: 'https://www.sleepfoundation.org/mattress-information/mattress-sizes',
    title: 'Mattress Sizes 101: Finding Your Perfect Fit',
    publisher: 'Sleep Foundation',
    accessedOn: '2026-10-06',
    geography: 'US',
    confidence: 'high',
    notes:
      'Publishes US nominal mattress dimensions in inches. US King 76×80, Queen 60×80, Full 54×75. Values converted to millimetres; "Full" is used as the US-market term rather than treating Double as a universal name.',
  },
  {
    id: 'src-ikea-uk-malm-double',
    url: 'https://www.ikea.com/gb/en/p/malm-bed-frame-high-white-luroey-s29006978/',
    title: 'MALM bed frame, Standard Double, weight and measurements',
    publisher: 'IKEA UK',
    accessedOn: '2026-10-06',
    geography: 'UK',
    confidence: 'high',
    notes:
      'Product listing states mattress width 135 cm and length 190 cm. This is a representative UK-market Standard Double product, not a global bed-size definition.',
  },
  {
    id: 'src-ikea-uk-malm-king',
    url: 'https://www.ikea.com/gb/en/p/malm-bed-frame-high-white-luroey-s69006981/',
    title: 'MALM bed frame, Standard King, weight and measurements',
    publisher: 'IKEA UK',
    accessedOn: '2026-10-06',
    geography: 'UK',
    confidence: 'high',
    notes:
      'Product listing states mattress width 150 cm and length 200 cm. This is a representative UK-market Standard King product, not a global bed-size definition.',
  },
  {
    id: 'src-sleep-foundation-bedroom-clearance',
    url: 'https://www.sleepfoundation.org/mattress-information/mattress-sizes',
    title: 'Mattress Sizes 101: Finding Your Perfect Fit — Bedroom Dimensions',
    publisher: 'Sleep Foundation',
    accessedOn: '2026-10-06',
    geography: 'global',
    confidence: 'medium',
    notes:
      'Editorial recommendation to leave about 24 inches of space around each side of a bed to avoid a cramped feeling. This is guidance, not a building code or accessibility requirement.',
  },
];
