// Situaciones del vecindario (docs/diseno-vecindario.md). Pequeñas comedias de varias fases que avanzan
// una fase al día como mucho, dejan huellas en el escenario y quedan en las Crónicas del Álbum.
// Textos: propuestas de Claude, pendientes de revisión de Javi. El humor sale de ellos, no de meterse
// con el jugador.
import type { CompaneroId } from './tipos'

/** Dónde ocurre algo: en la casa de un vecino o en el barrio. */
export type Lugar = CompaneroId | 'barrio'

export interface Fase {
  /** Lo que se cuenta en «Mientras no estabas…» y en las Crónicas. */
  noticia: string
  lugar: Lugar
  /** Lo que dice cada vecino si le tocas mientras la situación está en esta fase. */
  frases?: Partial<Record<CompaneroId, string[]>>
  /** Si en esta fase decides tú algo. La historia espera a que decidas. */
  decision?: { pregunta: string; opciones: { id: string; texto: string; respuesta: string }[] }
  /** Variantes de esta fase según lo que decidiste antes. */
  segun?: Record<string, { noticia: string; frases?: Partial<Record<CompaneroId, string[]>> }>
}

export interface Situacion {
  id: string
  titulo: string
  /** Vecinos que tienen que haber nacido y cosas que tienen que estar construidas. */
  requiere: { vecinos: CompaneroId[]; construido: string[] }
  fases: Fase[]
}

