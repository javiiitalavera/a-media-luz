// La casa de cada compañero: materiales que dan las ofrendas y cosas que se construyen con ellos.
import type { AreaId, CompaneroId } from './tipos'

/** Cómo se monta la escena de cada casa (posiciones en % del fondo). */
export interface Escena {
  /** Ancho / alto del fondo. */
  proporcion: number
  /** Dónde apoya los pies el compañero (centro horizontal y altura). */
  pies: { x: number; y: number }
  /** Ancho del compañero (en % del ancho del fondo) en cada dibujo (cachorro, joven, adulto y, si los tiene, niveles 4 y 5),
   *  ajustado para que todos ocupen lo mismo que el primer Tuerca (evolucionan sin crecer). Si falta, vale el último. */
  anchos: number[]
  /** Luces ya dibujadas en el fondo, para hacerlas latir. */
  luces: { x: number; y: number }[]
  /** Luz del propio compañero (la llama de Nox, la luz del pecho de Tuerca), relativa a su figura:
   *  x desde su centro y y desde sus pies, en fracciones de su ancho y alto. */
  luzPropia?: { x: number; y: number; tam: number; chispas?: boolean }
  /** Dónde se pueden dejar las cosas al ordenar la casa (los pies): rectángulos en % del fondo. */
  suelo: Zona[]
  mesa?: Zona[]
}

/** Una superficie de apoyo: de x[0] a x[1] y de y[0] a y[1] (en % del fondo). */
export interface Zona { x: [number, number]; y: [number, number] }

/** Anchos por dibujo, ajustados a la superficie visible del primer Tuerca. */
export const ESCENAS: Partial<Record<CompaneroId, Escena>> = {
  nox: { proporcion: 941 / 1672, pies: { x: 52, y: 73 }, anchos: [36.4, 35.1, 35.6, 33.8, 33.6],
    luces: [{ x: 18.6, y: 28.7 }, { x: 78, y: 21.5 }], luzPropia: { x: -0.28, y: 0.36, tam: 14, chispas: true },
    suelo: [{ x: [12, 88], y: [46, 82] }] },
  tuerca: { proporcion: 941 / 1672, pies: { x: 50, y: 74 }, anchos: [38, 37.4, 36.5, 34.5, 33.5],
    luces: [{ x: 50, y: 18 }], luzPropia: { x: 0, y: 0.24, tam: 9 },
    suelo: [{ x: [12, 88], y: [57, 84] }], mesa: [{ x: [48, 84], y: [43.5, 44.5] }] },
  tofu: { proporcion: 941 / 1672, pies: { x: 50, y: 73 }, anchos: [37.8, 36.9, 34.5, 31.5, 31.3],
    luces: [{ x: 16.5, y: 19 }, { x: 92, y: 34.5 }],
    suelo: [{ x: [12, 88], y: [52, 84] }] },
  // Bruma flota sobre el estanque: sus «pies» son el final de su cola de niebla.
  bruma: { proporcion: 941 / 1672, pies: { x: 50, y: 70 }, anchos: [37.4, 34.2, 36.3, 35.9, 35.7],
    luces: [{ x: 20.5, y: 27 }, { x: 67.5, y: 13 }],
    // La orilla, el embarcadero y los juncos del agua.
    suelo: [{ x: [10, 32], y: [39, 47] }, { x: [32, 66], y: [37.5, 41.5] }, { x: [68, 90], y: [44, 56] }] },
  // La madriguera de lana de Madeja: suelo de madera con alfombra trenzada.
  madeja: { proporcion: 941 / 1672, pies: { x: 50, y: 73 }, anchos: [35.8, 35.4, 35.8, 35, 35],
    luces: [{ x: 22, y: 16.5 }, { x: 61, y: 25 }],
    suelo: [{ x: [12, 88], y: [56, 84] }],
    mesa: [{ x: [15, 36], y: [43, 44] }, { x: [65, 76], y: [42.5, 43.5] }] },
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
  cuerpo: { area: 'cuerpo', nombre: 'Ascuas', singular: 'ascua', plural: 'ascuas', color: '#f08a3c', explicacion: 'Ascuas: salen de moverte y comer como una persona. Nox jura que no se las come.' },
  mente: { area: 'mente', nombre: 'Semillas', singular: 'semilla', plural: 'semillas', color: '#8fae6b', explicacion: 'Semillas: de leer, aprender o crear algo. Tofu las planta. No dice qué sale.' },
  calma: { area: 'calma', nombre: 'Rocío', singular: 'gota de rocío', plural: 'gotas de rocío', color: '#a99be0', explicacion: 'Rocío: de dormir bien y parar un rato sin pantallas. Se evapora si lo miras mucho. Es broma. Casi.' },
  vinculos: { area: 'vinculos', nombre: 'Hilo', singular: 'hebra de hilo', plural: 'hebras de hilo', color: '#e8737a', explicacion: 'Hilo: de compartir algo, escribir a alguien o quedar. Tuerca lo usa para atar expedientes.' },
  orden: { area: 'orden', nombre: 'Tornillos', singular: 'tornillo', plural: 'tornillos', color: '#7fa7b0', explicacion: 'Tornillos: de cerrar pendientes y poner orden. Tuerca los cuenta. Dos veces.' },
}

