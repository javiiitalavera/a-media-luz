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
    reacciones: ['¿8000 pasos? Yo he dado 8001. Por ganar.', 'Has andado. Yo he corrido detrás de una hoja. Empate técnico.'] },
  { id: 'correr', area: 'cuerpo', nombre: 'Correr 30 minutos', minima: 'Correr 10 minutos',
    reacciones: ['Media hora corriendo. ¿Huías de algo? No contestes.', 'Has corrido. Mi cola ha subido dos grados.'] },
  { id: 'bici', area: 'cuerpo', nombre: 'Bici 30 minutos', minima: 'Bici 10 minutos',
    reacciones: ['Bici. Dos ruedas y ninguna excusa. Me gusta.', 'Si te cruzas con una cuesta, salúdala de mi parte.'] },
  { id: 'fuerza', area: 'cuerpo', nombre: 'Fuerza 20 minutos', minima: '10 sentadillas',
    reacciones: ['Fuerza. Ahora podrás llevar más salchichas. Piénsalo.', 'Has levantado peso. Yo he levantado una ceja. Mismo esfuerzo.'] },
  { id: 'estirar', area: 'cuerpo', nombre: 'Estirar 10 minutos', minima: 'Estirar 2 minutos',
    reacciones: ['Estiramientos. Yo lo hago cada mañana. Se llama bostezar.'] },
  { id: 'dormir', area: 'calma', nombre: 'Dormir 7 horas', minima: 'Acostarme sin pantalla',
    reacciones: ['Siete horas. La niebla y tú, igual de descansadas.', 'Has dormido de verdad. Se te nota en los bordes. A mí también.'] },
  { id: 'verdura', area: 'cuerpo', nombre: 'Verdura en 2 comidas', minima: 'Una pieza de fruta',
    reacciones: ['Verdura. Respeto tu decisión. No la comparto.', 'Dos comidas con verdura. Yo me como la parte de la salchicha.'] },
  { id: 'agua', area: 'cuerpo', nombre: 'Beber 2 litros de agua', minima: 'Un vaso al levantarme',
    reacciones: ['Agua. Mantente lejos de mi hoguera, pero bien hecho.'] },
  { id: 'jugar-fuera', area: 'vinculos', nombre: 'Jugar fuera 30 minutos', minima: 'Salir a la calle 10 minutos',
    reacciones: ['¡Jugar fuera! ¿Con quién? ¿A qué? Cuéntamelo todo.'] },
  { id: 'equilibrio', area: 'cuerpo', nombre: 'Ejercicios de equilibrio 10 minutos', minima: 'A la pata coja 1 minuto',
    reacciones: ['Equilibrio. Yo lo pierdo cada vez que huelo una salchicha.'] },
  // Mente · Tofu
  { id: 'leer', area: 'mente', nombre: 'Leer 15 páginas', minima: 'Leer 1 página',
    reacciones: ['Quince páginas. Yo llevo tres horas con la portada.', 'Has leído. El brote se ha enterado antes que yo.'] },
  { id: 'idioma', area: 'mente', nombre: 'Una lección de idioma', minima: 'Aprender 5 palabras',
    reacciones: ['Otro idioma. Así podrás no hablar en dos.', 'Una lección. Correcto. En cualquier idioma.'] },
  { id: 'concentrado', area: 'mente', nombre: 'Trabajar 25 minutos sin distracciones', minima: '10 minutos sin el móvil',
    reacciones: ['Veinticinco minutos sin mirar el móvil. Lo anoto. Con asombro contenido.'] },
  { id: 'curso', area: 'mente', nombre: 'Un curso 20 minutos', minima: 'Un vídeo que me enseñe algo',
    reacciones: ['Has aprendido algo. No sé qué. Tú tampoco, todavía. Funciona así.'] },
  { id: 'instrumento', area: 'mente', nombre: 'Tocar un instrumento 15 minutos', minima: 'Tocar una canción',
    reacciones: ['Música. El brote ha llevado el ritmo. Yo no.'] },
  { id: 'crear', area: 'mente', nombre: 'Escribir o dibujar 15 minutos', minima: 'Un boceto rápido',
    reacciones: ['Has creado algo. No hace falta que me lo enseñes. Pero puedes.'] },
  { id: 'podcast', area: 'mente', nombre: 'Escuchar un audiolibro 30 minutos', minima: 'Escuchar 10 minutos',
    reacciones: ['Un libro con voz. Es leer con los ojos cerrados. Aprobado.'] },
  { id: 'deberes', area: 'mente', nombre: 'Hacer los deberes', minima: 'Empezar los deberes 10 minutos',
    reacciones: ['Deberes hechos. Yo nunca tuve deberes. Tuve musgo.'] },
  // Calma · Bruma
  { id: 'diario', area: 'mente', nombre: 'Escribir en mi diario', minima: 'Una frase en el diario',
    reacciones: ['Has escrito en tu diario. No lo leeré. El brote, quizá.', 'Una página tuya. Sin fórmula. Funciona igual.'] },
  { id: 'meditar', area: 'calma', nombre: 'Meditar 10 minutos', minima: 'Tres respiraciones lentas',
    reacciones: ['Diez minutos sin hacer nada a propósito. Es más difícil de lo que parece.'] },
  { id: 'paseo', area: 'calma', nombre: 'Pasear 20 minutos sin móvil', minima: 'Cinco minutos fuera sin móvil',
    reacciones: ['Un paseo sin pantalla. El mundo seguía ahí. Lo sé, me sorprende siempre.'] },
  { id: 'pantallas', area: 'calma', nombre: 'Sin pantallas la última hora', minima: 'Sin pantallas el último cuarto de hora',
    reacciones: ['Una hora sin pantalla antes de dormir. La luna te lo agradece. Yo también.'] },
  { id: 'aire', area: 'calma', nombre: 'Media hora al aire libre', minima: 'Cinco minutos mirando el cielo',
    reacciones: ['Aire libre. Ahí fuera hay nubes como yo. Más grandes. Menos interesantes.'] },
  { id: 'aficion', area: 'calma', nombre: 'Una afición tranquila 20 minutos', minima: 'Cinco minutos de algo que me guste',
    reacciones: ['Algo que te gusta, sin prisa. Debería ser obligatorio. No lo es. Por eso vale.'] },
  { id: 'para-mi', area: 'calma', nombre: 'Veinte minutos para mí', minima: 'Cinco minutos para mí',
    reacciones: ['Veinte minutos tuyos. Nadie te los devuelve si no los coges.'] },
  // Vínculos · Madeja
  { id: 'padres', area: 'vinculos', nombre: 'Escribir a mis padres', minima: 'Un audio corto',
    reacciones: ['¡Has escrito a tus padres! ¿Qué te han contestado? Cuéntamelo todo.', 'Tus padres ya saben que existes. Buen trabajo.'] },
  { id: 'amigo', area: 'vinculos', nombre: 'Llamar a un amigo', minima: 'Un mensaje a un amigo',
    reacciones: ['¡Una llamada! De voz. Como en las películas antiguas.'] },
  { id: 'quedar', area: 'vinculos', nombre: 'Quedar con alguien', minima: 'Proponer un plan',
    reacciones: ['¿Has quedado? ¿Con quién? No, da igual. Bueno, no da igual.'] },
  { id: 'cena', area: 'vinculos', nombre: 'Cenar sin móviles', minima: 'Un rato de charla sin móvil',
    reacciones: ['Una cena sin móviles. Habéis tenido que miraros. Valiente.'] },
  { id: 'detalle', area: 'vinculos', nombre: 'Tener un detalle con alguien', minima: 'Un mensaje bonito',
    reacciones: ['Un detalle. Pequeño, seguro. Los pequeños son los que se recuerdan.'] },
  { id: 'gracias', area: 'vinculos', nombre: 'Dar las gracias a alguien', minima: 'Un «gracias» por mensaje',
    reacciones: ['Has dado las gracias. Alguien hoy está un poco mejor. Y no sabe por qué.'] },
  // Orden · Tuerca
  { id: 'ayudar-casa', area: 'orden', nombre: 'Ayudar en casa 15 minutos', minima: 'Recoger mi plato',
    reacciones: ['Ayuda doméstica registrada. Tu casa sube un puesto en mi clasificación.'] },
  { id: 'ordenar', area: 'orden', nombre: 'Ordenar 15 minutos', minima: 'Ordenar una balda',
    reacciones: ['Quince minutos ordenando. He abierto un expediente de felicitación.', 'Orden. Mis tornillos te aplauden. En silencio, por orden de tamaño.'] },
  { id: 'gestion', area: 'orden', nombre: 'Hacer una gestión pendiente', minima: 'Abrir el sobre que llevo días evitando',
    reacciones: ['Gestión hecha. La archivo en RESUELTOS. Es una carpeta nueva. Está casi vacía.'] },
  { id: 'gastos', area: 'orden', nombre: 'Revisar gastos 10 minutos', minima: 'Mirar el saldo sin miedo',
    reacciones: ['Gastos revisados. He encontrado un café de 2019 sin justificar.', 'Cuentas al día. Me tiemblan los engranajes de la emoción.'] },
  { id: 'planificar', area: 'orden', nombre: 'Planificar mañana', minima: 'Apuntar tres cosas',
    reacciones: ['Mañana planificado. Ahora solo falta que mañana colabore.'] },
  { id: 'cocina', area: 'orden', nombre: 'Dejar la cocina recogida', minima: 'Fregar lo de hoy',
    reacciones: ['Cocina recogida. Mañana tu yo del desayuno te lo agradecerá.'] },
  { id: 'correo', area: 'orden', nombre: 'Dejar el correo a cero', minima: 'Borrar 20 correos',
    reacciones: ['Bandeja de entrada a cero. Es lo más bonito que he visto. Después de un tornillo nuevo.'] },
]

/** Las que vienen marcadas al empezar (se pueden cambiar). */
export const HAZANAS_INICIALES = ['pasos', 'leer', 'padres']

/** Equivalencias de las acciones antiguas (genéricas) con las hazañas nuevas, para las partidas de antes. */
export const EQUIVALENCIAS_ANTIGUAS: Record<string, string> = {
  andar: 'pasos', comer: 'verdura', ejercicio: 'fuerza', aprender: 'curso', concentrarme: 'concentrado',
  sinmovil: 'pantallas', naturaleza: 'aire', respirar: 'meditar', nadahacer: 'aficion', llamar: 'amigo',
  pareja: 'cena', mensaje: 'detalle', pendiente: 'gestion', papeleo: 'gestion', cuentas: 'gastos',
}
