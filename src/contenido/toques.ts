// Lo que se cuenta al tocar un objeto de una casa (va rotando). Propuestas de Claude, pendientes de
// revisión de Javi. Tono: el de cada dueño, con humor y sin meterse con el jugador más de la cuenta.

export const TOQUES_OBJETO: Record<string, string[]> = {
  // Nox
  hoguera: ['La hoguera de Nox. Calienta, ilumina y viola tres artículos de la normativa.', 'Nox dice que el fuego le relaja. Al extintor, no tanto.', 'Aquí se asan salchichas de forma totalmente ilegal.'],
  banco: ['Un tronco con patas. Nox lo llama «mobiliario de exterior».', 'Tuerca se sienta aquí sin invitación. Nox ha dejado de discutirlo.'],
  horno: ['Un horno de leña. Lo que sale de ahí, Nox lo llama pan.', 'Huele a pan quemado. Nox dice que es «tostado artesanal».'],
  cojin: ['El cojín de Nox. No es para visitas. Nada es para visitas.', 'Tiene la forma exacta de Nox. Lleva años trabajándolo.'],
  farolillo: ['Un farolillo. Nox lo enciende cuando cree que no le ve nadie.', 'Da luz suficiente para leer. Nox lo usa para mirar el fuego.'],
  seta: ['Una seta que brilla sola. Nadie sabe por qué. Nadie pregunta.', 'Nox dice que no se come. Lo dice con mucha seguridad.'],
  estanteria: ['Libros que Nox dice que ha leído. Algunos aún tienen el plástico.', 'Hay un hueco. Ahí estaba «Paciencia».'],
  zapatillas: ['Zapatillas de brasa. Dejan huellas chamuscadas.', 'Nox las usa para correr. Una vez. Fue memorable.'],
  bufanda: ['Una bufanda coral. Nox dice que es por estilo, no por frío.', 'Abriga. Nox no lo admitirá.'],
  'farol-luna': ['Un farol con una luna dentro. Nadie sabe cómo la metió.', 'Brilla más en las noches tranquilas. Nox no tiene muchas.'],
  // Tuerca
  caja: ['La caja de herramientas de Tuerca. El destornillador nunca está dentro.', 'Todo etiquetado. Nada en su sitio.'],
  aspiradora: ['Gregorio. Antes era una aspiradora. Ahora es un miembro del barrio.', 'Limpia sola. Y a veces se va sola.', 'Tiene número de serie y nombre. Hay un conflicto al respecto.'],
  tablon: ['El tablón de Tuerca. Hay una nota que remite a otra nota que remite a esta.', 'Planificación semanal. La semana es de 2019.'],
  flexo: ['Luz de trabajo. Tuerca la apunta a lo que no está haciendo.', 'Se enciende con un ruido muy satisfactorio. Tuerca lo hace por eso.'],
  cajonera: ['Tres cajones. Todos pone VARIOS.', 'El de abajo no se abre. Tuerca dice que es a propósito.'],
  'estanteria-tarros': ['Tornillos ordenados por tamaño, color y rencor.', 'Hay un tarro vacío con etiqueta: «FUTURO».'],
  reloj: ['Un reloj de engranajes. Va cuatro minutos adelantado. Por si acaso.', 'Tic, tac. Tuerca lo encuentra relajante. Nadie más.'],
  medalla: ['Medalla al mérito en la gestión de pendientes. Se la ha dado él mismo.', 'La limpia cada mañana. Antes de no hacer nada.'],
  tuerquita: ['Tuerquita. Una versión pequeña de Tuerca. Igual de insufrible.', 'Tuerquita ha empezado a etiquetar a Tuerca.'],
  // Tofu
  libros: ['La biblioteca de Tofu. Presta libros. Con condiciones.', 'Los ha leído todos. Dice que ninguno le ha cambiado. El brote dice lo contrario.'],
  pizarra: ['Una fórmula. Nadie sabe qué calcula. Funciona.', 'Tofu dice que la próxima versión resolverá algo. No dice qué.'],
  maceta: ['La planta de Tofu. Come poco. Casi siempre.', 'Te está mirando. Tofu dice que es su forma de saludar.', 'No le acerques los dedos. Es un consejo general.'],
  // Bruma
  tetera: ['La tetera de Bruma. Lo que sirve relaja. Y suelta la lengua.', 'Siempre hay una taza de más. Por si viene alguien. O por si viene ella misma.'],
  campanillas: ['Campanillas de viento. Suenan aunque no haga viento. Bruma no da explicaciones.', 'Tuerca ha medido los decibelios. Bruma ha medido a Tuerca.'],
  hamaca: ['Una hamaca de nenúfar. Bruma la usa poco. Nox, demasiado.', 'Se balancea sola. Bruma dice que es el agua. A veces es Nox, escondido.'],
  // Láminas nuevas
  saco: ['Un saco de hojas. Nox lo golpea cuando pierde al escondite. O sea, a menudo.', 'Suelta una hoja con cada golpe. Nox dice que es entrenamiento de otoño.'],
  mancuernas: ['Mancuernas de piedra. Nox las levanta una vez al día. Para la foto.', 'Pesan mucho. Nox dice que pesan poco. Nox suda.'],
  comba: ['La comba de Nox. Salta tres veces y se enreda la cola.', 'Récord personal: once saltos. Hay testigos. Uno. Gregorio.'],
  parrilla: ['La parrilla. Técnicamente no es una hoguera. Tuerca lo está estudiando.', 'Huele a salchicha. Siempre. Incluso apagada.'],
  colchoneta: ['Para estirar. Nox se ha quedado dormido estirando. Dos veces.', 'Es de musgo. Tofu dice que es pariente lejano.'],
  bici: ['Una bici de madera. Sin frenos. Nox frena con la cola.', 'Ha dado una vuelta al barrio. Ha vuelto a pie, empujándola.'],
  archivador: ['Tres cajones. Etiquetas en blanco. Tuerca no se decide por dónde empezar.', 'Dentro hay un expediente sobre el propio archivador.'],
  maquina: ['Clac, clac, ding. Tuerca escribe formularios para relajarse.', 'Ha escrito una carta de amor. A un tornillo. Es un formulario.'],
  corcho: ['Notas unidas con hilo rojo. Tuerca investiga quién se comió el barquito.', 'El hilo rojo lleva a una nota que pone «Nox». Todas llevan ahí.'],
  balanza: ['La balanza. Tuerca pesa sus decisiones. Siempre empatan.', 'En un platillo, un tornillo. En el otro, otro tornillo. Equilibrio perfecto.'],
  lampara: ['Una lámpara hecha de piezas. Tuerca dice que se parece a él. Se parece.', 'Se inclina hacia quien habla. Es muy educada.'],
  cajas: ['Tres cajas. La de arriba pone CAJAS. Las otras, también.', 'Tuerca las ha ordenado por tamaño. Coincide con el orden de altura. Le ha emocionado.'],
  telescopio: ['El telescopio de Tofu. Mira estrellas. Las estrellas no le miran.', 'Apunta a la ventana de Madeja. Tofu jura que es casualidad.'],
  globo: ['Un globo terráqueo. Tofu lo gira y pone el dedo. Siempre sale el mar.', 'Ha marcado con un punto dónde está el barrio. No está en el globo.'],
  atril: ['Un atril. Tofu lee de pie. Se cansa. Se sienta. Vuelve a empezar.', 'Hay un libro abierto por la mitad. Lleva así un mes. Es intencionado.'],
  caballete: ['Un lienzo en blanco. Tofu dice que es su mejor obra. Se titula «Todavía».', 'Le ha dado una pincelada. La ha borrado. Ha sido un gran día.'],
  ajedrez: ['Tofu juega contra sí mismo. Va ganando. Y perdiendo.', 'Nox movió un peón una vez. Tofu lleva dos semanas pensando la respuesta.'],
  gramofono: ['Música antigua. Tofu la escucha con el brote, que es por donde oye.', 'Suena un vals. La planta se balancea. Tofu no.'],
  tarro: ['Luciérnagas en un tarro abierto. Entran y salen cuando quieren.', 'De noche, el tarro alumbra más que el farol. Bruma no lo dice por modestia.'],
  columpio: ['Un columpio sobre el agua. Bruma se columpia sin tocar el asiento.', 'Nox se subió una vez. Cayó al estanque. Dice que fue a propósito.'],
  cometa: ['Una cometa con forma de nube. Bruma la vuela y se emociona un poco.', 'Hay días que no se sabe cuál es la cometa y cuál es Bruma.'],
  loto: ['Una lámpara de loto flotando. Se apaga si Bruma está triste.', 'Las ranas la usan de faro. Bruma no les cobra.'],
  manta: ['Una manta sobre una piedra. Bruma dice que las piedras también tienen frío.', 'Madeja la tejió. Bruma la ha dejado aquí. Es su forma de dar las gracias.'],
  'farol-papel': ['Un farolillo de papel lila. Alumbra bajito, como habla Bruma.', 'Con el viento se mece. Bruma también.'],
  // Madeja
  cesto: ['El cesto de costura. Hay un calcetín a medias. Es para ti. Aún no lo sabes.', 'Agujas, ovillos y tres conversaciones pendientes.'],
  telefono: ['Un teléfono de rueda. Madeja marca de memoria todos los números del barrio.', 'Está caliente. Acaba de colgar. Va a volver a llamar.'],
  mecedora: ['La mecedora de Madeja. Quien se sienta, acaba contando algo.', 'Cruje un poco. Madeja dice que es para que no te duermas a mitad de historia.'],
  album: ['Un álbum de fotos. Madeja lo va llenando con vecinos que no sabían que posaban.', 'Hay una foto de Nox dormido. Nox no sabe que existe.'],
  guirnalda: ['Banderines de lana. Madeja celebra hasta los martes.', 'Cada banderín es por alguien. Hay uno vacío. Es para quien venga.'],
  buzon: ['El buzón de Madeja. Cartas de verdad, con letra torcida.', 'Hay una carta de Tuerca. Es un formulario. Madeja la guarda igual.'],
}