export interface ObjetoCasa {
  id: string
  companero: CompaneroId
  nombre: string
  /** Lo que dice el dueño de la casa sobre él (en el catálogo). */
  descripcion: string
  coste: Partial<Record<AreaId, number>>
  /** Lo que pagaban las partidas antes de guardar el coste en cada construcción. */
  costeAnterior?: Partial<Record<AreaId, number>>
  apoyo?: 'mesa' | 'fijo'
  /** Dónde va en la escena, en % del fondo: centro horizontal, base (pies) y ancho. */
  sitio: { x: number; y: number; ancho: number; colgado?: boolean }
  /** Alto/ancho de su imagen, para colocar su luz. */
  proporcion: number
  /** Si es un proyecto personal: su prioridad en el catálogo de su casa. */
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
  { id: 'cojin', companero: 'nox', orden: 4, nombre: 'Cojín de cuadros', descripcion: 'Para mí. Tú te sientas en el suelo.',
    coste: { cuerpo: 4 }, costeAnterior: { cuerpo: 2, vinculos: 2 }, sitio: { x: 77, y: 67, ancho: 15 }, proporcion: 0.83 },
  { id: 'banco', companero: 'nox', orden: 2, abre: 'Un sitio para que se siente alguien de visita. Aunque nadie lo haya invitado.', nombre: 'Banco de tronco', descripcion: 'Un sitio para sentarse a juzgar a los demás.',
    coste: { cuerpo: 5, vinculos: 1 }, sitio: { x: 80, y: 57, ancho: 26 }, proporcion: 0.67 },
  { id: 'farolillo', companero: 'nox', orden: 5, nombre: 'Farolillo', descripcion: 'Más luz. Para leer de noche. No leo de noche, pero queda bien.',
    coste: { cuerpo: 3, calma: 2 }, sitio: { x: 44, y: 3, ancho: 11, colgado: true }, proporcion: 1.68, luz: { x: 50, y: 52, color: '#ffd27a' } },
  { id: 'seta', companero: 'nox', orden: 6, nombre: 'Seta luminosa', descripcion: 'Brilla sola. Ojalá todos fuéramos así de autónomos.',
    coste: { cuerpo: 2, mente: 3 }, sitio: { x: 20, y: 68, ancho: 12 }, proporcion: 1.0, luz: { x: 50, y: 62, color: '#ffe08a' } },
  { id: 'estanteria', companero: 'nox', orden: 7, nombre: 'Estantería', descripcion: 'Para los libros que digo que he leído. Algunos aún tienen el plástico.',
    coste: { cuerpo: 5, mente: 3 }, sitio: { x: 40, y: 47, ancho: 15 }, proporcion: 0.97 },

  { id: 'horno', companero: 'nox', orden: 3, abre: 'Cocina. O algo parecido a cocinar.', nombre: 'Horno de leña', descripcion: 'Para hacer pan. Nadie le ha dicho que no sabe hacer pan.',
    coste: { cuerpo: 7, mente: 2, orden: 2 }, sitio: { x: 66, y: 50, ancho: 15 }, proporcion: 1.01, luz: { x: 50, y: 52, color: '#ffb347' } },

