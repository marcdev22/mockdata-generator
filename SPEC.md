# Especificación: Datos de Prueba

## 1. Resumen

Aplicación web de una sola página que genera identidades mexicanas sintéticas para pruebas de software. Todo el procesamiento ocurre en el cliente. No existe backend, autenticación, analítica ni sincronización remota.

La interfaz está en español y presenta una identidad generada desde el primer render. El guardado es explícito y el historial se conserva en `localStorage`.

## 2. Objetivos

- Producir identidades completas y visualmente coherentes para QA y demos.
- Mantener CURP y RFC con estructura y dígito verificador correctos.
- Generar un NSS de 11 dígitos con una validación de consistencia claramente etiquetada como no oficial.
- Permitir copiar campos individuales o la identidad completa.
- Ofrecer historial local con búsqueda, restauración, eliminación y borrado total confirmado.
- Cumplir prácticas de accesibilidad, responsive y manejo de errores.
- No realizar solicitudes de red.

## 3. No objetivos

- Validar identidades contra RENAPO, SAT, IMSS u otro registro oficial.
- Producir documentos, credenciales o comprobantes.
- Garantizar que una combinación no coincida con una persona real.
- Sincronizar historial entre navegadores, perfiles o dispositivos.
- Autenticar usuarios o almacenar información en servidores.
- Generar homoclaves reales del SAT o números asignados por el IMSS.

## 4. Requisitos funcionales

### RF-01 Generación inicial

- Al cargar la aplicación debe existir una identidad actual generada y marcada como no guardada.
- La generación inicial debe considerar los NSS ya presentes en el historial local.
- La identidad debe incluir: ID, indicador sintético, nombres, apellidos, nombre completo, fecha de nacimiento, sexo, clave y nombre de entidad, CURP, RFC, NSS y fecha de creación.

### RF-02 Nueva identidad

- El botón «Generar otra identidad» reemplaza la identidad actual.
- La nueva identidad no se guarda automáticamente.
- La generación debe usar el historial vigente para evitar colisiones de NSS.
- Si se agotan los intentos, se muestra un error y se conserva la identidad anterior.

### RF-03 Presentación

- Se muestran siete campos: nombre completo, fecha de nacimiento, sexo, entidad de nacimiento, CURP, RFC y NSS.
- La fecha se muestra como `DD/MM/AAAA`.
- El sexo se muestra como «Hombre» o «Mujer».
- CURP, RFC y NSS usan tipografía monoespaciada.
- Una franja de estado indica «Guardada» o «Sin guardar».
- Un aviso visible aclara que la identidad es ficticia y explica las limitaciones de CURP, RFC y NSS.

### RF-04 Copiado

- Cada campo tiene una acción de copiado con nombre accesible.
- «Copiar todos los datos» copia siete líneas con etiqueta y valor.
- El éxito se refleja en el botón y en una región `aria-live`.
- Si el portapapeles falla, se muestra un aviso con opción de cierre.
- Se usa la API asíncrona de portapapeles y un respaldo con `textarea` para contextos restringidos.

### RF-05 Guardado

- «Guardar en el historial» agrega la identidad actual con `savedAt`.
- Si la identidad ya está guardada, la acción se deshabilita y el estado lo indica.
- El guardado exitoso muestra un aviso no bloqueante.
- Si falla la escritura local, el historial no cambia y se muestra un error.
- Se conservan como máximo 50 registros; al superar el límite se descarta el más antiguo.

### RF-06 Historial

- El panel muestra las identidades guardadas, más recientes primero.
- Cada tarjeta muestra nombre, CURP, fecha de guardado y acciones «Ver», «Copiar» y «Eliminar».
- «Ver» restaura la identidad en la tarjeta principal y desplaza la vista.
- La tarjeta de la identidad visible se marca con «En pantalla».
- Eliminar un registro actualiza el estado de guardado de la identidad principal.
- El borrado total exige confirmación explícita.
- Una búsqueda filtra por nombre, CURP, RFC o NSS, ignorando acentos y mayúsculas.
- Los estados vacío y sin resultados tienen mensajes diferenciados.

### RF-07 Persistencia

- Al iniciar, se lee `automatic-data-app:identities`.
- Solo se acepta el esquema `version: 1`.
- Los registros inválidos se descartan sin romper la aplicación.
- Los datos inválidos, JSON corrupto, versiones desconocidas o storage no disponible producen un historial vacío al cargar.
- Un fallo al guardar, eliminar o borrar muestra un aviso y preserva el estado anterior.

