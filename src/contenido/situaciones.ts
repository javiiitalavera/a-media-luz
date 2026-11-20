// Situaciones del vecindario (docs/diseno-vecindario.md). Pequeñas comedias de varias fases que avanzan
// una fase al día como mucho, dejan huellas en el escenario y quedan en las Crónicas del Álbum.
// Textos: propuestas de Claude, pendientes de revisión de Javi. El humor sale de ellos, no de meterse
// con el jugador.
import type { CompaneroId } from './tipos'
import { HUELLAS_LECTURAS, LECTURAS } from './lecturas'

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
  /** Si la noticia está vacía, la fase no avisa en el sobre (se descubre paseando); esto es lo que cuenta la Crónica. */
  recuerdo?: string
  /** Variantes de esta fase según lo que decidiste antes. */
  segun?: Record<string, { noticia: string; frases?: Partial<Record<CompaneroId, string[]>> }>
}

export interface Situacion {
  id: string
  titulo: string
  /** Vecinos que tienen que haber nacido y cosas que tienen que estar construidas. */
  /** `terminadas`: historias que tienen que haber acabado antes (por ejemplo, porque usan el mismo objeto). */
  requiere: { vecinos: CompaneroId[]; construido: string[]; terminadas?: string[] }
  /** Si nace de un patrón de tu diario (logica/patrones.ts): solo empieza cuando el patrón se cumple. */
  patron?: string
  fases: Fase[]
  /** Lo que recuerdan los vecinos después, de vez en cuando, cuando ya ha terminado. */
  ecos?: Partial<Record<CompaneroId, string[]>>
}

