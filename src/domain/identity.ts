import { buildCurp } from './curp';
import { BIRTH_ENTITIES } from './datasets/birthEntities';
import { createDateOfBirth } from './date';
import { createIdentityId, type IdFactory } from './id';
import { buildFullName, generateNameParts } from './names';
import { generateNss } from './nss';
import { defaultRandom, pickOne, randomInt, type RandomSource } from './random';
import { buildRfc } from './rfc';
import type { Sex, SyntheticIdentity } from './types';

export interface GenerateIdentityOptions {
  readonly random?: RandomSource;
  readonly now?: () => Date;
  readonly idFactory?: IdFactory;
  readonly existingNss?: ReadonlySet<string>;
}

export function generateSyntheticIdentity(
  options: GenerateIdentityOptions = {},
): SyntheticIdentity {
  const random = options.random ?? defaultRandom;
  const now = options.now ?? (() => new Date());
  const idFactory = options.idFactory ?? createIdentityId;
  const generatedAt = now();
  const name = generateNameParts(random);
  const dateOfBirth = createDateOfBirth(generatedAt, random);
  const sex: Sex = randomInt(0, 1, random) === 0 ? 'H' : 'M';
  const birthEntity = pickOne(BIRTH_ENTITIES, random);
  const curp = buildCurp(
    {
      name,
      dateOfBirth,
      sex,
      birthEntityCode: birthEntity.code,
    },
    random,
  );
  const rfc = buildRfc({ name, dateOfBirth }, random);
  const nss = generateNss({
    birthYear: dateOfBirth.year,
    currentYear: generatedAt.getUTCFullYear(),
    existingNss: options.existingNss ?? new Set<string>(),
    random,
  });

  return {
    id: idFactory(),
    isSynthetic: true,
    givenNames: name.givenNames,
    paternalSurname: name.paternalSurname,
    maternalSurname: name.maternalSurname,
    fullName: buildFullName(name),
    dateOfBirth: dateOfBirth.iso,
    sex,
    birthEntityCode: birthEntity.code,
    birthEntityName: birthEntity.name,
    curp,
    rfc,
    nss,
    createdAt: generatedAt.toISOString(),
  };
}
