// Gestos y descubrimientos: jugar no da materiales ni obliga a entrar.
import { OBJETOS_CASA, type CompaneroId } from '../contenido'
import { guardado, sitioDe } from './colocar'
import type { Partida } from './partida'

/** Objetos con un gesto que el jugador provoca. No conceden materiales ni dan misiones. */
export const JUGUETES = [
  'hoguera', 'comba', 'bici',
  'maquina', 'balanza',
  'maceta', 'gramofono', 'telescopio', 'globo',
  'cometa', 'loto',
  'telefono', 'cesto', 'buzon',
] as const
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

/** Microescenas ambientales visibles cuando dos objetos están cerca. */
export type EfectoVecindad =
  | 'brasas' | 'velocidad' | 'horno'
  | 'hilo-rojo' | 'papeles' | 'balanza'
  | 'musica' | 'estrellas' | 'ajedrez'
  | 'vapor' | 'luciernagas' | 'viento'
  | 'te' | 'lana' | 'cartas'

export interface Vecindad {
  id: string
  companero: CompaneroId
  a: string
  b: string
  /** Distancias máximas de los centros, en % de la escena. */
  dx: number
  dy: number
  /** El efecto visual sigue a los dos objetos y reacciona al tocarlos. */
  efecto: EfectoVecindad
  /** Solo se cuenta al descubrirlo por primera vez. */
  texto: string
}

/** Tres combinaciones por casa. Sin recetas públicas, puntos ni obligaciones. */
export const VECINDADES: Vecindad[] = [
  { id: 'nox-fogata', companero: 'nox', a: 'hoguera', b: 'banco', dx: 19, dy: 19, efecto: 'brasas',
    texto: 'Nox ha acercado el banco al fuego. Dice que es por seguridad. Está asando salchichas.' },
  { id: 'nox-velocidad', companero: 'nox', a: 'bici', b: 'zapatillas', dx: 20, dy: 20, efecto: 'velocidad',
    texto: 'Nox ha aparcado la bici junto a las zapatillas. Ahora tiene dos formas de llegar tarde.' },
  { id: 'nox-horno', companero: 'nox', a: 'horno', b: 'parrilla', dx: 21, dy: 19, efecto: 'horno',
    texto: 'Horno y parrilla, juntos. Nox lo llama cocina de autor. La alarma opina distinto.' },
  { id: 'tuerca-expediente', companero: 'tuerca', a: 'corcho', b: 'archivador', dx: 19, dy: 56, efecto: 'hilo-rojo',
    texto: 'Tuerca ha unido el archivador y el corcho con hilo rojo. El sospechoso es Tuerca.' },
  { id: 'tuerca-informes', companero: 'tuerca', a: 'maquina', b: 'archivador', dx: 20, dy: 41, efecto: 'papeles',
    texto: 'La máquina escribe directamente para el archivador. Tuerca está considerando contratarla.' },
  { id: 'tuerca-pesaje', companero: 'tuerca', a: 'balanza', b: 'cajas', dx: 20, dy: 16, efecto: 'balanza',
    texto: 'Tuerca pesa las cajas vacías. Ha encontrado una irregularidad: pesan.' },
  { id: 'tofu-biblioteca', companero: 'tofu', a: 'gramofono', b: 'libros', dx: 19, dy: 22, efecto: 'musica',
    texto: 'Tofu escucha un vals entre los libros. El brote lleva el ritmo. Él lo niega.' },
  { id: 'tofu-cielo', companero: 'tofu', a: 'telescopio', b: 'globo', dx: 20, dy: 20, efecto: 'estrellas',
    texto: 'El telescopio apunta al globo. Tofu está buscando una estrella que todavía no haya leído.' },
  { id: 'tofu-ajedrez', companero: 'tofu', a: 'ajedrez', b: 'atril', dx: 20, dy: 19, efecto: 'ajedrez',
    texto: 'Tofu ha puesto la estrategia en el atril. Sigue perdiendo contra sí mismo.' },
  { id: 'bruma-siesta', companero: 'bruma', a: 'tetera', b: 'hamaca', dx: 20, dy: 20, efecto: 'vapor',
    texto: 'Bruma ha organizado una merienda flotante. La tetera ha aceptado sin consultar.' },
  { id: 'bruma-luci', companero: 'bruma', a: 'loto', b: 'tarro', dx: 20, dy: 25, efecto: 'luciernagas',
    texto: 'El loto y las luciérnagas se iluminan por turnos. Bruma arbitra sin mirar.' },
  { id: 'bruma-viento', companero: 'bruma', a: 'cometa', b: 'campanillas', dx: 20, dy: 10, efecto: 'viento',
    texto: 'La cometa ha hecho sonar las campanillas. Bruma dice que ha sido el aire. Correcto.' },
  { id: 'madeja-te', companero: 'madeja', a: 'tetera-rosa', b: 'sofa', dx: 20, dy: 20, efecto: 'te',
    texto: 'Madeja ha declarado oficialmente la hora del té. Nadie ha solicitado una reunión.' },
  { id: 'madeja-lana', companero: 'madeja', a: 'cesto', b: 'costurero', dx: 20, dy: 20, efecto: 'lana',
    texto: 'Entre el cesto y el costurero hay una hebra infinita. Madeja la llama organización.' },
  { id: 'madeja-cartas', companero: 'madeja', a: 'buzon', b: 'album', dx: 20, dy: 20, efecto: 'cartas',
    texto: 'Madeja archiva las cartas en el álbum. Dice que es historia local. Es cotilleo.' },
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
  const nuevas = [...new Set(ids)].filter((id) => VECINDADES.some((v) => v.id === id) && !(p.vecindadesVistas ?? []).includes(id))
  if (nuevas.length === 0) return p
  return { ...p, vecindadesVistas: [...(p.vecindadesVistas ?? []), ...nuevas] }
}
