// Cada vecino crece con días de su área y su primer proyecto se paga con su material.
// Si tu lista no tiene nada de esa área, te lo pide él (con un reto que cueste algo y se añade con un toque),
// para que nadie se quede haciendo cosas sin avanzar y sin saber por qué.
import { ACCIONES, COMPANEROS, type AreaId, type CompaneroId } from '../contenido'
import type { Partida } from './partida'
import { cabeOtro, misHazanas } from './hazanas'
import { mesActual } from './meses'
import { nacido, NIVEL_MAXIMO, progreso } from './etapas'
import { sugerencias, type Sugerencia } from './sugerencias'
import { dia } from './fechas'

/** Un reto de cada área que pida algo de esfuerzo, si el cuestionario no sugiere ninguno de ella (decidido por Javi, 20/11/2026: nada de retos fáciles). */
const CON_ESFUERZO: Record<AreaId, string> = { cuerpo: 'pasos', mente: 'leer', calma: 'meditar', vinculos: 'amigo', orden: 'gestion' }

export interface Pista { vecino: CompaneroId; area: AreaId; reto: Sugerencia; cabe: boolean }

export function retoQueFalta(p: Partida, ahora: Date, vecino = mesActual(p).companero): Pista | null {
  if (!nacido(p, vecino, ahora) || progreso(p, vecino, ahora).nivel >= NIVEL_MAXIMO) return null
  // «Luego»: no vuelve a pedirlo hasta mañana (ni en su casa ni en Retos).
  if (p.vistos?.pideReto?.[vecino] === dia(ahora)) return null
  const area = COMPANEROS[vecino].area
  if (misHazanas(p).some((a) => a.area === area)) return null
  const sugerido = sugerencias(p.perfil ?? { mejorar: [] }).find((s) => ACCIONES.find((a) => a.id === s.id)?.area === area)
  const c = ACCIONES.find((a) => a.id === CON_ESFUERZO[area])!
  const reto = sugerido ?? { id: c.id, nombre: c.nombre, minima: c.minima }
  return { vecino, area, reto, cabe: cabeOtro(p, area) }
}

/** «Luego»: deja la petición para mañana. */
export const aplazarPista = (p: Partida, vecino: CompaneroId, ahora: Date): Partida =>
  ({ ...p, vistos: { ...p.vistos, pideReto: { ...p.vistos?.pideReto, [vecino]: dia(ahora) } } })
