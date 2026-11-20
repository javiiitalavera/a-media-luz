// Qué puede comentar un vecino al tocarlo, según lo que pasa (contenido/charla.ts). Devuelve los grupos de
// frases que vienen a cuento ahora; quien elige mezcla estos grupos con los saludos de la hora.
import { CHARLA } from '../contenido/charla'
import type { CompaneroId } from '../contenido'
import type { Partida } from './partida'
import { hechaHoy, misHazanas } from './hazanas'
import { nacidos, progreso } from './etapas'
import { construido } from './casa'
import { ecosDe } from './situaciones'
import { dia, diasEntre } from './fechas'
import { momentoDelDia } from './momento'

/** Días sin tachar nada para que se note que vuelves. */
export const DIAS_PARA_VUELTA = 3

export function gruposDeCharla(p: Partida, c: CompaneroId, ahora: Date): string[][] {
  const ch = CHARLA[c]
  if (!ch) return []
  const grupos: string[][] = []
  const hoy = dia(ahora)

  // Cómo va tu lista (sin tachar nada, solo a partir de mediodía: por la mañana no se pincha).
  const mias = misHazanas(p)
  if (mias.length) {
    const hechas = mias.filter((a) => hechaHoy(p, a.id, ahora)).length
    if (hechas === mias.length) grupos.push(ch.hoy.todo)
    else if (hechas > 0) grupos.push(ch.hoy.algo)
    else if (momentoDelDia(ahora) !== 'amanecer') grupos.push(ch.hoy.nada)
  }

  const d = ahora.getDay()
  if (d === 1) grupos.push(ch.semana.lunes)
  else if (d === 5) grupos.push(ch.semana.viernes)
  else if (d === 0 || d === 6) grupos.push(ch.semana.finde)

  // Vuelves tras unos días sin tachar nada (lo último antes de hoy fue hace 3 días o más).
  const antes = p.ofrendas.map((o) => dia(o.fecha)).filter((f) => f < hoy).sort().at(-1)
  if (antes && diasEntre(antes, hoy) >= DIAS_PARA_VUELTA) grupos.push(ch.vuelta)

  grupos.push(ch.etapa[progreso(p, c, ahora).etapa])

  for (const [id, frases] of Object.entries(ch.objetos)) if (construido(p, id)) grupos.push(frases)

  // Lo que ya pasó vuelve como remate, sin repetir la historia entera.
  grupos.push(...ecosDe(p, c))

  for (const otro of nacidos(p, ahora)) {
    const frases = otro !== c ? ch.vecinos[otro] : undefined
    if (frases?.length) grupos.push(frases)
  }
  return grupos.filter((g) => g.length)
}
