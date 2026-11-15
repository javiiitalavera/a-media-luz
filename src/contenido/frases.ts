// Frases de los compañeros. PROPUESTAS de Claude, pendientes de revisión de Javi.
// Tono: humor negro, nada ñoño; consecuencias sí, culpa no (ver CLAUDE.md).
import type { CompaneroId, Momento } from './tipos'

export type TipoFrase =
  | 'saludo' // al abrir el bosque, según el momento del día
  | 'ofrenda' // ofrenda de su propia área
  | 'otraArea' // ofrenda de un área cuyo compañero aún no ha llegado (comenta el principal)
  | 'tope' // ya van 3 ofrendas hoy en esa área
  | 'diaMalo' // ofrenda en modo día malo
  | 'fase1' // su rincón se ha asilvestrado
  | 'fase2' // está enfurruñado (su venganza)
  | 'fase3' // ha llegado un visitante
  | 'arreglo' // el rincón vuelve a estar bien
  | 'visitanteFuera' // el visitante se ha ido y ha devuelto lo robado
  | 'llegada' // se despierta y se muda al bosque
  | 'sorpresa' // encuentra un objeto para la colección

type Frases = Partial<Record<Exclude<TipoFrase, 'saludo'>, string[]>> & { saludo: Record<Momento, string[]> }