  // Taller de Tuerca: casi todo pide tornillos (Orden).
  { id: 'libros', companero: 'tofu', orden: 1, abre: 'Una biblioteca. Y préstamos, que es donde empiezan los problemas.', nombre: 'Pila de libros', descripcion: 'Los he leído todos. Algunos, dos veces. Ninguno me ha cambiado.',
    coste: { mente: 3 }, sitio: { x: 27, y: 58, ancho: 14 }, proporcion: 1.04 },
  { id: 'pizarra', companero: 'tofu', orden: 2, abre: 'Ciencia. Y un problema administrativo.', nombre: 'Pizarra', descripcion: 'Para escribir cosas importantes. O fórmulas. A veces coinciden.',
    coste: { mente: 4, orden: 2 }, sitio: { x: 72, y: 58, ancho: 19 }, proporcion: 0.99 },
  { id: 'maceta', companero: 'tofu', orden: 3, abre: 'Una planta con apetito.', nombre: 'Maceta grande', descripcion: 'Es una planta. Come poco. Casi siempre.',
    coste: { mente: 6 }, costeAnterior: { mente: 5, calma: 2 }, sitio: { x: 21, y: 72, ancho: 20 }, proporcion: 0.95 },
  // Estanque de Bruma: casi todo pide rocío (Calma).
  { id: 'tetera', companero: 'bruma', orden: 1, abre: 'Infusiones. Y confesiones, que vienen incluidas.', nombre: 'Tetera de barro', descripcion: 'Una infusión relaja. Dos te hacen contar cosas. Yo solo sirvo.',
    coste: { calma: 3 }, sitio: { x: 47, y: 40.5, ancho: 13 }, proporcion: 0.93 },
  { id: 'campanillas', companero: 'bruma', orden: 2, abre: 'Música de viento. Y una queja formal.', nombre: 'Campanillas de viento', descripcion: 'Suenan cuando pasa el aire. O cuando paso yo, que es casi lo mismo.',
    coste: { calma: 4, orden: 2 }, sitio: { x: 47, y: 4, ancho: 13, colgado: true }, proporcion: 1.15 },
  { id: 'hamaca', companero: 'bruma', orden: 3, abre: 'Siestas sobre el agua. Y un okupa.', nombre: 'Hamaca de nenúfar', descripcion: 'Para flotar sin esfuerzo. Que es lo que hago siempre, pero tumbada.',
    coste: { calma: 6 }, costeAnterior: { calma: 5, cuerpo: 2 }, sitio: { x: 80, y: 50, ancho: 21 }, proporcion: 0.93 },
  // Madriguera de Madeja: casi todo pide hilo (Vínculos).
  { id: 'cesto', companero: 'madeja', orden: 1, abre: 'Labores. Y calcetines para quien no los ha pedido.', nombre: 'Cesto de costura', descripcion: 'Agujas, ovillos y un cotilleo a medio tejer.',
    coste: { vinculos: 3 }, sitio: { x: 80, y: 67, ancho: 17 }, proporcion: 0.9 },
  { id: 'telefono', companero: 'madeja', orden: 2, abre: 'Una línea directa con todo el barrio. A cualquier hora.', nombre: 'Teléfono de rueda', descripcion: 'Para llamar. Para que me llamen. Sobre todo para llamar.',
    coste: { vinculos: 4, orden: 2 }, apoyo: 'mesa', sitio: { x: 33, y: 44, ancho: 11 }, proporcion: 0.84 },
  { id: 'mecedora', companero: 'madeja', orden: 3, abre: 'Un sitio para escuchar. Y para que te escuchen, si te dejas.', nombre: 'Mecedora', descripcion: 'Me meces y te cuento. O me cuentas y te meces.',
    coste: { vinculos: 6 }, costeAnterior: { vinculos: 5, calma: 2 }, sitio: { x: 20, y: 72, ancho: 21 }, proporcion: 1.13 },
  { id: 'album', companero: 'madeja', orden: 4, nombre: 'Álbum de fotos', descripcion: 'Todavía en blanco. Por poco tiempo.',
    coste: { vinculos: 4, mente: 2 }, sitio: { x: 34, y: 82, ancho: 15 }, proporcion: 0.76 },
  { id: 'guirnalda', companero: 'madeja', orden: 5, nombre: 'Guirnalda de banderines', descripcion: 'Para celebrar. Ya encontraremos el qué.',
    coste: { vinculos: 5, cuerpo: 2 }, sitio: { x: 61, y: 8, ancho: 26, colgado: true }, proporcion: 0.58 },
  { id: 'buzon', companero: 'madeja', orden: 6, nombre: 'Buzón de cartas', descripcion: 'Cartas de verdad. Con sello y con letra torcida.',
    coste: { vinculos: 6, orden: 2 }, sitio: { x: 79, y: 82, ancho: 15 }, proporcion: 1.03 },
  { id: 'tetera-rosa', companero: 'madeja', orden: 7, nombre: 'Tetera rosa', descripcion: 'Dos tazas desparejadas. Como las parejas que más duran.',
    coste: { vinculos: 5, calma: 2 }, apoyo: 'mesa', sitio: { x: 18, y: 44, ancho: 11 }, proporcion: 0.95 },
  { id: 'costurero', companero: 'madeja', orden: 8, nombre: 'Costurero', descripcion: 'Hilos para coser. Y para atar cabos sueltos de los vecinos.',
    coste: { vinculos: 7 }, costeAnterior: { vinculos: 6, orden: 2 }, sitio: { x: 58, y: 83, ancho: 12 }, proporcion: 1.01 },
  { id: 'sofa', companero: 'madeja', orden: 9, nombre: 'Sofá de dos plazas', descripcion: 'Para dos. Si viene uno solo, me siento yo al lado.',
    coste: { vinculos: 7, cuerpo: 2 }, sitio: { x: 84, y: 58, ancho: 19 }, proporcion: 0.71 },
  { id: 'marco', companero: 'madeja', orden: 10, nombre: 'Marco de fotos', descripcion: 'Vacío. Esperando a la foto adecuada. Tengo varias candidatas.',
    coste: { vinculos: 6, mente: 2 }, apoyo: 'mesa', sitio: { x: 75, y: 43, ancho: 7 }, proporcion: 1.11 },
  { id: 'alfombra', companero: 'madeja', orden: 11, nombre: 'Alfombra de retales', descripcion: 'Un retal de cada vecino. Algunos no saben que han donado.',
    coste: { vinculos: 7, calma: 2 }, sitio: { x: 16, y: 84, ancho: 15 }, proporcion: 0.78 },
  { id: 'farol-punto', companero: 'madeja', orden: 12, nombre: 'Farolillo de punto', descripcion: 'Luz tejida. Calienta un poco. Sobre todo, la conversación.',
    coste: { vinculos: 8, orden: 2 }, sitio: { x: 30, y: 3, ancho: 8, colgado: true }, proporcion: 1.37, luz: { x: 50, y: 62, color: '#ffd9a8' } },
  { id: 'caja', companero: 'tuerca', orden: 1, abre: 'Las primeras reparaciones del taller. Y las primeras búsquedas de herramientas.', nombre: 'Caja de herramientas', descripcion: 'Arreglo cualquier cosa. El cajón de las herramientas sigue atascado.',
    coste: { orden: 3 }, sitio: { x: 25, y: 71, ancho: 19 }, proporcion: 0.91 },
  { id: 'aspiradora', companero: 'tuerca', orden: 3, abre: 'Una aspiradora con ideas propias.', nombre: 'Aspiradora robot', descripcion: 'Limpia sola. Es lo más productivo de esta casa.',
    coste: { orden: 5, cuerpo: 2 }, apoyo: 'fijo', sitio: { x: 75, y: 72, ancho: 17 }, proporcion: 0.87 },
  { id: 'flexo', companero: 'tuerca', orden: 4, nombre: 'Flexo', descripcion: 'Luz de trabajo. La apunto a lo que no estoy haciendo.',
    coste: { orden: 3, mente: 2 }, apoyo: 'mesa', sitio: { x: 52, y: 44.2, ancho: 11 }, proporcion: 1.1, luz: { x: 70, y: 68, color: '#ffd27a' } },
  { id: 'cajonera', companero: 'tuerca', orden: 5, nombre: 'Cajonera', descripcion: 'Tres cajones. Uno pone VARIOS. Los otros dos, también.',
    coste: { orden: 5 }, costeAnterior: { orden: 4, calma: 1 }, sitio: { x: 84, y: 63, ancho: 15 }, proporcion: 1.22 },
  { id: 'estanteria-tarros', companero: 'tuerca', orden: 6, nombre: 'Estante de tarros', descripcion: 'Tornillos clasificados por tamaño, color y rencor.',
    coste: { orden: 4, vinculos: 2 }, sitio: { x: 14, y: 62, ancho: 17 }, proporcion: 1.05 },
  { id: 'reloj', companero: 'tuerca', orden: 7, nombre: 'Reloj de engranajes', descripcion: 'Va cuatro minutos adelantado. Por si acaso. No sé por si acaso qué.',
    coste: { orden: 5, mente: 2, calma: 1 }, sitio: { x: 20, y: 24, ancho: 11 }, proporcion: 0.92 },

