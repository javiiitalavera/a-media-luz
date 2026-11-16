// El bosque: un mapa con un claro por mes. Cada compañero criado tiene su casita en su claro (el mes 1
// abajo); se entra a visitarlo y a seguir construyendo con lo que le sobró. Los claros vacíos esperan
// a los meses que vienen. El del mes en curso lleva a casa (si aún es huevo, se ve el huevo).
import { CLAROS, COMPANEROS, PROPORCION_MAPA, UI, type CompaneroId } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoDelMes, mesesDe } from '../logica/meses'
import { rutaArte } from '../arte/manifiesto'
import { Pantalla } from '../componentes/comunes'

export function Bosque({ partida, ahora, onVisitar, onCasa }: {
  partida: Partida; ahora: Date; onVisitar: (c: CompaneroId) => void; onCasa: () => void
}) {
  const meses = mesesDe(partida).slice(0, CLAROS.length)
  const enHuevo = estadoDelMes(partida, ahora) === 'huevo'
  return (
    <Pantalla>
      <button type="button" onClick={onCasa} className="-ml-2 min-h-11 px-2 font-semibold text-texto-2">‹ {UI.casa.alaCasa}</button>
      <h1 className="mt-1 mb-1 px-1 text-[28px] leading-tight font-bold">{UI.vecinos.titulo}</h1>
      <p className="mb-3 px-1 text-texto-2">{UI.vecinos.explicacion}</p>
      <div className="relative -mx-4 overflow-hidden" style={{ aspectRatio: String(PROPORCION_MAPA) }}>
        <img src={rutaArte('bosque/mapa')} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
        {meses.map((m, i) => {
          const claro = CLAROS[i]
          const actual = i === meses.length - 1
          const oculto = actual && enHuevo
          const nombre = oculto ? '?' : COMPANEROS[m.companero].nombre
          return (
            <button key={m.inicio} type="button" aria-label={`${UI.vecinos.mes(i + 1)} · ${nombre}`}
              onClick={() => (actual ? onCasa() : onVisitar(m.companero))}
              className="absolute flex flex-col items-center transition active:scale-95"
              style={{ left: `${claro.x}%`, top: `${claro.y}%`, width: `${claro.ancho * (oculto ? 0.6 : 1)}%`, transform: 'translate(-50%, -62%)' }}>
              <img src={rutaArte(oculto ? `huevo/${m.companero}/cerrado` : `casita/${m.companero}`)} alt=""
                className={`w-full ${oculto ? 'anim-mecer' : ''} drop-shadow-[0_3px_3px_rgba(63,42,58,0.35)]`} draggable={false} />
              <span className={`-mt-1 rounded-full px-2.5 py-0.5 text-[12px] leading-tight font-bold whitespace-nowrap shadow-sm ${actual ? 'bg-ambar text-tinta' : 'bg-tarjeta text-texto'}`}>
                {nombre}
              </span>
            </button>
          )
        })}
      </div>
    </Pantalla>
  )
}
