// La casa de cada compañero: materiales que dan las ofrendas y cosas que se construyen con ellos.
import type { AreaId, CompaneroId } from './tipos'

export interface Material {
  area: AreaId
  nombre: string
  singular: string
  /** Color del punto que lo identifica (variable de color de la interfaz). */
  color: string
}

/** Cada ofrenda que cuenta (hasta 3 al día por área) da 1 material de su área. */
export const MATERIALES: Record<AreaId, Material> = {
  cuerpo: { area: 'cuerpo', nombre: 'Ascuas', singular: 'ascua', color: '#f08a3c' },
  mente: { area: 'mente', nombre: 'Semillas', singular: 'semilla', color: '#8fae6b' },
  calma: { area: 'calma', nombre: 'Rocío', singular: 'gota de rocío', color: '#a99be0' },
  vinculos: { area: 'vinculos', nombre: 'Hilo', singular: 'hilo', color: '#e8737a' },
  orden: { area: 'orden', nombre: 'Tornillos', singular: 'tornillo', color: '#7fa7b0' },
}

export interface ObjetoCasa {
  id: string
  companero: CompaneroId
  nombre: string
  /** Lo que dice el dueño de la casa sobre él (en el catálogo). */
  descripcion: string
  coste: Partial<Record<AreaId, number>>
  /** Dónde va en la escena, en % del fondo: centro horizontal, base (pies) y ancho. */
  sitio: { x: number; y: number; ancho: number; colgado?: boolean }
  /** Alto/ancho de su imagen, para colocar su luz. */
  proporcion: number
  /** Si da luz: dónde, en % de su imagen. */
  luz?: { x: number; y: number; color: string }
}

// Las posiciones se ajustan mirando el fondo de public/arte/casa/nox/fondo.webp.
// En móvil se ven los lados del fondo entre el 9 % y el 91 %: nada importante fuera de 12–88 %.
// Nox ocupa el centro (pies al 66 %); el panel de abajo tapa a partir del ~70 % en móviles bajos.
export const OBJETOS_CASA: ObjetoCasa[] = [
  { id: 'hoguera', companero: 'nox', nombre: 'Hoguera', descripcion: 'Competencia directa. La toleraré.',
    coste: { cuerpo: 3 }, sitio: { x: 24, y: 58, ancho: 22 }, proporcion: 0.81, luz: { x: 50, y: 40, color: '#ffb347' } },
  { id: 'cojin', companero: 'nox', nombre: 'Cojín de cuadros', descripcion: 'Para mí. Tú te sientas en el suelo.',
    coste: { cuerpo: 2, vinculos: 2 }, sitio: { x: 77, y: 67, ancho: 15 }, proporcion: 0.83 },
  { id: 'banco', companero: 'nox', nombre: 'Banco de tronco', descripcion: 'Un sitio para sentarse a juzgar a los demás.',
    coste: { cuerpo: 4, orden: 1 }, sitio: { x: 80, y: 57, ancho: 26 }, proporcion: 0.67 },
  { id: 'farolillo', companero: 'nox', nombre: 'Farolillo', descripcion: 'Más luz. Por si alguna vez decides venir de noche.',
    coste: { cuerpo: 3, calma: 2 }, sitio: { x: 44, y: 3, ancho: 11, colgado: true }, proporcion: 1.68, luz: { x: 50, y: 52, color: '#ffd27a' } },
  { id: 'seta', companero: 'nox', nombre: 'Seta luminosa', descripcion: 'Brilla sola. Ojalá todos fuéramos así de autónomos.',
    coste: { cuerpo: 2, mente: 3 }, sitio: { x: 20, y: 68, ancho: 12 }, proporcion: 1.0, luz: { x: 50, y: 62, color: '#ffe08a' } },
  { id: 'estanteria', companero: 'nox', nombre: 'Estantería', descripcion: 'Para los libros que dices que vas a leer.',
    coste: { cuerpo: 5, mente: 3 }, sitio: { x: 65, y: 47, ancho: 17 }, proporcion: 0.97 },
]
