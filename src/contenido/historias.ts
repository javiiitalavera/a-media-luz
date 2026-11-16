// Presentación de cada compañero al salir del huevo. PROPUESTAS de Claude, pendientes de revisión de Javi.
// Tono adulto: humor negro, nada ñoño (ver CLAUDE.md).
import type { CompaneroId } from './tipos'

export interface Historia {
  especie: string
  historia: string
  necesita: string
  /** Lo que dice al terminar de presentarse (es también el botón para cerrar). */
  despedida: string
  /** Su última frase en el informe del mes, según la etapa a la que llegó (cachorro, joven, adulto). */
  cierre: [string, string, string]
  /** Lo que pone bajo su nombre cuando lo visitas en el bosque, según la etapa en que se quedó. */
  vecino: [string, string, string]
}

export const HISTORIAS: Partial<Record<CompaneroId, Historia>> = {
  nox: {
    especie: 'Zorro de brasa',
    historia: 'Nació de una brasa que alguien se dejó encendida. Desde entonces hace lo mismo que el fuego: no estarse quieto, comer cuando puede y quemarse si se le deja solo. Su cola arde más cuanto más te mueves tú. Es injusto, pero es lo que hay.',
    necesita: 'Este mes vive de tu Cuerpo: andar, dormir, comer como una persona. Con eso gana ascuas para su casa y crece. Lo demás también le viene bien, aunque no lo vaya a reconocer.',
    despedida: 'Encantado. Más o menos.',
    cierre: [
      'Un mes y sigo siendo un cachorro. No pasa nada. Las brasas pequeñas también queman.',
      'Un mes. Has andado más que el año pasado entero, lo cual dice poco del año pasado.',
      'Adulto, con casa y con la cola en su punto. Ha sido un placer. No te acostumbres a que lo diga.',
    ],
    vecino: ['Cachorro vitalicio. Lo lleva con dignidad', 'Joven para siempre, como los de Instagram', 'Jubilado con la cola encendida'],
  },
  tuerca: {
    especie: 'Robot de taller',
    historia: 'Lo montaron con piezas sobrantes y un engranaje que no encajaba en ningún sitio, así que se lo pusieron en la cabeza. Desde entonces ordena todo lo que toca, menos sus sentimientos, que tiene etiquetados como «VARIOS».',
    necesita: 'Este mes funciona con tu Orden: pendientes cerrados, papeles, cuentas, planes. Cada uno le da tornillos para su taller. Si lo descuidas, reetiqueta tu vida. Ya lo ha hecho antes.',
    despedida: 'Inventario completado. Tú incluido.',
    cierre: [
      'Sigo en versión básica. Es una versión muy estable. Eso me digo.',
      'Mes cerrado y archivado. En la carpeta VARIOS, por supuesto.',
      'Totalmente operativo. Mi trabajo aquí ha terminado. El tuyo, nunca.',
    ],
    vecino: ['Versión beta permanente', 'Funciona. No preguntes cómo', 'Operativo, ordenado e insufrible'],
  },
}
