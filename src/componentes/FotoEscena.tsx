// Pinta una foto del Álbum a partir de la escena guardada (componentes/momentos), con el arte de siempre:
// un recorte cuadrado de la casa alrededor del vecino, o del barrio alrededor del puente.
import type { CSSProperties } from 'react'
import { ESCENAS, OBJETOS_CASA, PARCELAS, PASO_ARROYO, PROPORCION_BARRIO, type CompaneroId } from '../contenido'
import { colocarCasita } from '../logica/mapaBarrio'
import { GREGORIO_EN_NOX, sitioVisita } from '../contenido/casa'
import { HUELLAS } from '../contenido/situaciones'
import { rutaArte, rutaCompanero } from '../arte/manifiesto'
import type { EscenaFoto } from '../logica/momentos'

const TINTE: Record<EscenaFoto['momentoDia'], string> = {
  amanecer: 'bg-[#ffcfb8] opacity-40', mediodia: 'opacity-0', atardecer: 'bg-[#ff9f7a] opacity-35', noche: 'bg-[#3b2c63] opacity-60',
}

/** Algo colocado en la escena: centro horizontal y pies (en %), ancho en % del ancho. */
const pie = (x: number, y: number, ancho: number, extra: CSSProperties = {}): CSSProperties =>
  ({ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${ancho}%`, transform: 'translate(-50%, -100%)', ...extra })

export function FotoEscena({ e }: { e: EscenaFoto }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-hundido" style={{ containerType: 'inline-size' }}>
      {e.lugar === 'barrio' ? <Barrio e={e} /> : <Casa e={e} c={e.lugar} />}
    </div>
  )
}

function Casa({ e, c }: { e: EscenaFoto; c: CompaneroId }) {
  const esc = ESCENAS[c]
  if (!esc) return null
  // Recorte cuadrado algo acercado (ZOOM), centrado en el vecino y con sus pies un poco por debajo del centro.
  const ZOOM = 1.3
  const altoRel = (100 * esc.proporcion) / ZOOM // alto del cuadrado en % del alto del fondo
  const arriba = Math.min(Math.max(esc.pies.y + 7 - altoRel, 0), 100 - altoRel)
  const izquierda = Math.min(Math.max(50 - esc.pies.x * ZOOM, 100 - ZOOM * 100), 0)
  const objetos = OBJETOS_CASA.filter((o) => e.objetos.includes(o.id) && rutaArte(`casa/${o.companero}/objeto/${o.id}`))
  const aspiradora = OBJETOS_CASA.find((o) => o.id === 'aspiradora')!
  const capas: { y: number; nodo: React.ReactNode }[] = [
    ...objetos.map((o) => ({ y: o.sitio.colgado ? 0 : o.sitio.y, nodo: (
      <img key={o.id} src={rutaArte(`casa/${o.companero}/objeto/${o.id}`)} alt="" draggable={false}
        style={o.sitio.colgado ? { position: 'absolute', left: `${o.sitio.x}%`, top: `${o.sitio.y}%`, width: `${o.sitio.ancho}%`, transform: 'translateX(-50%)' } : pie(o.sitio.x, o.sitio.y, o.sitio.ancho)} />
    ) })),
    { y: esc.pies.y, nodo: <img key="vecino" src={rutaCompanero(c, e.etapa, e.cara)} alt="" draggable={false} style={pie(esc.pies.x, esc.pies.y, esc.anchos[e.etapa])} /> },
  ]
  if (e.gregorio) {
    const s = c === 'tuerca' ? aspiradora.sitio : GREGORIO_EN_NOX
    capas.push({ y: s.y, nodo: <img key="gregorio" src={rutaArte('casa/tuerca/objeto/aspiradora')} alt="" draggable={false} style={pie(s.x, s.y, s.ancho)} /> })
  }
  const v = e.visita && sitioVisita(c, e.visita)
  if (e.visita && v) capas.push({ y: v.y, nodo: <img key="visita" src={rutaCompanero(e.visita, 0, 'contento')} alt="" draggable={false} style={pie(v.x, v.y, v.ancho)} /> })
  return (
    <div className="absolute" style={{ width: `${ZOOM * 100}%`, left: `${izquierda}%`, aspectRatio: `${esc.proporcion}`, top: `${(-arriba * ZOOM) / esc.proporcion}%` }}>
      <img src={rutaArte(`casa/${c}/fondo`)} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
      <Huellas ids={e.huellas} zoom={ZOOM} />
      {capas.sort((a, b) => a.y - b.y).map((x) => x.nodo)}
      <div aria-hidden className={`absolute inset-0 mix-blend-multiply ${TINTE[e.momentoDia]}`} />
    </div>
  )
}

function Barrio({ e }: { e: EscenaFoto }) {
  const altoRel = 100 * PROPORCION_BARRIO
  const arriba = Math.min(Math.max(PASO_ARROYO.y + 14 - altoRel, 0), 100 - altoRel)
  return (
    <div className="absolute left-0 w-full" style={{ aspectRatio: `${PROPORCION_BARRIO}`, top: `${-arriba / PROPORCION_BARRIO}%` }}>
      <img src={rutaArte('barrio/mapa')} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
      {e.objetos.includes('puente') && (
        <img src={rutaArte('barrio/puente')} alt="" draggable={false}
          style={{ position: 'absolute', left: `${PASO_ARROYO.x}%`, top: `${PASO_ARROYO.y}%`, width: `${PASO_ARROYO.ancho}%`, translate: '-50% -50%', rotate: `${PASO_ARROYO.giro}deg` }} />
      )}
      <Huellas ids={e.huellas} />
      {(e.vecinos ?? []).map((c, i) => {
        const parcela = PARCELAS[i]
        const arte = rutaArte(`casita/${c}`)
        if (!parcela || !arte) return null
        const { x, y, ancho } = colocarCasita(parcela, c)
        return <img key={c} src={arte} alt="" draggable={false}
          style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${ancho}%` }} />
      })}
      <div aria-hidden className={`absolute inset-0 mix-blend-multiply ${TINTE[e.momentoDia]}`} />
    </div>
  )
}

function Huellas({ ids, zoom = 1 }: { ids: string[]; zoom?: number }) {
  return (
    <>
      {HUELLAS.filter((h) => ids.includes(h.id)).map((h) => (
        <div key={h.id} style={pie(h.sitio.x, h.sitio.y, h.sitio.ancho)}>
          <img src={rutaArte(`huella/${h.arte}`)} alt="" className="block w-full" draggable={false} />
          {h.texto && (
            <span className="absolute inset-x-[12%] top-[14%] flex h-[34%] items-center justify-center text-center leading-[1.05] font-bold whitespace-pre-line text-[#5a3424]"
              style={{ fontSize: `${h.sitio.ancho * (h.textoCorto ? 0.17 : 0.12) * zoom}cqw` }}>{h.textoCorto ?? h.texto}</span>
          )}
        </div>
      ))}
    </>
  )
}
