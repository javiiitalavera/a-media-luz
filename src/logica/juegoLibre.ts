// Juego libre opcional: pequeños objetos que se escapan y una foto al pasear por el barrio.
// No hay recompensas, encargos pendientes, rachas, avisos ni tareas para el día siguiente.
import { COMPANEROS, type CompaneroId } from '../contenido'
import type { Partida } from './partida'
import { azarConSemilla } from './azar'
import { dia, lunes } from './fechas'
import { nacido, nacidos } from './etapas'
import { anadirMomento, fotoDe } from './momentos'

export interface IniciativaDelDia {
  dia: string
  /** null: hoy el barrio está tranquilo; no insistir cambiando de casa. */
  vecino: CompaneroId | null
  pasos: number
}
export interface RondaDelDia {
  dia: string
  visitados: CompaneroId[]
}

export const INICIATIVAS: Record<CompaneroId, {
  arte: string
  nombre: string
  remate: string
  pasos: number
}> = {
  nox: {
    arte: '/arte/curiosidades/cerilla.webp',
    nombre: 'Cerilla que se escapa',
    remate: 'Era mía. Lo sabía. No sabía dónde.',
    pasos: 3,
  },
  tuerca: {
    arte: '/arte/curiosidades/tornillo.webp',
    nombre: 'Tornillo fugitivo',
    remate: 'Recuperado. Ahora me falta el agujero.',
    pasos: 4,
  },
  tofu: {
    arte: '/arte/curiosidades/semilla.webp',
    nombre: 'Semilla inquieta',
    remate: 'Quiere que la plante. Le he pedido una solicitud formal.',
    pasos: 2,
  },
  bruma: {
    arte: '/arte/curiosidades/rocio.webp',
    nombre: 'Gota escurridiza',
    remate: 'Era mía. Bueno, era lluvia. Ahora es mía.',
    pasos: 3,
  },
  madeja: {
    arte: '/arte/curiosidades/ovillo.webp',
    nombre: 'Ovillo travieso',
    remate: 'Se ha vuelto a enrollar solo. Me ha quitado el trabajo.',
    pasos: 3,
  },
}

const SITIOS: Record<CompaneroId, { x: number; y: number }[]> = {
  nox: [{ x: 32, y: 64 }, { x: 70, y: 55 }, { x: 36, y: 48 }, { x: 71, y: 66 }],
  tuerca: [{ x: 32, y: 63 }, { x: 70, y: 52 }, { x: 37, y: 49 }, { x: 71, y: 66 }],
  tofu: [{ x: 31, y: 62 }, { x: 69, y: 54 }, { x: 36, y: 47 }, { x: 71, y: 64 }],
  bruma: [{ x: 30, y: 59 }, { x: 68, y: 50 }, { x: 36, y: 45 }, { x: 72, y: 61 }],
  madeja: [{ x: 29, y: 64 }, { x: 70, y: 54 }, { x: 35, y: 48 }, { x: 72, y: 66 }],
}

export interface IniciativaVisible {
  vecino: CompaneroId
  nombre: string
  arte: string
  x: number
  y: number
  pasos: number
}

/** Se ofrece, o se decide no ofrecer, al entrar por primera vez en una casa ese día. */
export function ofrecerIniciativa(p: Partida, vecino: CompaneroId, ahora: Date): Partida {
  if (!nacido(p, vecino, ahora)) return p
  const hoy = dia(ahora)
  if (p.iniciativa?.dia === hoy) return p
  const azar = azarConSemilla('iniciativa|' + hoy + '|' + p.inicio)()
  return {
    ...p,
    iniciativa: { dia: hoy, vecino: azar < 0.65 ? vecino : null, pasos: 0 },
  }
}

/** El objeto vive en la escena y cambia de sitio tras cada toque. */
export function iniciativaVisible(p: Partida, vecino: CompaneroId, ahora: Date): IniciativaVisible | null {
  const activa = p.iniciativa
  if (!activa || activa.dia !== dia(ahora) || activa.vecino !== vecino || activa.pasos >= INICIATIVAS[vecino].pasos) return null
  const datos = INICIATIVAS[vecino]
  const posiciones = SITIOS[vecino]
  const variacion = Math.floor(azarConSemilla('objeto-escapista|' + activa.dia + '|' + vecino)() * posiciones.length)
  const sitio = posiciones[(activa.pasos + variacion) % posiciones.length]
  return { vecino, nombre: datos.nombre, arte: datos.arte, x: sitio.x, y: sitio.y, pasos: activa.pasos }
}

/** Tocar al fugitivo una vez lo hace huir; la última vez regresa al vecino. */
export function tocarIniciativa(p: Partida, vecino: CompaneroId, ahora: Date): {
  partida: Partida; encontrada: boolean
} {
  if (!iniciativaVisible(p, vecino, ahora)) return { partida: p, encontrada: false }
  const pasos = p.iniciativa!.pasos + 1
  return {
    partida: { ...p, iniciativa: { ...p.iniciativa!, pasos } },
    encontrada: pasos >= INICIATIVAS[vecino].pasos,
  }
}

/** Se guarda solo dónde se ha entrado de verdad, no el paso automático por el mapa. */
export function visitarEnRonda(p: Partida, vecino: CompaneroId, ahora: Date): Partida {
  if (!nacido(p, vecino, ahora) || nacidos(p, ahora).length < 2) return p
  const hoy = dia(ahora)
  if (p.ronda?.dia !== hoy) return { ...p, ronda: { dia: hoy, visitados: [vecino] } }
  if (p.ronda.visitados.includes(vecino)) return p
  return { ...p, ronda: { dia: hoy, visitados: [...p.ronda.visitados, vecino] } }
}

export function fotoDeRondaDisponible(p: Partida, ahora: Date): CompaneroId[] | null {
  const hoy = dia(ahora)
  const nacieron = nacidos(p, ahora)
  const visitados = p.ronda?.dia === hoy
    ? p.ronda.visitados.filter((c) => nacieron.includes(c)) : []
  if (nacieron.length < 2 || visitados.length < Math.min(3, nacieron.length)) return null
  // Máximo una foto semanal, sin cuenta atrás, progresómetro ni recordatorios.
  if ((p.momentos ?? []).some((m) => m.id === 'paseo-' + lunes(hoy))) return null
  return visitados.slice(0, 3)
}

/** La foto aparece en el banco solo tras recorrer el barrio espontáneamente. */
export function guardarFotoDeRonda(p: Partida, ahora: Date): Partida {
  const vecinos = fotoDeRondaDisponible(p, ahora)
  if (!vecinos) return p
  return anadirMomento(p, {
    id: 'paseo-' + lunes(dia(ahora)),
    fecha: ahora.toISOString(),
    titulo: 'Una vuelta por el barrio',
    texto: vecinos.map((c) => COMPANEROS[c].nombre).join(', ') + '. Nadie pidió una foto. Ya está hecha.',
    escena: fotoDe(p, 'barrio', ahora),
  })
}
