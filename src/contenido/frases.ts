// Frases de los compañeros. PROPUESTAS de Claude, pendientes de revisión de Javi.
// Tono: humor negro, nada ñoño; consecuencias sí, culpa no (ver CLAUDE.md).
import type { CompaneroId, Momento } from './tipos'

export type TipoFrase =
  | 'saludo' // al tocarlo en su casa, según el momento del día
  | 'construir' // acabas de construir algo en su casa
  | 'crecer1' // nivel 2
  | 'crecer2' // nivel 3
  | 'crecer3' // nivel 4
  | 'crecer4' // nivel 5
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
      amanecer: ['Buenos días. Técnicamente.', '¿Ya estás de ronda? Hoy no te cobro dos visitas.', 'Amanece. Yo ya he desayunado. Lo tuyo no lo sé, pero mi desayuno era tuyo.', 'Pasa. Acabo de abrir.', 'He dormido fatal. Soñé que me apagaba. No se lo cuentes a nadie.', 'Me he levantado por el lado malo. Tengo un cojín. Solo tiene un lado.'],
      mediodia: ['Si venías a hacer una visita breve, todavía puedes disimular.', 'Sigo aquí. Ardiendo. Por si te interesa.', 'A estas horas el sol pega fuerte. Yo pego más.', 'He escondido el desayuno. Era para mañana. Ahora tampoco sé dónde está el de hoy.', 'Llevo media mañana buscando sombra. Se mueve cuando me siento.', 'He estado pensando en ti. Poco. Pero he estado.'],
      atardecer: ['Ya casi no se ve el camino.', 'Ven, aún queda sitio al sol.', 'La luz se va. Yo me quedo. Soy así de leal. Y de vago.', 'He sacado dos sillas. Si preguntas, la coja era para mí.', 'El cielo se pone del color de mi cola. Me lo tomo como un homenaje.', 'Hace un rato se oía a todo el barrio. Así está mejor.'],
      noche: ['Es de noche. Si sigues mirando el móvil, que conste que no es culpa mía.', 'Si te quedas, cierra despacio. La puerta se cree un tambor.', 'La hoguera y yo velamos por el barrio. Bueno, la hoguera.', 'Si oyes algo fuera, es el viento. Si llama dos veces, soy yo, que me he quedado fuera.', 'Mañana será otro día. Igual de raro, pero otro.', 'Buenas noches.'],
    },
    ofrenda: [
      'Te has movido. Anotado. No te acostumbres a los aplausos.',
      'Lo tengo.',
      'Mi cola acaba de subir un grado. No me mires así.',
      'Bien. Ahora haz como que no te ha costado.',
      'Bien. Te habría animado desde la silla, pero me pilló sentado.',
      '¿Lo apunto o esperas a que haya testigos?',
      'Bien hecho. Mi cola te manda un saludo caliente.',
      'Eso ha sido energía de verdad. No de la de las bebidas.',
    ],
    otraArea: ['No es lo mío, pero vale. El barrio lo agradece. Yo, moderadamente.', 'Apuntado. Lo he guardado donde no lo vea nadie.'],
    tope: ['Ya está. Hoy no sumo más. No hay medalla por agotarse.', 'Tres por hoy. Lo demás es exhibicionismo.'],
    diaMalo: ['Día malo. Lo mínimo cuenta entero. Hasta yo tengo días de brasa.', 'Con eso basta por hoy.'],
    fase1: ['Mi claro se está llenando de malas hierbas. Les he puesto nombre.', 'Llevo días sin moverme. He empezado a hablar con los hongos.'],
    fase2: ['He escondido tus zapatillas. No preguntes dónde. Hay una nota.', 'Le he dicho al cuervo que este sitio estaba reservado. Se ha sentado en el cartel.'],
    fase3: ['Ha venido un cuervo y se ha sentado en mi hoguera. Yo no le he invitado, que conste.', 'Hay un pájaro negro en mi claro. Me mira. Le miro. Nadie cede.'],
    arreglo: ['Ah, mira quién ha vuelto. Las malas hierbas te mandan saludos.', 'Claro despejado. Ni lo menciones. Bueno, menciónalo un poco.'],
    visitanteFuera: ['El cuervo se ha ido. Ha soltado lo tuyo al salir. Cobarde.'],
    llegada: ['Vale, ya estoy aquí. No hagas una fiesta. Bueno, una pequeña.'],
    sorpresa: ['He encontrado esto. No preguntes de dónde. De verdad, no preguntes.'],
    construir: [
      'Vaya. Ha quedado casi decente.',
      'Lo pondré donde yo quiera. Que lo sepas.',
      'Voy a presumir de haberlo montado. Te dejo decidir cuándo desmentirme.',
      'Viene bien. Gracias.',
    ],
    crecer1: ['Noto algo distinto en la cola. Mira un momento. Ya es suficiente.', 'He subido un nivel. A ver quién se atreve a ponerlo en mi currículum.'],
    crecer2: ['Ya puedo hacer unas chispas que parecen estrellas. Si las miras de lejos.', 'Nivel tres. Quiero una placa. Comestible.'],
    crecer3: ['He practicado sombras con la cola. La de patata ya me sale casi redonda.'],
    crecer4: ['Ya sé encender una sola brasa. Me ha costado aprender a apagar las otras.'],
  },
  tofu: {
    saludo: {
      amanecer: ['Mañana. El brote ya está despierto. Yo también, por desgracia.', 'Buenos días. Es una forma de hablar.', 'Mañana. El brote se ha despertado antes. Siempre gana.', 'He soñado con una biblioteca. Estaba ordenada. Era una pesadilla de Tuerca.', 'Buenos días. He leído el amanecer. Bien escrito.', 'Amanece. Me he quedado quieto para no molestarlo.'],
      mediodia: ['Mediodía. Buena hora para pensar en algo. Lo que sea.', 'Sigo siendo un cubo. Por si había dudas.', 'Mediodía. Leo a la sombra. Soy mi propia sombra.', 'Hora de comer. Yo hago la fotosíntesis. Es más barato.', 'He pensado algo importante. Lo he olvidado. Seguía siendo importante.', 'Sigo aquí. Es mi especialidad.'],
      atardecer: ['Atardece. Una página antes de cenar no ha matado a nadie. Que yo sepa.', 'Te guardo el sitio. La página tendrás que buscarla tú.', 'Atardece. Las páginas se leen mejor con esta luz. O eso digo.', 'Tengo dos libros abiertos. El que estoy leyendo está debajo.', 'El brote se cierra un poco. Yo, no. Yo siempre igual.', 'La luz se pone naranja. Nox dirá que es por él.'],
      noche: ['Pasa. Estoy acabando una página.', 'Noche. No es momento de aprender. Es momento de cerrar los ojos.', 'Noche. Los libros duermen abiertos. Yo, cerrado.', 'Te presto uno fino. Por si piensas usarlo de almohada.', 'He guardado el libro. Me quedé en la frase buena.', 'Buenas noches. Es lo único que sé decir a estas horas.'],
    },
    ofrenda: ['Correcto.', 'Has usado la cabeza. El brote se ha enterado. Yo, también.', 'Una hoja nueva. No la he pedido.', 'Bien. No espero aplausos y tú tampoco deberías.', 'Algo aprendido. No lo olvidarás. Bueno, un poco.', 'Has pensado. Se nota. En el brote.', 'Bien. Una cosa más que sabes. Una menos que no.', 'Correcto. Lo digo poco. Esta vez lo digo.'],
    otraArea: ['No es mi área. Lo anoto igual. Con indiferencia.', 'Aceptado. Sin comentarios. Bueno, uno: bien.'],
    tope: ['Suficiente por hoy. Más no suma. La cabeza también necesita no hacer nada.'],
    diaMalo: ['Día malo. Una página vale. Una frase vale. Tofu ha hablado.'],
    fase1: ['El huerto se está llenando de musgo. Del malo. Ni lo sabía que había de malo.', 'El brote se ha doblado. No es tristeza. Es dramatismo.'],
    fase2: ['He dejado el libro en el suelo para acordarme de recogerlo. El suelo se ha hecho cargo.', 'Tofu no está disponible. Deje su mensaje después de nada.'],
    fase3: ['Hay una polilla enorme comiéndose la luz del huerto. Le he pedido que se vaya. No hablamos el mismo idioma.'],
    arreglo: ['Huerto limpio. Bien. Sigamos.', 'Has vuelto. Lo anoto sin emoción. (Con un poco de emoción.)'],
    visitanteFuera: ['La polilla se ha ido. Ha devuelto lo que se llevó. Educada, para ser una polilla.'],
    llegada: ['He llegado. No esperes que diga que me alegro. Me alegro.'],
    sorpresa: ['Esto estaba bajo el musgo. Ahora es tuyo. No me des las gracias.'],
    construir: ['Una cosa nueva. La miraré mucho tiempo antes de usarla.', 'Instalado. El brote opina que bien. Yo no opino.', 'Gracias. Lo digo en voz baja. Es como lo digo todo.', 'Queda bien. No lo voy a repetir.'],
    crecer1: ['He crecido. No lo voy a comentar. El brote, sí.', 'Más hojas. Mismas ideas. Más ordenadas.'],
    crecer2: ['Ya tengo copa. Los pájaros me miran distinto.', 'El brote ha cambiado. Ha tardado lo suyo. Como todo lo bueno.'],
    crecer3: ['Voy a empezar a leer en voz alta. Si viene Nox, puedo darle la voz del villano.'],
    crecer4: ['Ya sé acabar una historia. Ahora tengo que aprender a dejar que otro la acabe distinto.'],
  },
  bruma: {
    saludo: {
      amanecer: ['Ha amanecido con niebla. He sido yo. Perdona, estaba pensando.', 'He visto amanecer. No traigo un resumen.', 'Me he despertado deshilachada. Ya me voy juntando.', 'El rocío de esta mañana es mío. Bueno, era.', 'Amanece despacio. Hazlo tú igual.', 'Buenos días. Aún no sé cómo ha ido la noche. Tú tampoco, ¿verdad?'],
      mediodia: ['Mediodía. Todo el mundo corre. Yo floto. Uno de los dos lo está haciendo bien.', 'Para cinco minutos. El mundo seguirá ahí. Desgraciadamente.', 'A mediodía me encojo. Es el sol. No es nada personal.', '¿Te has sentado o vienes a decirme que te vas enseguida?', 'La orilla está fresca.', 'Estoy en mi mejor hora. Floto sin pensar.'],
      atardecer: ['Atardece. Buen momento para no hacer nada. A propósito, que tiene más mérito.', 'Hoy ha sido ruidoso, ¿verdad? Se te nota en los bordes. A mí también.', 'La luz se pone tierna. Aprovecha, que dura poco.', 'Este rato del día me gusta. Las cosas se calman solas.', 'Había dos ranas en la orilla. Cada una esperaba a que la otra se fuera.', 'El estanque se pone de color melocotón. Me pongo celosa.'],
      noche: ['Se oye el agua desde aquí.', 'Deja el móvil boca abajo. Que piense en lo que ha hecho.', 'De noche floto más bajo. Para estar cerca.', 'He dejado la taza en el borde. Si cae al agua, era una ofrenda.', 'Qué silencio. Así es como suena el descanso.', 'Cierra los ojos. Yo vigilo. No sé de qué, pero vigilo.'],
    },
    construir: ['Una cosa nueva en el estanque. Me la quedo mirando un rato. Bastante rato.', 'Gracias. No lo digo mucho. Lo pienso más.', 'Lo pondré cerca del agua. Le gustará. A mí, también.', 'Mi casa tiene una cosa más. Y yo un motivo más para quedarme.'],
    crecer1: ['He crecido. Me siento más ligera. Será la humedad.', 'Ahora tapo un poco más de cielo. Lo siento por el cielo.'],
    crecer2: ['Ya puedo llover en serio. No pienso hacerlo. Casi nunca.', 'Ahora noto cuándo va a llover antes de que me lo cuentes. A veces porque soy yo.'],
    crecer3: ['Ya puedo bajar una nube lo justo para dar sombra. No le mires mucho que sube.'],
    crecer4: ['He preparado una despedida para las nubes. Hoy todavía no quiero decirla.'],
    ofrenda: ['Has parado. Lo he notado. Se me ha recompuesto un borde.', 'Floto un poco mejor. Igual es por ti. Igual es el viento. Es por ti.', 'Bien. El estanque está quieto. Tú, casi.', 'He movido la silla un poco. Ahora miro lo mismo desde otro ángulo.', 'Has parado. Parar también es hacer algo.', 'Te acompaño un rato.', 'Se te ha soltado algo por dentro. Lo he visto flotar.', 'Un rato tuyo. Te lo has ganado sin tener que ganártelo.'],
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
      amanecer: ['Buenos días. Tengo el té hecho.', 'Me he despertado con un nudo. Creo que es tuyo.', 'Compré una libreta para escribir menos. Estoy en la segunda.', 'He dormido fatal. Soñé que nadie me contaba nada.', 'Iba a devolverte el plato. Lo he llenado otra vez.', 'Búscame la punta del ovillo. Si encuentras la de ayer, también me vale.'],
      mediodia: ['Si me mandas un audio de siete minutos, te contesto con un punto. Es por equilibrio.', 'Cuéntame algo. Lo que sea. Con detalles.', 'He puesto tres tazas. La tercera es para apoyar la cucharilla. Tenía ganas de poner mesa.', 'He tejido toda la mañana. Y he escuchado. Sobre todo he escuchado.', 'La silla de la izquierda se hunde. Es la buena.', 'Me han contado un secreto. No te lo puedo contar. Bueno, un poco.'],
      atardecer: ['Es buena hora para llamar a alguien. La gente está en casa y aburrida.', '¿Has quedado? ¿Con quién? No me lo digas. Sí, dímelo.', 'Atardece. La gente se pone tierna. Aprovecha.', 'Puedes quedarte sin contarme nada. Este minuto invito yo.', 'He visto pasar a dos vecinos juntos. Ya he sacado mis conclusiones.', 'Las mejores conversaciones son las de esta hora. Lo dice la ciencia. Lo digo yo.'],
      noche: ['Es tarde para llamar a nadie. Pero no para pensar a quién llamarás mañana.', 'Pasa bajito. He conseguido que no suene el timbre y ahora me da pena arreglarlo.', 'De noche se cuentan las cosas importantes. Yo estoy despierta. Por si acaso.', 'Duérmete. Mañana me cuentas. Con todo detalle.', 'He tejido una bufanda para alguien. Aún no sé para quién. Ya saldrá.', 'Buenas noches. Si sueñas con alguien, quiero saber con quién.'],
    },
    construir: ['¡Qué bonito! Lo voy a contar por todo el barrio. Ya lo he contado.', 'Una cosa nueva. Vendrán a verla. Vendrán a verme.', 'Gracias, cariño. Esto pide una visita. O tres.', 'Queda precioso. Le voy a hacer una funda de punto. Se la haga o no se la haga.'],
    crecer1: ['Hoy me sale un punto nuevo. El que queda bien incluso si lo haces escuchando.', 'Más lana, más cosas que contar. ¿Tienes un rato largo?'],
    crecer2: ['Ya puedo dar consejos que nadie ha pedido. Con autoridad.', 'Lo sé todo de todos. Antes también, pero ahora con bufanda.'],
    crecer3: ['Con este punto puedo tejer bolsillos para los que pierden cosas. Ya tengo una lista.'],
    crecer4: ['Una bufanda no da para todo el barrio. Un mapa de retales, a lo mejor.'],
    ofrenda: ['Eso se recuerda años. Lo sé yo, que lo recuerdo todo.', 'Un hilo más. Con esto tejo media bufanda.', 'He tejido una funda para el timbre. Ahora tengo que adivinar cuándo llaman.', 'Me he propuesto escuchar hasta el final. Para entrenar, empiezo por las frases cortas.', 'Has estado con alguien. Se te nota en la cara. Y en mis hebras.', 'Eso ha unido dos puntos. Lo sé, es metáfora de punto. Me encanta.', 'Uno más para la red. La red es lo que te sostiene cuando todo se suelta.', 'Lo apunto en mi libreta de cosas bonitas. Es gorda. Pero hoy pesa más.'],
    otraArea: ['No es lo mío, pero lo cuento por ahí igual. Que se sepa.', 'Muy bien, cariño. Se lo diré a todo el barrio.'],
    tope: ['Tres en un día. Más sociable que yo, y eso es mucho decir. Descansa.'],
    diaMalo: ['Día malo. Un mensaje cuenta. Un «pienso en ti» cuenta. Con eso tejo.'],
    fase1: ['La madriguera está muy callada. No me gusta el silencio: me invento cosas.', 'Se me han enredado las hebras. Será de no hablar con nadie.'],
    fase2: ['He tejido una funda para la funda. Ya no entra el teléfono.', 'He probado a llamar al timbre desde dentro. Da la misma vergüenza abrir.'],
    fase3: ['Ha entrado un cuervo en la madriguera. No ha saludado. Encima, maleducado.'],
    arreglo: ['¡Ya estás aquí! Siéntate, que te pongo un té y me cuentas qué me he perdido.', 'Has venido. Siéntate donde quieras. En esa silla no, que por fin la he arreglado.'],
    visitanteFuera: ['El cuervo se ha ido sin despedirse, pero ha devuelto lo tuyo. Algo es algo.'],
    llegada: ['¡Por fin te pillo! Me mudo. Ya he traído las agujas.'],
    sorpresa: ['Me han dado esto para ti. No te digo quién. Tengo mis fuentes.'],
  },
  tuerca: {
    saludo: {
      amanecer: ['Buenos días. Perdona el desorden. Lo he colocado así para detectarlo.', 'Deja la puerta abierta, por favor.', 'Revisión matinal: engranajes, bien; tornillos, bien; ánimo, en revisión.', 'Mañana. He puesto el café en el orden del día. Primer punto.', 'El reloj va bien. Lo he comparado con otro que va igual de mal.', 'Hoy tengo un plan. Tiene tres partes. La tercera es improvisar.'],
      mediodia: ['¿Estabas de paso? Apunto «visita breve». Dime luego si hay que corregirlo.', 'Engranaje girando. Más o menos.', 'Pausa reglamentaria. Diez minutos. He traído cronómetro.', 'Mediodía: la mitad del día. Estadísticamente, aún puede salir bien.', 'He ordenado la mañana por colores. Ha salido todo gris.', 'Nota interna: mediodía y sin incidencias. Sospechoso.'],
      atardecer: ['Si vas a tocar algo, avisa. Hay un cajón que se abre hacia ti.', 'He archivado el día. No encuentro dónde.', 'Cierre de jornada en curso. Rellena el formulario. Es una broma. O no.', 'Ya no da el sol en el banco. He movido la lupa antes de tiempo, por una vez.', 'He hecho inventario del día. Sobran cosas y faltan horas.', 'La luz baja. Mis engranajes también. Es solidaridad.'],
      noche: ['De noche los pendientes también duermen. Déjalos. Mañana les damos guerra.', 'Todo en su sitio. Mentira. Pero duerme igual.', 'Modo nocturno activado. Consumo mínimo. Juicio mínimo. Casi.', 'Te dejo luz en la entrada.', 'He dejado la ropa de mañana preparada. Yo no llevo ropa. Pero el gesto cuenta.', 'Noche. Los pendientes no se resuelven mirándolos. Lo he probado.'],
    },
    ofrenda: ['Pendiente cerrado. Clonc. El mejor sonido del mundo.', 'Algo ordenado. Lo he etiquetado. No sé dónde está la etiqueta.', 'Procedimiento completado. Creo.', 'Has soltado algo. Yo no sería capaz. Me admiro un poco de ti.', 'Hoy le he puesto ruedas a una silla. Ahora estoy buscando la silla.', 'Orden restaurado en un sector. Quedan muchos. Uno menos.', 'Excelente gestión. Te ascendería, pero no hay escalafón.', 'Clonc. Ha sonado a pendiente cerrado. Lo he oído desde aquí.'],
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
      '¿Lo has montado mirando las instrucciones? Puedes decírmelo. Las escribí después.',
      'Montaje completado. Sobra una pieza. La guardo en VARIOS.',
    ],
    crecer1: ['Actualización instalada. Me han salido brazos con articulaciones. Ahora puedo señalarte.', 'Versión 2.0. Mismos bugs, más carisma.'],
    crecer2: ['Totalmente operativo. Lo cual es más de lo que se puede decir de tu bandeja de entrada.', 'Actualización completada. Me sobraron dos tornillos. Los he guardado por si acaso. Por si acaso qué, no lo sé.'],
    crecer3: ['Ahora puedo clasificar objetos y rumores. Los objetos se quejan menos.'],
    crecer4: ['He inventado un cajón para lo que no necesita archivo. Espero que no me pidan un registro.'],
  },
}
