import type { CompaneroId } from '../contenido'
import { rutaArte } from '../arte/manifiesto'

const TORNILLO = '/arte/curiosidades/tornillo.webp'
const SEMILLA = '/arte/curiosidades/semilla.webp'
const OVILLO = '/arte/curiosidades/ovillo.webp'
const CARTA = '/arte/curiosidades/carta.webp'
const BOTON = '/arte/curiosidades/boton.webp'

/** Pequeñas escenas de fondo. Se dibujan detrás de lo que se puede tocar. */
export function VidaDeCasa({ vecino }: { vecino: CompaneroId }) {
  return (
    <div aria-hidden className="vida-de-casa pointer-events-none absolute inset-0" data-casa={vecino}>
      {vecino === 'nox' && (
        <span className="ascuas-del-porche"><i /><i /><i /></span>
      )}
      {vecino === 'tofu' && (
        <span className="semilla-del-invernadero"><img src={SEMILLA} alt="" draggable={false} /></span>
      )}
      {vecino === 'tuerca' && (
        <div className="paseo-de-tornillo">
          <img src={TORNILLO} alt="" draggable={false} />
          <span className="sombra-de-escenita" />
        </div>
      )}
      {vecino === 'madeja' && (
        <span className="boton-de-la-cesta"><img src={BOTON} alt="" draggable={false} /></span>
      )}
      {vecino === 'bruma' && (
        <div className="paseo-de-barquito">
          <span className="estela-de-barquito" />
          <img src={rutaArte('huella/barquito')} alt="" draggable={false} />
        </div>
      )}
    </div>
  )
}

export const GESTOS_DE_OBJETO: Partial<Record<string, string>> = {
  hoguera: 'chispas',
  horno: 'chispas',
  cojin: 'rebote',
  maceta: 'semilla',
  libros: 'libros',
  caja: 'tornillo',
  aspiradora: 'gregorio',
  reloj: 'reloj',
  tetera: 'vapor',
  campanillas: 'campanillas',
  hamaca: 'hamaca',
  // Madeja
  mecedora: 'hamaca',
  guirnalda: 'campanillas',
  'farol-punto': 'campanillas',
  telefono: 'reloj',
  cesto: 'ovillo',
  buzon: 'carta',
  sofa: 'rebote',
  'tetera-rosa': 'vapor',
  album: 'libros',
}

/** Los efectos van en la caja del propio objeto y siguen su posición si se mueve. */
export function EfectoDeObjeto({ gesto, toques }: { gesto: string; toques: number }) {
  if (gesto === 'vapor') {
    return (
      <span aria-hidden className="efecto-de-objeto vapor-de-tetera">
        <i /><i /><i />
        {toques > 0 && <b key={toques} />}
      </span>
    )
  }
  if (!toques) return null
  if (gesto === 'semilla' || gesto === 'tornillo' || gesto === 'ovillo' || gesto === 'carta') {
    const arte = { semilla: SEMILLA, tornillo: TORNILLO, ovillo: OVILLO, carta: CARTA }[gesto]
    return <img key={toques} aria-hidden className="efecto-de-objeto objeto-escupe" src={arte} alt="" draggable={false} />
  }
  if (gesto === 'chispas' || gesto === 'campanillas') {
    return <span key={toques} aria-hidden className="efecto-de-objeto destellos-de-objeto"><i /><i /><i /></span>
  }
  return null
}