export const SITUACIONES: Situacion[] = [
  {
    id: 'normativa',
    titulo: 'La normativa',
    requiere: { vecinos: ['nox', 'tuerca'], construido: ['hoguera'] },
    fases: [
      {
        noticia: 'Tuerca ha clavado un cartel junto a la hoguera de Nox.',
        lugar: 'nox',
        frases: {
          nox: ['Un cartel de madera. Junto a un fuego. Tuerca no ha pensado esto muy bien.', 'Lo he leído. Dos veces. Sigo sin estar de acuerdo.'],
          tuerca: ['Artículo 1: prohibido hacer fuego. Lo he redactado yo. Está muy bien redactado.'],
        },
      },
      {
        noticia: 'Nox asa salchichas justo detrás del cartel. Tuerca ha añadido el artículo 1 bis: «salchichas incluidas».',
        lugar: 'nox',
        frases: {
          nox: ['Técnicamente el fuego está detrás del cartel. Delante no hay nada prohibido.', '¿Quieres una? Está muy prohibida. Está buenísima.'],
          tuerca: ['He tenido que ampliar la normativa. Los vacíos legales me dan urticaria.'],
        },
      },
      {
        noticia: 'El cartel ha aparecido chamuscado. Nox dice que ha sido un accidente. Tuerca ha abierto un expediente y ha instalado un extintor.',
        lugar: 'nox',
        frases: {
          nox: ['Accidente. Lo juro por mi cola.', 'El extintor es feo. Pero tiene un fuego dibujado. Lo respeto.'],
          tuerca: ['Expediente 001. Tengo pruebas. Tengo olor a salchicha.'],
        },
      },
    ],
  },
  {
    id: 'tablon',
    titulo: 'El tablón',
    requiere: { vecinos: ['tuerca'], construido: ['tablon'] },
    fases: [
      {
        noticia: 'Tuerca ha colgado una convocatoria en su tablón: «Se aceptan sugerencias para mejorar el vecindario».',
        lugar: 'tuerca',
        frases: { tuerca: ['Buzón de sugerencias abierto. Las espero con los brazos abiertos. Y con una plantilla.'] },
      },
      {
        noticia: 'Nadie ha dejado ninguna sugerencia. Tuerca ha presentado tres propuestas propias y las ha aprobado por unanimidad.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['Unanimidad absoluta. Es lo que pasa cuando las propuestas son buenas.'],
          nox: ['He votado en contra. No ha contado mi voto. Dice que no traía el formulario.'],
        },
      },
      {
        noticia: 'Ha aparecido una nota anónima en el tablón: «Que Tuerca se relaje». Tuerca ha comparado la letra. Es la suya. Ha archivado el asunto como confidencial.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['No hay nada que ver aquí. Circule.', 'Asunto archivado. En la carpeta de asuntos que no han pasado.'],
          nox: ['Se ha denunciado a sí mismo. Y ha perdido. Es lo más bonito que he visto este año.'],
        },
      },
    ],
  },
  {
    id: 'gregorio',
    titulo: 'Gregorio',
    requiere: { vecinos: ['nox', 'tuerca'], construido: ['aspiradora'] },
    fases: [
      {
        noticia: 'La aspiradora de Tuerca ha desaparecido del taller.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['Ha desaparecido un electrodoméstico. He avisado a las autoridades. Soy yo.'],
          nox: ['¿Una aspiradora? No sé nada. ¿Por qué me miras así?'],
        },
      },
      {
        noticia: 'La aspiradora está en casa de Nox. Ahora se llama Gregorio. Nox le da de comer.',
        lugar: 'nox',
        frases: {
          nox: ['Se llama Gregorio. Come migas. Es el mejor compañero de piso que he tenido.'],
          tuerca: ['Es MI aspiradora. Tiene MI número de serie. No se llama Gregorio.'],
        },
      },
      {
        noticia: 'Tuerca reclama la custodia de Gregorio.',
        lugar: 'nox',
        frases: {
          nox: ['Gregorio ha elegido. Gregorio se queda.'],
          tuerca: ['Exijo una resolución. Por escrito. Con sello.'],
        },
        decision: {
          pregunta: '¿Con quién se queda Gregorio?',
          opciones: [
            { id: 'compartida', texto: 'Custodia compartida', respuesta: 'Tuerca ya está redactando el calendario. Nox ya está protestando.' },
            { id: 'nox', texto: 'Que se quede con Nox', respuesta: 'Nox ha levantado a Gregorio como si fuera un trofeo. Tuerca ha salido a buscar un abogado.' },
          ],
        },
      },
      {
        noticia: '',
        lugar: 'nox',
        segun: {
          compartida: {
            noticia: 'Custodia compartida aprobada. Tuerca ha redactado un calendario de doce páginas. Gregorio va de casa en casa.',
            frases: {
              tuerca: ['Los días pares es mío. Los impares, según el anexo B.'],
              nox: ['Doce páginas. Gregorio no sabe leer. Yo tampoco las he leído.'],
            },
          },
          nox: {
            noticia: 'Gregorio se queda con Nox. Tuerca ha presentado un recurso. Lo ha perdido contra sí mismo.',
            frases: {
              tuerca: ['He recurrido. He desestimado mi propio recurso. El sistema funciona.'],
              nox: ['Gregorio y yo estamos muy bien, gracias.'],
            },
          },
        },
      },
    ],
  },
  {
    id: 'puente',
    titulo: 'El puente',
    requiere: { vecinos: ['nox', 'tuerca'], construido: ['puente'] },
    fases: [
      {
        noticia: 'El puente está terminado. Tuerca ha organizado una inauguración oficial, con cinta y discurso.',
        lugar: 'barrio',
        frases: {
          tuerca: ['Mañana, inauguración. Habrá cinta. Habrá tijeras. Habrá protocolo.'],
          nox: ['Es un puente. Se cruza. No hace falta un discurso para cruzar.'],
        },
      },
      {
        noticia: 'Nox ha cruzado el puente antes de la inauguración. Dos veces. Tuerca ha cancelado el acto.',
        lugar: 'barrio',
        frases: {
          nox: ['Estaba ahí. Era un puente. ¿Qué querías que hiciera, mirarlo?'],
          tuerca: ['Ha cruzado sin protocolo. En las dos direcciones. Inaceptable.'],
        },
      },
      {
        noticia: 'Tuerca ha puesto un cartel con las normas de circulación. Nox ha puesto otro: peaje, una salchicha.',
        lugar: 'barrio',
        frases: {
          nox: ['El peaje es una salchicha. Tuerca no come. Es una medida muy discriminatoria. Me encanta.'],
          tuerca: ['He redactado las normas del puente. Nadie las ha leído. Lo cruzan igual.'],
        },
      },
    ],
  },
  {
    id: 'prestamo',
    titulo: 'El préstamo',
    requiere: { vecinos: ['nox', 'tofu'], construido: ['libros'] },
    fases: [
      {
        noticia: 'Tofu le ha prestado un libro a Nox. Se titula «Paciencia».',
        lugar: 'tofu',
        frases: {
          tofu: ['Se lo he prestado. Tiene quince días. Yo no tengo prisa. El libro, sí.'],
          nox: ['Me ha dejado un libro sin dibujos. Es una trampa.'],
        },
      },
      {
        noticia: 'El libro de Tofu ha aparecido junto a la hoguera de Nox. Chamuscado.',
        lugar: 'nox',
        frases: {
          nox: ['Hacía frío. Y el libro hablaba de paciencia. No tenía.'],
          tofu: ['Mi libro. En una hoguera. Lo anoto sin emoción.'],
          tuerca: ['Incendio de material bibliográfico. Lo añado al expediente 001. Ya pesa más que yo.'],
        },
      },
      {
        noticia: 'Tofu exige una compensación. Nox dice que el libro ya estaba así.',
        lugar: 'tofu',
        frases: {
          tofu: ['No estoy enfadado. El brote, sí.'],
          nox: ['Estaba así. Bueno, estaba así después.'],
        },
        decision: {
          pregunta: '¿Cómo paga Nox el libro?',
          opciones: [
            { id: 'leer', texto: 'Que lea otro entero', respuesta: 'Nox ha abierto un libro. Lleva tres páginas y dos siestas.' },
            { id: 'salchichas', texto: 'Con salchichas', respuesta: 'Nox ha pagado en salchichas. Tofu no come salchichas. Las ha aceptado por principios.' },
          ],
        },
      },
      {
        noticia: '',
        lugar: 'tofu',
        segun: {
          leer: {
            noticia: 'Nox ha terminado el libro. Dice que el final se veía venir. Era un libro de cocina.',
            frases: {
              nox: ['Me he leído un libro entero. Pregúntame lo que quieras. De salsas.'],
              tofu: ['Ha leído un libro. No lo voy a celebrar. El brote ha florecido sin mi permiso.'],
            },
          },
          salchichas: {
            noticia: 'Tofu ha colocado las salchichas en su estantería, junto a los libros. Clasificadas por grosor.',
            frases: {
              tofu: ['Sección de embutidos. Toda biblioteca seria tiene una.'],
              nox: ['Están ahí. Mirándome. Detrás de un cristal.'],
            },
          },
        },
      },
    ],
  },
  {
    id: 'pizarra',
    titulo: 'La fórmula',
    requiere: { vecinos: ['tofu', 'tuerca'], construido: ['pizarra'] },
    fases: [
      {
        noticia: 'Tofu ha escrito una fórmula en su pizarra. Nadie sabe qué calcula. Tofu tampoco.',
        lugar: 'tofu',
        frases: { tofu: ['Es una fórmula. Funciona. No sé para qué, pero funciona.'] },
      },
      {
        noticia: 'Tuerca ha borrado la pizarra de Tofu para archivar la fórmula. En VARIOS.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['Documento sin clasificar en vía pública. He actuado según protocolo.'],
          tofu: ['Me han borrado la pizarra. Escribiré otra. Mejor. O igual.'],
        },
      },
      {
        noticia: 'Tofu ha vuelto a escribir la fórmula. Es distinta. Dice que la otra estaba mal. Tuerca ha abierto un segundo archivador.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['Fórmula, versión 2. La 1 queda derogada. La archivo igual.'],
          tofu: ['La primera estaba mal. Esta también, pero mejor.'],
        },
      },
    ],
  },
  {
    id: 'planta',
    titulo: 'La planta',
    requiere: { vecinos: ['tofu', 'tuerca'], construido: ['maceta', 'aspiradora'] },
    fases: [
      {
        noticia: 'La planta de Tofu ha crecido. Tofu dice que es normal. La planta ha bostezado.',
        lugar: 'tofu',
        frases: { tofu: ['Crece. Las plantas crecen. No veo el problema.'] },
      },
      {
        noticia: 'Gregorio ha vuelto a desaparecer. La planta de Tofu está sospechosamente quieta.',
        lugar: 'tofu',
        frases: {
          tofu: ['No ha sido ella. Está haciendo la digestión, pero no ha sido ella.'],
          tuerca: ['Electrodoméstico desaparecido. Otra vez. Empiezo a tomármelo como algo personal.'],
          nox: ['Si alguien se ha comido a Gregorio, quiero saber cómo sabía.'],
        },
      },
      {
        noticia: 'Tuerca investiga la casa de Tofu con una lupa. Ha interrogado a la planta. La planta no ha colaborado.',
        lugar: 'tofu',
        frases: {
          tuerca: ['Tengo una lupa y una sospechosa. Me falta una confesión.'],
          tofu: ['Tuerca está interrogando a una maceta. Lo anoto.'],
        },
      },
      {
        noticia: 'La planta ha devuelto a Gregorio. Más limpio que nunca. Tofu dice que es simbiosis.',
        lugar: 'tofu',
        frases: {
          tofu: ['Simbiosis. Ella se lo come, él sale limpio. Todos ganan.'],
          tuerca: ['Caso cerrado. No pienso preguntar cómo.'],
          nox: ['Gregorio huele a ensalada. Me gusta menos.'],
        },
      },
    ],
  },
]

