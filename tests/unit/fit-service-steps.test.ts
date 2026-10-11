import { describe, expect, it } from 'vitest';
import {
  FIT_SERVICE_DEFINITIONS,
  getFitServiceDefinition,
  getFitServiceSteps,
} from '../../src/lib/geometry';

describe('Fit Services steps', () => {
  it('groups every delivery-route control without changing field definitions', () => {
    const fields = getFitServiceDefinition('delivery-route').fields;
    const steps = getFitServiceSteps('delivery-route', fields);

    expect(steps.map((step) => step.title)).toEqual([
      'Item to move',
      'Entry and hallway',
      'Turns and stairs',
      'Destination opening',
    ]);
    expect(steps.flatMap((step) => step.fields.map((field) => field.name)).sort()).toEqual(
      fields.map((field) => field.name).sort(),
    );
  });

  it('groups both structure sizing directions while preserving conditional fields', () => {
    const fields = getFitServiceDefinition('garden-structure').fields;
    const steps = getFitServiceSteps('garden-structure', fields);

    expect(steps.map((step) => step.title)).toEqual([
      'Plan and structure type',
      'Usable plot',
      'Structure or candidates',
      'Roof, maintenance and access',
    ]);
    expect(steps.flatMap((step) => step.fields.map((field) => field.name)).sort()).toEqual(
      fields.map((field) => field.name).sort(),
    );
    expect(steps.flatMap((step) => step.fields).filter((field) => field.showWhen)).toHaveLength(
      fields.filter((field) => field.showWhen).length,
    );
  });

  it('groups every service mode and assigns every field exactly once', () => {
    for (const definition of FIT_SERVICE_DEFINITIONS) {
      const steps = getFitServiceSteps(definition.mode, definition.fields);
      const assignedFields = steps.flatMap((step) => step.fields.map((field) => field.name));

      expect(steps.length, definition.mode).toBeGreaterThan(1);
      expect(assignedFields.sort(), definition.mode).toEqual(
        definition.fields.map((field) => field.name).sort(),
      );
      expect(new Set(assignedFields).size, definition.mode).toBe(assignedFields.length);
    }
  });
});