export const FRASES: Record<CompaneroId, Frases> = {
  nox: {
    saludo: {
      amanecer: ['Buenos días. Técnicamente.', 'Mi cola ya está encendida. Tú, menos.'],
      mediodia: ['Mediodía. Hora perfecta para hacer algo que no sea mirar esto.', 'Sigo aquí. Ardiendo. Por si te interesa.'],
      atardecer: ['Atardece. El último tren para hacer algo de provecho sale ahora.', 'Si hoy no te has movido, aún hay luz. Poca, pero hay.'],
      noche: ['Es de noche. Si sigues mirando el móvil, que conste que no es culpa mía.', 'Duérmete. Te lo digo con todo el cariño que me permite el sarcasmo.'],
    },
    ofrenda: [
      'Te has movido. Anotado. No te acostumbres a los aplausos.',
      'Mira tú. Un cuerpo que hace cosas. Casi no te reconozco.',
      'Mi cola acaba de subir un grado. No me mires así.',
      'Bien. Ahora haz como que no te ha costado.',
    ],
    otraArea: ['No es lo mío, pero vale. El bosque lo agradece. Yo, moderadamente.', 'Ofrenda aceptada. La he guardado donde no la vea nadie.'],
    tope: ['Ya está. Hoy no sumo más. No hay medalla por agotarse.', 'Tres por hoy. Lo demás es exhibicionismo.'],
    diaMalo: ['Día malo. Lo mínimo cuenta entero. Hasta yo tengo días de brasa.', 'Cinco minutos. Para hoy, es una gesta. No se lo digas a nadie.'],
    fase1: ['Mi claro se está llenando de malas hierbas. Igual que tu agenda, sospecho.', 'Llevas días sin moverte. He empezado a hablar con los hongos.'],
    fase2: ['He escondido tus zapatillas. No preguntes dónde. Hay una nota.', 'Te he dejado una nota: «Sigo vivo. Tú, a saber».'],
    fase3: ['Ha venido un cuervo. Se ha llevado algo. Yo no he hecho nada, que conste.', 'Hay un pájaro negro en mi claro. Le gustan las cosas brillantes. Y tus cosas.'],
    arreglo: ['Ah, mira quién ha vuelto. Las malas hierbas te mandan saludos.', 'Claro despejado. Ni lo menciones. Bueno, menciónalo un poco.'],
    visitanteFuera: ['El cuervo se ha ido. Ha soltado lo tuyo al salir. Cobarde.'],
    llegada: ['Vale, ya estoy aquí. No hagas una fiesta. Bueno, una pequeña.'],
    sorpresa: ['He encontrado esto. No preguntes de dónde. De verdad, no preguntes.'],
  },
  tofu: {
    saludo: {
      amanecer: ['Mañana. El brote ya está despierto. Yo también, por desgracia.', 'Buenos días. Es una forma de hablar.'],
      mediodia: ['Mediodía. Buena hora para pensar en algo. Lo que sea.', 'Sigo siendo un cubo. Por si había dudas.'],
      atardecer: ['Atardece. Una página antes de cenar no ha matado a nadie. Que yo sepa.', 'El brote pregunta qué has aprendido hoy. Yo no pregunto nada.'],
      noche: ['Es tarde. Las ideas también duermen. Tú deberías.', 'Noche. No es momento de aprender. Es momento de cerrar los ojos.'],
    },
    ofrenda: ['Correcto.', 'Has usado la cabeza. El brote se ha enterado. Yo, también.', 'Una hoja nueva. No la he pedido.', 'Bien. No espero aplausos y tú tampoco deberías.'],
    otraArea: ['No es mi área. Lo anoto igual. Con indiferencia.', 'Aceptado. Sin comentarios. Bueno, uno: bien.'],
    tope: ['Suficiente por hoy. Más no suma. La cabeza también necesita no hacer nada.'],
    diaMalo: ['Día malo. Una página vale. Una frase vale. Tofu ha hablado.'],
    fase1: ['El huerto se está llenando de musgo. Del malo. Ni lo sabía que había de malo.', 'El brote se ha doblado. No es tristeza. Es falta de riego. Tuyo.'],
    fase2: ['He decidido que no existes. Es una decisión firme. Temporal, pero firme.', 'Tofu no está disponible. Deje su mensaje después de nada.'],
    fase3: ['Hay una polilla enorme comiéndose la luz del huerto. Le he pedido que se vaya. No hablamos el mismo idioma.'],
    arreglo: ['Huerto limpio. Bien. Sigamos.', 'Has vuelto. Lo anoto sin emoción. (Con un poco de emoción.)'],
    visitanteFuera: ['La polilla se ha ido. Ha devuelto lo que se llevó. Educada, para ser una polilla.'],
    llegada: ['He llegado. No esperes que diga que me alegro. Me alegro.'],
    sorpresa: ['Esto estaba bajo el musgo. Ahora es tuyo. No me des las gracias.'],
  },
  bruma: {
    saludo: {
      amanecer: ['Ha amanecido con niebla. Por mí. Perdona.', 'Antes del móvil, mira por la ventana. Solo un momento. Yo espero.'],
      mediodia: ['A mitad del día todo va muy deprisa. Yo me deshilacho un poco.', 'Para cinco minutos. El mundo no se va a ir. Lo he comprobado.'],
      atardecer: ['Atardece. Es un buen momento para no hacer nada. A propósito.', 'Hoy ha sido ruidoso, ¿verdad? Lo noto en los bordes.'],
      noche: ['Qué noche tan quieta. Quédate en ella un rato, sin pantalla.', 'Deja el móvil boca abajo. La luna no necesita notificaciones.'],
    },
    ofrenda: ['Has parado un momento. He recuperado un borde.', 'Floto un poco mejor. No sé si por ti o por casualidad. Por ti.', 'Gracias por parar conmigo.', 'El estanque está más quieto. Tú también, creo.'],
    otraArea: ['No es lo mío, pero me alegra. Un poco. Lo justo.', 'Lo guardo en la niebla. Ahí no se pierde nada.'],
    tope: ['Ya basta por hoy. Tanta calma también cansa. Créeme.'],
    diaMalo: ['No tienes que estar bien. Solo parar un momento. Con eso me basta.'],
    fase1: ['El estanque se ha llenado de hojas. Y de silencio del malo.', 'Me estoy quedando transparente. No es una metáfora. Bueno, un poco.'],
    fase2: ['Me he ido flotando. No muy lejos. Pero tendrás que buscarme.', 'Estoy en algún sitio entre los árboles. Haciéndome la niebla.'],
    fase3: ['Un caracol se ha instalado en el estanque. Dice que se queda. Tiene mi frasco.'],
    arreglo: ['Vuelvo a tener forma. Gracias por volver.', 'El estanque se ha aclarado. Se ve el fondo. Y tu reflejo, cansado pero aquí.'],
    visitanteFuera: ['El caracol se ha ido, muy despacio. Ha dejado lo tuyo en la orilla.'],
    llegada: ['He bajado del valle. Creo que me quedo. Si me dejas.'],
    sorpresa: ['La niebla ha traído esto. Me lo ha dado para ti.'],
  },
  madeja: {
    saludo: {
      amanecer: ['¡Buenos días! ¿Has dado los buenos días a alguien? No a mí, a alguien.', 'Me he despertado con un nudo. Creo que es tuyo.'],
      mediodia: ['Media mañana es perfecta para un audio. Cortito. Me entero igual.', 'Cuéntame algo. Lo que sea. Con detalles.'],
      atardecer: ['Es buena hora para llamar a alguien. La gente está en casa y aburrida.', '¿Has quedado? ¿Con quién? No me lo digas. Sí, dímelo.'],
      noche: ['Es tarde para llamar a nadie. Pero no para pensar a quién llamarás mañana.', 'Si alguien duerme a tu lado, apaga esto y habla con él.'],
    },
    ofrenda: ['¡Ay, qué bonito! Ya me lo contarás todo.', 'Un hilo más. Con esto tejo media bufanda.', '¡Por fin noticias! Pensaba que te habías hecho ermitaño.', 'Eso se recuerda años. Lo sé yo, que lo recuerdo todo.'],
    otraArea: ['No es lo mío, pero lo cuento por ahí igual. Que se sepa.', 'Muy bien, cariño. Se lo diré a todo el bosque.'],
    tope: ['Tres en un día. Más sociable que yo, y eso es mucho decir. Descansa.'],
    diaMalo: ['Día malo. Un mensaje cuenta. Un «pienso en ti» cuenta. Con eso tejo.'],
    fase1: ['El porche está lleno de telarañas. Y no son mías.', 'Llevas días sin hablar con nadie. Lo sé. Lo sé todo.'],
    fase2: ['Les he contado a los demás lo tuyo. Todo. Con detalles. Lo siento. No lo siento.', 'He estado cotilleando sobre ti. Por despecho. Por cariño. Las dos cosas.'],
    fase3: ['Ha entrado un cuervo en el porche y se ha llevado algo. Encima, maleducado.'],
    arreglo: ['¡Ya estás aquí! Siéntate, que te pongo un té y me cuentas qué me he perdido.', 'Porche barrido. Los cotilleos sobre ti, retirados. Casi todos.'],
    visitanteFuera: ['El cuervo se ha ido sin despedirse, pero ha devuelto lo tuyo. Algo es algo.'],
    llegada: ['¡Por fin te pillo! Me mudo. Ya he traído la tetera.'],
    sorpresa: ['Me han dado esto para ti. No te digo quién. Tengo mis fuentes.'],
  },
  tuerca: {
    saludo: {
      amanecer: ['Buenos días. Propuesta: tres cosas para hoy. Más de tres requiere otra caja.', 'He clasificado la mañana. Está en «VARIOS».'],
      mediodia: ['Mediodía. Hay un pendiente que lleva días mirándote. Lo he etiquetado: «Ese».', 'Engranaje girando. Más o menos.'],
      atardecer: ['Quedan diez minutos de luz para ordenar una balda. Solo una.', 'He archivado el día. No encuentro dónde.'],
      noche: ['De noche los pendientes también duermen. Déjalos. Mañana les damos guerra.', 'Todo en su sitio. Mentira. Pero duerme igual.'],
    },
    ofrenda: ['Pendiente cerrado. Clonc. El mejor sonido del mundo.', 'Algo ordenado. Lo he etiquetado. No sé dónde está la etiqueta.', 'Procedimiento completado. Creo.', 'Has soltado algo. Yo no sería capaz. Me admiro un poco de ti.'],
    otraArea: ['No es mi área. Lo archivo en «Cosas de otros». Esa caja está llena.', 'Recibido. Clasificado. Perdido. Normal.'],
    tope: ['Tres por hoy. Ya está bien. Hasta yo necesito un poco de caos.'],
    diaMalo: ['Día malo. Un papel a la basura cuenta. Lo dice el reglamento. Lo he escrito yo.'],
    fase1: ['El taller está lleno de polvo. He clasificado el polvo. No ayuda.', 'Engranaje chirriando. Aviso sin importancia. Importantísimo.'],
    fase2: ['He reetiquetado todo el bosque como «VARIOS». Por error. No ha sido por error.', 'Todo lo tuyo está ahora en cajas. Etiquetadas. Mal.'],
    fase3: ['Un caracol se ha instalado en el taller. Se ha llevado una pieza. No sé cuál. Ese es el problema.'],
    arreglo: ['¡Engranaje en marcha! Rrrr. Clonc. Perdón, es la emoción.', 'Taller operativo. Te he quitado de la lista de «Desaparecidos».'],
    visitanteFuera: ['El caracol ha abandonado el taller. Ha devuelto la pieza. Estaba en «VARIOS».'],
    llegada: ['Atención. Procedo a mudarme. Paso dos: no sé qué va en el paso dos.'],
    sorpresa: ['He encontrado esto en una caja. La caja ponía «Tuyo». No sé quién la etiquetó.'],
  },
}
