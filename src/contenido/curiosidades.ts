// Curiosidades del Álbum (decidido por Javi, 18/11/2026): objetos con historia. Unos los encuentra un
// vecino de vez en cuando al tachar una hazaña de su área; otros quedan al terminar una historia.
// Textos: propuestas de Claude, pendientes de revisión de Javi.
import type { CompaneroId } from './tipos'

export interface Curiosidad {
  id: string
  vecino: CompaneroId
  nombre: string
  texto: string
  /** Ruta del dibujo (en public/arte). */
  arte: string
  /** Si sale al terminar una historia (si no, por sorpresa). */
  historia?: string
}

const c = (id: string) => `/arte/curiosidades/${id}.webp`
const h = (id: string) => `/arte/huellas/${id}.webp`
const b = (id: string) => `/arte/casa/bruma/objetos/${id}.webp`

export const CURIOSIDADES: Curiosidad[] = [
  // Nox
  { id: 'pina', vecino: 'nox', nombre: 'Piña chamuscada', arte: c('pina'), texto: 'Nox la encontró «así». Huele a hoguera y a coartada.' },
  { id: 'zapatilla', vecino: 'nox', nombre: 'Zapatilla huérfana', arte: c('zapatilla'), texto: 'Nadie sabe dónde está la otra. Nox dice que la perdió corriendo. Nox no corre.' },
  { id: 'cerilla', vecino: 'nox', nombre: 'Cerilla eterna', arte: c('cerilla'), texto: 'Lleva encendida desde el martes. Tuerca ha pedido que no se acerque a los expedientes.' },
  { id: 'cartel-quemado', vecino: 'nox', nombre: 'Cartel chamuscado', arte: h('cartel-quemado'), historia: 'normativa', texto: 'Prueba A del expediente 001. Nox lo ha firmado. Con ceniza.' },
  { id: 'salchicha', vecino: 'nox', nombre: 'Salchicha del peaje', arte: c('salchicha'), historia: 'puente', texto: 'El primer pago del peaje del puente. Nadie más ha pagado. Nox la guarda como un trofeo.' },
  // Tuerca
  { id: 'tornillo', vecino: 'tuerca', nombre: 'Tornillo que no encaja', arte: c('tornillo'), texto: 'No encaja en nada. Tuerca lo ha clasificado en VARIOS con todos los honores.' },
  { id: 'llave', vecino: 'tuerca', nombre: 'Llave de nada', arte: c('llave'), texto: 'Abre algo. Nadie sabe qué. La etiqueta está en blanco por si acaso.' },
  { id: 'etiqueta', vecino: 'tuerca', nombre: 'Etiqueta en blanco', arte: c('etiqueta'), texto: 'Tuerca la reserva para algo importante. Lleva tres años esperando.' },
  { id: 'expediente', vecino: 'tuerca', nombre: 'Expediente confidencial', arte: h('expediente'), historia: 'tablon', texto: 'Tuerca dice que no hay nada dentro. Pesa como si lo hubiera.' },
  { id: 'tuerca-lazo', vecino: 'tuerca', nombre: 'Tuerca con lazo', arte: c('tuerca-lazo'), historia: 'gregorio', texto: 'El regalo de Tuerca a Gregorio para hacer las paces. Gregorio no la ha abierto.' },
  // Tofu
  { id: 'semilla', vecino: 'tofu', nombre: 'Semilla en un sobre', arte: c('semilla'), texto: 'Brilla un poco. Tofu no la ha plantado: dice que aún no ha decidido qué quiere ser.' },
  { id: 'gafas', vecino: 'tofu', nombre: 'Gafas sin cristales', arte: c('gafas'), texto: 'Tofu las usa para leer. Dice que ve igual, pero se concentra mejor.' },
  { id: 'marcapaginas', vecino: 'tofu', nombre: 'Marcapáginas de hoja', arte: c('marcapaginas'), texto: 'Marca la página 15 de un libro que Tofu ya ha terminado. Por si acaso.' },
  { id: 'piedra-corazon', vecino: 'tofu', nombre: 'Piedra con forma de corazón', arte: c('piedra-corazon'), texto: 'Torcido, como casi todos. Tofu no ha dicho nada. El brote, sí.' },
  { id: 'libro-quemado', vecino: 'tofu', nombre: 'Libro chamuscado', arte: h('libro-quemado'), historia: 'prestamo', texto: '«Paciencia». Lo que queda de ella. Tofu dice que ahora tiene más carácter.' },
  { id: 'lupa', vecino: 'tofu', nombre: 'Lupa de Tuerca', arte: h('lupa'), historia: 'planta', texto: 'Se la dejó en casa de Tofu durante el interrogatorio. Huele a planta.' },
  { id: 'archivador', vecino: 'tofu', nombre: 'Archivador «Fórmulas»', arte: h('archivador'), historia: 'pizarra', texto: 'Dentro, la fórmula versión 1. Derogada. Archivada. Intacta.' },
  // Bruma (por ahora solo las que dejan sus historias)
  { id: 'frasco', vecino: 'bruma', nombre: 'Frasco de niebla', arte: b('frasco'), historia: 'frasco', texto: 'Vacío. La etiqueta dice «Muestra 1. VARIOS». Tuerca jura que no lo abre por las noches.' },
  { id: 'paraguas', vecino: 'bruma', nombre: 'Paraguas de interior', arte: b('paraguas'), historia: 'hamaca', texto: 'Tuerca lo abrió en el taller por si Bruma lloraba. Sigue abierto. Por si acaso.' },
  { id: 'barquito', vecino: 'bruma', nombre: 'Barquito de papel', arte: b('barquito'), historia: 'barquitos', texto: 'Dentro pone «Sí». Tardaron tres horas en escribirlo. Tofu dice que no es suyo.' },
]
