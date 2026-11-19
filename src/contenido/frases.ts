// Frases de los compañeros. PROPUESTAS de Claude, pendientes de revisión de Javi.
// Tono: humor negro, nada ñoño; consecuencias sí, culpa no (ver CLAUDE.md).
import type { CompaneroId, Momento } from './tipos'

export type TipoFrase =
  | 'saludo' // al tocarlo en su casa, según el momento del día
  | 'construir' // acabas de construir algo en su casa
  | 'crecer1' // acaba de pasar de cachorro a joven
  | 'crecer2' // acaba de hacerse adulto
  | 'ofrenda' // ofrenda de su propia área
  | 'otraArea' // ofrenda de un área cuyo compañero aún no ha llegado (comenta el principal)
  | 'tope' // ya van 3 ofrendas hoy en esa área
  | 'diaMalo' // ofrenda en modo día malo
  | 'fase1' // su rincón se ha asilvestrado
  | 'fase2' // está enfurruñado (su venganza)
  | 'fase3' // ha llegado un visitante
  | 'arreglo' // el rincón vuelve a estar bien
  | 'visitanteFuera' // el visitante se ha ido y ha devuelto lo robado
  | 'llegada' // se despierta y se muda al barrio
  | 'sorpresa' // encuentra un objeto para la colección
  | 'charla' // al tocarlo, sobre lo que pasa (contenido/charla.ts)

type Frases = Partial<Record<Exclude<TipoFrase, 'saludo'>, string[]>> & { saludo: Record<Momento, string[]> }