export type ArteHuella = 'cartel' | 'cartel-quemado' | 'extintor' | 'expediente' | 'puente' | 'libro-quemado' | 'archivador' | 'lupa' | 'salchicha' | 'libros'

/** Lo que pone en los carteles (el dibujo va en blanco: el texto lo pone la app). */
export interface Huella {
  id: string
  situacion: string
  /** Fase desde la que se ve (y hasta la que, si deja de verse). */
  desde: number
  hasta?: number
  decision?: string
  lugar: Lugar
  arte: ArteHuella
  /** Centro horizontal y pies, en % del escenario; ancho en % del ancho. */
  sitio: { x: number; y: number; ancho: number }
  proporcion: number
  texto?: string
  /** Lo que se cuenta si tocas la huella. */
  toque?: string
}

export const HUELLAS: Huella[] = [
  { id: 'cartel-fuego', situacion: 'normativa', desde: 0, hasta: 1, lugar: 'nox', arte: 'cartel', sitio: { x: 17, y: 51, ancho: 13 }, proporcion: 1.1,
    texto: 'PROHIBIDO\nEL FUEGO', toque: 'Debajo, en pequeñito: «art. 1. Firmado: Tuerca».' },
  { id: 'cartel-quemado', situacion: 'normativa', desde: 2, lugar: 'nox', arte: 'cartel-quemado', sitio: { x: 17, y: 51, ancho: 13 }, proporcion: 1.1,
    texto: 'PROHI…\n…FUEGO', toque: 'Huele a salchicha. Y a expediente.' },
  { id: 'extintor', situacion: 'normativa', desde: 2, lugar: 'nox', arte: 'extintor', sitio: { x: 27, y: 48, ancho: 6 }, proporcion: 1.03,
    toque: 'Lleva una etiqueta de Tuerca: «VARIOS».' },
  { id: 'expediente-fuego', situacion: 'normativa', desde: 2, lugar: 'tuerca', arte: 'expediente', sitio: { x: 63, y: 44.4, ancho: 9 }, proporcion: 0.9,
    toque: 'Expediente 001: «Hoguera, salchichas y otras infracciones».' },
  { id: 'expediente-interno', situacion: 'tablon', desde: 2, lugar: 'tuerca', arte: 'expediente', sitio: { x: 45, y: 44.4, ancho: 8 }, proporcion: 0.9,
    toque: 'Confidencial. Tuerca dice que no hay nada dentro. Pesa bastante.' },
  { id: 'cartel-normas', situacion: 'puente', desde: 2, lugar: 'barrio', arte: 'cartel', sitio: { x: 36, y: 58, ancho: 9 }, proporcion: 1.1,
    texto: 'NORMAS\nDEL PUENTE', toque: 'Son veintitrés normas. La primera es «leer las normas».' },
  { id: 'cartel-peaje', situacion: 'puente', desde: 2, lugar: 'barrio', arte: 'cartel', sitio: { x: 63, y: 54, ancho: 9 }, proporcion: 1.1,
    texto: 'PEAJE:\n1 SALCHICHA', toque: 'Nox cobra en especie. Nadie ha pagado todavía.' },
  // Tofu.
  { id: 'libro-hoguera', situacion: 'prestamo', desde: 1, hasta: 2, lugar: 'nox', arte: 'libro-quemado', sitio: { x: 30, y: 61, ancho: 9 }, proporcion: 1.12,
    toque: '«Paciencia», capítulo 1. Del resto quedan cenizas.' },
  { id: 'libro-estante', situacion: 'prestamo', desde: 3, lugar: 'tofu', arte: 'libro-quemado', sitio: { x: 23, y: 36.3, ancho: 7 }, proporcion: 1.12,
    toque: 'Tofu lo ha devuelto a su sitio. Dice que ahora tiene más carácter.' },
  // Lo que decidiste en «El préstamo» se queda a la vista.
  { id: 'salchichas-estante', situacion: 'prestamo', desde: 3, decision: 'salchichas', lugar: 'tofu', arte: 'salchicha', sitio: { x: 13, y: 36.6, ancho: 7 }, proporcion: 1.32,
    toque: 'Sección de embutidos de la biblioteca de Tofu. Clasificada por grosor.' },
  { id: 'libro-leido', situacion: 'prestamo', desde: 3, decision: 'leer', lugar: 'nox', arte: 'libros', sitio: { x: 72, y: 56, ancho: 9 }, proporcion: 1.04,
    toque: 'Los libros que Nox se leyó para pagar el préstamo. Uno era de cocina. Lo tiene abierto por las salsas.' },
  { id: 'archivador-formula', situacion: 'pizarra', desde: 1, lugar: 'tuerca', arte: 'archivador', sitio: { x: 28, y: 44.4, ancho: 8 }, proporcion: 1.06,
    toque: 'Archivador «VARIOS – Fórmulas». Dentro hay una pizarra pequeña. Entera.' },
  { id: 'lupa-planta', situacion: 'planta', desde: 2, hasta: 2, lugar: 'tofu', arte: 'lupa', sitio: { x: 35, y: 72, ancho: 8 }, proporcion: 1.03,
    toque: 'La lupa de Tuerca. Huele un poco a planta.' },
]

