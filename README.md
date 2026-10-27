# Datos de Prueba

Generador local de identidades mexicanas sintéticas para QA, demos y desarrollo. Crea nombres, fechas de nacimiento, CURP, RFC y NSS coherentes sin backend, cuentas ni servicios externos.

> Todos los datos son ficticios. No son documentos oficiales, no acreditan identidad y no deben usarse para trámites reales. Cualquier parecido con una persona existente es accidental.

## Características

- Identidad completa generada en el navegador: nombre, fecha de nacimiento, sexo, entidad, CURP, RFC y NSS.
- CURP y RFC construidos con sus reglas estructurales y dígito verificador.
- NSS de 11 dígitos con validación Luhn de consistencia, documentada como no oficial.
- Nombre con el token visible `TEST` como segundo o tercer nombre.
- 100 nombres y 100 apellidos únicos; los apellidos incluyen guiños de testing.
- Copiado por campo, copiado de toda la identidad y confirmación visual y accesible.
- Historial local con guardado explícito, búsqueda sin distinción de acentos, restauración, eliminación y borrado total confirmado.
- Persistencia versionada en `localStorage`, validada al cargar y limitada a 50 registros.
- Interfaz española, adaptable a móvil, con foco visible, enlaces de salto, avisos ARIA y reducción de movimiento.
- Sin llamadas de red, sin analítica y sin fuentes externas.

## Stack

- React 19 y TypeScript 6 en modo estricto.
- Vite 8.
- CSS puro.
- Vitest, Testing Library y Playwright.
- ESLint y Prettier.

Las versiones exactas están fijadas en `package.json`. TypeScript se mantiene en `6.0.3` porque `typescript-eslint@8.72.0` todavía declara compatibilidad con versiones anteriores a `6.1.0`.

## Requisitos

- Node.js `>=24.22.1`.
- pnpm `>=12.15.0`.

Con Corepack:

```bash
corepack enable
corepack prepare pnpm@12.15.0 --activate
```

Alternativa:

```bash
npm install -g pnpm@12.15.0
```

## Inicio rápido

```bash
pnpm install
pnpm dev
```

Vite mostrará la URL local. La aplicación genera una identidad inicial sin guardarla.

## Scripts

| Comando              | Descripción                                        |
| -------------------- | -------------------------------------------------- |
| `pnpm dev`           | Servidor de desarrollo de Vite.                    |
| `pnpm build`         | Typecheck y compilación de producción en `dist/`.  |
| `pnpm preview`       | Sirve la compilación de producción.                |
| `pnpm typecheck`     | Verificación estricta de TypeScript.               |
| `pnpm test`          | Suite unitaria y de componentes con Vitest.        |
| `pnpm test:watch`    | Vitest en modo interactivo.                        |
| `pnpm test:coverage` | Cobertura con V8.                                  |
| `pnpm test:e2e`      | Compila y ejecuta Playwright sobre `vite preview`. |
| `pnpm test:e2e:ui`   | Interfaz interactiva de Playwright.                |
| `pnpm lint`          | ESLint sin advertencias permitidas.                |
| `pnpm format`        | Formatea el repositorio con Prettier.              |
| `pnpm format:check`  | Comprueba el formato sin escribir.                 |

Antes de ejecutar E2E por primera vez:

```bash
pnpm exec playwright install chromium
```

## Identificadores

### CURP

- 18 caracteres con homonimia y dígito verificador.
- Normaliza acentos y convierte `Ñ` en `X` para el cálculo.
- Usa el segundo nombre cuando el primero es común, como `MARÍA` o `JOSÉ`.
- La entidad se elige entre las 32 claves estatales incluidas en el catálogo.
- No se valida contra RENAPO ni contra registros reales.

### RFC

- 13 caracteres: prefijo de nombre, fecha `AAMMDD`, homoclave sintética y dígito verificador.
- Conserva `Ñ` y aplica la tabla de valores del Anexo 3 para el cálculo.
- La homoclave es aleatoria; no representa una asignación del SAT.

### NSS

- 11 dígitos con año de nacimiento y año de registro coherentes.
- El último dígito se calcula con Luhn solo como consistencia estructural.
- Luhn no es la regla oficial de asignación del IMSS.
- Se evitan colisiones contra la identidad actual y el historial local con reintentos acotados.

## Historial y persistencia

- Clave: `automatic-data-app:identities`.
- Esquema versionado: `{ "version": 1, "identities": [...] }`.
- Cada registro incluye `isSynthetic: true`, `createdAt` y `savedAt`.
- Al cargar se validan forma, fecha, entidad, CURP, RFC, NSS y token `TEST`; los registros inválidos se descartan.
- Máximo 50 identidades, ordenadas por guardado más reciente.
- Si el navegador bloquea o llena `localStorage`, la interfaz muestra un aviso y no modifica el estado.
- El historial es local al navegador y perfil; no se sincroniza.

## Estructura

```text
src/
  components/          UI reutilizable, tarjeta, historial e iconos
  domain/              generación, validación, fechas y formato
    datasets/          nombres, apellidos y entidades
    __tests__/         pruebas de dominio
  hooks/               historial y portapapeles
  services/            persistencia y clipboard
  styles/              estilos globales
  test/                setup y utilidades de prueba
e2e/                   flujos críticos con Playwright
SPEC.md                especificación funcional y técnica
```

## Pruebas

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm format:check
```

La suite cubre datasets, fechas, nombres, CURP, RFC, NSS, generación completa, formato, aleatoriedad, almacenamiento, portapapeles, la interfaz principal y tres flujos E2E en Chromium: generación/copiado/guardado/restauración, búsqueda/eliminación/borrado y uso móvil sin desbordamiento horizontal.

## Privacidad

La aplicación no envía datos a ningún servidor. La generación, el copiado y el historial ocurren en el navegador. No hay cookies, analítica, telemetría ni recursos remotos.

## Limitaciones

- Los datos no tienen validez oficial ni sustituyen documentos reales.
- Las validaciones de CURP y RFC son estructurales; no confirman existencia o vigencia.
- El NSS usa una comprobación Luhn no oficial y no representa una asignación del IMSS.
- La unicidad de NSS solo se garantiza dentro de la sesión y el historial local.
- CURP, RFC y nombres pueden repetirse entre ejecuciones; no hay una base global.
- Borrar los datos del navegador elimina el historial.
- La aplicación no está diseñada para generar identidades de personas reales ni para evadir controles.

Consulta [SPEC.md](SPEC.md) para las reglas completas y los criterios de aceptación.
