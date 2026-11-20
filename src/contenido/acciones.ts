// Catálogo de hazañas: concretas, con una meta por defecto que cada uno ajusta. Diarias: o la haces o no.
// Propuesta de Claude (decidido por Javi, 18/11/2026). Las reacciones las dice el vecino del área,
// con su voz, cuando cumples una de tus hazañas.
import type { Accion } from './tipos'

export interface HazanaCatalogo extends Accion {
  /** Lo que dice el vecino del área al cumplirla (si ya vive en el barrio). */
  reacciones: string[]
}

export const ACCIONES: HazanaCatalogo[] = [
  // Energía · Nox
  { id: 'pasos', area: 'cuerpo', nombre: 'Andar 8000 pasos', minima: 'Andar 2000 pasos',
    reacciones: ['¿Pasos? Yo he dado uno más que tú. Por ganar.', 'He corrido detrás de una hoja. Se ha subido a un árbol. Muy listo de su parte.', '¿Pasaste dos veces por la misma piedra? Yo también llamo a eso una ruta.', 'Bien. Siéntate.'] },
  { id: 'correr', area: 'cuerpo', nombre: 'Correr 30 minutos', minima: 'Correr 10 minutos',
    reacciones: ['Un rato corriendo. ¿Huías de algo? No contestes.', 'Lo tengo. Pasa, estás en casa.', 'Correr por gusto. Los zorros solo corremos si nos persiguen. Respeto tu locura.', 'Has corrido. Yo he mirado. Ha sido un trabajo en equipo.'] },
  { id: 'bici', area: 'cuerpo', nombre: 'Bici 30 minutos', minima: 'Bici 10 minutos',
    reacciones: ['Bici. Dos ruedas y ninguna excusa. Me gusta.', 'Si te cruzas con una cuesta, salúdala de mi parte.', 'Pedalear. Es como correr, pero sentado. Muy inteligente.', 'Has vuelto con las piernas enteras. Buena señal.'] },
  { id: 'fuerza', area: 'cuerpo', nombre: 'Fuerza 20 minutos', minima: '10 sentadillas',
    reacciones: ['He intentado mover una piedra que me estorbaba. Ahora me estorba la espalda.', 'Has levantado peso. Yo he levantado una ceja. Mismo esfuerzo.', 'Más fuerte que ayer. Más débil que mañana. Así funciona.', 'Fuerza hecha. Ahora puedes abrir los botes de pepinillos sin pedir ayuda.'] },
  { id: 'estirar', area: 'cuerpo', nombre: 'Estirar 10 minutos', minima: 'Estirar 2 minutos',
    reacciones: ['Estiramientos. Yo lo hago cada mañana. Se llama bostezar.', 'Estirado. Ahora llegas a la balda de arriba. Ahí escondo las salchichas.', 'Pon el cojín como estaba cuando acabes.', 'Tus músculos te lo agradecen. Lo sé, me lo han dicho.'] },
  { id: 'dormir', area: 'calma', nombre: 'Dormir 7 horas', minima: 'Acostarme sin pantalla',
    reacciones: ['La niebla y tú, igual de descansadas.', 'Has dormido de verdad. Se te nota en los bordes. A mí también.', 'Buenos días. Ya estoy aquí.', 'Dormir te ha cambiado la cara. A mejor, que conste.'] },
  { id: 'verdura', area: 'cuerpo', nombre: 'Verdura en 2 comidas', minima: 'Una pieza de fruta',
    reacciones: ['Verdura. Respeto tu decisión. No la comparto.', 'Verdura en el plato. Yo me como la parte de la salchicha.', 'Algo verde en el plato. No era lechuga de decoración. Bien.', 'Verdura comida. Mi cola no lo entiende, pero lo respeta.'] },
  { id: 'agua', area: 'cuerpo', nombre: 'Beber 2 litros de agua', minima: 'Un vaso al levantarme',
    reacciones: ['Agua. Mantente lejos de mi hoguera, pero bien hecho.', 'Con tanta agua ya eres un poco estanque. Bruma se pondrá celosa.', 'Hidratado. Yo me hidrato con calor. Cada uno con lo suyo.', 'Agua. Sin sabor, sin gracia, sin discusión. Bebe.'] },
  { id: 'jugar-fuera', area: 'cuerpo', nombre: 'Jugar fuera 30 minutos', minima: 'Salir a la calle 10 minutos',
    reacciones: ['Has salido a jugar. A mí me echaron por perseguir la pelota.', 'Si vuelves con barro, entra despacio. Así parece que lo traías de antes.', 'Jugar sin pantalla. Puedes perder igual. Lo he comprobado.', 'Has vuelto del aire libre con todas las patas. Buen resultado.'] },
  { id: 'equilibrio', area: 'cuerpo', nombre: 'Ejercicios de equilibrio 10 minutos', minima: 'A la pata coja 1 minuto',
    reacciones: ['Equilibrio. Yo lo pierdo cada vez que huelo una salchicha.', 'Has estado a la pata coja. Si te ha visto alguien, no lo sabrás nunca.', 'Equilibrio entrenado. Ahora caerte te costará más. Lo celebro.', 'Un pie, el otro pie. Es más difícil de lo que parece. Yo uso la cola.'] },
  // Mente · Tofu
  { id: 'leer', area: 'mente', nombre: 'Leer 15 páginas', minima: 'Leer 1 página',
    reacciones: ['Has pasado página. Yo llevo tres horas con la portada.', 'Has leído. El brote se ha enterado antes que yo.', 'Te dejo el marcapáginas.', '¿Qué tal? Puedes decir que lo mejor era la portada.'] },
  { id: 'idioma', area: 'mente', nombre: 'Una lección de idioma', minima: 'Aprender 5 palabras',
    reacciones: ['Otro idioma. Así podrás no hablar en dos.', 'Una lección. Correcto. En cualquier idioma.', 'Palabras nuevas. Algún día las usarás. O no. Siguen siendo tuyas.', 'Has aprendido a decir algo en otra lengua. Probablemente «¿dónde está el baño?». Es útil.'] },
  { id: 'concentrado', area: 'mente', nombre: 'Trabajar 25 minutos sin distracciones', minima: '10 minutos sin el móvil',
    reacciones: ['Bien. Si alguien llama, estabas ocupado.', 'Concentración. Es como el musgo: crece si no lo pisas.', 'Sin distracciones. Yo vivo así. Es muy recomendable.', 'Puedes dejarlo aquí por hoy.'] },
  { id: 'curso', area: 'mente', nombre: 'Un curso 20 minutos', minima: 'Un vídeo que me enseñe algo',
    reacciones: ['Has aprendido algo. No sé qué. Tú tampoco, todavía. Funciona así.', 'Un curso. Sabes una cosa más. Hay gente que no sabe ninguna. No los nombro.', 'Aprender es como regar. No se nota hasta que se nota.', 'Clase hecha. El brote ha tomado apuntes.'] },
  { id: 'instrumento', area: 'mente', nombre: 'Tocar un instrumento 15 minutos', minima: 'Tocar una canción',
    reacciones: ['Música. El brote ha llevado el ritmo. Yo no.', 'Has tocado. Los vecinos te han oído. Algunos, con gusto.', 'Has hecho música. Buscar la nota también cuenta.', 'Practicar es la parte aburrida de la música. La has hecho. Bien.'] },
  { id: 'crear', area: 'mente', nombre: 'Escribir o dibujar 15 minutos', minima: 'Un boceto rápido',
    reacciones: ['Has creado algo. No hace falta que me lo enseñes. Pero puedes.', 'Algo que antes no existía. Ahora sí. Es lo más raro que se puede hacer.', 'Has hecho algo con tus manos. O con tu cabeza. Mejor con las dos.', 'Creado. No tiene que ser bueno. Tiene que ser tuyo.'] },
  { id: 'podcast', area: 'mente', nombre: 'Escuchar un audiolibro 30 minutos', minima: 'Escuchar 10 minutos',
    reacciones: ['Un libro con voz. Es leer con los ojos cerrados. Aprobado.', 'Has escuchado un libro. El brote ha escuchado contigo.', 'Una voz ajena contándote cosas. Es como tener un amigo culto.', 'Audiolibro. Leer con las orejas. Muy eficiente.'] },
  { id: 'deberes', area: 'mente', nombre: 'Hacer los deberes', minima: 'Empezar los deberes 10 minutos',
    reacciones: ['Deberes hechos. Yo nunca tuve deberes. Tuve musgo.', 'Deberes terminados. El que los inventó estaría orgulloso. Es el único.', 'Hecho. Ahora tienes la tarde libre. Úsala mal, que también se aprende.', 'Deberes. Lo aburrido hecho primero. Muy sabio.'] },
  // Calma · Bruma
  { id: 'diario', area: 'mente', nombre: 'Escribir en mi diario', minima: 'Una frase en el diario',
    reacciones: ['Has escrito en tu diario. No lo leeré. El brote, quizá.', 'Una página tuya. Sin fórmula. Funciona igual.', 'El brote lleva un diario. Cada página dice que necesita una maceta más grande.', 'El diario guarda lo que tú no puedes. Para eso está.'] },
  { id: 'meditar', area: 'calma', nombre: 'Meditar 10 minutos', minima: 'Tres respiraciones lentas',
    reacciones: ['Un rato sin hacer nada a propósito. Es más difícil de lo que parece.', 'Has estado contigo un rato. Sin huir. Eso es mucho.', 'Respiraciones contadas. Las que no contaste también valen.', 'Meditar. Estar quieto por dentro. Yo lo intento y me disperso.'] },
  { id: 'paseo', area: 'calma', nombre: 'Pasear 20 minutos sin móvil', minima: 'Cinco minutos fuera sin móvil',
    reacciones: ['Un paseo sin pantalla. El mundo seguía ahí. Lo sé, me sorprende siempre.', 'Sin móvil. Caminar y ya. Las ideas vienen andando.', '¿Has mantenido el paso cuando no quedaba nadie delante? Es la parte difícil.', 'Un paseo. No había que llegar a ningún sitio. Por eso ha servido.'] },
  { id: 'pantallas', area: 'calma', nombre: 'Sin pantallas la última hora', minima: 'Sin pantallas el último cuarto de hora',
    reacciones: ['Un rato sin pantalla antes de dormir. La luna te lo agradece. Yo también.', 'El final del día, sin pantalla. Tus ojos se han ido a dormir antes que tú.', 'Sin pantallas. Has dejado que la noche fuera noche.', 'Pantalla apagada. Ahora el silencio se oye. Es bonito, ¿verdad?'] },
  { id: 'aire', area: 'calma', nombre: 'Media hora al aire libre', minima: 'Cinco minutos mirando el cielo',
    reacciones: ['Aire libre. Ahí fuera hay nubes como yo. Más grandes. Menos interesantes.', 'Has respirado aire de verdad. El de dentro de casa es de segunda mano.', 'Un rato fuera. Vuelves con otra cara. Más tuya.', 'Cielo mirado. Yo soy parte de él a ratos. Te he visto.'] },
  { id: 'aficion', area: 'calma', nombre: 'Una afición tranquila 20 minutos', minima: 'Cinco minutos de algo que me guste',
    reacciones: ['Algo que te gusta, sin prisa. Debería ser obligatorio. No lo es. Por eso vale.', 'Algo que te gusta porque sí. No sirve para nada. Por eso sirve.', 'Un rato de lo tuyo. Se te nota en la cara. Tienes otra.', 'Has jugado a ser tú. Sale muy bien.'] },
  { id: 'para-mi', area: 'calma', nombre: 'Veinte minutos para mí', minima: 'Cinco minutos para mí',
    reacciones: ['Me he reservado un rato también. Si viene alguien, dile que soy niebla.', 'Un rato para ti. No has pedido permiso. Bien.', 'Un rato tuyo. No se lo has dado a nadie. Ni al móvil.', 'Tiempo para ti. Lo guardo en la niebla, junto a lo bueno.'] },
  // Vínculos · Madeja
  { id: 'compartir-foto', area: 'vinculos', nombre: 'Enviar una foto a alguien', minima: 'Enviar algo que me recordó a alguien',
    reacciones: ['Una foto. Si salen dos vecinos, quiero los dos nombres.', 'Una imagen vale más que mil palabras. A mí me caben las mil igual.', 'Has mandado algo que te recordó a alguien. A mí me pasa con los teléfonos.'] },
  { id: 'preguntar', area: 'vinculos', nombre: 'Preguntar a alguien cómo está', minima: 'Mandar un «¿cómo vas?»',
    reacciones: ['Un «¿cómo vas?». La mejor pregunta si tienes tiempo para la respuesta.', 'Ya has preguntado. Ahora disimula y no mires el móvil cada ocho segundos.', 'Vale. Te dejo por si te contesta.'] },
  { id: 'padres', area: 'vinculos', nombre: 'Escribir a mis padres', minima: 'Un audio corto',
    reacciones: ['¡Has escrito a tus padres! ¿Qué te han contestado? Cuéntamelo todo.', 'Tus padres ya saben que existes. Buen trabajo.', '¿Les has contado lo de...? No, mejor no me lo digas. Sí, dímelo.', 'Ahora saben de ti. Si te piden que llames, yo tengo teléfono.'] },
  { id: 'amigo', area: 'vinculos', nombre: 'Llamar a un amigo', minima: 'Un mensaje a un amigo',
    reacciones: ['¡Una llamada! De voz. Como en las películas antiguas.', '¿Y qué te ha contado? Lo quiero todo, con nombres.', 'He puesto agua para el té. Si quieres seguir hablando.', 'Una llamada a tiempo arregla más que diez mensajes. Lo dice mi abuela. Me lo invento.'] },
  { id: 'quedar', area: 'vinculos', nombre: 'Quedar con alguien', minima: 'Proponer un plan',
    reacciones: ['Si el plan empieza con «vemos dónde cenamos», lleva algo comido.', 'Habéis quedado. En persona. Con cuerpos. ¡Qué moderno!', 'Un plan con alguien. Los planes se olvidan; la compañía, no.', 'Has visto a alguien de verdad. Eso cuenta el doble. Para mí, el triple.'] },
  { id: 'cena', area: 'vinculos', nombre: 'Cenar en compañía sin móviles', minima: 'Un rato de charla sin móvil',
    reacciones: ['Una cena sin móviles. Habéis tenido que miraros. Valiente.', 'Sin móviles en la mesa. ¿De qué habéis hablado? No me lo digas. Sí.', 'Habéis comido mirándoos. Es más íntimo que cualquier foto.', 'Cena sin pantallas. Seguro que alguien ha contado algo que no sabías.'] },
  { id: 'detalle', area: 'vinculos', nombre: 'Tener un detalle con alguien', minima: 'Un mensaje bonito',
    reacciones: ['Un detalle. Pequeño, seguro. Los pequeños son los que se recuerdan.', 'Un detalle. Alguien ahora sonríe y no sabe que has sido tú. Yo sí.', 'Has pensado en otra persona. Es lo más bonito que se puede hacer gratis.', 'Detalle hecho. Los detalles son el pegamento. Yo soy de lana, sé de qué hablo.'] },
  { id: 'gracias', area: 'vinculos', nombre: 'Dar las gracias a alguien', minima: 'Un «gracias» por mensaje',
    reacciones: ['Yo le di las gracias a Tuerca por un favor. Me pidió el nombre de la persona que me había atendido.', 'Un gracias bien dicho. Casi nadie lo hace. Por eso funciona tanto.', 'Agradecer. Lo recordarán más que cualquier regalo.', 'De nada. Perdona, lo he oído desde el porche y me he dado por aludida.'] },
  // Orden · Tuerca
  { id: 'ayudar-casa', area: 'orden', nombre: 'Ayudar en casa 15 minutos', minima: 'Recoger mi plato',
    reacciones: ['Ayuda doméstica registrada. Tu casa sube un puesto en mi clasificación.', 'Ayuda en casa. Tus convivientes te subirán la valoración. Yo ya lo he hecho.', 'Faltaba una mano. Gracias.', 'Contribución al hogar registrada. Sello oficial: «Bien».'] },
  { id: 'ordenar', area: 'orden', nombre: 'Ordenar 15 minutos', minima: 'Ordenar una balda',
    reacciones: ['He despejado mi banco. Ahora no tengo dónde dejar lo que estaba encima.', 'Orden. Mis tornillos te aplauden. En silencio, por orden de tamaño.', 'Ver las cosas en su sitio me calma los engranajes.', 'Si encuentras un botón azul, es mío. Si encuentras dos, ya me dirás cuál es el mío.'] },
  { id: 'gestion', area: 'orden', nombre: 'Hacer una gestión pendiente', minima: 'Abrir el sobre que llevo días evitando',
    reacciones: ['Gestión hecha. La archivo en RESUELTOS. Es una carpeta nueva. Está casi vacía.', 'Ese trámite que llevabas evitando. Ya no existe. Bueno, existe archivado.', 'Gestión resuelta. La burocracia ha perdido una batalla hoy.', 'Hecho. Lo difícil no era hacerlo; era empezar. Lo sé, me pasa.'] },
  { id: 'gastos', area: 'orden', nombre: 'Revisar gastos 10 minutos', minima: 'Mirar el saldo sin miedo',
    reacciones: ['Gastos revisados. He encontrado un café de 2019 sin justificar.', 'Cuentas al día. Me tiemblan los engranajes de la emoción.', 'Has mirado tus cuentas. Las cuentas te han mirado a ti. Habéis hecho las paces.', 'Gastos al día. Ahora sabes adónde va el dinero. A veces es mejor no saberlo. Hoy, no.'] },
  { id: 'planificar', area: 'orden', nombre: 'Planificar mañana', minima: 'Apuntar tres cosas',
    reacciones: ['Mañana planificado. Ahora solo falta que mañana colabore.', 'Mañana tiene plan. Mañana no lo sabe aún.', '¿Cuánto tiempo has dejado para planificar cómo vas a cumplir el plan?', 'Planificado. Tu yo de mañana ya tiene instrucciones. Ojalá las lea.'] },
  { id: 'cocina', area: 'orden', nombre: 'Dejar la cocina recogida', minima: 'Fregar lo de hoy',
    reacciones: ['Está bien así.', 'Cocina recogida. Ese plato ya no te mira acusador.', 'Fregado. Nadie aplaude esto. Yo sí. Clonc, clonc.', 'La encimera brilla. La he inspeccionado. Aprobada.'] },
  { id: 'correo', area: 'orden', nombre: 'Dejar el correo a cero', minima: 'Borrar 20 correos',
    reacciones: ['Bandeja de entrada a cero. Es lo más bonito que he visto. Después de un tornillo nuevo.', 'Correo a cero. Hoy dormiré con el engranaje tranquilo.', 'Has borrado lo que sobraba. Ojalá se pudiera con todo.', 'Bandeja limpia. Mañana se llenará. Pero hoy, no.'] },
]

/** Las que vienen marcadas al empezar (se pueden cambiar). */
export const HAZANAS_INICIALES = ['pasos', 'leer', 'padres']

/** Equivalencias de las acciones antiguas (genéricas) con las hazañas nuevas, para las partidas de antes. */
export const EQUIVALENCIAS_ANTIGUAS: Record<string, string> = {
  andar: 'pasos', comer: 'verdura', ejercicio: 'fuerza', aprender: 'curso', concentrarme: 'concentrado',
  sinmovil: 'pantallas', naturaleza: 'aire', respirar: 'meditar', nadahacer: 'aficion', llamar: 'amigo',
  pareja: 'cena', mensaje: 'detalle', pendiente: 'gestion', papeleo: 'gestion', cuentas: 'gastos',
}