/** Pequeñas cosas que pasan en una casa sin historia detrás. Se ven de vez en cuando al entrar. */
export interface Micro {
  casa: CompaneroId
  /** Lo que tiene que estar construido (o el nombre de un vecino si tiene que haber nacido). */
  requiere: string[]
  texto: string
  /** Si alguien está de visita durante el micro (por ejemplo, Tuerca en el banco de Nox). */
  visita?: CompaneroId
  /** Si el dueño cambia de cara mientras dura. */
  cara?: 'dormido' | 'contento' | 'enfurrunado'
}

export const MICROS: Micro[] = [
  { casa: 'nox', requiere: ['hoguera'], texto: 'Nox se ha quedado dormido junto a la hoguera.', cara: 'dormido' },
  { casa: 'nox', requiere: ['horno'], texto: 'Ha salido algo del horno. Nox insiste en que es pan.' },
  { casa: 'nox', requiere: ['banco', 'tuerca'], texto: 'Tuerca está sentado en el banco de Nox, revisando expedientes. Nadie le ha invitado.', visita: 'tuerca' },
  { casa: 'nox', requiere: [], texto: 'Nox está persiguiéndose la cola. Va perdiendo.', cara: 'enfurrunado' },
  { casa: 'tuerca', requiere: ['caja'], texto: 'Tuerca busca el destornillador desde hace una hora. Lo tiene en la mano.' },
  { casa: 'tuerca', requiere: ['tablon'], texto: 'Tuerca ha colgado una nota nueva en el tablón. Pone «Ver nota anterior».' },
  { casa: 'tuerca', requiere: [], texto: 'Tuerca está ordenando sus tornillos por orden alfabético.' },
  { casa: 'tofu', requiere: ['libros'], texto: 'Tofu lleva una hora en la misma página. Dice que la está pensando.' },
  { casa: 'tofu', requiere: ['maceta'], texto: 'La planta de Tofu mira hacia la puerta. Tofu dice que es su forma de saludar.' },
  { casa: 'tofu', requiere: ['pizarra', 'tuerca'], texto: 'Tuerca está corrigiendo la ortografía de la pizarra de Tofu. Era una fórmula.', visita: 'tuerca' },
  { casa: 'tofu', requiere: [], texto: 'Tofu está mirando la pared desde el amanecer. Dice que medita. El brote dice que duerme.', cara: 'dormido' },
  { casa: 'nox', requiere: ['hoguera', 'tofu'], texto: 'Tofu lleva diez minutos mirando la hoguera de Nox sin decir nada. Nox empieza a ponerse nervioso.', visita: 'tofu' },
]

/** Lo que dice un vecino cuando está de visita en casa de otro (tras el puente, o en el banco). */
export const FRASES_VISITA: Partial<Record<CompaneroId, string[]>> = {
  tuerca: ['He venido a inspeccionar. No es una visita.', 'Nada de esto está homologado. Me quedo igual.', 'He traído etiquetas. Por si acaso.'],
  nox: ['He venido a ver si tenías algo de comer. No tienes.', 'Me he sentado en tu silla. Ahora es mía. Ponle una etiqueta.'],
  tofu: ['He venido a mirar. Ya he mirado.', 'Tu casa tiene muchas cosas. Pocas necesarias.'],
}
