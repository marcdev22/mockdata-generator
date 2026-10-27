import { formatIsoDate } from './date';
import type { Sex, SyntheticIdentity } from './types';

export const SEX_LABELS: Readonly<Record<Sex, string>> = {
  H: 'Hombre',
  M: 'Mujer',
};

export type IdentityFieldKey =
  'fullName' | 'dateOfBirth' | 'sex' | 'birthEntity' | 'curp' | 'rfc' | 'nss';

export interface IdentityFieldDescriptor {
  readonly key: IdentityFieldKey;
  readonly label: string;
  readonly value: string;
  readonly monospace?: boolean;
  readonly wide?: boolean;
}

export function getIdentityFields(identity: SyntheticIdentity): IdentityFieldDescriptor[] {
  return [
    {
      key: 'fullName',
      label: 'Nombre completo',
      value: identity.fullName,
      wide: true,
    },
    {
      key: 'dateOfBirth',
      label: 'Fecha de nacimiento',
      value: formatIsoDate(identity.dateOfBirth),
    },
    {
      key: 'sex',
      label: 'Sexo',
      value: SEX_LABELS[identity.sex],
    },
    {
      key: 'birthEntity',
      label: 'Entidad de nacimiento',
      value: identity.birthEntityName,
      wide: true,
    },
    {
      key: 'curp',
      label: 'CURP',
      value: identity.curp,
      monospace: true,
      wide: true,
    },
    {
      key: 'rfc',
      label: 'RFC',
      value: identity.rfc,
      monospace: true,
    },
    {
      key: 'nss',
      label: 'NSS',
      value: identity.nss,
      monospace: true,
    },
  ];
}

export function formatIdentityForClipboard(identity: SyntheticIdentity): string {
  return getIdentityFields(identity)
    .map((field) => `${field.label}: ${field.value}`)
    .join('\n');
}

export function formatSavedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
