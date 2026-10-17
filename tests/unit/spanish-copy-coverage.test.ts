import { describe, expect, it } from 'vitest';
import {
  FIT_SERVICE_DEFINITIONS,
  buildFitServicePlan,
  getFitServiceDefaults,
} from '../../src/lib/geometry/fit-services';
import {
  CORE_CALCULATOR_START_GUIDANCE,
  getFitServiceStartGuidance,
} from '../../src/lib/fit/start-guidance';
import {
  CORE_MEASUREMENT_GUIDANCE,
  MEASUREMENT_DIAGRAM_COPY,
  getFitServiceMeasurementGuidance,
} from '../../src/lib/fit/measurement-guidance';
import { translateWorkspaceBedroomText } from '../../src/i18n/es-workspace-bedroom-copy';
import { fitServicesCopy, fitServicesTemplate } from '../../src/i18n/es-fit-services-copy';
import { renderFitServiceAsciiPreview } from '../../src/lib/diagram/render-fit-service-ascii';
import { getFitServiceSteps } from '../../src/lib/geometry/fit-service-steps';
import { translate, translateRequired, translateTemplate } from '../../src/i18n/text';

function expectSpanish(value: string | undefined, context: string) {
  if (!value) return;
  expect(() => translateRequired('es', value), context).not.toThrow();
}

