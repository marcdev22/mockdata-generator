export type RandomSource = () => number;

export const defaultRandom: RandomSource = () => Math.random();

function readRandom(random: RandomSource): number {
  const value = random();

  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('La fuente aleatoria debe producir valores entre 0 y 1.');
  }

  return value;
}

export function randomInt(
  minInclusive: number,
  maxInclusive: number,
  random: RandomSource = defaultRandom,
): number {
  if (!Number.isInteger(minInclusive) || !Number.isInteger(maxInclusive)) {
    throw new RangeError('Los límites aleatorios deben ser enteros.');
  }

  if (minInclusive > maxInclusive) {
    throw new RangeError('El límite inferior no puede superar al superior.');
  }

  return minInclusive + Math.floor(readRandom(random) * (maxInclusive - minInclusive + 1));
}

export function pickOne<T>(items: readonly T[], random: RandomSource = defaultRandom): T {
  if (items.length === 0) {
    throw new RangeError('No se puede elegir un elemento de una colección vacía.');
  }

  const item = items[randomInt(0, items.length - 1, random)];

  if (item === undefined) {
    throw new RangeError('El índice aleatorio quedó fuera de la colección.');
  }

  return item;
}

export function pickDistinct<T>(
  items: readonly T[],
  count: number,
  random: RandomSource = defaultRandom,
): T[] {
  if (!Number.isInteger(count) || count < 0 || count > items.length) {
    throw new RangeError('La cantidad solicitada no está disponible en la colección.');
  }

  const pool = [...items];
  const selected: T[] = [];

  while (selected.length < count) {
    const index = randomInt(0, pool.length - 1, random);
    const [item] = pool.splice(index, 1);

    if (item === undefined) {
      throw new RangeError('No se pudo extraer el elemento aleatorio.');
    }

    selected.push(item);
  }

  return selected;
}
