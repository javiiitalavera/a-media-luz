// Recursos gráficos APROBADOS que la app puede usar.
// Fuente única: docs/entregas-arte.md (lo mantiene ChatGPT). Aquí solo se copian las rutas
// de los archivos marcados APROBADO que existen en public/arte/. No se dibujan sustitutos:
// si un recurso no está, la interfaz deja su hueco neutro.
//
// Las claves y cómo se montan las capas están explicadas en docs/capas-arte.md.
// Estado a 15/11/2026: ninguna entrega aprobada todavía.

import type { AreaId as Area, CompaneroId as Id } from '../contenido/tipos'
export type Expresion = 'base' | 'contento' | 'enfurrunado' | 'dormido'

export type ClaveArte =
  | `rincon/${Area}/fondo`
  | `rincon/${Area}/crecimiento-${1 | 2 | 3}`
  | `rincon/${Area}/maleza`
  | `rincon/${Area}/visitante`
  | `companero/${Id}/${Expresion}`
  | `objeto/${string}`

export const ARTE: Partial<Record<ClaveArte, string>> = {}

export const rutaArte = (clave: ClaveArte): string | undefined => ARTE[clave]
