// Ordenar la casa (decidido por Javi, 20/11/2026: libre, dentro del suelo de cada casa, sin baúl todavía).
// Cada objeto tiene su sitio de siempre (contenido/casa.ts); si lo mueves, la partida guarda dónde.
// Al llevarlo al fondo se hace un poco más pequeño y al acercarlo, más grande. Los colgados solo se
// mueven de lado. Gregorio y las huellas de las historias no se mueven: las historias cuentan con su sitio.
import { ESCENAS, OBJETOS_CASA, type CompaneroId, type ObjetoCasa } from '../contenido'
import type { Zona } from '../contenido/casa'
import type { Partida } from './partida'

/** Cuánto cambia el tamaño por cada punto (%) que baja o sube, y sus límites. */
const PERSPECTIVA = 0.012
const ESCALA: [number, number] = [0.75, 1.3]
/** Los colgados se mueven de lado entre estos márgenes. */
const LADOS: [number, number] = [15, 85]

const dentro = (z: Zona, x: number, y: number) => x >= z.x[0] && x <= z.x[1] && y >= z.y[0] && y <= z.y[1]
const limitar = (v: number, [a, b]: [number, number]) => Math.min(Math.max(v, a), b)

/** ¿Se puede mover? Los colgados, sí; los de suelo, si su sitio de siempre está en el suelo de la casa. */
export function movible(o: ObjetoCasa): boolean {
  if (o.id === 'aspiradora') return false
  if (o.sitio.colgado) return true
  return (ESCENAS[o.companero]?.suelo ?? []).some((z) => dentro(z, o.sitio.x, o.sitio.y))
}

/** El punto del suelo más cercano a (x, y). Los colgados conservan su altura. */
export function encajar(o: ObjetoCasa, x: number, y: number): { x: number; y: number } {
  if (o.sitio.colgado) return { x: limitar(x, LADOS), y: o.sitio.y }
  let mejor = { x: o.sitio.x, y: o.sitio.y }
  let distancia = Infinity
  for (const z of ESCENAS[o.companero]?.suelo ?? []) {
    const p = { x: limitar(x, z.x), y: limitar(y, z.y) }
    const d = (p.x - x) ** 2 + (p.y - y) ** 2
    if (d < distancia) { distancia = d; mejor = p }
  }
  return mejor
}

/** Dónde está un objeto ahora (y su ancho, con la perspectiva). */
export function sitioDe(p: Partida, o: ObjetoCasa, pos = p.colocados?.[o.id]): ObjetoCasa['sitio'] {
  if (!pos || !movible(o)) return o.sitio
  const escala = o.sitio.colgado ? 1 : limitar(1 + (pos.y - o.sitio.y) * PERSPECTIVA, ESCALA)
  return { ...o.sitio, x: pos.x, y: pos.y, ancho: o.sitio.ancho * escala }
}

/** Deja un objeto en un sitio (encajado en el suelo). */
export function colocar(p: Partida, id: string, x: number, y: number): Partida {
  const o = OBJETOS_CASA.find((k) => k.id === id)
  if (!o || !movible(o)) return p
  return { ...p, colocados: { ...p.colocados, [id]: encajar(o, x, y) } }
}

/** Vuelve a poner las cosas de una casa en su sitio de siempre. */
export function ordenOriginal(p: Partida, c: CompaneroId): Partida {
  if (!p.colocados) return p
  const resto = Object.fromEntries(Object.entries(p.colocados).filter(([id]) => OBJETOS_CASA.find((o) => o.id === id)?.companero !== c))
  return { ...p, colocados: resto }
}
