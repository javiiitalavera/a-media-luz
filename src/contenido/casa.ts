// La casa de cada compañero: materiales que dan las ofrendas y cosas que se construyen con ellos.
import type { AreaId, CompaneroId } from './tipos'

/** Cómo se monta la escena de cada casa (posiciones en % del fondo). */
export interface Escena {
  /** Ancho / alto del fondo. */
  proporcion: number
  /** Dónde apoya los pies el compañero (centro horizontal y altura). */
  pies: { x: number; y: number }
  /** Ancho del compañero (en % del ancho del fondo) en cada etapa. Igual en las tres (decidido por Javi:
   *  evolucionan sin crecer, que de bebés son más monos). */
  anchos: [number, number, number]
  /** Luces ya dibujadas en el fondo, para hacerlas latir. */
  luces: { x: number; y: number }[]
  /** Luz del propio compañero (la llama de Nox, la luz del pecho de Tuerca), relativa a su figura:
   *  x desde su centro y y desde sus pies, en fracciones de su ancho y alto. */
  luzPropia?: { x: number; y: number; tam: number; chispas?: boolean }
}

export const ESCENAS: Partial<Record<CompaneroId, Escena>> = {
  nox: { proporcion: 941 / 1672, pies: { x: 52, y: 73 }, anchos: [40, 38.7, 37.8],
    luces: [{ x: 18.6, y: 28.7 }, { x: 78, y: 21.5 }], luzPropia: { x: -0.28, y: 0.36, tam: 14, chispas: true } },
  tuerca: { proporcion: 941 / 1672, pies: { x: 50, y: 74 }, anchos: [38, 39.1, 37.6],
    luces: [{ x: 50, y: 18 }], luzPropia: { x: 0, y: 0.24, tam: 9 } },
  tofu: { proporcion: 941 / 1672, pies: { x: 50, y: 73 }, anchos: [36, 34.9, 33.7],
    luces: [{ x: 16.5, y: 19 }, { x: 92, y: 34.5 }] },
}

export interface Material {
  area: AreaId
  nombre: string
  singular: string
  /** Color del punto que lo identifica (variable de color de la interfaz). */
  color: string
  /** En plural, para las frases («3 ascuas», «2 gotas de rocío»). */
  plural: string
  /** Lo que se cuenta al tocarlo en la barra: de dónde sale y para qué sirve, con humor. */
  explicacion: string
}

/** Cada ofrenda que cuenta (hasta 3 al día por área) da 1 material de su área. */
export const MATERIALES: Record<AreaId, Material> = {
  cuerpo: { area: 'cuerpo', nombre: 'Ascuas', singular: 'ascua', plural: 'ascuas', color: '#f08a3c', explicacion: 'Ascuas: salen de moverte, dormir y comer como una persona. Nox jura que no se las come.' },
  mente: { area: 'mente', nombre: 'Semillas', singular: 'semilla', plural: 'semillas', color: '#8fae6b', explicacion: 'Semillas: de leer, aprender o crear algo. Tofu las planta. No dice qué sale.' },
  calma: { area: 'calma', nombre: 'Rocío', singular: 'gota de rocío', plural: 'gotas de rocío', color: '#a99be0', explicacion: 'Rocío: de parar un rato sin pantallas. Se evapora si lo miras mucho. Es broma. Casi.' },
  vinculos: { area: 'vinculos', nombre: 'Hilo', singular: 'hebra de hilo', plural: 'hebras de hilo', color: '#e8737a', explicacion: 'Hilo: de quedar, llamar o abrazar a alguien. Tuerca lo usa para atar expedientes.' },
  orden: { area: 'orden', nombre: 'Tornillos', singular: 'tornillo', plural: 'tornillos', color: '#7fa7b0', explicacion: 'Tornillos: de cerrar pendientes y poner orden. Tuerca los cuenta. Dos veces.' },
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
  /** Si es un proyecto personal: su posición en la cadena de su casa (se desvelan de uno en uno). */
  orden?: number
  /** Qué abre al terminarlo (se ve en el panel de proyectos). */
  abre?: string
  /** Si da luz: dónde, en % de su imagen. */
  luz?: { x: number; y: number; color: string }
}

