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
}

/** Gregorio de visita en casa de Nox (es la misma aspiradora, con otra vida). */
export const TOQUES_GREGORIO_EN_NOX = ['Gregorio, en casa de Nox. Come migas. Está muy bien atendido.', 'Nox le ha puesto una manta. Gregorio no ha opinado.']

/** Cómo suena cada objeto al tocarlo (los que no están, golpecito de madera). */
export const SONIDO_OBJETO: Record<string, 'fuego' | 'metal' | 'hoja'> = {
  hoguera: 'fuego', horno: 'fuego', 'farol-luna': 'fuego', farolillo: 'fuego',
  caja: 'metal', aspiradora: 'metal', flexo: 'metal', cajonera: 'metal', 'estanteria-tarros': 'metal', reloj: 'metal', medalla: 'metal', tuerquita: 'metal', tablon: 'metal',
  libros: 'hoja', pizarra: 'hoja', maceta: 'hoja', hamaca: 'hoja', campanillas: 'metal', estanteria: 'hoja', seta: 'hoja', cojin: 'hoja', bufanda: 'hoja',
}