const SITUACIONES_DEL_BARRIO: Situacion[] = [
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
    // Gregorio no puede estar dentro de la planta mientras se decide con quién se queda.
    requiere: { vecinos: ['tofu', 'tuerca'], construido: ['maceta', 'aspiradora'], terminadas: ['gregorio'] },
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
  // Madeja
  {
    id: 'cotilleo',
    titulo: 'El cotilleo',
    requiere: { vecinos: ['madeja', 'nox', 'tuerca'], construido: [] },
    fases: [
      {
        noticia: 'Madeja ha llegado al barrio y en una mañana ya sabe que Nox ronca, que Tuerca habla con su aspiradora y que Tofu lee en voz alta.',
        lugar: 'barrio',
        frases: {
          madeja: ['Una mañana. Solo he necesitado una mañana. Y una ventana abierta.'],
          nox: ['Yo no ronco. Respiro con convicción.'],
          tuerca: ['¿Cómo sabe lo de Gregorio? Gregorio no habla. Creo.'],
        },
      },
      {
        noticia: 'Tuerca ha abierto un expediente a Madeja por «difusión de datos vecinales». Madeja ya ha contado lo del expediente.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['Expediente 003: Madeja. Asunto: todo. Le he puesto candado. Ya sabe la combinación.'],
          madeja: ['Me ha abierto un expediente. Qué detalle. Nadie me había archivado nunca.'],
        },
      },
      {
        noticia: 'Madeja ha organizado una merienda para hacer las paces. Ha venido todo el barrio. Tuerca ha tomado acta de lo que se ha dicho. Madeja también.',
        lugar: 'madeja',
        frases: {
          madeja: ['Ha venido todo el mundo. Nadie ha dicho nada importante. Lo he apuntado todo igual.'],
          nox: ['Había bizcocho. Me he comido el expediente. Era de bizcocho también.'],
          tuerca: ['Acta de la merienda: tres tazas, un bizcocho, cero secretos. Madeja dice que mínimo cinco.'],
        },
      },
    ],
  },
  {
    id: 'calcetines',
    titulo: 'Los calcetines',
    requiere: { vecinos: ['madeja', 'nox', 'tofu', 'tuerca'], construido: ['cesto'] },
    fases: [
      {
        noticia: 'Madeja ha tejido calcetines para todo el barrio. Nadie los ha pedido. Todos los ha medido a escondidas.',
        lugar: 'madeja',
        frases: {
          madeja: ['Un par para cada uno. Las tallas las he sacado a ojo. Tengo muy buen ojo.'],
          tofu: ['Me ha tejido calcetines. No tengo pies. Los llevo en el brote.'],
        },
      },
      {
        noticia: 'Los calcetines de Nox se han chamuscado en la primera hora. Nox dice que eran de prueba.',
        lugar: 'nox',
        frases: {
          nox: ['Eran calcetines de verano. Muy de verano. De verano a la brasa.'],
          madeja: ['Le he tejido otros. De lana ignífuga. No existe. Los he tejido igual.'],
        },
      },
      {
        noticia: 'Tuerca ha clasificado sus calcetines por talla, color y día de la semana. Solo tiene un par. Lleva una semana sin ponérselos para no desordenarlos.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['Calcetines: un par. Clasificación: completa. Uso: pendiente de aprobación.'],
          madeja: ['Tuerca no se pone mis calcetines. Los archiva. Es su forma de querer.'],
        },
      },
    ],
  },
  {
    id: 'linea',
    titulo: 'La línea directa',
    requiere: { vecinos: ['madeja', 'tuerca', 'bruma'], construido: ['telefono'] },
    fases: [
      {
        noticia: 'Madeja tiene teléfono. A las seis de la mañana ya había llamado a todo el barrio para decir que tenía teléfono.',
        lugar: 'madeja',
        frases: {
          madeja: ['¡Tengo línea! Ya os he llamado a todos. Algunos no lo cogíais. Insistí.'],
          tuerca: ['Llamada entrante a las 6:02. Contenido: «Hola». Lo he archivado como urgente por si acaso.'],
        },
      },
      {
        noticia: 'Tuerca ha redactado un horario de llamadas: de diez a doce y de cinco a siete. Madeja ha llamado a las nueve para preguntar si el horario iba en serio.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['El horario es oficial. Lo he sellado. Ella llama para preguntar por el sello.'],
          madeja: ['Un horario. Para hablar. Ni que fuéramos un ministerio.'],
        },
        decision: {
          pregunta: '¿A quién llama Madeja de noche, fuera de horario?',
          opciones: [
            { id: 'bruma', texto: 'A Bruma, que no duerme', respuesta: 'Bruma ha cogido a la primera. Llevan dos horas. Bruma casi no ha hablado.' },
            { id: 'nadie', texto: 'A nadie: que respete el horario', respuesta: 'Madeja ha mirado el teléfono toda la noche. No ha llamado. Le ha costado.' },
          ],
        },
      },
      {
        noticia: '',
        lugar: 'madeja',
        segun: {
          bruma: {
            noticia: 'Madeja y Bruma hablan cada noche fuera de horario. Tuerca lo sabe. Ha añadido un anexo: «Excepto ellas dos».',
            frases: {
              bruma: ['De noche, Madeja habla bajito. Es otra Madeja. Me gusta.'],
              madeja: ['Bruma escucha como nadie. Y no lo cuenta. Somos el equilibrio perfecto.'],
              tuerca: ['Anexo 1: excepto Madeja y Bruma. Anexo 2: no preguntar por el anexo 1.'],
            },
          },
          nadie: {
            noticia: 'Madeja ha cumplido el horario una semana entera. Tuerca le ha dado un diploma. Madeja ha llamado a todos para contarlo. Dentro de horario.',
            frases: {
              madeja: ['Una semana sin llamar de noche. Me han dado un diploma. Lo he contado por teléfono, claro.'],
              tuerca: ['Diploma al cumplimiento horario. Primer diploma que doy. Me he emocionado. Dentro de horario.'],
            },
          },
        },
      },
    ],
  },
  // Bruma
  {
    id: 'barquitos',
    titulo: 'Los barquitos',
    requiere: { vecinos: ['bruma', 'tofu'], construido: [] },
    fases: [
      {
        noticia: 'Por el arroyo baja un barquito de papel. Dentro pone: «¿Alguien más está despierto?». Es la letra de Bruma.',
        lugar: 'barrio',
        frases: {
          bruma: ['Eran las cuatro de la mañana. A esa hora todo el mundo está un poco solo. Yo, un poco más.'],
          nox: ['Yo estaba despierto. Pero comiendo. No cuenta.'],
        },
      },
      {
        noticia: 'Tofu ha contestado con otro barquito: «Sí». Ha tardado tres horas en escribirlo.',
        lugar: 'barrio',
        frases: {
          tofu: ['Era una respuesta corta. Tenía que ser la correcta.'],
          bruma: ['Me ha dicho que sí. Una palabra. La he leído catorce veces.'],
        },
      },
      {
        noticia: 'Ahora todo el barrio se manda barquitos. Tuerca los numera. Nox se los come: dice que no sabía que eran mensajes.',
        lugar: 'barrio',
        frases: {
          tuerca: ['Barquito 0047. Asunto: «Hola». Registrado, archivado y respondido: «Recibido».'],
          nox: ['Sabían a papel. Y a secreto. Les faltaba sal.'],
          bruma: ['El arroyo va lleno de cosas que nadie se atrevía a decir en voz alta.'],
          tofu: ['No he vuelto a escribir. Ya lo dije todo.'],
        },
      },
    ],
  },
  {
    id: 'infusion',
    titulo: 'La infusión',
    requiere: { vecinos: ['bruma', 'nox', 'tuerca', 'tofu'], construido: ['tetera'] },
    fases: [
      {
        noticia: 'Bruma ha invitado a todo el barrio a una infusión. Nadie ha preguntado de qué es. Nadie se ha atrevido.',
        lugar: 'bruma',
        frases: {
          bruma: ['Es de hierbas. Qué hierbas, no lo sé. Las cogí con niebla.', 'Siéntate. No hace falta hablar. Ya hablarás.'],
          nox: ['Huele a tila y a interrogatorio.'],
          tuerca: ['He pedido la lista de ingredientes. Me ha servido otra taza.'],
        },
      },
      {
        noticia: 'Tuerca se ha tomado dos tazas y ha confesado que dentro de la carpeta VARIOS hay otra: SENTIMIENTOS. Tiene un pañuelo y una tuerca de cuando era pequeño.',
        lugar: 'bruma',
        frases: {
          tuerca: ['No he dicho nada. Y si lo he dicho, no consta en acta.', 'Era una tuerca muy bonita. Fin del comunicado.'],
          bruma: ['No le he preguntado nada. Solo le he servido. Las tazas preguntan solas.'],
          nox: ['Un pañuelo. Lo sabía. Nadie archiva tanto si no llora un poco.'],
        },
      },
      {
        noticia: 'Nox se ha tomado una taza y ha confesado que le dan miedo los patos. Lleva toda la mañana negándolo. Bruma quiere servir la última taza.',
        lugar: 'bruma',
        frases: {
          nox: ['No me dan miedo. Me dan respeto. Mucho respeto. Desde lejos.'],
          bruma: ['Queda una taza. Alguien tiene que tomársela. No miro a nadie. Miro a todos.'],
        },
        decision: {
          pregunta: '¿Quién se toma la última taza?',
          opciones: [
            { id: 'tofu', texto: 'Tofu', respuesta: 'Tofu ha cogido la taza sin decir nada. El brote ya se está poniendo nervioso.' },
            { id: 'bruma', texto: 'La propia Bruma', respuesta: 'Bruma ha mirado su taza un buen rato. Ha suspirado. Se la ha bebido.' },
          ],
        },
      },
      {
        noticia: '',
        lugar: 'bruma',
        segun: {
          tofu: {
            noticia: 'Tofu se ha bebido la infusión entera y no ha confesado nada. El brote se ha puesto rojo y ha confesado por él: le gusta leer en voz alta cuando no hay nadie.',
            frases: {
              tofu: ['No tengo nada que declarar. El brote habla por libre.'],
              bruma: ['Tofu es muy discreto. Su cabeza, no.'],
              nox: ['Lee en voz alta. Le he oído. Pone voces. La del malo le sale muy bien.'],
            },
          },
          bruma: {
            noticia: 'Bruma se ha tomado su propia infusión y ha confesado que a veces llueve a propósito, para que alguien le pregunte qué le pasa. Ahora todos se lo preguntan. Demasiado.',
            frases: {
              bruma: ['Ahora me preguntan qué me pasa cada cinco minutos. Prefería la lluvia.'],
              nox: ['Le he preguntado qué le pasa. Me ha llovido encima. No entiendo el sistema.'],
              tuerca: ['He creado un formulario: «¿Qué te pasa?». Tiene tres casillas. Ninguna sirve.'],
            },
          },
        },
      },
    ],
  },
  {
    id: 'frasco',
    titulo: 'La muestra',
    requiere: { vecinos: ['bruma', 'tuerca'], construido: ['campanillas'] },
    fases: [
      {
        noticia: 'Las campanillas de Bruma suenan toda la noche. Tuerca las ha medido: dice que es ruido sin licencia.',
        lugar: 'bruma',
        frases: {
          tuerca: ['Cuarenta y dos decibelios a las tres de la mañana. Sin licencia. Sin partitura.'],
          bruma: ['No suenan ellas. Es el viento. Yo solo paso por al lado. Mucho.'],
          nox: ['A mí me duermen. Bueno, me despiertan y luego me duermen.'],
        },
      },
      {
        noticia: 'Tuerca ha embotellado un poco de la niebla de Bruma como prueba. El frasco lleva etiqueta: «Niebla. Muestra 1. VARIOS».',
        lugar: 'tuerca',
        frases: {
          tuerca: ['Prueba material. Debidamente etiquetada. Se mueve un poco, pero es normal.'],
          bruma: ['Tiene un trozo de mí en un frasco. Es el trozo que estaba de buen humor.'],
        },
      },
      {
        noticia: 'Bruma se ha sentado en el taller a esperar a que le devuelvan su niebla. Lleva así desde ayer. Se han empañado todas las etiquetas.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['No veo las etiquetas. Ninguna. Es lo más parecido al infierno que conozco.'],
          bruma: ['No tengo prisa. Las nubes nunca tenemos prisa. Es nuestra forma de ganar.'],
        },
      },
      {
        noticia: 'Tuerca ha devuelto la niebla. Se ha quedado el frasco vacío, con su etiqueta. Dice que es para el archivo. Lo mira de vez en cuando.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['El frasco está vacío. Lo guardo por motivos administrativos. Solo administrativos.'],
          bruma: ['Me ha devuelto la niebla y ha dicho «perdón» muy bajito. Lo he oído igual. Soy niebla: lo oigo todo.'],
        },
      },
    ],
  },
  {
    id: 'hamaca',
    titulo: 'La hamaca',
    requiere: { vecinos: ['bruma', 'nox', 'tuerca'], construido: ['hamaca'] },
    fases: [
      {
        noticia: 'Bruma ha colgado una hamaca de nenúfar. Ha estado vacía cuatro minutos. Ahora dentro está Nox.',
        lugar: 'bruma',
        frases: {
          nox: ['Estaba libre. Lo libre es de quien llega primero. Es una norma. De Tuerca, creo.'],
          bruma: ['Es mi hamaca. Pero se le ve tan a gusto que me da pena. Y rabia. Pena con rabia.'],
        },
      },
      {
        noticia: 'Nox se niega a salir de la hamaca. Bruma se ha puesto triste y ha empezado a llover. Solo encima de Nox.',
        lugar: 'bruma',
        frases: {
          nox: ['Llueve. Solo aquí. Me lo tomo como algo personal porque lo es.'],
          bruma: ['No estoy lloviendo a propósito. Del todo.'],
        },
      },
      {
        noticia: 'Tuerca ha abierto un paraguas dentro del taller. Dice que cuando Bruma está triste puede llover en cualquier sitio y que es una cuestión de protocolo.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['Paraguas abierto en interior. Dicen que trae mala suerte. Peor es mojar el archivo.'],
          bruma: ['Tuerca ha abierto un paraguas por mí. Es lo más bonito que han hecho en mi honor. Es lo único.'],
          nox: ['Sigo en la hamaca. Mojado, pero en la hamaca. Es una cuestión de principios.'],
        },
        decision: {
          pregunta: '¿Cómo se arregla lo de la hamaca?',
          opciones: [
            { id: 'turnos', texto: 'Por turnos', respuesta: 'Tuerca ya está haciendo el cuadrante. Nadie se lo ha pedido.' },
            { id: 'otra', texto: 'Que Nox se haga la suya', respuesta: 'Nox ha salido a buscar un nenúfar. Ha vuelto con una hoja de lechuga.' },
          ],
        },
      },
      {
        noticia: '',
        lugar: 'bruma',
        segun: {
          turnos: {
            noticia: 'Hay cuadrante: la hamaca es de Bruma por la mañana y de Nox por la tarde. Nox ha pedido también las mañanas, como horas extra.',
            frases: {
              nox: ['Mi turno es por la tarde. Por la mañana espero mi turno. Tumbado.'],
              bruma: ['Ya no llueve. Bueno, un poco los martes. Por costumbre.'],
              tuerca: ['Cuadrante aprobado. Nox lo ha firmado con la cola. Es válido.'],
            },
          },
          otra: {
            noticia: 'Nox se ha hecho su propia hamaca con una hoja de lechuga. Ha durado una siesta. Tofu dice que era su desayuno.',
            frases: {
              nox: ['Era una hamaca muy buena. Crujiente.'],
              tofu: ['Me he quedado sin desayuno. Lo anoto.'],
              bruma: ['Vuelvo a tener mi hamaca. Y un vecino que me la mira con hambre.'],
            },
          },
        },
      },
    ],
  },
]

