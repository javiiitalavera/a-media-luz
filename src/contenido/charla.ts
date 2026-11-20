// Lo que dicen los vecinos al tocarlos según lo que pasa: cómo va tu día, qué día de la semana es, si
// vuelves tras unos días, su etapa, lo que tienen construido y los demás vecinos (solo si ya han llegado).
// Se mezcla con los saludos de cada momento del día (frases.ts). PROPUESTAS de Claude, pendientes de
// revisión de Javi. Tono: humor negro, nada ñoño; consecuencias sí, culpa no.
import type { CompaneroId } from './tipos'

export interface Charla {
  /** Cómo va tu lista de hoy: sin tachar nada (solo a partir de mediodía), a medias o completa. */
  hoy: { nada: string[]; algo: string[]; todo: string[] }
  semana: { lunes: string[]; viernes: string[]; finde: string[] }
  /** Vuelves tras tres días o más sin tachar nada. Sin reproches. */
  vuelta: string[]
  /** Según el dibujo que lleva el vecino. */
  etapa: [string[], string[], string[]]
  /** Sobre lo que tiene construido en su casa (id del objeto). */
  objetos: Record<string, string[]>
  /** Sobre los otros vecinos (solo si ya han nacido). */
  vecinos: Partial<Record<CompaneroId, string[]>>
}

