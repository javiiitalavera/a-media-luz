// Presentación de cada compañero al salir del huevo. PROPUESTAS de Claude, pendientes de revisión de Javi.
// Tono adulto: humor negro, nada ñoño (ver CLAUDE.md).
import type { CompaneroId } from './tipos'

export interface Historia {
  especie: string
  historia: string
  necesita: string
  /** Lo que dice al terminar de presentarse (es también el botón para cerrar). */
  despedida: string
}

export const HISTORIAS: Partial<Record<CompaneroId, Historia>> = {
  nox: {
    especie: 'Zorro de brasa',
    historia: 'Nació de una brasa que alguien se dejó encendida. Desde entonces hace lo mismo que el fuego: no estarse quieto, comer cuando puede y quemarse si se le deja solo. Su cola arde más cuanto más te mueves tú. Es injusto, pero es lo que hay.',
    necesita: 'Este mes vive de tu Cuerpo: andar, dormir, comer como una persona. Con eso gana ascuas para su casa y crece. Lo demás también le viene bien, aunque no lo vaya a reconocer.',
    despedida: 'Encantado. Más o menos.',
  },
  tuerca: {
    especie: 'Robot de taller',
    historia: 'Lo montaron con piezas sobrantes y un engranaje que no encajaba en ningún sitio, así que se lo pusieron en la cabeza. Desde entonces ordena todo lo que toca, menos sus sentimientos, que tiene etiquetados como «VARIOS».',
    necesita: 'Este mes funciona con tu Orden: pendientes cerrados, papeles, cuentas, planes. Cada uno le da tornillos para su taller. Si lo descuidas, reetiqueta tu vida. Ya lo ha hecho antes.',
    despedida: 'Inventario completado. Tú incluido.',
  },
}