  // Láminas nuevas (20/11/2026): siguen la cadena de proyectos de cada casa.
  { id: 'saco', companero: 'nox', orden: 11, nombre: 'Saco de hojas', descripcion: 'Para golpear algo que no sea el despertador.',
    coste: { cuerpo: 5, calma: 1 }, sitio: { x: 82, y: 10, ancho: 12, colgado: true }, proporcion: 1.09 },
  { id: 'mancuernas', companero: 'nox', orden: 12, nombre: 'Mancuernas de piedra', descripcion: 'Pesan lo mismo que mis remordimientos. Poco.',
    coste: { cuerpo: 6 }, sitio: { x: 30, y: 80, ancho: 12 }, proporcion: 0.86 },
  { id: 'comba', companero: 'nox', orden: 13, nombre: 'Comba', descripcion: 'Saltar a la comba. Sin tropezar. Casi nunca.',
    coste: { cuerpo: 6, vinculos: 1 }, sitio: { x: 70, y: 80, ancho: 11 }, proporcion: 0.93 },
  { id: 'parrilla', companero: 'nox', orden: 14, nombre: 'Parrilla', descripcion: 'Para salchichas. Con normativa o sin ella.',
    coste: { cuerpo: 7, orden: 2 }, sitio: { x: 15, y: 57, ancho: 13 }, proporcion: 0.79, luz: { x: 50, y: 40, color: '#ffb347' } },
  { id: 'colchoneta', companero: 'nox', orden: 15, nombre: 'Colchoneta de musgo', descripcion: 'Para estirar. O para la siesta. Más bien para la siesta.',
    coste: { cuerpo: 6, calma: 3 }, sitio: { x: 60, y: 80, ancho: 14 }, proporcion: 0.81 },
  { id: 'bici', companero: 'nox', orden: 16, nombre: 'Bicicleta de madera', descripcion: 'No tiene frenos. Tiene confianza.',
    coste: { cuerpo: 9, orden: 2 }, sitio: { x: 84, y: 76, ancho: 17 }, proporcion: 0.86 },
  { id: 'archivador', companero: 'tuerca', orden: 10, nombre: 'Archivador', descripcion: 'Tres cajones. Etiquetas en blanco. Potencial infinito.',
    coste: { orden: 6, mente: 1 }, sitio: { x: 87, y: 80, ancho: 12 }, proporcion: 1.44 },
  { id: 'maquina', companero: 'tuerca', orden: 11, nombre: 'Máquina de escribir', descripcion: 'Clac, clac, ding. Escribo formularios por placer.',
    coste: { orden: 6, mente: 2 }, apoyo: 'mesa', sitio: { x: 63, y: 44.2, ancho: 12 }, proporcion: 0.97 },
  { id: 'corcho', companero: 'tuerca', orden: 12, nombre: 'Corcho de pistas', descripcion: 'Hilo rojo entre notas. Aún no sé qué investigo.',
    coste: { orden: 5, mente: 3 }, sitio: { x: 81, y: 27, ancho: 13 }, proporcion: 0.81 },
  { id: 'balanza', companero: 'tuerca', orden: 13, nombre: 'Balanza', descripcion: 'Lo peso todo. Hasta las decisiones. Sobre todo las decisiones.',
    coste: { orden: 7, calma: 1 }, sitio: { x: 13, y: 82, ancho: 12 }, proporcion: 1.02 },
  { id: 'lampara', companero: 'tuerca', orden: 14, nombre: 'Lámpara de piezas', descripcion: 'Hecha con un brazo que me sobró. Ilumina con ganas.',
    coste: { orden: 7, cuerpo: 2 }, sitio: { x: 66, y: 62, ancho: 9 }, proporcion: 1.33, luz: { x: 28, y: 22, color: '#ffd27a' } },
  { id: 'cajas', companero: 'tuerca', orden: 15, nombre: 'Cajas apiladas', descripcion: 'Tres cajas. Una pone CAJAS.',
    coste: { orden: 8, vinculos: 1 }, sitio: { x: 30, y: 84, ancho: 13 }, proporcion: 1.08 },
  { id: 'telescopio', companero: 'tofu', orden: 4, nombre: 'Telescopio', descripcion: 'Para mirar lejos. Las estrellas tampoco hablan.',
    coste: { mente: 5, calma: 2 }, sitio: { x: 84, y: 72, ancho: 15 }, proporcion: 1.06 },
  { id: 'globo', companero: 'tofu', orden: 5, nombre: 'Globo terráqueo', descripcion: 'Lo he girado entero. No he encontrado el huerto.',
    coste: { mente: 6 }, sitio: { x: 38, y: 56, ancho: 10 }, proporcion: 1.35 },
  { id: 'atril', companero: 'tofu', orden: 6, nombre: 'Atril', descripcion: 'Para leer de pie. Leo sentado. Queda bien.',
    coste: { mente: 6, orden: 1 }, sitio: { x: 60, y: 57, ancho: 11 }, proporcion: 1.02 },
  { id: 'caballete', companero: 'tofu', orden: 7, nombre: 'Caballete', descripcion: 'Lienzo en blanco. Es la obra. Por ahora.',
    coste: { mente: 6, vinculos: 2 }, sitio: { x: 14, y: 60, ancho: 11 }, proporcion: 1.31 },
  { id: 'ajedrez', companero: 'tofu', orden: 8, nombre: 'Tablero de ajedrez', descripcion: 'Juego contra mí mismo. Empatamos. Siempre.',
    coste: { mente: 7, orden: 2 }, sitio: { x: 34, y: 83, ancho: 14 }, proporcion: 0.86 },
  { id: 'gramofono', companero: 'tofu', orden: 9, nombre: 'Gramófono', descripcion: 'Música de antes. Para pensar despacio.',
    coste: { mente: 7, calma: 2 }, sitio: { x: 66, y: 83, ancho: 13 }, proporcion: 1.19 },
  { id: 'tarro', companero: 'bruma', orden: 4, nombre: 'Tarro de luciérnagas', descripcion: 'No las encierro. Vienen solas. Y se van cuando quieren.',
    coste: { calma: 5 }, sitio: { x: 23, y: 44.5, ancho: 7 }, proporcion: 1.33, luz: { x: 50, y: 55, color: '#fff1a5' } },
  { id: 'columpio', companero: 'bruma', orden: 5, nombre: 'Columpio', descripcion: 'Para ir y volver sin moverse del sitio.',
    coste: { calma: 5, cuerpo: 2 }, sitio: { x: 59, y: 41, ancho: 14 }, proporcion: 0.92 },
  { id: 'cometa', companero: 'bruma', orden: 6, nombre: 'Cometa de nube', descripcion: 'Una nube que vuela atada. Me identifico.',
    coste: { calma: 5, vinculos: 2 }, sitio: { x: 28, y: 4, ancho: 9, colgado: true }, proporcion: 1.38 },
  { id: 'loto', companero: 'bruma', orden: 7, nombre: 'Lámpara de loto', descripcion: 'Flota y alumbra. Lo segundo lo hace mejor que yo.',
    coste: { calma: 6, mente: 1 }, sitio: { x: 36, y: 63, ancho: 10 }, proporcion: 1.03, luz: { x: 50, y: 40, color: '#ffe6b0' } },
  { id: 'manta', companero: 'bruma', orden: 8, nombre: 'Manta en la piedra', descripcion: 'Para que la piedra no tenga frío. Ni tú.',
    coste: { calma: 6, vinculos: 2 }, sitio: { x: 13, y: 46.5, ancho: 10 }, proporcion: 0.81 },
  { id: 'farol-papel', companero: 'bruma', orden: 9, nombre: 'Farolillo de papel', descripcion: 'Lila, como yo. Alumbra bajito, como yo.',
    coste: { calma: 7, orden: 1 }, sitio: { x: 78, y: 4, ancho: 8, colgado: true }, proporcion: 1.17, luz: { x: 50, y: 60, color: '#e9c7ff' } },
  // Dibujados para los antiguos retos; desde el 20/11/2026 siguen la cadena de proyectos de su casa.
  { id: 'zapatillas', companero: 'nox', orden: 8, nombre: 'Zapatillas de brasa', descripcion: 'Para correr. Las he usado una vez. Fue memorable.',
    coste: { cuerpo: 4, calma: 1 }, sitio: { x: 33, y: 48.5, ancho: 10 }, proporcion: 0.9 },
  { id: 'bufanda', companero: 'nox', orden: 9, nombre: 'Bufanda coral', descripcion: 'Abriga. No es por el frío, es por el estilo.',
    coste: { cuerpo: 3, vinculos: 3 }, sitio: { x: 86, y: 38, ancho: 11 }, proporcion: 0.9 },
  { id: 'farol-luna', companero: 'nox', orden: 10, nombre: 'Farol de luna', descripcion: 'Brilla en las noches tranquilas. No tengo muchas.',
    coste: { cuerpo: 4, calma: 3 }, sitio: { x: 63, y: 3, ancho: 9, colgado: true }, proporcion: 1.32, luz: { x: 45, y: 45, color: '#ffe08a' } },
  { id: 'medalla', companero: 'tuerca', orden: 8, nombre: 'Medalla de engranaje', descripcion: 'Al mérito en la gestión de pendientes. Me la he dado yo. Me la merecía.',
    coste: { orden: 6, mente: 2 }, sitio: { x: 89, y: 41, ancho: 8 }, proporcion: 1.29 },
  { id: 'tablon', companero: 'tuerca', orden: 2, abre: 'Sugerencias, expedientes y conflictos administrativos.', nombre: 'Tablón de planificación', descripcion: 'Todo planificado. Lo imprevisto, en la columna VARIOS.',
    coste: { orden: 5 }, costeAnterior: { orden: 4, mente: 2 }, sitio: { x: 33, y: 23.5, ancho: 13 }, proporcion: 0.94 },
  { id: 'tuerquita', companero: 'tuerca', orden: 9, nombre: 'Tuerquita', descripcion: 'Una versión pequeña de mí. Igual de insufrible, la mitad de alta.',
    coste: { orden: 7, vinculos: 2 }, sitio: { x: 39, y: 74, ancho: 9 }, proporcion: 1.13 },
]