export type ArteHuella = 'corcho' | 'cartel' | 'cartel-quemado' | 'extintor' | 'expediente' | 'puente' | 'libro-quemado' | 'archivador' | 'lupa' | 'salchicha' | 'libros' | 'frasco' | 'paraguas' | 'barquito' | 'gramofono' | 'balanza'

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
  /** Versión legible en carteles pequeños del mapa. */
  textoCorto?: string
  /** Lo que se cuenta si tocas la huella. */
  toque?: string
  /** Si ese objeto ya está construido, no sale (para no tener dos iguales en la casa). */
  sinObjeto?: string
}

const HUELLAS_DEL_BARRIO: Huella[] = [
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
  { id: 'cartel-normas', situacion: 'puente', desde: 2, lugar: 'barrio', arte: 'cartel', sitio: { x: 40, y: 54.2, ancho: 6.4 }, proporcion: 1.1,
    texto: 'NORMAS\nDEL PUENTE', textoCorto: 'Normas', toque: 'Son veintitrés normas. La primera es «leer las normas».' },
  { id: 'cartel-peaje', situacion: 'puente', desde: 2, lugar: 'barrio', arte: 'cartel', sitio: { x: 60, y: 53, ancho: 6.4 }, proporcion: 1.1,
    texto: 'PEAJE:\n1 SALCHICHA', textoCorto: 'Peaje', toque: 'Nox cobra en especie. Nadie ha pagado todavía.' },
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
  // Bruma.
  { id: 'barquito-arroyo', situacion: 'barquitos', desde: 2, lugar: 'barrio', arte: 'barquito', sitio: { x: 58, y: 57, ancho: 6 }, proporcion: 0.63,
    toque: 'Dentro pone: «¿Alguien ha visto mi otro barquito?». Lo tiene Nox. En el estómago.' },
  { id: 'frasco-taller', situacion: 'frasco', desde: 1, lugar: 'tuerca', arte: 'frasco', sitio: { x: 36.5, y: 44.4, ancho: 6 }, proporcion: 1.15,
    toque: '«Niebla. Muestra 1. VARIOS». Al final está vacío. Tuerca lo limpia cada mañana.' },
  { id: 'paraguas-taller', situacion: 'hamaca', desde: 2, lugar: 'tuerca', arte: 'paraguas', sitio: { x: 71, y: 63, ancho: 13 }, proporcion: 0.96,
    toque: 'Un paraguas abierto dentro de casa. Tuerca dice que la mala suerte no está homologada.' },
]

