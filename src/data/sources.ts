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
    id: 'src-samsung-m7-stand-spec',
    url: 'https://www.samsung.com/ph/business/monitors/high-resolution/smart-m7-32-inch-smart-tv-experience-ls32bm700uexxp/',
    title: 'Samsung Smart Monitor M7 M70B 32-inch dimensions',
    publisher: 'Samsung',
    accessedOn: '2026-10-08',
    geography: 'global',
    confidence: 'high',
    notes:
      'Samsung lists 716.1 x 517.0 x 193.5 mm with stand and 716.1 x 424.5 x 41.8 mm without stand. Model-specific example; not a 32-inch category average.',
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
    id: 'src-ccohs-monitor-positioning',
    url: 'https://www.ccohs.ca/oshanswers/ergonomics/office/monitor_positioning.html',
    title: 'Office Ergonomics - Positioning the Monitor',
    publisher: 'Canadian Centre for Occupational Health and Safety (CCOHS)',
    accessedOn: '2026-10-08',
    geography: 'CA',
    standard: 'CCOHS OSH Answers',
    confidence: 'high',
    notes:
      'States viewing-distance recommendations vary and are guidelines rather than fixed rules; average resting point of accommodation is about 80 cm, and arm length is a starting estimate adjusted to the person and task.',
  },
  {
    id: 'src-ccohs-ergonomic-chair',
    url: 'https://www.ccohs.ca/oshanswers/ergonomics/office/chair.html',
    title: 'Office Ergonomics - Ergonomic Chair',
    publisher: 'Canadian Centre for Occupational Health and Safety (CCOHS)',
    accessedOn: '2026-10-08',
    geography: 'CA',
    standard: 'CCOHS OSH Answers',
    confidence: 'high',
    notes:
      'Says chair fit depends on the worker, workstation and task; advises sufficient seat/back support and movement but does not state a universal numeric pull-back clearance.',
  },
  {
    id: 'src-herman-miller-aeron-size-b',
    url: 'https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/',
    title: 'Aeron Chair Size and Dimensions',
    publisher: 'Herman Miller',
    accessedOn: '2026-10-08',
    geography: 'global',
    confidence: 'high',
    notes:
      'For Size B with fully adjustable arms, the manufacturer lists overall width 28.3-30.4 in, overall depth 27.5-28.3 in, height 36.8-41.1 in and seat depth 17 in. The example uses maximum dimensions converted to millimeters and rounded to the nearest millimeter.',
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
      'Product listing states mattress width 135 cm and length 190 cm, with bed-frame outer width 150 cm and length 199 cm. Frame allowances in the model are derived by halving the outer-minus-mattress difference on each axis.',
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
      'Product listing states mattress width 150 cm and length 200 cm, with bed-frame outer width 166 cm and length 209 cm. Frame allowances in the model are derived by halving the outer-minus-mattress difference on each axis.',
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
  {
    id: 'src-ikea-pax-grimo-wardrobe',
    url: 'https://www.ikea.com/us/en/p/pax-grimo-wardrobe-combination-white-white-s69560819/',
    title: 'PAX / GRIMO two-door wardrobe combination',
    publisher: 'IKEA US',
    accessedOn: '2026-10-08',
    geography: 'US',
    confidence: 'high',
    notes:
      'Product size is 39 3/8 x 23 5/8 x 79 1/4 in. The component listing identifies two GRIMO door leaves, each 19 1/2 x 76 5/8 in. A 90-degree swing projection equal to leaf width is a geometry estimate, not a walking-clearance standard.',
  },
  {
    id: 'src-ikea-uk-hemnes-bedside',
    url: 'https://www.ikea.com/gb/en/p/hemnes-bedside-table-grey-green-light-brown-stained-50610739/',
    title: 'HEMNES bedside table 46 x 35 cm',
    publisher: 'IKEA UK',
    accessedOn: '2026-10-08',
    geography: 'UK',
    confidence: 'high',
    notes: 'Product dimensions: width 46 cm, depth 35 cm, height 70 cm.',
  },
  {
    id: 'src-ikea-uk-hemnes-8-drawer',
    url: 'https://www.ikea.com/gb/en/p/hemnes-chest-of-8-drawers-white-stain-10239280/',
    title: 'HEMNES chest of 8 drawers 160 x 96 cm',
    publisher: 'IKEA UK',
    accessedOn: '2026-10-08',
    geography: 'UK',
    confidence: 'high',
    notes:
      'Product dimensions: width 160 cm, depth 50 cm, height 96 cm; manufacturer lists drawer pull-out of 29.4 cm. Drawer extension is not standing/walking clearance.',
  },
];
