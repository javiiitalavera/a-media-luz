// Subir la meta (decidido por Javi, 20/11/2026): el esfuerzo crece contigo. Cuando un reto fijo con número
// ya te sale solo (10 días cumplido desde la última vez que se tocó), el vecino de su área propone subirlo
// un escalón. Como mucho una propuesta al día; si dices que no, ese reto no se vuelve a proponer en 14 días.
// Los retos sin número (llamar a un amigo, quedar…) no se proponen. La versión mínima no cambia.
import { AREAS, type CompaneroId } from '../contenido'
import type { Accion } from '../contenido'
import type { Partida } from './partida'
import { misHazanas, editarHazana } from './hazanas'
import { nacido } from './etapas'
import { dia, diasEntre } from './fechas'

export const DIAS_PARA_SUBIR = 10
export const DIAS_TRAS_NO = 14

/** La meta un escalón más arriba, o null si no tiene número o no tiene sentido subirla (horas de sueño, litros…). */
export function metaSubida(nombre: string): string | null {
  const m = /(\d{1,3}(?:[.\s]\d{3})+|\d+)(\s*)([a-záéíóúñ]*)/i.exec(nombre)
  if (!m) return null
  const n = Number(m[1].replace(/[.\s]/g, ''))
  const unidad = m[3].toLowerCase()
  if (!n || /^(hora|horas|h|litro|litros|l|vaso|vasos|comida|comidas)$/.test(unidad)) return null
  const nuevo = unidad.startsWith('paso') ? (n >= 1000 ? n + 1000 : Math.round(n * 1.25))
    : unidad.startsWith('min') ? n + 5
    : unidad.startsWith('pág') || unidad.startsWith('pag') ? n + 5
    : Math.max(n + 1, Math.round(n * 1.25))
  // Se respeta cómo estaba escrito el número (con o sin punto de miles).
  const sep = /[.\s]/.exec(m[1])?.[0]
  const escrito = sep ? String(nuevo).replace(/\B(?=(\d{3})+(?!\d))/g, sep) : String(nuevo)
  return nombre.slice(0, m.index) + escrito + nombre.slice(m.index + m[1].length)
}

const deEse = (p: Partida, id: string) => new Set(p.ofrendas.filter((o) => o.accionId === id).map((o) => dia(o.fecha)))

export interface PropuestaMeta { reto: Accion; vecino: CompaneroId; nueva: string }

/** La propuesta de hoy, si toca. */
export function propuestaDeMeta(p: Partida, ahora: Date): PropuestaMeta | null {
  const hoy = dia(ahora)
  const m = p.metas ?? {}
  if (m.dia === hoy) return null // ya se ha contestado una hoy
  for (const reto of misHazanas(p)) {
    const nueva = metaSubida(reto.nombre)
    if (!nueva || nueva === reto.nombre) continue
    const vecino = AREAS[reto.area].companero
    if (!nacido(p, vecino, ahora)) continue
    const no = m.rechazos?.[reto.id]
    if (no && diasEntre(no, hoy) < DIAS_TRAS_NO) continue
    const desde = m.subidas?.[reto.id]
    const dias = [...deEse(p, reto.id)].filter((d) => !desde || diasEntre(desde, d) > 0).filter((d) => diasEntre(d, hoy) >= 0).length
    if (dias >= DIAS_PARA_SUBIR) return { reto, vecino, nueva }
  }
  return null
}

/** «Súbelo»: la meta cambia y vuelve a contar desde hoy. */
export function aceptarMeta(p: Partida, id: string, nueva: string, ahora: Date): Partida {
  const hoy = dia(ahora)
  const q = editarHazana(p, id, { nombre: nueva })
  return { ...q, metas: { ...q.metas, dia: hoy, subidas: { ...q.metas?.subidas, [id]: hoy } } }
}

/** «Así está bien»: no se vuelve a proponer ese reto en un par de semanas. */
export function rechazarMeta(p: Partida, id: string, ahora: Date): Partida {
  const hoy = dia(ahora)
  return { ...p, metas: { ...p.metas, dia: hoy, rechazos: { ...p.metas?.rechazos, [id]: hoy } } }
}
