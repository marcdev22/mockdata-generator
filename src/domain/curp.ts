import { formatCurpDate } from './date';
import {
  getFirstInternalConsonant,
  getFirstInternalVowel,
  getInitial,
  normalizeForCurp,
  selectCurpGivenName,
} from './names';
import { defaultRandom, pickOne, type RandomSource } from './random';
import type { DateParts, NameParts, Sex } from './types';

const CURP_CHARACTER_VALUES: Readonly<Record<string, number>> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
  I: 8,
  J: 9,
  K: 0,
  L: 1,
  M: 2,
  N: 3,
  O: 5,
  P: 6,
  Q: 7,
  R: 8,
  S: 9,
  T: 0,
  U: 1,
  V: 2,
  W: 3,
  X: 4,
  Y: 5,
  Z: 6,
};

const PRE_2000_HOMONYM_CHARACTERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const POST_2000_HOMONYM_CHARACTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] as const;

export interface CurpInput {
  readonly name: NameParts;
  readonly dateOfBirth: Pick<DateParts, 'year' | 'month' | 'day'>;
  readonly sex: Sex;
  readonly birthEntityCode: string;
  readonly homonymCharacter?: string;
}

export function createCurpHomonymCharacter(
  birthYear: number,
  random: RandomSource = defaultRandom,
): string {
  const characters = birthYear < 2000 ? PRE_2000_HOMONYM_CHARACTERS : POST_2000_HOMONYM_CHARACTERS;

  return pickOne(characters, random);
}

export function calculateCurpCheckDigit(firstSeventeenCharacters: string): number {
  if (!/^[A-Z0-9]{17}$/.test(firstSeventeenCharacters)) {
    throw new RangeError('La CURP base debe contener 17 caracteres alfanuméricos en mayúsculas.');
  }

  let sum = 0;

  for (let index = 0; index < firstSeventeenCharacters.length; index += 1) {
    const character = firstSeventeenCharacters.charAt(index);
    const numericValue = /^\d$/.test(character)
      ? Number(character)
      : CURP_CHARACTER_VALUES[character];

    if (numericValue === undefined) {
      throw new RangeError(`El carácter "${character}" no es válido para una CURP.`);
    }

    sum += numericValue * (18 - index);
  }

  return (10 - (sum % 10)) % 10;
}

export function isValidCurpCheckDigit(curp: string): boolean {
  if (curp.length !== 18 || !/^[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z]{3}[0-9A-J]\d$/.test(curp)) {
    return false;
  }

  return calculateCurpCheckDigit(curp.slice(0, 17)) === Number(curp.charAt(17));
}

function resolveHomonymCharacter(input: CurpInput, random: RandomSource): string {
  const homonym =
    input.homonymCharacter ?? createCurpHomonymCharacter(input.dateOfBirth.year, random);
  const validCharacters = input.dateOfBirth.year < 2000 ? /^[0-9]$/ : /^[A-J]$/;

  if (!validCharacters.test(homonym)) {
    throw new RangeError('El carácter de homonimia no corresponde al siglo de nacimiento.');
  }

  return homonym;
}

export function buildCurp(input: CurpInput, random: RandomSource = defaultRandom): string {
  if (!/^[A-Z]{2}$/.test(input.birthEntityCode)) {
    throw new RangeError('La clave de entidad federativa debe tener dos letras mayúsculas.');
  }

  if (input.sex !== 'H' && input.sex !== 'M') {
    throw new RangeError('El sexo debe ser H o M.');
  }

  const paternalSurname = normalizeForCurp(input.name.paternalSurname) || 'X';
  const maternalSurname = normalizeForCurp(input.name.maternalSurname) || 'X';
  const selectedGivenName = selectCurpGivenName(input.name.givenNames);
  const homonym = resolveHomonymCharacter(input, random);

  const firstFour =
    getInitial(paternalSurname) +
    getFirstInternalVowel(paternalSurname) +
    getInitial(maternalSurname) +
    getInitial(selectedGivenName);

  const internalConsonants =
    getFirstInternalConsonant(paternalSurname) +
    getFirstInternalConsonant(maternalSurname) +
    getFirstInternalConsonant(selectedGivenName);

  const base =
    firstFour +
    formatCurpDate(input.dateOfBirth) +
    input.sex +
    input.birthEntityCode +
    internalConsonants +
    homonym;

  return `${base}${calculateCurpCheckDigit(base)}`;
}
