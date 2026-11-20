// «Tu vida es el guion» (dirección A, decidida por Javi el 20/11/2026 a partir de la auditoría de Z.ai).
// Historias que nacen de lo que haces fuera del juego y le cuentas al barrio: los vecinos leen un patrón de tu
// diario (logica/patrones.ts), lo malinterpretan y montan una pequeña comedia. Cada una tiene una pista, un
// intercambio entre vecinos, una consecuencia que se ve en el barrio o en una casa y un remate que se descubre
// paseando (sin noticia en el sobre). Después, los vecinos la recuerdan de vez en cuando («ecos»).
// {dias}, {orden} y {calma} se rellenan con lo que se leyó al empezar. Nunca se citan títulos que escribe el
// jugador. Textos: propuestas de Claude, pendientes de revisión de Javi.
import type { Huella, Situacion } from './situaciones'

export const LECTURAS: Situacion[] = [
  {
    id: 'asesoria',
    titulo: 'La asesoría de paseos',
    patron: 'caminante',
    requiere: { vecinos: ['nox', 'tuerca'], construido: [] },
    fases: [
      {
        noticia: 'Junto al sendero ha aparecido un cartel: «ASESORÍA DE PASEOS». La letra es de Nox. La ortografía, también.',
        lugar: 'barrio',
        frases: {
          nox: ['{dias} días saliendo a andar esta semana. Eso no pasa solo. Pasa con un buen asesor.', 'He montado una asesoría. Soy el asesor. Y el asesorado eres tú, aunque no lo sepas.'],
        },
      },
      {
        noticia: 'Tuerca ha pedido a Nox los datos que respaldan su asesoría. Nox ha señalado el sendero. Tuerca ha medido el sendero.',
        lugar: 'nox',
        frases: {
          tuerca: ['Pruebas presentadas por Nox: «el camino». He abierto un expediente. Al camino.'],
          nox: ['Los datos están ahí fuera. Andando. Yo solo los interpreto.'],
          bruma: ['A lo mejor no anda por Nox. A lo mejor anda porque le sienta bien.'],
        },
      },
      {
        noticia: 'Nox ha trazado una ruta oficial con piedras del arroyo. Pasa tres veces por su casa y una por la parrilla.',
        lugar: 'barrio',
        frases: {
          nox: ['La ruta está optimizada. Para mí, pero optimizada.'],
          tuerca: ['He homologado la ruta. Bueno, he homologado la primera piedra.'],
        },
      },
      {
        noticia: '',
        recuerdo: 'Al final del sendero, Nox ha clavado un segundo cartel con las tarifas. Nadie ha pagado. Nadie le ha contratado.',
        lugar: 'barrio',
        frases: { nox: ['¿Has visto las tarifas? Son razonables. Una salchicha. O dos, si llueve.'] },
      },
    ],
    ecos: {
      nox: ['Mi asesoría de paseos sigue abierta. Sin clientes, pero abierta. Como un buen negocio.'],
      tuerca: ['El expediente del camino sigue abierto. El camino no ha colaborado.'],
    },
  },
  {
    id: 'club-lectura',
    titulo: 'El club de lectura',
    patron: 'lector',
    requiere: { vecinos: ['tofu', 'nox'], construido: [] },
    fases: [
      {
        noticia: 'Han aparecido libros apilados en la plaza. Tofu dice que es un club de lectura. Es un club de una persona. La persona es Tofu.',
        lugar: 'barrio',
        frases: {
          tofu: ['{dias} días con la cabeza ocupada esta semana. Alguien en este barrio lee. He decidido que somos un club.'],
        },
      },
      {
        noticia: 'Tofu ha concluido que el barrio entero está leyendo «El arte de no hacer nada». Nadie lo ha leído. Nadie sabe de dónde lo ha sacado.',
        lugar: 'tofu',
        frases: {
          tofu: ['He llegado a una conclusión. Nadie me la ha pedido. Es correcta.'],
          nox: ['Yo he leído la portada. Dos veces. Cuenta como un capítulo.'],
          bruma: ['A lo mejor no hay ningún club. A lo mejor alguien lee porque le gusta.'],
        },
      },
      {
        noticia: 'El club se ha reunido por primera vez. Nox ha llegado con salchichas y sin libro. Tofu lo ha apuntado en el acta como «aportación cultural».',
        lugar: 'tofu',
        frases: {
          tofu: ['Primera sesión: un libro, un lector, un zorro con salchichas. Es un comienzo.'],
          nox: ['He aportado contexto. El contexto eran salchichas.'],
        },
      },
      {
        noticia: '',
        recuerdo: 'En casa de Tofu se ha quedado el acta del club: una pila de libros con una salchicha de marcapáginas.',
        lugar: 'tofu',
        frases: { tofu: ['El acta está en mi estantería. La salchicha también. Ya no sé cuál es el documento.'] },
      },
    ],
    ecos: {
      tofu: ['El club de lectura sigue en pie. Sigo siendo el único socio. Es un club exclusivo.'],
      nox: ['Soy socio de honor del club de lectura. Por las salchichas, no por leer.'],
    },
  },
  {
    id: 'protocolo-descanso',
    titulo: 'El protocolo de descanso',
    patron: 'protocolo',
    requiere: { vecinos: ['tuerca', 'bruma'], construido: [] },
    fases: [
      {
        noticia: 'Tuerca ha detectado gestiones y descansos en la misma semana. Ha redactado un «Protocolo de descanso». Tiene cuarenta páginas.',
        lugar: 'tuerca',
        frases: {
          tuerca: ['{orden} días ordenando y {calma} descansando. Esto hay que regularlo antes de que se convierta en salud.', 'Protocolo de descanso, versión 1. Paso uno: leer el protocolo.'],
        },
      },
      {
        noticia: 'Bruma ha leído el protocolo entero. Ha dicho una sola frase: «Descansar no se archiva». Tuerca lleva una hora mirando la pared.',
        lugar: 'tuerca',
        frases: {
          bruma: ['Descansar no se archiva.'],
          tuerca: ['Una frase. Cinco palabras. Me ha derogado cuarenta páginas.'],
          nox: ['Yo descanso sin protocolo. Y me sale de maravilla.'],
        },
      },
      {
        noticia: 'Bruma ha doblado la primera página del protocolo en forma de barco y la ha soltado en el arroyo. Tuerca la ha seguido un rato. Luego se ha sentado.',
        lugar: 'barrio',
        frases: {
          tuerca: ['El protocolo navega. Yo me he sentado a mirarlo. Creo que eso era el protocolo.'],
          bruma: ['Ha flotado bien. Las cosas ligeras flotan mejor.'],
        },
      },
      {
        noticia: '',
        recuerdo: 'En el taller queda el resto del protocolo, archivado como «Leído». Tuerca no lo ha vuelto a abrir. Dice que ya se lo sabe.',
        lugar: 'tuerca',
        frases: { tuerca: ['El protocolo está archivado. Lo cumplo de memoria. Paso uno: sentarse.'] },
      },
    ],
    ecos: {
      tuerca: ['Desde lo del barco descanso diez minutos al día. Cronometrados. Pero los descanso.'],
      bruma: ['A veces veo a Tuerca sentado sin hacer nada. No le digo nada. Sale solo.'],
    },
  },
  {
    id: 'red-de-contactos',
    titulo: 'La red de contactos',
    patron: 'contactos',
    requiere: { vecinos: ['madeja'], construido: [] },
    fases: [
      {
        noticia: 'Madeja ha colgado un corcho en su casa con hilos que unen a gente que no conoce. Dice que es tu red de contactos. Dice que está incompleta.',
        lugar: 'madeja',
        frases: {
          madeja: ['{dias} días hablando con alguien esta semana. ¿Con quién? No lo sé. Pero tengo hilo de sobra.', 'He unido tres puntos. No sé qué son los puntos. El hilo es precioso.'],
        },
      },
      {
        noticia: 'Madeja ha relacionado tus llamadas con que Nox ronca. Lo ha contado a medio barrio. Nadie entiende la relación. Ella tampoco, pero está segura.',
        lugar: 'barrio',
        frases: {
          madeja: ['Está clarísimo. Llamas a alguien, Nox ronca. Causa y efecto. O efecto y causa.'],
          nox: ['Yo no ronco. Y si ronco, es por mi cuenta.'],
          bruma: ['A lo mejor solo te apetecía hablar con alguien.'],
        },
      },
      {
        noticia: 'El corcho de Madeja ha crecido tanto que el hilo rojo sale por la ventana y llega hasta la plaza. Tuerca ha tropezado dos veces.',
        lugar: 'madeja',
        frases: {
          tuerca: ['He tropezado con una red social. Literalmente. Lo pongo en el expediente de Madeja.'],
          madeja: ['La red está creciendo. Como todo lo bueno. Y lo que hace tropezar a Tuerca.'],
        },
      },
      {
        noticia: '',
        recuerdo: 'En la plaza ha quedado un cartel de Madeja anunciando que se sabe todo. No dice qué. Es parte del encanto.',
        lugar: 'barrio',
        frases: { madeja: ['¿Has visto mi cartel en la plaza? No dice nada concreto. Así no me equivoco.'] },
      },
    ],
    ecos: {
      madeja: ['Mi corcho sigue creciendo. Ya tengo a medio barrio unido con hilo. La otra mitad, en camino.'],
      tuerca: ['Hay hilo rojo por todo el barrio. Lo he clasificado como «decoración no autorizada».'],
    },
  },
  {
    id: 'reto-secreto',
    titulo: 'El reto secreto',
    patron: 'secreto',
    requiere: { vecinos: ['madeja', 'tuerca'], construido: [] },
    fases: [
      {
        noticia: 'Madeja ha descubierto que llevas {dias} días haciendo algo que no está en el catálogo. No sabe qué es. Ha colgado un cartel en la plaza preguntándolo.',
        lugar: 'barrio',
        frases: {
          madeja: ['Algo que te has inventado tú. Varios días. Y yo sin saber qué es. No puedo vivir así.'],
        },
      },
      {
        noticia: 'Tuerca ha abierto una investigación con lupa. Ha llegado a una conclusión: «Es algo». Madeja dice que eso ya lo sabía.',
        lugar: 'barrio',
        frases: {
          tuerca: ['Conclusión preliminar: es algo. Conclusión definitiva: pendiente.'],
          madeja: ['¡Pues claro que es algo! Lo que quiero saber es qué algo.'],
          bruma: ['Es suyo. No hace falta saber más.'],
        },
      },
      {
        noticia: 'Madeja y Tuerca han acordado no preguntar más. Madeja ha durado cuatro horas. Tuerca ha archivado la lupa.',
        lugar: 'madeja',
        frases: {
          madeja: ['He aguantado sin preguntar. Cuatro horas. Ha sido lo más difícil que he hecho nunca.'],
          tuerca: ['Investigación cerrada por respeto a la intimidad. Y por falta de pruebas.'],
        },
      },
      {
        noticia: '',
        recuerdo: 'En la plaza queda la lupa de Tuerca, apoyada en una piedra, por si algún día hace falta. Madeja la mira mucho.',
        lugar: 'barrio',
        frases: { madeja: ['La lupa sigue en la plaza. No la toco. Bueno, la toco un poco.'] },
      },
    ],
    ecos: {
      madeja: ['Sigo sin saber qué es lo tuyo. Lo llevo bien. No lo llevo bien.'],
      tuerca: ['El caso del reto secreto está cerrado. Mi lupa sigue en la plaza por si se reabre.'],
    },
  },
  {
    id: 'reencuentro',
    titulo: 'El reencuentro',
    patron: 'reencuentro',
    requiere: { vecinos: ['nox', 'tuerca'], construido: [] },
    fases: [
      {
        noticia: 'Tuerca ha colgado un cartel en el barrio: «SE BUSCA». El dibujo lo ha hecho Nox. Se parece más a una salchicha que a ti.',
        lugar: 'barrio',
        frases: {
          tuerca: ['En el archivador no consta ningún registro desde hace {dias} días. El archivador está preocupado. Yo, administrativamente.'],
          nox: ['El dibujo es fiel. Te he dibujado como te recuerdo. Con hambre.'],
        },
      },
      {
        noticia: 'Has vuelto. Nox dice que sabía que volverías. Tuerca dice que Nox apostó lo contrario. Hay un acta.',
        lugar: 'nox',
        frases: {
          nox: ['Sabía que volverías. Lo sabía. No mires el acta.'],
          tuerca: ['Acta de la apuesta: Nox dijo «no vuelve». Lo he subrayado. Dos veces.'],
          bruma: ['Lo importante es que estás aquí. Lo demás es papeleo.'],
        },
        decision: {
          pregunta: '¿A quién le cuentas primero dónde has estado?',
          opciones: [
            { id: 'tofu', texto: 'A Tofu, que no pregunta', respuesta: 'Tofu ha escuchado sin decir nada. El brote ha asentido.' },
            { id: 'nox', texto: 'A Nox, que dice que lo sabía', respuesta: 'Nox ha escuchado y ha dicho «lo sabía». No lo sabía.' },
          ],
        },
      },
      {
        noticia: '',
        lugar: 'barrio',
        segun: {
          tofu: { noticia: 'Tofu ha guardado lo que le contaste. No lo ha apuntado en ningún sitio. Madeja está desesperada.' },
          nox: { noticia: 'Nox va contando por el barrio dónde estuviste. Lo cuenta mal. Lo cuenta con salchichas.' },
        },
      },
      {
        noticia: '',
        recuerdo: 'El cartel de «SE BUSCA» ahora pone «ENCONTRADO». Tuerca lo ha dejado puesto. Dice que es para la próxima vez.',
        lugar: 'barrio',
        frases: { tuerca: ['El cartel sigue ahí. Ahora pone ENCONTRADO. Lo reutilizaré si hace falta. No hará falta. Ojalá.'] },
      },
    ],
    ecos: {
      tuerca: ['Tengo un cartel de ENCONTRADO guardado. Por si acaso. No es una indirecta.'],
      nox: ['Cuando te fuiste, yo sabía que volverías. Hay un acta que dice lo contrario. El acta miente.'],
    },
  },
  {
    id: 'bis', titulo: 'El público de alquiler', patron: 'ensayo',
    requiere: { vecinos: ['tofu', 'madeja'], construido: [] },
    fases: [
      { lugar: 'tofu', noticia: 'Van {dias} días de instrumento en tu diario. Tofu ha puesto un gramófono frente a una silla para que el público ensaye también.',
        frases: { tofu: ['Entrar a tiempo con un aplauso tiene su técnica. Siéntate.'] } },
      { lugar: 'tofu', noticia: 'Madeja ha grabado un aplauso. Al final de la grabación se la oye preguntar cuánto pagan.',
        decision: { pregunta: 'Tienes la manivela. ¿Qué oye Tofu?', opciones: [
          { id: 'bis', texto: 'Poner el aplauso dos veces', respuesta: 'Madeja acaba de reconocer su propia voz entre el público. Se ha saludado.' },
          { id: 'entera', texto: 'Dejar que suene hasta el final', respuesta: 'Tofu ha oído la pregunta. Ha pedido que le pasen el presupuesto.' },
        ] } },
      { lugar: 'tofu', noticia: '', segun: {
        bis: { noticia: 'Tofu ha contado dos espectadores. Madeja ha venido a cobrar las dos entradas de público profesional.' },
        entera: { noticia: 'Tofu ha ofrecido pagar en derechos de autor. Madeja ha preguntado cuántos derechos cuesta una barra de pan.' },
      } },
      { lugar: 'tofu', noticia: '', recuerdo: 'El gramófono lleva una dedicatoria de la primera espectadora. Ha firmado también en nombre de la segunda.',
        frases: { madeja: ['La próxima vez traigo a mi prima. Tengo otra cara del disco libre.'] } },
    ],
    ecos: { tofu: ['Echo de menos aquel público. Sobre todo desde que se rompió la manivela.'] },
  },
  {
    id: 'lluvia-local', titulo: 'Lluvia muy local', patron: 'pronostico',
    requiere: { vecinos: ['bruma', 'nox'], construido: [] },
    fases: [
      { lugar: 'bruma', noticia: 'En {dias} días del diario coinciden agua y aire libre. Nox le pide a Bruma un pronóstico igual de preciso para tender su bufanda.',
        frases: { bruma: ['Puedo decirte dónde va a llover. Ponte ahí.'] } },
      { lugar: 'nox', noticia: 'Nox ha movido el tendedero tres veces. La nube lo ha seguido las tres. Empieza a sospechar que el tiempo tiene algo personal contra la lana.',
        frases: { bruma: ['Me pidió que vigilase la bufanda. La estoy vigilando.'] } },
      { lugar: 'bruma', noticia: 'Han metido la bufanda en casa y han dejado el paraguas abierto debajo de Bruma. Por primera vez llueve en el sitio previsto.',
        frases: { nox: ['Mi parte decía lluvia en el tendedero. He movido el tendedero debajo. Cien por cien de aciertos.'] } },
      { lugar: 'bruma', noticia: '', recuerdo: 'Debajo del paraguas de Bruma hay una única baldosa seca. Nox la alquila como apartamento de verano.' },
    ],
    ecos: { bruma: ['He recibido una queja por vistas al paraguas. Era el techo.'] },
  },
  {
    id: 'saldo-gracias', titulo: 'La deuda de gratitud', patron: 'cortesia',
    requiere: { vecinos: ['tuerca', 'madeja'], construido: [] },
    fases: [
      { lugar: 'tuerca', noticia: 'Esta semana has apuntado revisar gastos y dar las gracias. Tuerca acaba de encontrar algo que se debe y que nunca había metido en las cuentas.',
        frases: { tuerca: ['Madeja me debe una. Falta determinar una qué.'] } },
      { lugar: 'madeja', noticia: 'Madeja le ha dado las gracias por llevarle las cuentas. Tuerca ha vuelto al taller con dos deudas y cara de haber pisado un rastrillo.',
        frases: { madeja: ['Le iba a pagar con un detalle. Por lo visto eso abre otra cuenta.'] } },
      { lugar: 'tuerca', noticia: 'Han puesto «gracias» en un platillo de la balanza y «de nada» en el otro. La aguja lleva toda la tarde en cero. Tuerca ha cerrado el ejercicio.' },
      { lugar: 'tuerca', noticia: '', recuerdo: 'La balanza de las cortesías vuelve a inclinarse. Alguien ha dejado un bombón en el platillo de «de nada».',
        frases: { tuerca: ['Si me lo como, cuadra. Dame un minuto con la contabilidad.'] } },
    ],
    ecos: { madeja: ['Desde lo del bombón, Tuerca se ofrece a llevarme las cuentas del postre.'] },
  },
]

