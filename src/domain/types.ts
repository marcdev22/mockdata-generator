export type Sex = 'H' | 'M';

export interface BirthEntity {
  readonly code: string;
  readonly name: string;
}

export interface NameParts {
  readonly givenNames: readonly string[];
  readonly paternalSurname: string;
  readonly maternalSurname: string;
}

export interface DateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly iso: string;
}

export interface SyntheticIdentity {
  readonly id: string;
  readonly isSynthetic: true;
  readonly givenNames: readonly string[];
  readonly paternalSurname: string;
  readonly maternalSurname: string;
  readonly fullName: string;
  readonly dateOfBirth: string;
  readonly sex: Sex;
  readonly birthEntityCode: string;
  readonly birthEntityName: string;
  readonly curp: string;
  readonly rfc: string;
  readonly nss: string;
  readonly createdAt: string;
}

export interface SavedIdentity extends SyntheticIdentity {
  readonly savedAt: string;
}