export const FRASES: Record<CompaneroId, Frases> = {
  nox: {
    saludo: {
      amanecer: ['Buenos días. Técnicamente.', 'Mi cola ya está encendida. Tú, menos.', 'Amanece. Yo ya he desayunado. Lo tuyo no lo sé, pero mi desayuno era tuyo.', 'Mañana nueva. Las de ayer no se recuperan, así que a por esta.', 'He dormido fatal. Soñé que me apagaba. No se lo cuentes a nadie.', 'Arriba. Las piernas no se mueven solas. Bueno, las mías sí.'],
      mediodia: ['Mediodía. Hora perfecta para hacer algo que no sea mirar esto.', 'Sigo aquí. Ardiendo. Por si te interesa.', 'A estas horas el sol pega fuerte. Yo pego más.', 'Hora de comer. Si hay salchichas, avísame. Si no, también.', 'Media jornada. Lo bueno de la otra mitad es que aún no la has estropeado.', 'He estado pensando en ti. Poco. Pero he estado.'],
      atardecer: ['Atardece. El último tren para hacer algo de provecho sale ahora.', 'Si hoy no te has movido, aún hay luz. Poca, pero hay.', 'La luz se va. Yo me quedo. Soy así de leal. Y de vago.', 'Hora del paseo. El tuyo, digo. El mío es del cojín a la hoguera.', 'El cielo se pone del color de mi cola. Me lo tomo como un homenaje.', 'Queda poco día. Lo justo para algo pequeño. Lo pequeño también arde.'],
      noche: ['Es de noche. Si sigues mirando el móvil, que conste que no es culpa mía.', 'Duérmete. Te lo digo con todo el cariño que me permite el sarcasmo.', 'La hoguera y yo velamos por el barrio. Bueno, la hoguera.', 'Si no puedes dormir, cuenta salchichas. A mí me funciona. Me da hambre, pero funciona.', 'Mañana será otro día. Igual de raro, pero otro.', 'Apaga eso. Yo me quedo encendido por los dos.'],
    },
    ofrenda: [
      'Te has movido. Anotado. No te acostumbres a los aplausos.',
      'Mira tú. Un cuerpo que hace cosas. Casi no te reconozco.',
      'Mi cola acaba de subir un grado. No me mires así.',
      'Bien. Ahora haz como que no te ha costado.',
      'Movimiento detectado. Mi cola aprueba.',
      'Has sudado. Lo noto desde aquí. Es un cumplido.',
      'Bien hecho. Mi cola te manda un saludo caliente.',
      'Eso ha sido energía de verdad. No de la de las bebidas.',
    ],
    otraArea: ['No es lo mío, pero vale. El barrio lo agradece. Yo, moderadamente.', 'Apuntado. Lo he guardado donde no lo vea nadie.'],
    tope: ['Ya está. Hoy no sumo más. No hay medalla por agotarse.', 'Tres por hoy. Lo demás es exhibicionismo.'],
    diaMalo: ['Día malo. Lo mínimo cuenta entero. Hasta yo tengo días de brasa.', 'Cinco minutos. Para hoy, es una gesta. No se lo digas a nadie.'],
    fase1: ['Mi claro se está llenando de malas hierbas. Les he puesto nombre.', 'Llevo días sin moverme. He empezado a hablar con los hongos.'],
    fase2: ['He escondido tus zapatillas. No preguntes dónde. Hay una nota.', 'Te he dejado una nota: «Sigo vivo. Tú, a saber».'],
    fase3: ['Ha venido un cuervo y se ha sentado en mi hoguera. Yo no le he invitado, que conste.', 'Hay un pájaro negro en mi claro. Me mira. Le miro. Nadie cede.'],
    arreglo: ['Ah, mira quién ha vuelto. Las malas hierbas te mandan saludos.', 'Claro despejado. Ni lo menciones. Bueno, menciónalo un poco.'],
    visitanteFuera: ['El cuervo se ha ido. Ha soltado lo tuyo al salir. Cobarde.'],
    llegada: ['Vale, ya estoy aquí. No hagas una fiesta. Bueno, una pequeña.'],
    sorpresa: ['He encontrado esto. No preguntes de dónde. De verdad, no preguntes.'],
    construir: [
      'Vaya. Ha quedado casi decente.',
      'Lo pondré donde yo quiera. Que lo sepas.',
      'Mi casa mejora. Tu vida, a ratos. Algo es algo.',
      'No pienso darte las gracias. Pero lo uso.',
    ],
    crecer1: ['Me he estirado. No digas nada. Ni una palabra.', 'Más alto, igual de sarcástico. Mejorado, en resumen.'],
    crecer2: ['Adulto. Con facturas imaginarias y todo. Gracias por nada. Bueno, por todo.', 'Ya está. Ahora soy el zorro que tu fisioterapeuta querría que fueras.'],
  },
  tofu: {
    saludo: {
      amanecer: ['Mañana. El brote ya está despierto. Yo también, por desgracia.', 'Buenos días. Es una forma de hablar.', 'Mañana. El brote se ha despertado antes. Siempre gana.', 'He soñado con una biblioteca. Estaba ordenada. Era una pesadilla de Tuerca.', 'Buenos días. He leído el amanecer. Bien escrito.', 'Amanece. Me he quedado quieto para no molestarlo.'],
      mediodia: ['Mediodía. Buena hora para pensar en algo. Lo que sea.', 'Sigo siendo un cubo. Por si había dudas.', 'Mediodía. Leo a la sombra. Soy mi propia sombra.', 'Hora de comer. Yo hago la fotosíntesis. Es más barato.', 'He pensado algo importante. Lo he olvidado. Seguía siendo importante.', 'Sigo aquí. Es mi especialidad.'],
      atardecer: ['Atardece. Una página antes de cenar no ha matado a nadie. Que yo sepa.', 'El brote pregunta qué has aprendido hoy. Yo no pregunto nada.', 'Atardece. Las páginas se leen mejor con esta luz. O eso digo.', 'Buen momento para aprender una cosa pequeña. Las grandes también empiezan así.', 'El brote se cierra un poco. Yo, no. Yo siempre igual.', 'La luz se pone naranja. Nox dirá que es por él.'],
      noche: ['Es tarde. Las ideas también duermen. Tú deberías.', 'Noche. No es momento de aprender. Es momento de cerrar los ojos.', 'Noche. Los libros duermen abiertos. Yo, cerrado.', 'Si lees en la cama, que sea en papel. La pantalla no tiene marcapáginas.', 'Es tarde para pensar. Piensa mañana. Mejor.', 'Buenas noches. Es lo único que sé decir a estas horas.'],
    },
    ofrenda: ['Correcto.', 'Has usado la cabeza. El brote se ha enterado. Yo, también.', 'Una hoja nueva. No la he pedido.', 'Bien. No espero aplausos y tú tampoco deberías.', 'Algo aprendido. No lo olvidarás. Bueno, un poco.', 'Has pensado. Se nota. En el brote.', 'Bien. Una cosa más que sabes. Una menos que no.', 'Correcto. Lo digo poco. Esta vez lo digo.'],
    otraArea: ['No es mi área. Lo anoto igual. Con indiferencia.', 'Aceptado. Sin comentarios. Bueno, uno: bien.'],
    tope: ['Suficiente por hoy. Más no suma. La cabeza también necesita no hacer nada.'],
    diaMalo: ['Día malo. Una página vale. Una frase vale. Tofu ha hablado.'],
    fase1: ['El huerto se está llenando de musgo. Del malo. Ni lo sabía que había de malo.', 'El brote se ha doblado. No es tristeza. Es dramatismo.'],
    fase2: ['He decidido que no existes. Es una decisión firme. Temporal, pero firme.', 'Tofu no está disponible. Deje su mensaje después de nada.'],
    fase3: ['Hay una polilla enorme comiéndose la luz del huerto. Le he pedido que se vaya. No hablamos el mismo idioma.'],
    arreglo: ['Huerto limpio. Bien. Sigamos.', 'Has vuelto. Lo anoto sin emoción. (Con un poco de emoción.)'],
    visitanteFuera: ['La polilla se ha ido. Ha devuelto lo que se llevó. Educada, para ser una polilla.'],
    llegada: ['He llegado. No esperes que diga que me alegro. Me alegro.'],
    sorpresa: ['Esto estaba bajo el musgo. Ahora es tuyo. No me des las gracias.'],
    construir: ['Una cosa nueva. La miraré mucho tiempo antes de usarla.', 'Instalado. El brote opina que bien. Yo no opino.', 'Gracias. Lo digo en voz baja. Es como lo digo todo.', 'Queda bien. No lo voy a repetir.'],
    crecer1: ['He crecido. No lo voy a comentar. El brote, sí.', 'Más hojas. Mismas ideas. Más ordenadas.'],
    crecer2: ['Adulto. Ya tengo copa. Los pájaros me miran distinto.', 'He llegado a adulto. Sin prisa. Como todo lo bueno.'],
  },
  bruma: {
    saludo: {
      amanecer: ['Ha amanecido con niebla. He sido yo. Perdona, estaba pensando.', 'Buenos días. Has mirado el móvil antes que el cielo. Lo sé. Lo noto.', 'Me he despertado deshilachada. Ya me voy juntando.', 'El rocío de esta mañana es mío. Bueno, era.', 'Amanece despacio. Hazlo tú igual.', 'Buenos días. Aún no sé cómo ha ido la noche. Tú tampoco, ¿verdad?'],
      mediodia: ['Mediodía. Todo el mundo corre. Yo floto. Uno de los dos lo está haciendo bien.', 'Para cinco minutos. El mundo seguirá ahí. Desgraciadamente.', 'A mediodía me encojo. Es el sol. No es nada personal.', 'Come sentado. Aunque sea cinco minutos. El móvil puede esperar sentado también.', 'Respira. No hace falta que se note.', 'Estoy en mi mejor hora. Floto sin pensar.'],
      atardecer: ['Atardece. Buen momento para no hacer nada. A propósito, que tiene más mérito.', 'Hoy ha sido ruidoso, ¿verdad? Se te nota en los bordes. A mí también.', 'La luz se pone tierna. Aprovecha, que dura poco.', 'Este rato del día me gusta. Las cosas se calman solas.', 'Si hoy no has parado ni un momento, este es buen momento.', 'El estanque se pone de color melocotón. Me pongo celosa.'],
      noche: ['Es tarde. La pantalla no tiene sueño, pero tú sí.', 'Deja el móvil boca abajo. Que piense en lo que ha hecho.', 'De noche floto más bajo. Para estar cerca.', 'Mañana seguirá todo ahí. Lo de hoy también. Duerme igual.', 'Qué silencio. Así es como suena el descanso.', 'Cierra los ojos. Yo vigilo. No sé de qué, pero vigilo.'],
    },
    construir: ['Una cosa nueva en el estanque. Me la quedo mirando un rato. Bastante rato.', 'Gracias. No lo digo mucho. Lo pienso más.', 'Lo pondré cerca del agua. Le gustará. A mí, también.', 'Mi casa tiene una cosa más. Y yo un motivo más para quedarme.'],
    crecer1: ['He crecido. Me siento más ligera. Será la humedad.', 'Ahora tapo un poco más de cielo. Lo siento por el cielo.'],
    crecer2: ['Adulta. Ya puedo llover en serio. No pienso hacerlo. Casi nunca.', 'Me he hecho mayor. Ahora entiendo todo antes de que me lo cuentes. Es agotador.'],
    ofrenda: ['Has parado. Lo he notado. Se me ha recompuesto un borde.', 'Floto un poco mejor. Igual es por ti. Igual es el viento. Es por ti.', 'Bien. El estanque está quieto. Tú, casi.', 'Eso ha sido descansar de verdad. Pensaba que ya no sabías.', 'Has parado. Parar también es hacer algo.', 'Así. Más despacio. Mucho mejor.', 'Se te ha soltado algo por dentro. Lo he visto flotar.', 'Un rato tuyo. Te lo has ganado sin tener que ganártelo.'],
    otraArea: ['No es lo mío, pero me alegro. Con moderación, como todo.', 'Lo guardo en la niebla. Ahí no se pierde nada. Ni lo malo, por desgracia.'],
    tope: ['Ya basta por hoy. Hasta la calma cansa si la haces con tanto empeño.'],
    diaMalo: ['Día malo. No hace falta estar bien. Basta con estar quieto un minuto. Yo llevo siglos.'],
    fase1: ['El estanque se ha llenado de hojas. Y de un silencio de los que pesan.', 'Me estoy quedando transparente. No es una metáfora. Bueno, un poco.'],
    fase2: ['Me he ido a flotar entre los árboles. No muy lejos. Lo justo para que se note.', 'No estoy enfadada. Estoy dispersa. Es peor, pero queda más bonito.'],
    fase3: ['Un caracol se ha instalado en el estanque. Dice que no tiene prisa por irse. Yo no tenía prisa por que viniera.'],
    arreglo: ['Vuelvo a tener forma. No me preguntes cuál.', 'El estanque se ha aclarado. Se ve el fondo. Y tu reflejo: cansado, pero aquí.'],
    visitanteFuera: ['El caracol se ha ido. Ha tardado tres días. Ha dejado lo tuyo en la orilla, un poco babeado.'],
    llegada: ['He bajado del valle. Me quedo. Si no te importa. Y si te importa, también.'],
    sorpresa: ['La niebla ha traído esto. No sé de dónde. La niebla no da explicaciones.'],
  },
  madeja: {
    saludo: {
      amanecer: ['¡Buenos días! ¿Has dado los buenos días a alguien? No a mí, a alguien.', 'Me he despertado con un nudo. Creo que es tuyo.'],
      mediodia: ['Media mañana es perfecta para un audio. Cortito. Me entero igual.', 'Cuéntame algo. Lo que sea. Con detalles.'],
      atardecer: ['Es buena hora para llamar a alguien. La gente está en casa y aburrida.', '¿Has quedado? ¿Con quién? No me lo digas. Sí, dímelo.'],
      noche: ['Es tarde para llamar a nadie. Pero no para pensar a quién llamarás mañana.', 'Si alguien duerme a tu lado, apaga esto y habla con él.'],
    },
    ofrenda: ['¡Ay, qué bonito! Ya me lo contarás todo.', 'Un hilo más. Con esto tejo media bufanda.', '¡Por fin noticias! Pensaba que te habías hecho ermitaño.', 'Eso se recuerda años. Lo sé yo, que lo recuerdo todo.'],
    otraArea: ['No es lo mío, pero lo cuento por ahí igual. Que se sepa.', 'Muy bien, cariño. Se lo diré a todo el barrio.'],
    tope: ['Tres en un día. Más sociable que yo, y eso es mucho decir. Descansa.'],
    diaMalo: ['Día malo. Un mensaje cuenta. Un «pienso en ti» cuenta. Con eso tejo.'],
    fase1: ['El porche está lleno de telarañas. Y no son mías.', 'El porche está muy callado. No me gusta el silencio: me invento cosas.'],
    fase2: ['Les he contado a los demás lo tuyo. Todo. Con detalles. Lo siento. No lo siento.', 'He estado cotilleando sobre ti. Por despecho. Por cariño. Las dos cosas.'],
    fase3: ['Ha entrado un cuervo en el porche. No ha saludado. Encima, maleducado.'],
    arreglo: ['¡Ya estás aquí! Siéntate, que te pongo un té y me cuentas qué me he perdido.', 'Porche barrido. Los cotilleos sobre ti, retirados. Casi todos.'],
    visitanteFuera: ['El cuervo se ha ido sin despedirse, pero ha devuelto lo tuyo. Algo es algo.'],
    llegada: ['¡Por fin te pillo! Me mudo. Ya he traído la tetera.'],
    sorpresa: ['Me han dado esto para ti. No te digo quién. Tengo mis fuentes.'],
  },
  tuerca: {
    saludo: {
      amanecer: ['Buenos días. Propuesta: tres cosas para hoy. Más de tres requiere otra caja.', 'He clasificado la mañana. Está en «VARIOS».', 'Revisión matinal: engranajes, bien; tornillos, bien; ánimo, en revisión.', 'Mañana. He puesto el café en el orden del día. Primer punto.', 'Amanece a las 7:42. Lo he comprobado. Me ha decepcionado un poco.', 'Hoy tengo un plan. Tiene tres partes. La tercera es improvisar.'],
      mediodia: ['Mediodía. Hay un pendiente que lleva días mirándote. Lo he etiquetado: «Ese».', 'Engranaje girando. Más o menos.', 'Pausa reglamentaria. Diez minutos. He traído cronómetro.', 'Mediodía: la mitad del día. Estadísticamente, aún puede salir bien.', 'He ordenado la mañana por colores. Ha salido todo gris.', 'Nota interna: mediodía y sin incidencias. Sospechoso.'],
      atardecer: ['Quedan diez minutos de luz para ordenar una balda. Solo una.', 'He archivado el día. No encuentro dónde.', 'Cierre de jornada en curso. Rellena el formulario. Es una broma. O no.', 'Atardece. Momento ideal para dejar algo listo para mañana. Uno de tus yos te lo agradecerá.', 'He hecho inventario del día. Sobran cosas y faltan horas.', 'La luz baja. Mis engranajes también. Es solidaridad.'],
      noche: ['De noche los pendientes también duermen. Déjalos. Mañana les damos guerra.', 'Todo en su sitio. Mentira. Pero duerme igual.', 'Modo nocturno activado. Consumo mínimo. Juicio mínimo. Casi.', 'Desconecta. Es una instrucción técnica, no un consejo.', 'He dejado la ropa de mañana preparada. Yo no llevo ropa. Pero el gesto cuenta.', 'Noche. Los pendientes no se resuelven mirándolos. Lo he probado.'],
    },
    ofrenda: ['Pendiente cerrado. Clonc. El mejor sonido del mundo.', 'Algo ordenado. Lo he etiquetado. No sé dónde está la etiqueta.', 'Procedimiento completado. Creo.', 'Has soltado algo. Yo no sería capaz. Me admiro un poco de ti.', 'Tarea finalizada. Archivo cerrado. Siguiente.', 'Orden restaurado en un sector. Quedan muchos. Uno menos.', 'Excelente gestión. Te ascendería, pero no hay escalafón.', 'Clonc. Ha sonado a pendiente cerrado. Lo he oído desde aquí.'],
    otraArea: ['No es mi área. Lo archivo en «Cosas de otros». Esa caja está llena.', 'Recibido. Clasificado. Perdido. Normal.'],
    tope: ['Tres por hoy. Ya está bien. Hasta yo necesito un poco de caos.'],
    diaMalo: ['Día malo. Un papel a la basura cuenta. Lo dice el reglamento. Lo he escrito yo.'],
    fase1: ['El taller está lleno de polvo. He clasificado el polvo. No ayuda.', 'Engranaje chirriando. Aviso sin importancia. Importantísimo.'],
    fase2: ['He reetiquetado todo el barrio como «VARIOS». Por error. No ha sido por error.', 'Todo lo tuyo está ahora en cajas. Etiquetadas. Mal.'],
    fase3: ['Un caracol se ha instalado en el taller. Le he abierto un expediente. Se lo ha comido.'],
    arreglo: ['¡Engranaje en marcha! Rrrr. Clonc. Perdón, es la emoción.', 'Taller operativo. Te he quitado de la lista de «Desaparecidos».'],
    visitanteFuera: ['El caracol ha abandonado el taller. Ha devuelto la pieza. Estaba en «VARIOS».'],
    llegada: ['Atención. Procedo a mudarme. Paso dos: no sé qué va en el paso dos.'],
    sorpresa: ['He encontrado esto en una caja. La caja ponía «Tuyo». No sé quién la etiquetó.'],
    construir: [
      'Instalado. Nivelado. Catalogado. Ya puedo morir tranquilo. Es una forma de hablar.',
      'Otra cosa en su sitio. Te lo agradecería, pero no tengo ese módulo.',
      'Perfecto. Ahora solo falta que el resto de tu vida esté igual de ordenada. Sin prisa. Bueno, con algo de prisa.',
      'Montaje completado. Sobra una pieza. La guardo en VARIOS.',
    ],
    crecer1: ['Actualización instalada. Me han salido brazos con articulaciones. Ahora puedo señalarte.', 'Versión 2.0. Mismos bugs, más carisma.'],
    crecer2: ['Adulto. Totalmente operativo. Lo cual es más de lo que se puede decir de tu bandeja de entrada.', 'Montaje final completado. Me sobraron dos tornillos. Los he guardado por si acaso. Por si acaso qué, no lo sé.'],
  },
}
