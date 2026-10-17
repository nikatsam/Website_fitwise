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
import { translateRequired } from '../../src/i18n/text';
import { translateWorkspaceBedroomText } from '../../src/i18n/es-workspace-bedroom-copy';
import { fitServicesCopy, fitServicesTemplate } from '../../src/i18n/es-fit-services-copy';
import { renderFitServiceAsciiPreview } from '../../src/lib/diagram/render-fit-service-ascii';
import { getFitServiceSteps } from '../../src/lib/geometry/fit-service-steps';

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