/** Pequeñas cosas que pasan en una casa sin historia detrás. Se ven de vez en cuando al entrar. */
export interface Micro {
  casa: CompaneroId
  /** Muebles que tienen que estar a la vista y vecinos que tienen que haber nacido. */
  requiere: string[]
  /** Nivel mínimo del dueño de la casa. */
  nivelMinimo?: 2 | 3 | 4 | 5
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
  { casa: 'bruma', requiere: [], texto: 'Bruma lleva toda la mañana mirando su reflejo en el estanque. Dice que el del agua está más tranquilo.' },
  { casa: 'bruma', requiere: [], texto: 'Bruma se ha deshilachado un poco al amanecer. Dice que es la humedad. Es la humedad.', cara: 'dormido' },
  { casa: 'bruma', requiere: ['tetera'], texto: 'Bruma ha preparado té para dos. No ha venido nadie. Se ha tomado las dos tazas y se ha confesado algo a sí misma.' },
  { casa: 'bruma', requiere: ['campanillas'], texto: 'No hace viento, pero las campanillas suenan. Bruma dice que no ha sido ella. Ha sido ella.' },
  { casa: 'bruma', requiere: ['hamaca', 'nox'], texto: 'Nox espera en el embarcadero a que la hamaca quede libre. Bruma ha decidido no volver a levantarse.', visita: 'nox', cara: 'enfurrunado' },
  { casa: 'tuerca', requiere: ['bruma'], texto: 'Se ha colado niebla en el taller. Tuerca la está intentando archivar.', visita: 'bruma' },
  { casa: 'madeja', requiere: [], texto: 'Madeja está tejiendo algo para alguien. No dice para quién. Mira mucho hacia tu lado.' },
  { casa: 'madeja', requiere: ['telefono'], texto: 'Madeja levanta el auricular y dice «¿Diga?». No hay nadie. Lo vuelve a colgar. Lleva toda la tarde ensayando.' },
  { casa: 'madeja', requiere: ['mecedora', 'bruma'], texto: 'Bruma está en la mecedora. Madeja la mece. Ninguna de las dos habla. Es raro. Es bonito.', visita: 'bruma' },
  { casa: 'madeja', requiere: [], texto: 'Madeja se ha quedado dormida en mitad de una frase. Era una frase muy larga.', cara: 'dormido' },
  { casa: 'madeja', requiere: ['nox'], texto: 'Nox ha venido a por algo de comer y lleva una hora escuchando cotilleos. Ya no se acuerda de qué venía a comer.', visita: 'nox' },
  { casa: 'madeja', requiere: ['tofu'], texto: 'Tofu está de visita. Madeja habla. Tofu escucha. Los dos parecen encantados.', visita: 'tofu' },
  { casa: 'nox', requiere: ['madeja'], texto: 'Madeja le está tomando medidas a Nox para unos calcetines. Nox no ha dicho que sí. Nox no ha dicho que no.', visita: 'madeja' },
  { casa: 'nox', requiere: ['hoguera', 'tofu'], texto: 'Tofu lleva diez minutos mirando la hoguera de Nox sin decir nada. Nox empieza a ponerse nervioso.', visita: 'tofu' },
  { casa: 'nox', requiere: ['tuerca'], texto: 'Tuerca ha venido a medir la cola de Nox. Nox le ha preguntado si necesita una licencia para llevarla. Tuerca ha sacado papel.', visita: 'tuerca' },
  { casa: 'nox', nivelMinimo: 2, requiere: ['hoguera', 'madeja'], texto: 'Nox ha puesto a Madeja al cargo de las castañas. Ya sabe quién se comió la última y a quién le conviene que no se sepa.', visita: 'madeja', cara: 'contento' },
  { casa: 'tuerca', nivelMinimo: 2, requiere: ['caja', 'nox'], texto: 'Tuerca ha abierto un taller de reparaciones. Nox ha traído una rama partida. Quiere que conserve la garantía del árbol.', visita: 'nox' },
  { casa: 'tofu', nivelMinimo: 3, requiere: ['libros', 'madeja'], texto: 'Tofu ha invitado a Madeja a su club de lectura. Ella ha traído un libro que aún no existe. Ha venido a contarle el final.', visita: 'madeja', cara: 'contento' },
  { casa: 'bruma', nivelMinimo: 2, requiere: ['tetera', 'tuerca'], texto: 'Bruma le ha servido a Tuerca una infusión y le ha pedido que deje enfriar el acta. Ya lleva dos tazas sin tomar notas.', visita: 'tuerca' },
  { casa: 'madeja', nivelMinimo: 3, requiere: ['telefono', 'bruma'], texto: 'Bruma ha venido a preguntar quién la llamó a las cuatro. Madeja ha descolgado el teléfono y ha dicho: «Ha vuelto a preguntar».', visita: 'bruma' },
  { casa: 'nox', nivelMinimo: 4, requiere: ['bruma'], texto: 'Nox y Bruma están haciendo sombras en la pared. Ella hace un bosque. Él lleva un rato intentando hacer una patata.', visita: 'bruma' },
  { casa: 'nox', nivelMinimo: 5, requiere: ['tuerca'], texto: 'Nox le ha enseñado a Tuerca a encender una sola brasa. Tuerca ha escrito veintitrés pasos. Nox recuerda tres.', visita: 'tuerca' },
  { casa: 'tuerca', nivelMinimo: 4, requiere: ['madeja'], texto: 'Tuerca ha intentado ordenar los rumores de Madeja por fecha. Tiene tres versiones de ayer y ninguna coincide.', visita: 'madeja' },
  { casa: 'tuerca', nivelMinimo: 5, requiere: ['tofu'], texto: 'Tuerca ha hecho una caja con un solo cajón para las cosas que no necesitan archivar. Tofu ha metido su manual de instrucciones.', visita: 'tofu' },
  { casa: 'tofu', nivelMinimo: 4, requiere: ['nox'], texto: 'Tofu está leyendo en voz alta. Nox protesta cuando para y protesta cuando hay una parte triste. Lleva aquí desde el prólogo.', visita: 'nox' },
  { casa: 'tofu', nivelMinimo: 5, requiere: ['bruma'], texto: 'Tofu y Bruma se han mandado una historia en barquitos. Hay dos finales flotando. Han decidido dejar que el arroyo escoja.', visita: 'bruma' },
  { casa: 'bruma', nivelMinimo: 4, requiere: ['tofu'], texto: 'Bruma ha hecho una nube lo bastante baja para que Tofu lea a la sombra. El brote se ha quedado dormido antes de la primera página.', visita: 'tofu' },
  { casa: 'bruma', nivelMinimo: 5, requiere: ['madeja'], texto: 'Bruma y Madeja ensayan una despedida para las nubes. Madeja se demora en cada adiós. Han vuelto a pasar las mismas tres.', visita: 'madeja' },
  { casa: 'madeja', nivelMinimo: 4, requiere: ['tuerca'], texto: 'Madeja ha tejido un bolsillo para los tornillos que Tuerca pierde. Él ha pedido un segundo bolsillo para el justificante.', visita: 'tuerca' },
  { casa: 'madeja', nivelMinimo: 5, requiere: ['nox'], texto: 'Madeja ha cosido un mapa del barrio con retales. Nox ha encontrado su casa por la mancha de hollín. Dice que es realismo.', visita: 'nox' },
]