export interface ProyectoBarrio {
  id: string
  nombre: string
  descripcion: string
  abre: string
  coste: Partial<Record<AreaId, number>>
  /** Dónde va en el mapa (pies, en % del mapa) y su dibujo (el puente va aparte, sobre el arroyo). */
  sitio?: { x: number; y: number; ancho: number }
  arte?: string
  /** Lo que se cuenta al tocarlo en el mapa. */
  toques?: string[]
}

/** Proyectos del barrio: transforman el mapa y conectan a los vecinos. */
export const PROYECTOS_BARRIO: ProyectoBarrio[] = [
  { id: 'puente', nombre: 'Puente', descripcion: 'Para cruzar el arroyo sin mojarse. Tuerca quiere inaugurarlo. Nox quiere cruzarlo.',
    abre: 'Une las dos orillas: empiezan las visitas.', coste: { cuerpo: 5, orden: 5, calma: 2 } },
  // Se desvelan de uno en uno, después del puente (los ids no coinciden con los de las casas).
  { id: 'fuente', nombre: 'Fuente', descripcion: 'Agua para todos. Bruma dice que es suya. Nox ya ha bebido.',
    abre: 'Un sitio donde pararse. Y donde enterarse de todo.', coste: { calma: 5, orden: 3, cuerpo: 2 },
    sitio: { x: 45, y: 42.5, ancho: 8.5 }, arte: 'fuente',
    toques: ['La fuente de la plaza. Bruma la mira mucho. Nox bebe directamente.', 'Alguien ha echado una moneda. Es un tornillo. Es de Tuerca.'] },
  { id: 'tablon-plaza', nombre: 'Tablón del barrio', descripcion: 'Avisos para todos. Tuerca ya ha pedido permiso para colgar el primero.',
    abre: 'Avisos, quejas y alguna declaración de amor anónima.', coste: { orden: 5, vinculos: 3 },
    sitio: { x: 65, y: 34, ancho: 7 }, arte: 'tablon',
    toques: ['Hay una nota: «Se busca destornillador». Lleva ahí desde el principio de los tiempos.', 'Otra nota: «Quien se haya comido mi barquito, que lo devuelva». Firmado: Bruma.'] },
  { id: 'columpio-plaza', nombre: 'Columpio', descripcion: 'Uno solo. Va a haber turnos. Y discusiones.',
    abre: 'Diversión con cola de espera.', coste: { cuerpo: 4, vinculos: 4 },
    sitio: { x: 30, y: 51, ancho: 8 }, arte: 'columpio',
    toques: ['El columpio del barrio. Tuerca ha hecho un cuadrante de turnos. Nadie lo respeta.', 'Se mueve solo. Es Bruma. O el viento. Con Bruma nunca se sabe.'] },
  { id: 'pergola', nombre: 'Pérgola con farolillos', descripcion: 'Para cenar fuera. Madeja ya ha invitado a todos.',
    abre: 'Cenas al fresco y conversaciones largas.', coste: { vinculos: 5, calma: 3, orden: 2 },
    sitio: { x: 64, y: 48.5, ancho: 9 }, arte: 'pergola',
    toques: ['La pérgola. De noche se encienden los farolillos y Madeja lo cuenta todo.', 'Aquí se cenó una vez entera sin que nadie mirara el móvil. Hay placa. No hay placa.'] },
  { id: 'horno-plaza', nombre: 'Horno del barrio', descripcion: 'Pan para todos. Nox dice que sabe hacer pan. Nadie le corrige.',
    abre: 'Pan recién hecho. O algo parecido.', coste: { cuerpo: 5, mente: 3, vinculos: 2 },
    sitio: { x: 77, y: 50, ancho: 8 }, arte: 'horno',
    toques: ['Huele a pan. O a pan quemado. Depende de quién hornee.', 'Tofu ha puesto un cartel con la temperatura exacta. Nox ha puesto una salchicha.'] },
  { id: 'buzon-plaza', nombre: 'Buzón del barrio', descripcion: 'Cartas entre vecinos. Madeja promete no leerlas. Madeja.',
    abre: 'Cartas, notas y algún secreto que no tardará en saberse.', coste: { vinculos: 6, orden: 2 },
    sitio: { x: 22, y: 80, ancho: 5 }, arte: 'buzon',
    toques: ['El buzón del barrio. Está lleno. Casi todo es de Madeja para Madeja.', 'Hay una carta de Tofu. Pone «Sí». Otra vez.'] },
]