### RF-08 Generación de nombres

- Los nombres se eligen de un catálogo de exactamente 100 valores únicos en mayúsculas.
- Los apellidos se eligen de un catálogo de exactamente 100 valores únicos en mayúsculas, con referencias de testing.
- El nombre completo contiene dos o tres nombres, con `TEST` exactamente como segundo o tercer nombre.
- Los dos apellidos son distintos.
- No se usa `TEST` como nombre del catálogo ni como único nombre.

### RF-09 Fecha y entidad

- La edad al momento de generar está entre 18 y 80 años cumplidos, calculada en UTC.
- Las fechas se almacenan como ISO `AAAA-MM-DD` y se validan como fechas reales.
- La entidad se elige uniformemente entre las 32 claves estatales del catálogo.
- La fecha usada en CURP y RFC es la misma fecha de nacimiento.

### RF-10 CURP

- Debe tener 18 caracteres y superar el dígito verificador.
- El primer bloque usa la primera letra y primera vocal interna del apellido paterno, la inicial del materno y la inicial del nombre seleccionado.
- Para nombres comunes (`MARIA`, `MA`, `M`, `JOSE`, `J`) se usa el siguiente nombre, salvo que también sea común, en cuyo caso se usa el tercero.
- Los acentos se eliminan y `Ñ` se normaliza a `X`.
- La homonimia es un dígito para nacimientos anteriores a 2000 y una letra `A`-`J` desde 2000.
- La posición 17 es la clave de entidad y la 18 el dígito verificador.

### RF-11 RFC

- Debe tener 13 caracteres y superar el dígito verificador.
- El prefijo usa apellido paterno, apellido materno y nombre con la misma selección de nombres comunes.
- Se conserva `Ñ`; los acentos y caracteres no admitidos se eliminan.
- La homoclave de dos caracteres es aleatoria y sintética.
- Se usa la tabla de valores del Anexo 3, incluidos `Ñ = 38` y `& = 24`.
- No se consulta ni replica una asignación real del SAT.

### RF-12 NSS

- Debe tener 11 dígitos y conservar ceros iniciales.
- Los primeros dos dígitos representan una oficina sintética; los dos siguientes, el año de registro; los dos siguientes, el año de nacimiento; los cuatro siguientes, un folio; el último es el dígito Luhn.
- El año de registro no puede ser anterior al de nacimiento ni posterior al año actual.
- El último dígito se calcula con Luhn sobre los primeros 10.
- La validación Luhn se documenta como no oficial.
- Se intenta evitar colisión contra un conjunto de NSS existentes, con máximo de intentos configurable y error tipado al agotarse.

## 5. Modelo de dominio

```ts
interface SyntheticIdentity {
  id: string;
  isSynthetic: true;
  givenNames: readonly string[];
  paternalSurname: string;
  maternalSurname: string;
  fullName: string;
  dateOfBirth: string;
  sex: 'H' | 'M';
  birthEntityCode: string;
  birthEntityName: string;
  curp: string;
  rfc: string;
  nss: string;
  createdAt: string;
}

interface SavedIdentity extends SyntheticIdentity {
  savedAt: string;
}
```

`createdAt` y `savedAt` son fechas ISO. `id` usa `crypto.randomUUID()` cuando está disponible y un respaldo local en caso contrario.

## 6. Esquema de persistencia

```json
{
  "version": 1,
  "identities": [
    {
      "id": "uuid",
      "isSynthetic": true,
      "givenNames": ["ANA", "TEST"],
      "paternalSurname": "MOCKERNANDEZ",
      "maternalSurname": "LOOPEZ",
      "fullName": "ANA TEST MOCKERNANDEZ LOOPEZ",
      "dateOfBirth": "1990-04-09",
      "sex": "M",
      "birthEntityCode": "DF",
      "birthEntityName": "Ciudad de México",
      "curp": "...",
      "rfc": "...",
      "nss": "...",
      "createdAt": "2026-10-26T12:00:00.000Z",
      "savedAt": "2026-10-26T12:05:00.000Z"
    }
  ]
}
```

Validación al cargar:

