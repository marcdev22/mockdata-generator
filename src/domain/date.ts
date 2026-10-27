import { defaultRandom, randomInt, type RandomSource } from './random';
import type { DateParts } from './types';

const MILLISECONDS_PER_DAY = 86_400_000;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function daysInUtcMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function subtractUtcYears(date: Date, years: number): Date {
  const year = date.getUTCFullYear() - years;
  const monthIndex = date.getUTCMonth();
  const day = Math.min(date.getUTCDate(), daysInUtcMonth(year, monthIndex));

  return new Date(Date.UTC(year, monthIndex, day));
}

export function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MILLISECONDS_PER_DAY);
}

export function utcDaysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY);
}

export function toDateParts(date: Date): DateParts {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  return {
    year,
    month,
    day,
    iso: `${pad(year, 4)}-${pad(month)}-${pad(day)}`,
  };
}

export function createDateOfBirth(
  now: Date,
  random: RandomSource = defaultRandom,
  minAge = 18,
  maxAge = 80,
): DateParts {
  if (!Number.isInteger(minAge) || !Number.isInteger(maxAge) || minAge < 0 || maxAge < minAge) {
    throw new RangeError('El rango de edad configurado no es válido.');
  }

  const today = startOfUtcDay(now);
  const latestBirthDate = subtractUtcYears(today, minAge);
  const earliestBirthDate = subtractUtcYears(today, maxAge);
  const offset = randomInt(0, utcDaysBetween(earliestBirthDate, latestBirthDate), random);

  return toDateParts(addUtcDays(earliestBirthDate, offset));
}

export function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  const match = ISO_DATE_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function isValidIsoDate(value: string): boolean {
  return parseIsoDate(value) !== null;
}

export function formatIsoDate(value: string): string {
  const parts = parseIsoDate(value);

  if (!parts) {
    throw new RangeError(`La fecha "${value}" no tiene un formato ISO válido.`);
  }

  return `${pad(parts.day)}/${pad(parts.month)}/${pad(parts.year, 4)}`;
}

export function formatCurpDate(parts: Pick<DateParts, 'year' | 'month' | 'day'>): string {
  return `${pad(parts.year % 100)}${pad(parts.month)}${pad(parts.day)}`;
}