/** Quién se cuela en cada casa cuando llevas días sin aparecer (fase 3) y dónde se planta. Se va solo con unos pocos retos. */
export const VISITANTES: Partial<Record<CompaneroId, { quien: 'cuervo' | 'polilla' | 'caracol'; x: number; y: number; ancho: number }>> = {
  nox: { quien: 'cuervo', x: 80, y: 70, ancho: 16 },
  tuerca: { quien: 'caracol', x: 80, y: 80, ancho: 17 },
  tofu: { quien: 'polilla', x: 78, y: 50, ancho: 16 },
  bruma: { quien: 'caracol', x: 24, y: 46, ancho: 14 },
  madeja: { quien: 'cuervo', x: 77, y: 67, ancho: 14 },
}

/** Dónde se pone Gregorio (la aspiradora) cuando está en casa de Nox. */
export const GREGORIO_EN_NOX: ObjetoCasa['sitio'] = { x: 80, y: 80, ancho: 13 }
/** Dónde se pone un vecino de visita (o sentado en el banco). */
export const VISITA: Partial<Record<CompaneroId, { x: number; y: number; ancho: number }>> = {
  nox: { x: 82, y: 56, ancho: 22 },
  tuerca: { x: 75, y: 59, ancho: 21 },
  tofu: { x: 76, y: 62, ancho: 20 },
  bruma: { x: 76, y: 60, ancho: 24 },
  madeja: { x: 76, y: 61, ancho: 23 },
}

/** En el estanque de Bruma no hay suelo: las visitas se sientan en el embarcadero. */
const VISITA_EN: Partial<Record<CompaneroId, { x: number; y: number; ancho: number }>> = {
  bruma: { x: 59, y: 41, ancho: 15 },
}

/** Dónde se pone un vecino de visita en una casa. */
export const sitioVisita = (casa: CompaneroId, quien: CompaneroId) => VISITA_EN[casa] ?? VISITA[quien]
