import { GIVEN_NAMES } from './datasets/givenNames';
import { SURNAMES } from './datasets/surnames';
import { defaultRandom, pickDistinct, randomInt, type RandomSource } from './random';
import type { NameParts } from './types';

export const TEST_GIVEN_NAME = 'TEST';

const COMMON_FIRST_NAMES = new Set(['MARIA', 'MA', 'M', 'JOSE', 'J']);
const CURP_VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

function stripDiacritics(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeDisplayName(value: string): string {
  return value.normalize('NFC').trim().toUpperCase();
}

export function normalizeForCurp(value: string): string {
  return stripDiacritics(value.toUpperCase().replaceAll('Ñ', 'X')).replace(/[^A-Z]/g, '');
}

export function normalizeForRfc(value: string): string {
  const sentinel = '\u0000';

  return stripDiacritics(value.toUpperCase().replaceAll('Ñ', sentinel))
    .replaceAll(sentinel, 'Ñ')
    .replace(/[^A-ZÑ&]/g, '');
}

export function getInitial(value: string): string {
  return value.charAt(0) || 'X';
}

export function getFirstInternalVowel(value: string): string {
  for (let index = 1; index < value.length; index += 1) {
    const character = value.charAt(index);

    if (CURP_VOWELS.has(character)) {
      return character;
    }
  }

  return 'X';
}

export function getFirstInternalConsonant(value: string): string {
  for (let index = 1; index < value.length; index += 1) {
    const character = value.charAt(index);

    if (character && !CURP_VOWELS.has(character)) {
      return character;
    }
  }

  return 'X';
}

function selectGivenNameForIdentifier(
  givenNames: readonly string[],
  normalize: (value: string) => string,
): string {
  const normalizedNames = givenNames.map(normalize).filter(Boolean);
  const first = normalizedNames[0];

  if (!first) {
    return 'X';
  }

  if (!COMMON_FIRST_NAMES.has(first)) {
    return first;
  }

  const second = normalizedNames[1];

  if (!second) {
    return first;
  }

  if (COMMON_FIRST_NAMES.has(second)) {
    return normalizedNames[2] ?? second;
  }

  return second;
}

export function selectCurpGivenName(givenNames: readonly string[]): string {
  return selectGivenNameForIdentifier(givenNames, normalizeForCurp);
}

export function selectRfcGivenName(givenNames: readonly string[]): string {
  return selectGivenNameForIdentifier(givenNames, normalizeForRfc);
}

export function buildFullName(name: NameParts): string {
  return [...name.givenNames, name.paternalSurname, name.maternalSurname].join(' ');
}

export function hasRequiredTestPlacement(givenNames: readonly string[]): boolean {
  return givenNames[1] === TEST_GIVEN_NAME || givenNames[2] === TEST_GIVEN_NAME;
}

export function generateNameParts(random: RandomSource = defaultRandom): NameParts {
  const givenNameCount = randomInt(2, 3, random);
  const baseGivenNames = pickDistinct(GIVEN_NAMES, givenNameCount - 1, random);
  const testPosition = givenNameCount === 2 ? 1 : randomInt(1, 2, random);
  const givenNames: string[] = [...baseGivenNames];
  givenNames.splice(testPosition, 0, TEST_GIVEN_NAME);

  const [paternalSurname, maternalSurname] = pickDistinct(SURNAMES, 2, random);

  if (!paternalSurname || !maternalSurname) {
    throw new RangeError('No se pudieron seleccionar los apellidos.');
  }

  if (!hasRequiredTestPlacement(givenNames)) {
    throw new Error('La colocación del token TEST no es válida.');
  }

  return {
    givenNames,
    paternalSurname,
    maternalSurname,
  };
}
