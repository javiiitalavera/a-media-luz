import type { CSSProperties } from 'react'
import { useRef } from 'react'
import { COMPANEROS, UI, type CompaneroId } from '../contenido'
import { PASEOS_BARRIO, type PuntoMapa } from '../contenido/barrio'
import { rutaArte, rutaCompanero } from '../arte/manifiesto'
import type { Etapa } from '../logica/etapas'
import { azarConSemilla } from '../logica/azar'
import { dia } from '../logica/fechas'
import { sfx } from '../sonido'
import { globoEn } from '../estado/globo'

export function VecinoDePaseo({ vecino, etapa, ancho, alto, puente, ahora }: {
  vecino: CompaneroId
  etapa: Etapa
  ancho: number
  alto: number
  puente: boolean
  ahora: Date
}) {
  const toques = useRef(0)
  const paseo = PASEOS_BARRIO[vecino]
  if (!paseo) return null

  const puntos = puente ? paseo.puntos : paseo.sinPuente ?? paseo.puntos
  const [inicio, ...resto] = puntos
  const xy = ({ x, y }: PuntoMapa) => `${(x * ancho / 100).toFixed(1)} ${(y * alto / 100).toFixed(1)}`
  // Curvas cuadráticas entre los puntos medios para que los cambios de dirección sean suaves.
  const curvas = resto.slice(0, -1).map((p, i) => {
    const siguiente = resto[i + 1]
    return `Q ${xy(p)} ${xy({ x: (p.x + siguiente.x) / 2, y: (p.y + siguiente.y) / 2 })}`
  })
  const trazado = [`M ${xy(inicio)}`, ...curvas, `L ${xy(resto.at(-1) ?? inicio)}`].join(' ')
  return (
    <button type="button" className="vecino-de-paseo absolute grid min-h-11 min-w-11 items-end justify-items-center"
      aria-label={UI.barrio.dePaseo(COMPANEROS[vecino].nombre)}
      style={{
        '--paseo-reposo-x': `${paseo.descanso.x}%`, '--paseo-reposo-y': `${paseo.descanso.y}%`,
        '--paseo-camino': `path("${trazado}")`, '--paseo-duracion': `${paseo.segundos}s`, '--paseo-retardo': `-${paseo.desfase}s`,
      } as CSSProperties}
      onClick={(e) => {
        sfx.personaje(vecino)
        const inicio = Math.floor(azarConSemilla(`${dia(ahora)}|paseo|${vecino}`)() * paseo.frases.length)
        const frase = paseo.frases[(inicio + toques.current++) % paseo.frases.length]
        globoEn(e, `${COMPANEROS[vecino].nombre}: «${frase}»`)
      }}>
      <img src={rutaCompanero(vecino, etapa, 'base')} alt="" draggable={false} className="relative block w-full" />
    </button>
  )
}

export function ArroyoEnMovimiento() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      <div className="barrio-arroyo absolute inset-0">
        <i /><i /><i /><i /><i />
      </div>
      <div className="barrio-cascada"><i /><i /><i /></div>
    </div>
  )
}

const HOJAS = [
  { x: 27, y: 5.5, giro: 32, segundos: 15, desfase: 3 },
  { x: 39, y: 8, giro: -16, segundos: 19, desfase: 12 },
  { x: 69, y: 6.5, giro: 55, segundos: 17, desfase: 9 },
  { x: 75, y: 31, giro: 70, segundos: 23, desfase: 5 },
  { x: 19, y: 78, giro: 15, segundos: 21, desfase: 16 },
]

export function HojasAlViento() {
  return (
    <div aria-hidden className="hojas-del-barrio pointer-events-none absolute inset-0">
      {HOJAS.map(({ x, y, giro, segundos, desfase }) => (
        <i key={x} style={{ left: `${x}%`, top: `${y}%`, '--hoja-giro': `${giro}deg`, animationDuration: `${segundos}s`, animationDelay: `-${desfase}s` } as CSSProperties} />
      ))}
    </div>
  )
}

export function VidaDeCasita({ vecino }: { vecino: CompaneroId }) {
  switch (vecino) {
    case 'tuerca':
      return (
        <span aria-hidden className="humo-de-chimenea">
          <i /><i /><i />
        </span>
      )
    case 'nox':
      return (
        <span aria-hidden className="calor-de-casita">
          <i /><i /><i />
        </span>
      )
    case 'tofu':
      return (
        <span aria-hidden className="maceta-inquieta">
          <img src={rutaArte('casa/tofu/objeto/maceta')} alt="" draggable={false} />
          <i />
        </span>
      )
    case 'bruma':
      return (
        <span aria-hidden className="estanque-de-casita">
          <i /><i />
          <img src={rutaArte('casa/bruma/objeto/barquito')} alt="" draggable={false} />
        </span>
      )
    default:
      return null
  }
}
