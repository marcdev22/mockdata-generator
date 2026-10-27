import { formatCurpDate } from './date';
import { getFirstInternalVowel, getInitial, normalizeForRfc, selectRfcGivenName } from './names';
import { defaultRandom, pickOne, type RandomSource } from './random';
import type { DateParts, NameParts } from './types';

const RFC_CHARACTER_VALUES: Readonly<Record<string, number>> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
  H: 17,
  I: 18,
  J: 19,
  K: 20,
  L: 21,
  M: 22,
  N: 23,
  '&': 24,
  O: 25,
  P: 26,
  Q: 27,
  R: 28,
  S: 29,
  T: 30,
  U: 31,
  V: 32,
  W: 33,
  X: 34,
  Y: 35,
  Z: 36,
  Ñ: 38,
};

const HOMOCLAVE_CHARACTERS = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

export interface RfcInput {
  readonly name: NameParts;
  readonly dateOfBirth: Pick<DateParts, 'year' | 'month' | 'day'>;
}

export function calculateRfcCheckDigit(firstTwelveCharacters: string): string {
  if (!/^[A-Z0-9&Ñ]{12}$/.test(firstTwelveCharacters)) {
    throw new RangeError('El RFC base debe contener 12 caracteres válidos en mayúsculas.');
  }

  let sum = 0;

  for (let index = 0; index < firstTwelveCharacters.length; index += 1) {
    const character = firstTwelveCharacters.charAt(index);
    const numericValue = RFC_CHARACTER_VALUES[character];

    if (numericValue === undefined) {
      throw new RangeError(`El carácter "${character}" no es válido para un RFC.`);
    }

    sum += numericValue * (13 - index);
  }

  const remainder = sum % 11;

  if (remainder === 0) {
    return '0';
  }

  const result = 11 - remainder;

  if (result === 10) {
    return 'A';
  }

  return String(result);
}

export function isValidRfcCheckDigit(rfc: string): boolean {
  if (!/^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/.test(rfc)) {
    return false;
  }

  return calculateRfcCheckDigit(rfc.slice(0, 12)) === rfc.charAt(12);
}

export function buildRfcPrefix(name: NameParts): string {
  const paternalSurname = normalizeForRfc(name.paternalSurname) || 'X';
  const maternalSurname = normalizeForRfc(name.maternalSurname) || 'X';
  const selectedGivenName = selectRfcGivenName(name.givenNames);

  return (
    getInitial(paternalSurname) +
    getFirstInternalVowel(paternalSurname) +
    getInitial(maternalSurname) +
    getInitial(selectedGivenName)
  );
}

export function buildRfc(input: RfcInput, random: RandomSource = defaultRandom): string {
  const homoclave = pickOne(HOMOCLAVE_CHARACTERS, random) + pickOne(HOMOCLAVE_CHARACTERS, random);
  const firstTwelve = buildRfcPrefix(input.name) + formatCurpDate(input.dateOfBirth) + homoclave;

  return `${firstTwelve}${calculateRfcCheckDigit(firstTwelve)}`;
}