/** Gregorio de visita en casa de Nox (es la misma aspiradora, con otra vida). */
export const TOQUES_GREGORIO_EN_NOX = ['Gregorio, en casa de Nox. Come migas. Está muy bien atendido.', 'Nox le ha puesto una manta. Gregorio no ha opinado.']

/** Cómo suena cada objeto al tocarlo (los que no están, golpecito de madera). */
export const SONIDO_OBJETO: Record<string, 'fuego' | 'metal' | 'hoja'> = {
  hoguera: 'fuego', horno: 'fuego', 'farol-luna': 'fuego', farolillo: 'fuego',
  caja: 'metal', aspiradora: 'metal', flexo: 'metal', cajonera: 'metal', 'estanteria-tarros': 'metal', reloj: 'metal', medalla: 'metal', tuerquita: 'metal', tablon: 'metal',
  libros: 'hoja', pizarra: 'hoja', maceta: 'hoja', saco: 'hoja', colchoneta: 'hoja', comba: 'hoja', parrilla: 'fuego', archivador: 'metal', maquina: 'metal', balanza: 'metal', lampara: 'metal', cajas: 'metal', telescopio: 'metal', gramofono: 'metal', atril: 'hoja', caballete: 'hoja', ajedrez: 'hoja', tarro: 'metal', cometa: 'hoja', loto: 'hoja', manta: 'hoja', 'farol-papel': 'hoja', hamaca: 'hoja', campanillas: 'metal', album: 'hoja', guirnalda: 'hoja', telefono: 'metal', estanteria: 'hoja', seta: 'hoja', cojin: 'hoja', bufanda: 'hoja',
}
