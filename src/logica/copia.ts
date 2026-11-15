// Copia de seguridad: exportar e importar la partida (JSON).
import { AREAS, COMPANEROS, RITMOS } from '../contenido'
import type { Partida } from './partida'

export function exportarCopia(p: Partida, ahora: Date): string {
  return JSON.stringify({ app: 'a-media-luz', version: 1, exportado: ahora.toISOString(), partida: p }, null, 2)
}

export function importarCopia(texto: string): Partida | null {
  try {
    const d = JSON.parse(texto)
    const p = d?.partida
    if (d?.app !== 'a-media-luz' || d.version !== 1 || !p) return null
    const areas = Object.keys(AREAS)
    const ok =
      p.principal in COMPANEROS && !Number.isNaN(Date.parse(p.inicio)) &&
      Array.isArray(p.acciones) && p.acciones.every((a: { id: unknown; area: string; nombre: unknown; minima: unknown }) =>
        typeof a.id === 'string' && areas.includes(a.area) && typeof a.nombre === 'string' && typeof a.minima === 'string') &&
      p.ritmos && areas.every((a) => p.ritmos[a] in RITMOS) &&
      Array.isArray(p.ofrendas) && p.ofrendas.every((o: { id: unknown; area: string; fecha: string }) =>
        typeof o.id === 'string' && areas.includes(o.area) && !Number.isNaN(Date.parse(o.fecha))) &&
      Array.isArray(p.hallazgos)
    if (!ok) return null
    return { ...p, version: 1, frasesRecientes: Array.isArray(p.frasesRecientes) ? p.frasesRecientes : [] }
  } catch {
    return null
  }
}