export const CHARLA: Partial<Record<CompaneroId, Charla>> = {
  nox: {
    hoy: {
      nada: ['Antes me daba el sol aquí. Espero que vuelva.', '¿Te quedas? Te he visto poner esa cara justo antes de irte.', 'He oído crujir el suelo y he dicho «adelante». Era el suelo.'],
      algo: ['¿Te guardo la silla o vas a decir otra vez que no te vas a sentar?', 'A medias. Como mis siestas: empezadas con mucha convicción.', 'Te veo luego.'],
      todo: ['Iba a aplaudir. Me he acordado de cómo tengo las patas.', 'Descansa. Te guardo el sitio.', 'Voy a copiarte una idea. Luego diré que se me ocurrió en la ducha.'],
    },
    semana: {
      lunes: ['Lunes. Lo odio con la intensidad de mil hogueras. Bueno, de una.', 'Es lunes. Haz lo mínimo y que parezca mucho. Técnica de zorro.'],
      viernes: ['Es viernes. He sacado la silla buena. La mala cruje cuando digo que sí.', 'Viernes. El cuerpo pide sofá. El mío también. Le hago caso.'],
      finde: ['Fin de semana. Aprovecha para moverte. O para dormir. Las dos cuentan si las haces bien.', 'Sábado o domingo, da igual. Para un zorro, todos los días son festivos.'],
    },
    vuelta: ['Mira quién ha vuelto. Te he guardado el sitio. Lo he calentado yo.', 'Unos días fuera. Yo también me escapo a veces. Volver es la parte buena.', 'Ya estás aquí. No digo nada. Bueno, una cosa: hola.'],
    etapa: [
      ['Soy pequeño. Pero las brasas pequeñas son las que prenden el monte.', 'Me he subido a un tocón para ver el horizonte. He visto otro tocón.'],
      ['Hoy he intentado rugir. Ha venido un pato a ver qué me pasaba.', 'Me he dado cuenta de que tengo cuello. Lo uso para mirarte por encima del hombro.'],
      ['Tengo responsabilidades. No las cumplo, pero las tengo.', 'Me estoy poniendo interesante. Espero que no me pidas pruebas.'],
    ],
    objetos: {
      hoguera: ['Mi hoguera. Le hablo por las noches. Me entiende mejor que nadie.', 'Si el fuego se apaga, me apago yo. Es una metáfora. O no.'],
      banco: ['Tengo un banco. Para sentarme a juzgar el paisaje.', 'El banco es para visitas. Las visitas no vienen. Es para mí.'],
      horno: ['Tengo horno. Hago pan. Lo llamo pan.', 'El horno funciona. El pan, a su manera.'],
      cojin: ['Mi cojín tiene la forma exacta de mi trasero. Años de trabajo.'],
      farolillo: ['El farolillo es para leer. No leo. Pero está encendido por si me da.'],
      seta: ['La seta brilla sola. Es un ejemplo para todos. Menos para mí.'],
      estanteria: ['Tengo estantería. Los libros son decorativos. Como la mitad de mis opiniones.'],
    },
    vecinos: {
      tuerca: ['Tuerca me ha etiquetado la cola. Pone VARIOS.', 'Tuerca ha hecho una lista de mis defectos. Tiene índice.', 'A Tuerca le debo una salchicha. O él a mí. Lo tiene apuntado.'],
      tofu: ['Tofu me mira sin parpadear. No sé si me admira o me está leyendo.', 'Le he preguntado a Tofu qué piensa. Me ha contestado el brote.', 'Tofu es el vecino perfecto: no hace ruido, no come salchichas, no compite.'],
      bruma: ['Bruma me ha llovido encima. Dice que fue sin querer. Lo dijo sonriendo.', 'Cuando Bruma está triste, mi cola echa vapor. Es incómodo para los dos.', 'Bruma me entiende. Es lo peor que le puede pasar a un zorro.'],
      madeja: ['Madeja me ha tejido unos calcetines. Se han quemado. Casi sin querer.', 'Madeja sabe cosas de mí que yo no sé. Me da miedo preguntar.', 'Le conté a Madeja una tontería. Ya la sabe medio barrio. La otra mitad, mañana.'],
    },
  },

  tuerca: {
    hoy: {
      nada: ['Puedes mirar. Estoy probando un sistema de cajones.', 'He puesto una silla para las visitas. No pensaba que iba a hacer falta tan pronto.', '¿Has venido a supervisar? Es que tienes las manos a la espalda.'],
      algo: ['Lo he apuntado.', '¿Quieres ver cómo lo hago yo? Te aviso de que aún estoy eligiendo el bolígrafo.', 'Me sobran dos tornillos. He decidido que eran de otra cosa.'],
      todo: ['Registrado.', 'Si alguien pregunta, estaba supervisándote. Desde el banco.', 'Bien. Ya podemos dejar de hacer como si hubiera una auditoría.'],
    },
    semana: {
      lunes: ['Lunes. Día oficial de empezar cosas. Y de dejarlas el martes.', 'Lunes. He preparado un plan semanal. Tiene anexos.'],
      viernes: ['Viernes. Revisión semanal de pendientes. No mires la cifra. Yo ya la he mirado.', 'Viernes. Los pendientes de la semana pasan a la semana que viene. Es el ciclo de la vida.'],
      finde: ['Fin de semana. Buen momento para ordenar un cajón. Uno. No te vengas arriba.', 'Sábado y domingo no figuran en mi calendario laboral. Los paso ordenando igual.'],
    },
    vuelta: ['Bienvenido de vuelta. He conservado tu expediente en perfecto estado.', 'Has estado unos días fuera. Lo he anotado como «vacaciones». Suena mejor.', 'Has vuelto. Te he guardado el sitio. Tiene etiqueta.'],
    etapa: [
      ['Versión básica. Pocas funciones, pocos fallos. Bueno, algunos fallos.', 'Soy pequeño, pero mis etiquetas son de tamaño estándar.'],
      ['He recibido una actualización. Ahora tengo dos engranajes y el doble de opiniones.', 'Versión intermedia. Funciono. A veces sé por qué.'],
      ['Tengo una actualización pendiente. La he archivado bajo «Luego».', 'Operativo. Con garantía. La garantía ha caducado.'],
    ],
    objetos: {
      caja: ['La caja de herramientas está completa. Menos el destornillador. Siempre menos el destornillador.'],
      tablon: ['He colgado una nota nueva en el tablón. Dice «leer el tablón».', 'El tablón está al día. Bueno, al día de 2019.'],
      aspiradora: ['La aspiradora ha vuelto a cambiar de sitio sola. Le estoy preparando un expediente.'],
      flexo: ['El flexo ilumina lo que no estoy haciendo. Es un buen flexo.'],
      cajonera: ['Tres cajones. Los tres pone VARIOS. Es un sistema. Funciona.'],
      'estanteria-tarros': ['Tengo los tornillos ordenados por rencor. Los más rencorosos, arriba.'],
      reloj: ['El reloj va cuatro minutos adelantado. Los uso para preocuparme con antelación.'],
    },
    vecinos: {
      nox: ['Nox ha vuelto a hacer fuego. He actualizado el expediente. Ya tiene tomo dos.', 'Nox me debe tres formularios. Y una salchicha. La salchicha es lo de menos.', 'He intentado ordenar a Nox. No se deja. Es una pieza que no encaja en ningún sitio. Me gusta.'],
      tofu: ['Tofu no habla mucho. Lo que dice lo archivo en «IMPORTANTE». Es la única carpeta con eso.', 'Tofu ha leído mi reglamento entero. Nadie lo había hecho. Me he emocionado. En silencio.', 'He medido a Tofu. No crece. El brote, sí. Lo apunto aparte.'],
      bruma: ['Bruma ha empañado mi archivo. Dice que lo siente. Lo ha empañado más.', 'Cuando Bruma pasa, las etiquetas se despegan. He pedido etiquetas a prueba de niebla.', 'Bruma me ha preguntado qué siento. He abierto la carpeta VARIOS. Ha sido un error.'],
      madeja: ['Madeja sabe dónde está todo lo que pierdo. No me dice dónde. Me dice con quién.', 'He abierto un expediente a Madeja por difusión de datos. Ya lo sabe todo el barrio.', 'Madeja me ha tejido una funda para el engranaje. No la necesito. La llevo.'],
    },
  },

  tofu: {
    hoy: {
      nada: ['Estoy aquí.', 'Puedes sentarte. Hoy leo despacio.', 'Ayer me salté una página y mejoró bastante.'],
      algo: ['Te guardo el sitio.', 'Puedes pasar a la siguiente página. A nadie le hace falta saber lo de la anterior.', 'El brote se ha inclinado hacia la ventana. Tiene su propio horario.'],
      todo: ['Bien.', 'Me quedaba una página. He vuelto a la primera.', 'Puedes cerrar el libro cuando quieras. Yo también miro cuánto queda.'],
    },
    semana: {
      lunes: ['Lunes. Buen día para empezar un libro. Malo para terminarlo.', 'Lunes. El brote no quiere salir de la maceta. Lo entiendo.'],
      viernes: ['Viernes. He terminado la semana. Y un capítulo. Empate.', 'Viernes. El brote quiere salir. Yo prefiero leer. Ganará el brote.'],
      finde: ['Fin de semana. Tiempo para leer sin culpa. Bueno, sin culpa siempre.', 'Sábado o domingo. Los cubos no distinguimos. Los libros tampoco.'],
    },
    vuelta: ['Has vuelto. Te he guardado la página.', 'Unos días fuera. El musgo ha crecido. Yo, no. Te esperaba igual.', 'Bienvenido. No he cambiado nada. Ni de postura.'],
    etapa: [
      ['Soy un brote. Los brotes no tenemos opiniones. Tenemos raíces.', 'Pequeño. Pero denso. Como un buen libro de bolsillo.'],
      ['He crecido. El brote tiene más hojas. Yo tengo las mismas ideas.', 'Rama nueva. Cara seria. Corazón de musgo.'],
      ['Tengo copa. No me da sombra a mí, pero me da sombra.', 'Me caen las hojas. A propósito.'],
    ],
    objetos: {
      libros: ['Mis libros. Los he leído todos. Algunos al revés, para ver si cambiaba el final.', 'He numerado las páginas que me gustan. Empiezan por la 87.'],
      pizarra: ['La fórmula de la pizarra sigue sin resolver nada. Sigue siendo bonita.', 'He borrado la pizarra. La he vuelto a escribir igual. Ahora la entiendo menos.'],
      maceta: ['La planta me mira. Yo la miro. Es nuestra forma de hablar.', 'La planta ha comido. No pregunto qué.'],
    },
    vecinos: {
      nox: ['Nox me ha devuelto un libro. Olía a humo. Era otro libro.', 'Nox habla mucho. Yo escucho. Es un buen reparto.', 'Nox me ha preguntado de qué va mi libro. Le he dicho que de un zorro. Se lo ha creído.'],
      tuerca: ['Tuerca me ha pedido que clasifique mis libros. Ya están clasificados: por cariño.', 'Tuerca y yo nos entendemos. Él ordena. Yo no desordeno.', 'Tuerca ha corregido la ortografía de mi fórmula. Ahora funciona peor.'],
      bruma: ['Bruma y yo nos sentamos a no decir nada. Es nuestra conversación favorita.', 'Bruma me ha empañado las gafas. No las necesito. Las llevo por ella.', 'Bruma lee lo que pienso. Es cómodo: me ahorra hablar.'],
      madeja: ['Madeja me ha preguntado qué leo. Se lo he dicho. Ahora lo lee todo el barrio.', 'Madeja me deja recados entre páginas. En los libros malos, eso ayuda.', 'Madeja me ha tejido un marcapáginas. Es muy largo. Marca tres libros a la vez.'],
    },
  },

  bruma: {
    hoy: {
      nada: ['Me quedo en la orilla.', 'He reservado la silla seca. Sí, hay una.', 'No hace falta hablar.'],
      algo: ['Si quieres, me quedo un rato.', '¿Has venido a desconectar o a mirar si se nota que desconectas?', 'Acaba de pasar una rana. Llevaba prisa. La he visto volver.'],
      todo: ['Muy bien. Quédate si quieres.', 'Ya se oye menos el viento.', 'Me sobra una taza. La otra también, si me quedo flotando.'],
    },
    semana: {
      lunes: ['Lunes. Todo el mundo corre. Tú no tienes por qué.', 'Es lunes. Hoy llovería, pero me contengo.'],
      viernes: ['Viernes. La semana pesa. Déjala en la orilla.', 'Viernes. Esta noche el estanque estará muy quieto. Ven si quieres.'],
      finde: ['Fin de semana. Hoy no tienes que ser útil. Solo estar.', 'Sábado o domingo. Las nubes no trabajamos. Tú tampoco deberías.'],
    },
    vuelta: ['Has vuelto. Te había echado de menos un poco. Bueno, bastante. Pero bajito.', 'Unos días fuera. A veces hace falta irse para que te apetezca volver.', 'Ya estás aquí. El estanque se ha aclarado solo.'],
    etapa: [
      ['Soy pequeña. Pero tapo el sol igual. Un poquito.', 'Nubecilla. Me deshilacho con nada. Y me rehago con menos.'],
      ['He crecido. Ahora me caben más cosas dentro. No todas buenas.', 'Ya sé llover a propósito. No lo uso. Casi nunca.'],
      ['He visto pasar muchas tormentas. Algunas eran mías.', 'Ahora puedo espesarme. Luego ya veré si me disipo.'],
    ],
    objetos: {
      tetera: ['La tetera está caliente. Siempre hay una taza de más. Por si acaso.', 'Mis infusiones hacen hablar. Yo solo sirvo. Lo que salga, sale.'],
      campanillas: ['Las campanillas suenan cuando estoy triste. Así nadie tiene que preguntar.', 'Tuerca dice que las campanillas hacen ruido. Es música. Desordenada.'],
      hamaca: ['La hamaca se balancea sola. Es el agua. A veces es Nox, escondido.', 'Tengo hamaca. Para flotar tumbada. Es otra cosa.'],
    },
    vecinos: {
      nox: ['Nox hace como que no le importa nada. Le importa todo. Lo noto en la cola.', 'A Nox le he llovido encima. Sin querer. Bueno.', 'Nox me ha traído una salchicha. Es su forma de decir «lo siento». O de deshacerse de ella.'],
      tuerca: ['Tuerca lo ordena todo porque por dentro está muy desordenado. Lo sé. No se lo digo.', 'Tuerca me ha abierto un expediente. Lo he empañado. Estamos en paz.', 'Tuerca abrió un paraguas por mí una vez. No lo ha cerrado.'],
      tofu: ['Tofu y yo nos entendemos sin hablar. Es lo que más me gusta de él.', 'El brote de Tofu me cuenta lo que Tofu no dice. Lo dice todo.', 'Tofu me ha escrito un barquito. Ponía «Sí». Lo tengo guardado.'],
      madeja: ['Madeja me pregunta qué me pasa antes de que me pase. Es agotador. Y bonito.', 'Madeja me ha tejido un gorro. Las nubes no llevamos gorro. Lo llevo.', 'Le conté algo a Madeja. Ya lo sabe todo el barrio. Lo sabía.'],
    },
  },

  madeja: {
    hoy: {
      nada: ['Quédate si quieres. La tetera sigue caliente.', 'Te iba a hacer un ovillo. Me ha salido un calcetín. ¿Qué pie te cae mejor?', 'Estoy tejiendo unos mitones. Si te preguntan, son para alguien con manos.'],
      algo: ['Te escucho.', 'Si empiezas por «en resumen», voy a traer otra taza.', 'He tejido un bolsillo en el delantal. Ahora sí puedo perder cosas sin salir de casa.'],
      todo: ['Bien hecho.', 'Hoy te dejaría elegir la música. Pero te he oído tararear.', '¿Te guardo un trozo? Ya he cortado dos.'],
    },
    semana: {
      lunes: ['Lunes. La gente vuelve con historias del fin de semana. Mi día favorito.', 'Es lunes. Escribe a alguien para preguntarle qué tal el finde. Y luego me cuentas.'],
      viernes: ['¡Viernes! ¿Planes? ¿Con quién? ¿Dónde? Necesito datos.', 'Viernes. La gente queda. Tú también deberías. Yo me apunto. Mentalmente.'],
      finde: ['Fin de semana. Ideal para ver a alguien en persona. Con ojos y todo.', 'Sábado o domingo. Las familias se juntan. Los cotilleos se multiplican.'],
    },
    vuelta: ['¡Por fin! ¿Dónde estabas? No, espera, siéntate primero.', 'Unos días fuera. Te he guardado todas las noticias. Son muchas.', 'Has vuelto. Me alegro. No sabes cuánto. Bueno, te lo cuento.'],
    etapa: [
      ['Soy pequeña, pero tengo mucha hebra. Y mucha conversación.', 'Un ovillo pequeño sabe muchas cosas. Las pequeñas, sobre todo.'],
      ['He crecido. Ahora llevo agujas. Para tejer. Y para señalar.', 'Más hebra, más contactos.'],
      ['Con bufanda y opiniones. Muchas opiniones.', 'Tengo hilo de sobra para enredarme en la vida de los demás.'],
    ],
    objetos: {
      cesto: ['Estoy tejiendo unos calcetines. No te digo para quién. Para ti.'],
      telefono: ['He llamado a todo el barrio esta mañana. Dos veces. A Tuerca, tres.'],
      mecedora: ['Siéntate en la mecedora. Solo un momento. Cuéntame algo. Lo que sea.'],
      album: ['Tengo una foto de cada vecino. Algunos posaron. Otros no se enteraron.'],
      guirnalda: ['He colgado la guirnalda. Celebramos que es jueves. O lo que sea.'],
      buzon: ['Me ha llegado una carta. No pienso decir de quién. Es de Tofu.'],
    },
    vecinos: {
      nox: ['Nox dice que no le importa nadie. Le he visto llevarle una salchicha a Tofu.', 'A Nox le he tejido unos calcetines. Los ha quemado. Sin querer. Eso dice.', 'Nox ronca. Lo sé. No preguntes cómo.'],
      tuerca: ['Tuerca tiene una carpeta con mi nombre. Yo tengo una con el suyo. Más gorda.', 'Tuerca me ha pedido que no cuente lo de la carpeta SENTIMIENTOS. Ya es tarde.', 'Tuerca finge que no le gustan las visitas. Ordena la casa cuando voy.'],
      tofu: ['Tofu no habla, pero escucha. Es mi vecino favorito. No se lo digas a los demás.', 'He intentado que Tofu me cuente un secreto. Me ha contado la fórmula. No la he entendido.', 'El brote de Tofu se pone rosa cuando paso. Yo ahí lo dejo.'],
      bruma: ['Bruma y yo tomamos té. Ella confiesa, yo escucho. Reparto justo.', 'Bruma sabe lo que sientes. Yo sé lo que haces. Juntas somos imparables.', 'A Bruma le he tejido un gorro. Le queda fatal. Lo lleva.'],
    },
  },
}
