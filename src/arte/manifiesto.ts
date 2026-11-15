// Recursos gráficos APROBADOS que la app puede usar.
// Fuente única: docs/entregas-arte.md (lo mantiene ChatGPT). Aquí solo se copian las rutas
// de los archivos marcados APROBADO que existen en public/arte/. No se dibujan sustitutos:
// si un recurso no está, la interfaz deja su hueco neutro.
//
// Las claves y cómo se montan las capas están explicadas en docs/capas-arte.md.
// Estado a 15/11/2026: PACK 1 (Claro del fuego + Nox), pendiente del visto bueno de Javi.

import type { AreaId as Area, CompaneroId as Id } from '../contenido/tipos'
export type Expresion = 'base' | 'contento' | 'enfurrunado' | 'dormido'

export type ClaveArte =
  | `rincon/${Area}/fondo`
  | `rincon/${Area}/crecimiento-${1 | 2 | 3}`
  | `rincon/${Area}/maleza`
  | `rincon/${Area}/visitante`
  | `sendero/${Area}-${Area}`
  | 'sendero/final'
  | `companero/${Id}/${Expresion}`
  | `objeto/${string}`

export const ARTE: Partial<Record<ClaveArte, string>> = {
  'rincon/cuerpo/fondo': '/arte/rincones/cuerpo/fondo.webp',
  'rincon/cuerpo/crecimiento-1': '/arte/rincones/cuerpo/crecimiento-1.webp',
  'rincon/cuerpo/crecimiento-2': '/arte/rincones/cuerpo/crecimiento-2.webp',
  'rincon/cuerpo/crecimiento-3': '/arte/rincones/cuerpo/crecimiento-3.webp',
  'rincon/cuerpo/maleza': '/arte/rincones/cuerpo/maleza.webp',
  'rincon/cuerpo/visitante': '/arte/rincones/cuerpo/visitante.webp',
  'companero/nox/base': '/arte/personajes/nox/base.webp',
  'companero/nox/contento': '/arte/personajes/nox/contento.webp',
  'companero/nox/enfurrunado': '/arte/personajes/nox/enfurrunado.webp',
  'companero/nox/dormido': '/arte/personajes/nox/dormido.webp',
}

export const rutaArte = (clave: ClaveArte): string | undefined => ARTE[clave]
