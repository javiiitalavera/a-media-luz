// Escenas que se tocan (tanda B): de vez en cuando, algo brilla en una casa o en el barrio. Si lo
// tocas, asoma algo durante unos segundos con su frase. No da nada: es solo para que mirar tenga premio.
// Textos: propuestas de Claude, pendientes de revisión de Javi.
import type { CompaneroId } from './tipos'

export interface Gag {
  id: string
  lugar: CompaneroId | 'barrio'
  /** Lo que tiene que estar construido (o «gregorio» si Gregorio tiene que estar en esa casa). */
  requiere: string[]
  /** Dónde brilla, en % del escenario (o del mapa). */
  sitio: { x: number; y: number }
  /** Lo que asoma al tocarlo: dibujos ya existentes, apilados, y su ancho en % del escenario. */
  artes: string[]
  ancho: number
  texto: string
}

const cur = (id: string) => `/arte/curiosidades/${id}.webp`

export const GAGS: Gag[] = [
  { id: 'bajo-banco', lugar: 'nox', requiere: ['banco', 'gregorio'], sitio: { x: 80, y: 57 }, artes: ['/arte/casa/tuerca/objetos/aspiradora.webp', cur('zapatilla')], ancho: 13,
    texto: 'Gregorio asoma de debajo del banco con una zapatilla enganchada. No es suya. No es de nadie.' },
  { id: 'hoguera-salchicha', lugar: 'nox', requiere: ['hoguera'], sitio: { x: 24, y: 54 }, artes: [cur('salchicha')], ancho: 9,
    texto: 'Algo chisporrotea en la hoguera. Era una salchicha. Era.' },
  { id: 'nota-tablon', lugar: 'tuerca', requiere: ['tablon'], sitio: { x: 33, y: 22 }, artes: [cur('etiqueta')], ancho: 8,
    texto: 'Se ha caído una nota del tablón. Pone «Ver nota anterior». La anterior pone «Ver nota siguiente».' },
  { id: 'planta-tornillo', lugar: 'tofu', requiere: ['maceta'], sitio: { x: 21, y: 62 }, artes: [cur('tornillo')], ancho: 7,
    texto: 'La planta ha escupido un tornillo. Tuerca lo estaba buscando desde marzo.' },
  { id: 'barquito-estanque', lugar: 'bruma', requiere: [], sitio: { x: 28, y: 62 }, artes: ['/arte/casa/bruma/objetos/barquito.webp'], ancho: 10,
    texto: 'Un barquito de papel da vueltas en el estanque. Dentro pone «Para nadie». Bruma dice que es para nadie.' },
  // Barrio: rincones que no anuncia ningún aviso.
  { id: 'arroyo-mensaje', lugar: 'barrio', requiere: [], sitio: { x: 80, y: 49 }, artes: [cur('etiqueta')], ancho: 6,
    texto: 'Flota una etiqueta en el arroyo: «Si encuentras esto, devuélvelo a su sitio. El sitio está en el mensaje». Es de Tuerca.' },
  { id: 'setas-huella', lugar: 'barrio', requiere: [], sitio: { x: 88, y: 77 }, artes: [cur('zapatilla')], ancho: 6,
    texto: 'Entre las setas hay huellas de Nox. Van en círculo. Tres veces.' },
  { id: 'plaza-semilla', lugar: 'barrio', requiere: ['tofu'], sitio: { x: 50, y: 36 }, artes: [cur('semilla')], ancho: 6,
    texto: 'Alguien ha plantado una semilla en mitad de la plaza. Tofu dice que no ha sido él. El brote dice que sí.' },
]