1. La raíz debe ser un objeto con `version === 1` e `identities` como arreglo.
2. Cada registro debe cumplir el modelo.
3. `isSynthetic` debe ser `true`.
4. `givenNames` debe tener 2 o 3 elementos y `TEST` en la segunda o tercera posición.
5. `dateOfBirth` debe ser una fecha ISO real.
6. La entidad debe existir en el catálogo.
7. CURP, RFC y NSS deben superar sus validaciones estructurales.
8. `createdAt` y `savedAt` deben ser fechas válidas.
9. Se ordena por `savedAt` descendente y se recorta a 50.

## 7. Interfaz y experiencia

- Estética neobrutalista con bordes gruesos, sombras sólidas, tipografía de alto contraste y paleta amarillo, rosa, azul y verde.
- Cabecera con marca, alcance local y sello sintético.
- Hero con propuesta de valor, aviso de límites y acción principal.
- Tarjeta principal y panel lateral de historial; en pantallas menores se apilan.
- Sin Tailwind, librerías de componentes ni fuentes remotas.
- Botones con estados hover, active, disabled y focus visible.
- Avisos de generación, copiado y almacenamiento con cierre manual.
- Confirmación de guardado mediante aviso temporal y estado persistente del botón.

## 8. Accesibilidad

- Idioma de documento `es`.
- Enlace para saltar al contenido.
- Jerarquía de encabezados `h1` a `h3`.
- Controles nativos para botones, búsqueda y grupos.
- Nombres accesibles en todas las acciones de copiado y eliminación.
- Etiqueta explícita para la búsqueda del historial.
- Regiones `role="status"` para copiado y avisos de guardado, y `role="alert"` para errores.
- Foco visible reforzado.
- Sin dependencia exclusiva del color para estados.
- Respeto de `prefers-reduced-motion` en CSS y desplazamiento programático.

## 9. Arquitectura

- `src/domain`: lógica pura, catálogos, cálculos y validaciones.
- `src/services`: límites de infraestructura para storage y clipboard.
- `src/hooks`: estado de historial y feedback de portapapeles.
- `src/components`: presentación y composición sin lógica de dominio.
- `src/App.tsx`: orquestación de la identidad actual, alertas y avisos.
- Persistencia validada de extremo a extremo; no se confía en datos de `localStorage`.
- Errores tipados para storage, clipboard y agotamiento de NSS.

### Supuestos de seguridad y privacidad

- No se procesan datos personales reales.
- No hay red, cookies, analítica ni telemetría.
- El historial es visible localmente para cualquiera con acceso al navegador.
- La aplicación no mitiga amenazas de extensiones del navegador o equipos comprometidos.

## 10. Criterios de aceptación

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` y `pnpm build` terminan correctamente.
- La carga inicial muestra una identidad completa y «Sin guardar».
- Generar otra identidad cambia los datos y permite guardarlos.
- Copiar un campo y copiar todo produce el contenido esperado y feedback visible.
- Guardar crea una tarjeta en historial y persiste tras recargar.
- «Ver» restaura la identidad guardada.
- Eliminar y borrar todo actualizan la interfaz y el estado de guardado.
- La búsqueda filtra por nombre y documentos sin distinguir acentos.
- No hay desbordamiento horizontal a 390 px.
- Datos corruptos o inválidos no rompen el render.
- La suite no depende de servicios externos.

## 11. Pruebas

- Unitarias: catálogos, colocación de `TEST`, fechas y edades, CURP, RFC, NSS, aleatoriedad, identidad completa, formato y almacenamiento.
- Componentes: render inicial, generación, guardado, restauración, eliminación, borrado confirmado, copiado y carga desde storage.
- Integración de infraestructura: clipboard con API y respaldo.
- E2E: flujo completo en Chromium, persistencia tras recarga, búsqueda/limpieza y responsive móvil.
- No se usan snapshots de imagen.

## 12. Limitaciones conocidas

- CURP y RFC son estructuralmente válidos, no oficialmente válidos.
- La homoclave del RFC y el NSS son sintéticos.
- El NSS no usa la regla oficial de asignación del IMSS.
- La unicidad de NSS es solo local.
- No hay garantía de unicidad global de CURP, RFC o nombres.
- Puede existir una coincidencia accidental con datos reales; la probabilidad es baja pero no nula.
- El historial se pierde al limpiar el almacenamiento o cambiar de navegador/perfil.
- El límite de 50 registros es deliberado.
- No hay exportación, importación, edición manual ni generación por lotes.
