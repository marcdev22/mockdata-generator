import { NssUniquenessError } from './errors';
import { defaultRandom, randomInt, type RandomSource } from './random';

const DEFAULT_MAX_ATTEMPTS = 100;

export interface GenerateNssOptions {
  readonly birthYear: number;
  readonly currentYear: number;
  readonly existingNss?: ReadonlySet<string>;
  readonly random?: RandomSource;
  readonly maxAttempts?: number;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0');
}

export function calculateLuhnCheckDigit(baseTenDigits: string): number {
  if (!/^\d{10}$/.test(baseTenDigits)) {
    throw new RangeError('La base del NSS debe contener exactamente 10 dígitos.');
  }

  let sum = 0;

  for (let index = 0; index < baseTenDigits.length; index += 1) {
    const digit = Number(baseTenDigits.charAt(baseTenDigits.length - 1 - index));

    if (index % 2 === 0) {
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    } else {
      sum += digit;
    }
  }

  return (10 - (sum % 10)) % 10;
}

export function isValidNss(nss: string): boolean {
  return (
    /^\d{11}$/.test(nss) && calculateLuhnCheckDigit(nss.slice(0, 10)) === Number(nss.charAt(10))
  );
}

export function generateNss(options: GenerateNssOptions): string {
  const {
    birthYear,
    currentYear,
    existingNss = new Set<string>(),
    random = defaultRandom,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
  } = options;

  if (!Number.isInteger(birthYear) || !Number.isInteger(currentYear) || birthYear > currentYear) {
    throw new RangeError('El año de nacimiento o de registro no es válido.');
  }

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new RangeError('El número máximo de intentos debe ser un entero positivo.');
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const office = pad(randomInt(1, 99, random), 2);
    const registrationYear = pad(randomInt(birthYear, currentYear, random) % 100, 2);
    const birthYearDigits = pad(birthYear % 100, 2);
    const folio = pad(randomInt(0, 9999, random), 4);
    const base = `${office}${registrationYear}${birthYearDigits}${folio}`;
    const candidate = `${base}${calculateLuhnCheckDigit(base)}`;

    if (!existingNss.has(candidate)) {
      return candidate;
    }
  }

  throw new NssUniquenessError(maxAttempts);
}