/** Las huellas de estas historias: la pista, la consecuencia y el remate que se descubre paseando. */
export const HUELLAS_LECTURAS: Huella[] = [
  { id: 'cartel-asesoria', situacion: 'asesoria', desde: 0, lugar: 'barrio', arte: 'cartel', sitio: { x: 42, y: 66, ancho: 6.4 }, proporcion: 1.1,
    texto: 'ASESORÍA\nDE PASEOS', textoCorto: 'Asesoría', toque: 'Horario de atención: cuando Nox se acuerda. Datos disponibles: tú.' },
  { id: 'cartel-tarifas', situacion: 'asesoria', desde: 3, lugar: 'barrio', arte: 'cartel', sitio: { x: 40, y: 80, ancho: 6.4 }, proporcion: 1.1,
    texto: 'TARIFA:\n1 SALCHICHA', textoCorto: 'Tarifas', toque: 'Primera consulta gratis. La segunda, también. Nox no sabe cobrar.' },
  { id: 'libros-plaza', situacion: 'club-lectura', desde: 0, hasta: 2, lugar: 'barrio', arte: 'libros', sitio: { x: 51, y: 46, ancho: 5 }, proporcion: 1.04,
    toque: 'El club de lectura del barrio. Socios: uno. Sillas: ninguna. Ambiente: inmejorable.' },
  { id: 'acta-club', situacion: 'club-lectura', desde: 3, lugar: 'tofu', arte: 'salchicha', sitio: { x: 50, y: 50, ancho: 7 }, proporcion: 1.32,
    toque: 'El acta del club de lectura. Es una salchicha. Marca la página 12.' },
  { id: 'expediente-protocolo', situacion: 'protocolo-descanso', desde: 0, hasta: 1, lugar: 'tuerca', arte: 'expediente', sitio: { x: 42, y: 62, ancho: 9 }, proporcion: 0.9,
    toque: '«Protocolo de descanso». Cuarenta páginas. Índice de seis.' },
  { id: 'barco-protocolo', situacion: 'protocolo-descanso', desde: 2, lugar: 'barrio', arte: 'barquito', sitio: { x: 37, y: 58, ancho: 5 }, proporcion: 0.63,
    toque: 'Es la primera página del protocolo. Ahora flota. Pone «Paso uno: …». El resto se ha mojado.' },
  { id: 'archivo-protocolo', situacion: 'protocolo-descanso', desde: 3, lugar: 'tuerca', arte: 'archivador', sitio: { x: 42, y: 62, ancho: 8 }, proporcion: 1.06,
    toque: '«Protocolo de descanso. Estado: leído». Tuerca dice que lo cumple de memoria.' },
  { id: 'corcho-contactos', situacion: 'red-de-contactos', desde: 0, lugar: 'madeja', arte: 'corcho', sitio: { x: 50, y: 47, ancho: 15 }, proporcion: 0.81,
    toque: 'Hilos rojos uniendo notas en blanco. Madeja dice que eres tú. Y que vas bien.' },
  { id: 'cartel-se-sabe', situacion: 'red-de-contactos', desde: 3, lugar: 'barrio', arte: 'cartel', sitio: { x: 78, y: 82, ancho: 6.4 }, proporcion: 1.1,
    texto: 'SE SABE\nTODO', textoCorto: 'Se sabe', toque: 'No dice qué se sabe. Madeja dice que así nunca se equivoca.' },
  { id: 'cartel-que-hace', situacion: 'reto-secreto', desde: 0, hasta: 2, lugar: 'barrio', arte: 'cartel', sitio: { x: 38, y: 47, ancho: 6.4 }, proporcion: 1.1,
    texto: '¿QUÉ\nHACE?', textoCorto: '¿Qué hace?', toque: 'Debajo, con otra letra: «No es asunto tuyo, Madeja». Es de Bruma.' },
  { id: 'lupa-secreto', situacion: 'reto-secreto', desde: 3, lugar: 'barrio', arte: 'lupa', sitio: { x: 38, y: 47, ancho: 4.5 }, proporcion: 1.03,
    toque: 'La lupa de Tuerca. Caso cerrado. La lupa sigue de guardia.' },
  { id: 'cartel-se-busca', situacion: 'reencuentro', desde: 0, hasta: 2, lugar: 'barrio', arte: 'cartel', sitio: { x: 60, y: 28.5, ancho: 6.4 }, proporcion: 1.1,
    texto: 'SE\nBUSCA', textoCorto: 'Se busca', toque: 'El dibujo es de Nox. Es una salchicha con piernas. Dice que eres tú.' },
  { id: 'cartel-encontrado', situacion: 'reencuentro', desde: 3, lugar: 'barrio', arte: 'cartel', sitio: { x: 60, y: 28.5, ancho: 6.4 }, proporcion: 1.1,
    texto: 'ENCON-\nTRADO', textoCorto: 'Encontrado', toque: 'Tuerca lo ha dejado puesto. Dice que es por si acaso. Ojalá no haga falta.' },
  { id: 'disco-publico', situacion: 'bis', desde: 0, lugar: 'tofu', arte: 'gramofono', sitio: { x: 27, y: 62, ancho: 10 }, proporcion: 1, sinObjeto: 'gramofono',
    hasta: 2, toque: 'Alguien ha pegado una oreja de lana a la bocina para que parezca que escucha.' },
  { id: 'disco-firmado', situacion: 'bis', desde: 3, lugar: 'tofu', arte: 'gramofono', sitio: { x: 27, y: 62, ancho: 10 }, proporcion: 1, sinObjeto: 'gramofono',
    toque: 'Las dos firmas son idénticas. La segunda lleva bigote.' },
  { id: 'piso-de-verano', situacion: 'lluvia-local', desde: 2, lugar: 'bruma', arte: 'paraguas', sitio: { x: 71, y: 68, ancho: 13 }, proporcion: 1,
    toque: 'Cabe un pie. Para pasar la noche en pareja hay que reservar dos turnos.' },
  { id: 'balanza-cortesias', situacion: 'saldo-gracias', desde: 3, lugar: 'tuerca', arte: 'balanza', sitio: { x: 70, y: 57, ancho: 11 }, proporcion: 1, sinObjeto: 'balanza',
    toque: 'Queda el envoltorio. En el libro mayor figura como gasto de representación.' },
]
