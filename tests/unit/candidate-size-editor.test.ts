import { describe, expect, it } from 'vitest';
import {
  parseCandidateSizeInput,
  renderCandidateSizeEditorMarkup,
  serializeCandidateSizeInput,
  validateCandidateSizeInputRow,
} from '../../src/lib/fit/candidate-size-editor';

describe('structured Garden candidate size editor', () => {
  it('converts existing candidate examples into editable width/depth rows', () => {
    const rows = parseCandidateSizeInput('1.8 m x 1.2 m; 2.4 m x 1.8 m');

    expect(rows).toEqual([
      { id: 1, width: '1.8 m', depth: '1.2 m' },
      { id: 2, width: '2.4 m', depth: '1.8 m' },
    ]);
  });

  it('serializes structured rows to the existing calculation format', () => {
    expect(
      serializeCandidateSizeInput([
        { id: 1, width: '2.4 m', depth: '1.8 m' },
        { id: 2, width: '300 cm', depth: '240 cm' },
      ]),
    ).toBe('2.4 m x 1.8 m; 300 cm x 240 cm');
  });

  it('validates each row independently while allowing an empty extra row', () => {
    expect(validateCandidateSizeInputRow({ id: 1, width: '2.4 m', depth: '' })).toContain(
      'Enter both width and depth',
    );
    expect(validateCandidateSizeInputRow({ id: 2, width: 'two metres', depth: '1.8 m' })).toContain(
      'Width:',
    );
    expect(validateCandidateSizeInputRow({ id: 3, width: '', depth: '' })).toBeNull();
    expect(validateCandidateSizeInputRow({ id: 4, width: '2.4 m', depth: '1.8 m' })).toBeNull();
  });

  it('renders labeled controls and add/remove buttons without a visible mini-language field', () => {
    const html = renderCandidateSizeEditorMarkup(
      'service-candidateSizes',
      '2.4 m x 1.8 m',
      true,
      ' data-show-when-name="direction" data-show-when-value="plot-to-structure"',
    );

    expect(html).toContain('<legend>Candidate body sizes</legend>');
    expect(html).toContain('Candidate 1 width');
    expect(html).toContain('Candidate 1 depth');
    expect(html).toContain('aria-label="Remove candidate 1"');
    expect(html).toContain('+ Add another size');
    expect(html).toContain('type="hidden" name="candidateSizes"');
    expect(html).not.toContain('textarea');
    expect(html).not.toContain('separated by semicolons');
  });
});
