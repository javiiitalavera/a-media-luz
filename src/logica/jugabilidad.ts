// Gestos y descubrimientos: jugar no da materiales ni obliga a entrar.
import { OBJETOS_CASA, type CompaneroId } from '../contenido'
import { guardado, sitioDe } from './colocar'
import type { Partida } from './partida'

/** Cinco objetos que dejan de ser un botón de lectura: responden físicamente a cada toque. */
export const JUGUETES = ['hoguera', 'comba', 'maceta', 'gramofono', 'telefono'] as const
export const esJuguete = (id: string): boolean => JUGUETES.some((j) => j === id)

/** Zonas que provocan una respuesta cómica, nunca penalizaciones. Coordenadas relativas a la figura. */
export function zonaIncomoda(c: CompaneroId, x: number, y: number): boolean {
  switch (c) {
    case 'nox': return x > 0.78 && y > 0.55 // llama de la cola
    case 'tofu': return y < 0.30             // brote
    case 'bruma': return x < 0.20 && y > 0.65 // jirones bajos
    case 'madeja': return y < 0.20            // orejas
    case 'tuerca': return y < 0.26            // antena y etiqueta
  }
}

export const PROTESTAS_CARICIA: Record<CompaneroId, string> = {
  nox: 'La cola no. Es fuego reglamentario.',
  tofu: 'El brote es una propiedad privada.',
  bruma: '¡Eh! Por ahí se me escapa la niebla.',
  madeja: 'Las orejas se tocan con cita previa.',
  tuerca: 'Ha tocado el departamento equivocado.',
}

export interface Vecindad {
  id: string
  companero: CompaneroId
  a: string
  b: string
  /** Separación horizontal y vertical máxima, en % de la escena. */
  dx: number
  dy: number
  texto: string
}

/** Unas pocas reglas, no una colección ni una lista de tareas. */
export const VECINDADES: Vecindad[] = [
  { id: 'nox-fogata', companero: 'nox', a: 'hoguera', b: 'banco', dx: 19, dy: 19,
    texto: 'Nox ha acercado el banco al fuego. Dice que es por seguridad. Está asando salchichas.' },
  { id: 'tuerca-expediente', companero: 'tuerca', a: 'corcho', b: 'archivador', dx: 19, dy: 56,
    texto: 'Tuerca ha unido el archivador y el corcho con hilo rojo. El sospechoso es Tuerca.' },
  { id: 'tofu-biblioteca', companero: 'tofu', a: 'gramofono', b: 'libros', dx: 19, dy: 22,
    texto: 'Tofu escucha un vals entre los libros. El brote lleva el ritmo. Él lo niega.' },
  { id: 'bruma-siesta', companero: 'bruma', a: 'tetera', b: 'hamaca', dx: 20, dy: 20,
    texto: 'Bruma ha organizado una merienda flotante. La tetera ha aceptado sin consultar.' },
  { id: 'madeja-te', companero: 'madeja', a: 'tetera-rosa', b: 'sofa', dx: 20, dy: 20,
    texto: 'Madeja ha declarado oficialmente la hora del té. Nadie ha solicitado una reunión.' },
]

/** Solo cuentan construcciones reales, a la vista y físicamente próximas. */
export function vecindadesActivas(p: Partida, c: CompaneroId): Vecindad[] {
  const hechos = new Set((p.construcciones ?? []).map((x) => x.objetoId))
  return VECINDADES.filter((v) => {
    if (v.companero !== c || !hechos.has(v.a) || !hechos.has(v.b) || guardado(p, v.a) || guardado(p, v.b)) return false
    const a = OBJETOS_CASA.find((o) => o.id === v.a)
    const b = OBJETOS_CASA.find((o) => o.id === v.b)
    if (!a || !b) return false
    const pa = sitioDe(p, a)
    const pb = sitioDe(p, b)
    return Math.abs(pa.x - pb.x) <= v.dx && Math.abs(pa.y - pb.y) <= v.dy
  })
}

export function vecindadesNuevas(p: Partida, c: CompaneroId): Vecindad[] {
  return vecindadesActivas(p, c).filter((v) => !(p.vecindadesVistas ?? []).includes(v.id))
}

/** El hallazgo se recuerda aunque el jugador luego mueva o guarde los objetos. */
export function recordarVecindades(p: Partida, ids: string[]): Partida {
  const nuevas = ids.filter((id) => VECINDADES.some((v) => v.id === id) && !(p.vecindadesVistas ?? []).includes(id))
  if (nuevas.length === 0) return p
  return { ...p, vecindadesVistas: [...(p.vecindadesVistas ?? []), ...nuevas] }
}
