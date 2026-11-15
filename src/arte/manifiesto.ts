// Recursos gráficos APROBADOS que la app puede usar.
// Fuente única: docs/entregas-arte.md (lo mantiene ChatGPT). Aquí solo se copian las rutas
// de los archivos marcados APROBADO que existen en public/arte/. No se dibujan sustitutos:
// si un recurso no está, la interfaz deja su hueco neutro.
//
// Estado a 15/11/2026: ninguna entrega aprobada todavía.

export type ClaveArte =
  | 'bosque/fondo'
  | `companero/${'nox' | 'tofu' | 'bruma' | 'madeja' | 'tuerca'}/base`
  | `objeto/${string}`

export const ARTE: Partial<Record<ClaveArte, string>> = {}

export const rutaArte = (clave: ClaveArte): string | undefined => ARTE[clave]
