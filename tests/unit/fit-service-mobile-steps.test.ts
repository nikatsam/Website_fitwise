import { describe, expect, it } from 'vitest';
import { getFitServiceDefinition, getFitServiceMobileSteps } from '../../src/lib/geometry';

describe('Fit Services mobile steps', () => {
  it('groups every delivery-route control without changing field definitions', () => {
    const fields = getFitServiceDefinition('delivery-route').fields;
    const steps = getFitServiceMobileSteps('delivery-route', fields);

    expect(steps?.map((step) => step.title)).toEqual([
      'Item to move',
      'Entry and hallway',
      'Turns and stairs',
      'Destination opening',
    ]);
    expect(steps?.flatMap((step) => step.fields.map((field) => field.name)).sort()).toEqual(
      fields.map((field) => field.name).sort(),
    );
  });

  it('groups both structure sizing directions while preserving conditional fields', () => {
    const fields = getFitServiceDefinition('garden-structure').fields;
    const steps = getFitServiceMobileSteps('garden-structure', fields);

    expect(steps?.map((step) => step.title)).toEqual([
      'Plan and structure type',
      'Usable plot',
      'Structure or candidates',
      'Roof, maintenance and access',
    ]);
    expect(steps?.flatMap((step) => step.fields.map((field) => field.name)).sort()).toEqual(
      fields.map((field) => field.name).sort(),
    );
    expect(steps?.flatMap((step) => step.fields).filter((field) => field.showWhen)).toHaveLength(
      fields.filter((field) => field.showWhen).length,
    );
  });

  it('leaves short service modes in their existing non-step form', () => {
    expect(getFitServiceMobileSteps('pool-room', getFitServiceDefinition('pool-room').fields)).toBe(
      undefined,
    );
  });
});
