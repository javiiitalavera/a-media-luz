// El bosque: un mapa a pantalla completa con un claro por mes. Cada compañero criado tiene su casita en
// su claro (el mes 1 abajo); se entra a visitarlo y a seguir construyendo con lo que le sobró. Los claros
// vacíos esperan a los meses que vienen. El mapa llena la pantalla; lo que no cabe a los lados se ve
// deslizando con el dedo (empieza centrado).
import { useLayoutEffect, useRef, useState } from 'react'
import { CLAROS, COMPANEROS, PROPORCION_MAPA, UI, type CompaneroId } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoDelMes, mesesDe } from '../logica/meses'
import { rutaArte } from '../arte/manifiesto'

export function Bosque({ partida, ahora, onVisitar, onCasa }: {
  partida: Partida; ahora: Date; onVisitar: (c: CompaneroId) => void; onCasa: () => void
}) {
  const meses = mesesDe(partida).slice(0, CLAROS.length)
  const enHuevo = estadoDelMes(partida, ahora) === 'huevo'
  const caja = useRef<HTMLDivElement>(null)
  const [t, setT] = useState({ w: 390, h: 844 })
  useLayoutEffect(() => {
    const el = caja.current
    if (!el) return
    const medir = () => setT({ w: el.clientWidth, h: el.clientHeight })
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // Cubre la pantalla: si el mapa es más ancho, sobra por los lados; si es más alto, por arriba.
  const ancho = Math.max(t.w, t.h * PROPORCION_MAPA)
  const alto = ancho / PROPORCION_MAPA
  useLayoutEffect(() => {
    const el = caja.current
    if (el) { el.scrollLeft = (ancho - t.w) / 2; el.scrollTop = alto - t.h }
  }, [ancho, alto, t.w, t.h])

  return (
    <main className="relative mx-auto h-dvh max-w-[430px] overflow-hidden bg-[#5c7a4a]">
      <div ref={caja} className="sin-barras absolute inset-0 overflow-auto overscroll-contain">
        <div className="relative" style={{ width: ancho, height: alto }}>
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
      </div>

      {/* Arriba, como en casa: el título y la vuelta a casa. */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-[max(12px,calc(env(safe-area-inset-top)+32px))]">
        <h1 className="flex min-h-11 items-center rounded-2xl bg-tarjeta/85 px-3.5 text-[18px] font-bold shadow-sm backdrop-blur-sm">{UI.vecinos.titulo}</h1>
        <button type="button" onClick={onCasa} className="pointer-events-auto min-h-11 shrink-0 whitespace-nowrap rounded-full bg-tarjeta/85 px-4 text-sm font-semibold text-texto-2 shadow-sm backdrop-blur-sm">
          {UI.casa.alaCasa} ›
        </button>
      </header>
    </main>
  )
}
