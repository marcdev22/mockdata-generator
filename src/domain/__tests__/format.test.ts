import { describe, expect, it } from 'vitest';

import { formatIsoDate } from '../date';
import {
  formatIdentityForClipboard,
  formatSavedAt,
  getIdentityFields,
  SEX_LABELS,
} from '../format';
import { createTestIdentity } from '../../test/fixtures';

describe('identity formatting', () => {
  it('creates Spanish presentation fields', () => {
    const identity = createTestIdentity();
    const fields = getIdentityFields(identity);

    expect(fields.map((field) => field.label)).toEqual([
      'Nombre completo',
      'Fecha de nacimiento',
      'Sexo',
      'Entidad de nacimiento',
      'CURP',
      'RFC',
      'NSS',
    ]);
    expect(fields[1]?.value).toBe(formatIsoDate(identity.dateOfBirth));
    expect(fields[2]?.value).toBe(SEX_LABELS[identity.sex]);
    expect(fields[4]?.value).toBe(identity.curp);
  });

  it('formats a complete copy block', () => {
    const identity = createTestIdentity({ id: 'copy-test' });
    const text = formatIdentityForClipboard(identity);

    expect(text).toContain(`Nombre completo: ${identity.fullName}`);
    expect(text).toContain(`CURP: ${identity.curp}`);
    expect(text).toContain(`RFC: ${identity.rfc}`);
    expect(text).toContain(`NSS: ${identity.nss}`);
    expect(text.split('\n')).toHaveLength(7);
  });

  it('formats saved timestamps and falls back for invalid values', () => {
    expect(formatSavedAt('not-a-date')).toBe('not-a-date');
    expect(formatSavedAt('2026-10-26T12:05:00.000Z')).not.toBe('2026-10-26T12:05:00.000Z');
  });
});