// Las posiciones se ajustan mirando el fondo de public/arte/casa/nox/fondo.webp.
// En móvil se ven los lados del fondo entre el 9 % y el 91 %: nada importante fuera de 12–88 %.
// Nox ocupa el centro (pies al 66 %); el panel de abajo tapa a partir del ~70 % en móviles bajos.
export const OBJETOS_CASA: ObjetoCasa[] = [
  { id: 'hoguera', companero: 'nox', orden: 1, abre: 'Enciende la casa. Y problemas con la normativa.', nombre: 'Hoguera', descripcion: 'Competencia directa. La toleraré.',
    coste: { cuerpo: 3 }, sitio: { x: 24, y: 58, ancho: 22 }, proporcion: 0.81, luz: { x: 50, y: 40, color: '#ffb347' } },
  { id: 'cojin', companero: 'nox', nombre: 'Cojín de cuadros', descripcion: 'Para mí. Tú te sientas en el suelo.',
    coste: { cuerpo: 2, vinculos: 2 }, sitio: { x: 77, y: 67, ancho: 15 }, proporcion: 0.83 },
  { id: 'banco', companero: 'nox', orden: 2, abre: 'Un sitio para que se siente alguien de visita. Aunque nadie lo haya invitado.', nombre: 'Banco de tronco', descripcion: 'Un sitio para sentarse a juzgar a los demás.',
    coste: { cuerpo: 5, vinculos: 1 }, sitio: { x: 80, y: 57, ancho: 26 }, proporcion: 0.67 },
  { id: 'farolillo', companero: 'nox', nombre: 'Farolillo', descripcion: 'Más luz. Para leer de noche. No leo de noche, pero queda bien.',
    coste: { cuerpo: 3, calma: 2 }, sitio: { x: 44, y: 3, ancho: 11, colgado: true }, proporcion: 1.68, luz: { x: 50, y: 52, color: '#ffd27a' } },
  { id: 'seta', companero: 'nox', nombre: 'Seta luminosa', descripcion: 'Brilla sola. Ojalá todos fuéramos así de autónomos.',
    coste: { cuerpo: 2, mente: 3 }, sitio: { x: 20, y: 68, ancho: 12 }, proporcion: 1.0, luz: { x: 50, y: 62, color: '#ffe08a' } },
  { id: 'estanteria', companero: 'nox', nombre: 'Estantería', descripcion: 'Para los libros que digo que he leído. Algunos aún tienen el plástico.',
    coste: { cuerpo: 5, mente: 3 }, sitio: { x: 65, y: 47, ancho: 17 }, proporcion: 0.97 },

  { id: 'horno', companero: 'nox', orden: 3, abre: 'Cocina. O algo parecido a cocinar.', nombre: 'Horno de leña', descripcion: 'Para hacer pan. Nadie le ha dicho que no sabe hacer pan.',
    coste: { cuerpo: 7, mente: 2, orden: 2 }, sitio: { x: 66, y: 50, ancho: 15 }, proporcion: 1.01, luz: { x: 50, y: 52, color: '#ffb347' } },

  // Taller de Tuerca: casi todo pide tornillos (Orden).
  { id: 'libros', companero: 'tofu', orden: 1, abre: 'Una biblioteca. Y préstamos, que es donde empiezan los problemas.', nombre: 'Pila de libros', descripcion: 'Los he leído todos. Algunos, dos veces. Ninguno me ha cambiado.',
    coste: { mente: 3 }, sitio: { x: 27, y: 58, ancho: 14 }, proporcion: 1.04 },
  { id: 'pizarra', companero: 'tofu', orden: 2, abre: 'Ciencia. Y un problema administrativo.', nombre: 'Pizarra', descripcion: 'Para escribir cosas importantes. O fórmulas. A veces coinciden.',
    coste: { mente: 4, orden: 2 }, sitio: { x: 72, y: 58, ancho: 19 }, proporcion: 0.99 },
  { id: 'maceta', companero: 'tofu', orden: 3, abre: 'Una planta con apetito.', nombre: 'Maceta grande', descripcion: 'Es una planta. Come poco. Casi siempre.',
    coste: { mente: 5, calma: 2 }, sitio: { x: 21, y: 72, ancho: 20 }, proporcion: 0.95 },
  { id: 'caja', companero: 'tuerca', orden: 1, abre: 'Las primeras reparaciones del taller. Y las primeras búsquedas de herramientas.', nombre: 'Caja de herramientas', descripcion: 'Arreglo cualquier cosa. El cajón de las herramientas sigue atascado.',
    coste: { orden: 3 }, sitio: { x: 25, y: 71, ancho: 19 }, proporcion: 0.91 },
  { id: 'aspiradora', companero: 'tuerca', orden: 3, abre: 'Una aspiradora con ideas propias.', nombre: 'Aspiradora robot', descripcion: 'Limpia sola. Es lo más productivo de esta casa.',
    coste: { orden: 5, cuerpo: 2 }, sitio: { x: 75, y: 72, ancho: 17 }, proporcion: 0.87 },
  { id: 'flexo', companero: 'tuerca', nombre: 'Flexo', descripcion: 'Luz de trabajo. La apunto a lo que no estoy haciendo.',
    coste: { orden: 3, mente: 2 }, sitio: { x: 52, y: 44.2, ancho: 11 }, proporcion: 1.1, luz: { x: 70, y: 68, color: '#ffd27a' } },
  { id: 'cajonera', companero: 'tuerca', nombre: 'Cajonera', descripcion: 'Tres cajones. Uno pone VARIOS. Los otros dos, también.',
    coste: { orden: 4, calma: 1 }, sitio: { x: 84, y: 63, ancho: 15 }, proporcion: 1.22 },
  { id: 'estanteria-tarros', companero: 'tuerca', nombre: 'Estante de tarros', descripcion: 'Tornillos clasificados por tamaño, color y rencor.',
    coste: { orden: 4, vinculos: 2 }, sitio: { x: 14, y: 62, ancho: 17 }, proporcion: 1.05 },
  { id: 'reloj', companero: 'tuerca', nombre: 'Reloj de engranajes', descripcion: 'Va cuatro minutos adelantado. Por si acaso. No sé por si acaso qué.',
    coste: { orden: 5, mente: 2, calma: 1 }, sitio: { x: 20, y: 24, ancho: 11 }, proporcion: 0.92 },

  // Dibujados para los antiguos retos; de momento no se construyen (quedan para proyectos futuros).
  { id: 'zapatillas', companero: 'nox', nombre: 'Zapatillas de brasa', descripcion: 'Para correr. Las he usado una vez. Fue memorable.',
    coste: {}, sitio: { x: 33, y: 48.5, ancho: 10 }, proporcion: 0.9 },
  { id: 'bufanda', companero: 'nox', nombre: 'Bufanda coral', descripcion: 'Abriga. No es por el frío, es por el estilo.',
    coste: {}, sitio: { x: 86, y: 38, ancho: 11 }, proporcion: 0.9 },
  { id: 'farol-luna', companero: 'nox', nombre: 'Farol de luna', descripcion: 'Brilla en las noches tranquilas. No tengo muchas.',
    coste: {}, sitio: { x: 63, y: 3, ancho: 9, colgado: true }, proporcion: 1.32, luz: { x: 45, y: 45, color: '#ffe08a' } },
  { id: 'medalla', companero: 'tuerca', nombre: 'Medalla de engranaje', descripcion: 'Al mérito en la gestión de pendientes. Me la he dado yo. Me la merecía.',
    coste: {}, sitio: { x: 89, y: 41, ancho: 8 }, proporcion: 1.29 },
  { id: 'tablon', companero: 'tuerca', orden: 2, abre: 'Sugerencias, expedientes y conflictos administrativos.', nombre: 'Tablón de planificación', descripcion: 'Todo planificado. Lo imprevisto, en la columna VARIOS.',
    coste: { orden: 4, mente: 2 }, sitio: { x: 33, y: 23.5, ancho: 13 }, proporcion: 0.94 },
  { id: 'tuerquita', companero: 'tuerca', nombre: 'Tuerquita', descripcion: 'Una versión pequeña de mí. Igual de insufrible, la mitad de alta.',
    coste: {}, sitio: { x: 39, y: 74, ancho: 9 }, proporcion: 1.13 },
]

export interface ProyectoBarrio {
  id: string
  nombre: string
  descripcion: string
  abre: string
  coste: Partial<Record<AreaId, number>>
}

/** Proyectos del barrio: transforman el mapa y conectan a los vecinos. */
export const PROYECTOS_BARRIO: ProyectoBarrio[] = [
  { id: 'puente', nombre: 'Puente', descripcion: 'Para cruzar el arroyo sin mojarse. Tuerca quiere inaugurarlo. Nox quiere cruzarlo.',
    abre: 'Une las dos orillas: empiezan las visitas.', coste: { cuerpo: 5, orden: 5, calma: 2 } },
]

/** Dónde se pone Gregorio (la aspiradora) cuando está en casa de Nox. */
export const GREGORIO_EN_NOX: ObjetoCasa['sitio'] = { x: 80, y: 80, ancho: 13 }
/** Dónde se pone un vecino de visita (o sentado en el banco). */
export const VISITA: Partial<Record<CompaneroId, { x: number; y: number; ancho: number }>> = {
  nox: { x: 82, y: 56, ancho: 22 },
  tuerca: { x: 75, y: 59, ancho: 21 },
  tofu: { x: 76, y: 62, ancho: 20 },
}