/** Lo que dice un vecino cuando está de visita en casa de otro (tras el puente, o en el banco). */
export const FRASES_VISITA: Partial<Record<CompaneroId, string[]>> = {
  tuerca: ['He venido a inspeccionar. No es una visita.', 'Nada de esto está homologado. Me quedo igual.', 'He traído etiquetas. Por si acaso.'],
  nox: ['He venido a ver si tenías algo de comer. No tienes.', 'Me he sentado en tu silla. Ahora es mía. Ponle una etiqueta.'],
  tofu: ['He venido a mirar. Ya he mirado.', 'Tu casa tiene muchas cosas. Pocas necesarias.'],
  bruma: ['He venido a ver cómo estabas. Ya lo sé. No hace falta que me lo digas.', 'Qué casa tan llena de cosas. Y de ruido. Me quedo un poco.', 'No me hagas caso. Soy niebla de paso.'],
  madeja: ['¡Pasaba por aquí! Bueno, venía aposta. ¿Qué hay de nuevo?', 'Qué bonito lo tienes. ¿Quién te lo ha regalado? Cuéntamelo.', 'Me quedo un ratito. Un ratito largo.'],
}

/** Todas las historias: primero las que nacen de tu diario (tienen prioridad si su patrón se cumple). */
export const SITUACIONES: Situacion[] = [...LECTURAS, ...SITUACIONES_DEL_BARRIO]
export const HUELLAS: Huella[] = [...HUELLAS_DEL_BARRIO, ...HUELLAS_LECTURAS]