describe('Spanish measurement-help copy coverage', () => {
  it('localizes the initial Fit Services server-rendered content', () => {
    const definition = FIT_SERVICE_DEFINITIONS.find(
      (service) => service.mode === 'appliance-install',
    )!;
    for (const text of [
      definition.title,
      definition.description,
      ...definition.fields.map((field) => field.label),
      'Dimensions and compatibility envelopes for the selected Fit Services calculation',
    ]) {
      expect(fitServicesCopy(text, 'es'), text).not.toBe(text);
    }

    expect(
      fitServicesTemplate('Step {n} of {total}: {title}', 'es', {
        n: 1,
        total: 2,
        title: fitServicesCopy('Choose a fit relationship', 'es'),
      }),
    ).toBe('Paso 1 de 2: Elige una relación de ajuste');

    const preview = renderFitServiceAsciiPreview('appliance-install', {}, 'metric', 'es');
    expect(preview.art).toContain('ELECTRODOMÉSTICO');
    expect(preview.art).toContain('ESPACIO DE INSTALACIÓN');
  });

  it('has Spanish translations for every Fit Services mode, field, option, and step', () => {
    const untranslated = new Set<string>();
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      const visible = [
        definition.title,
        definition.description,
        ...definition.fields.flatMap((field) => [
          field.label,
          ...(field.options ?? []).map((option) => option.label),
        ]),
        ...getFitServiceSteps(definition.mode, definition.fields).map((step) => step.title),
      ];
      for (const text of visible) {
        if (fitServicesCopy(text, 'es') === text) untranslated.add(text);
      }
    }
    expect([...untranslated].sort()).toEqual([]);
  });

  it('has Spanish translations for default Fit Services results and assumptions', () => {
    const untranslated = new Set<string>();
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      const plan = buildFitServicePlan(definition.mode, getFitServiceDefaults(definition.mode));
      const visible = [
        plan.extra,
        ...plan.assumptions,
        ...plan.compatibility.flatMap((check) => [check.label, check.detail]),
        ...(plan.candidates ?? []).flatMap((candidate) => [candidate.label, candidate.detail]),
      ];
      for (const text of visible) {
        if (text && fitServicesCopy(text, 'es') === text) untranslated.add(text);
      }
    }
    expect([...untranslated].sort()).toEqual([]);
  });

  it('keeps measurement-dependent Fit Services result copy in Spanish', () => {
    const workspaceValues = getFitServiceDefaults('workspace-compatibility');
    workspaceValues.monitorWeight = 9;
    workspaceValues.armMaxLoad = 14;
    workspaceValues.monitorVesa = '75x75';
    const tvValues = getFitServiceDefaults('tv-fit');
    tvValues.setup = 'wall';
    tvValues.tvWeight = 23;
    tvValues.mountMaxLoad = 42;
    tvValues.tvVesa = '300x300';
    const storageValues = getFitServiceDefaults('storage');
    storageValues.requestedQuantity = 13;
    const shedValues = getFitServiceDefaults('garden-shed-storage');
    shedValues.itemQuantity = 5;
    const patioValues = getFitServiceDefaults('garden-patio-dining');
    patioValues.advertisedWidth = 4000;
    patioValues.advertisedDepth = 3500;

    const plans = [
      buildFitServicePlan('workspace-compatibility', workspaceValues),
      buildFitServicePlan('tv-fit', tvValues),
      buildFitServicePlan('storage', storageValues),
      buildFitServicePlan('garden-shed-storage', shedValues),
      buildFitServicePlan('garden-patio-dining', patioValues),
    ];
    for (const plan of plans) {
      const visible = [plan.extra, ...plan.compatibility.map((check) => check.detail)].filter(
        (text): text is string => Boolean(text),
      );
      for (const text of visible) {
        expect(fitServicesCopy(text, 'es'), text).not.toBe(text);
      }
    }
  });

  it('covers Spanish Rug calculator copy used by the static and dynamic UI', () => {
    const visible = [
      'Example values are illustrative placeholders, not recommended rug dimensions or styling advice.',
      'Measure the room and rug',
      'Enter clear inside room dimensions and the rug’s laid-flat outside dimensions.',
      'Inside room width',
      'Rug outside depth',
      'Advanced options · Optional',
      'Room-axis alignment',
      'Try both 90-degree orientations',
      'The border is your chosen layout target, not a universal rug-sizing rule.',
      'Choose what the rug should cover',
      'Also check a furniture/use footprint against the rug',
      'Coverage mode',
      'Keep the full footprint on the rug',
      'Rug fit result',
      'Rug and furniture footprint visualization',
      'Rug-to-room dimensions and selected rug-to-furniture coverage dimensions',
      'Rug width runs along the room width.',
      'Rug is rotated 90 degrees against the room axes.',
      'Furniture coverage is disabled; only rug-to-room dimensions are checked.',
      'Centered rectangular comparison only; it does not place furniture in a floor plan or infer styling preferences.',
      'rug width against room width',
      'rug depth against room depth',
      'furniture/use footprint depth on rug',
      'furniture front width with selected side margin',
      'rug overlap and extension at furniture front edge',
    ];
    for (const source of visible) {
      expect(translateRequired('es', source), source).not.toBe(source);
    }

    expect(
      translateTemplate(
        'es',
        'The {measurement} room border is an extra user-selected target on every rug edge, not a universal design rule.',
        { measurement: '10 cm' },
      ),
    ).toContain('10 cm');
    expect(
      translateTemplate(
        'es',
        'Centered rectangular room and rug comparison. Room {roomWidth} by {roomDepth}. Rug {rugWidth} by {rugDepth} in the selected orientation. {relationship} This is not a complete floor-plan placement tool.',
        {
          roomWidth: '400 cm',
          roomDepth: '500 cm',
          rugWidth: '240 cm',
          rugDepth: '300 cm',
          relationship: translate('es', 'Furniture coverage is not checked.'),
        },
      ),
    ).toContain('No se comprueba');
  });

  it('localizes sticky calculator labels and result-state announcements', () => {
    const resultLabel = 'Tu resultado — No cabe físicamente';
    const sharedLabel = translateTemplate(
      'es',
      'Fit result: {resultLabel}. View calculation details.',
      { resultLabel },
    );
    const workspaceLabel = translateWorkspaceBedroomText(
      'es',
      `Fit result: ${resultLabel}. View calculation details.`,
    );
    const servicesLabel = fitServicesTemplate(
      'Fit services result: {resultLabel}. View calculation details.',
      'es',
      { resultLabel },
    );

    for (const label of [sharedLabel, workspaceLabel, servicesLabel]) {
      expect(label).toContain(resultLabel);
      expect(label).not.toMatch(/Fit result|Fit services result|View calculation details/);
    }
    for (const phrase of [
      'No measurement tolerance remains',
      'Compatibility failed',
      'Verification needed',
      'Physical fit failed',
    ]) {
      expect(fitServicesCopy(phrase, 'es'), phrase).not.toBe(phrase);
    }
  });

  it('localizes the new header theme and language control labels', () => {
    expect(translateRequired('es', 'Theme')).toBe('Tema');
    expect(
      translateTemplate('es', 'Theme: {theme}', { theme: translateRequired('es', 'Dark') }),
    ).toBe('Tema: Oscuro');
    expect(
      translateTemplate('es', 'Site language: {language}', {
        language: translateRequired('es', 'Spanish'),
      }),
    ).toBe('Idioma del sitio: Español');
  });

  it('preserves measured values when translating workspace templates', () => {
    expect(
      translateWorkspaceBedroomText(
        'es',
        "Monitor stand/base depth: 200 mm (7.87 in) initial example; replace it with the actual model's sourced depth.",
      ),
    ).toBe(
      'Profundidad del soporte/base del monitor: 200 mm (7.87 in) como ejemplo inicial; sustitúyelo por la profundidad documentada del modelo.',
    );
  });

  it('translates every public calculator preparation prompt', () => {
    for (const [calculator, items] of Object.entries(CORE_CALCULATOR_START_GUIDANCE)) {
      for (const [index, item] of items.entries()) {
        expectSpanish(item.text, `${calculator}.start.${index}`);
      }
    }
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      const setups = definition.mode === 'tv-fit' ? ['wall', 'stand'] : [undefined];
      for (const setup of setups) {
        const values = { setup } as Parameters<typeof getFitServiceStartGuidance>[1];
        for (const [index, item] of getFitServiceStartGuidance(definition.mode, values).entries()) {
          expectSpanish(item.text, `${definition.mode}.start.${setup ?? 'default'}.${index}`);
        }
      }
    }
  });

  it('translates all core calculator measurement guidance and diagrams', () => {
    for (const [calculator, fields] of Object.entries(CORE_MEASUREMENT_GUIDANCE)) {
      for (const [field, guidance] of Object.entries(fields)) {
        for (const key of [
          'label',
          'summaryHelp',
          'measureHelp',
          'example',
          'warning',
          'sourceRequirement',
        ] as const) {
          expectSpanish(guidance[key], `${calculator}.${field}.${key}`);
        }
        if (guidance.diagram) {
          const copy = MEASUREMENT_DIAGRAM_COPY[guidance.diagram];
          expectSpanish(copy.title, `${calculator}.${field}.diagram.title`);
          expectSpanish(copy.description, `${calculator}.${field}.diagram.description`);
        }
      }
    }
  });

  it('translates all Fit Services measurement guidance', () => {
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      for (const field of definition.fields) {
        const item = getFitServiceMeasurementGuidance(definition.mode, field.name);
        if (!item) continue;
        for (const key of [
          'label',
          'summaryHelp',
          'measureHelp',
          'example',
          'warning',
          'sourceRequirement',
        ] as const) {
          expectSpanish(item[key], `${definition.mode}.${field.name}.${key}`);
        }
        if (item.diagram) {
          const copy = MEASUREMENT_DIAGRAM_COPY[item.diagram];
          expectSpanish(copy.title, `${definition.mode}.${field.name}.diagram.title`);
          expectSpanish(copy.description, `${definition.mode}.${field.name}.diagram.description`);
        }
      }
    }
  });
});
