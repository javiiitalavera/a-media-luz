// El barrio (docs/diseno-vecindario.md): el mapa con la casita de cada vecino en su parcela, lo construido
// en común (el puente) y las huellas de las historias. Es la pantalla principal cuando hay dos vecinos.
// El mapa ocupa toda la pantalla, como la casa: se ajusta al alto (sin cortar arriba ni abajo) y se recortan
// los lados por igual. Las casitas que quedarían cortadas en el borde se acercan lo justo hacia dentro.
import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { COMPANEROS, MATERIALES, ORDEN_AREAS, PARCELAS, PASO_ARROYO, PROPORCION_BARRIO, PROYECTOS_BARRIO, UI, type AreaId, type CompaneroId } from '../contenido'
import type { Partida } from '../logica/partida'
import { construido, disponibles, faltan } from '../logica/casa'
import { estadoDelMes, mesesDe } from '../logica/meses'
import { nacido } from '../logica/etapas'
import { barrioAbierto, huellasEn } from '../logica/situaciones'
import { rutaArte } from '../arte/manifiesto'
import { useJuego } from '../estado/juego'

export function Barrio({ partida, ahora, onCasa, onVolver }: {
  partida: Partida; ahora: Date; onCasa: (c: CompaneroId) => void; onVolver?: () => void
}) {
  const caja = useRef<HTMLDivElement>(null)
  const [t, setT] = useState({ w: 390, h: 844 })
  const [hoja, setHoja] = useState(false)
  const [nota, setNota] = useState<string | null>(null)
  useLayoutEffect(() => {
    const el = caja.current
    if (!el) return
    const medir = () => setT({ w: el.clientWidth, h: el.clientHeight })
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // Cubre la pantalla entera; en móviles (más altos que el mapa) se ajusta al alto y se centra.
  const ancho = Math.max(t.w, t.h * PROPORCION_BARRIO)
  const alto = ancho / PROPORCION_BARRIO
  const arriba = (t.h - alto) / 2
  const izquierda = (t.w - ancho) / 2
  /** Posición horizontal (en % del mapa) para que algo de `anchoPct` % quepa entero en pantalla. */
  const dentro = (x: number, anchoPct: number) => {
    const mitad = (anchoPct / 100) * ancho / 2 + 4
    const px = Math.min(Math.max((x / 100) * ancho, -izquierda + mitad), -izquierda + t.w - mitad)
    return (px / ancho) * 100
  }
  const vecinos = mesesDe(partida)
  const ultimoEnHuevo = estadoDelMes(partida, ahora) === 'huevo'
  const mat = disponibles(partida, ahora)
  const abierto = barrioAbierto(partida, ahora)
  const listos = abierto && PROYECTOS_BARRIO.some((b) => !construido(partida, b.id) && Object.keys(faltan(partida, b, ahora)).length === 0)

  return (
    <main ref={caja} className="relative mx-auto h-dvh max-w-[430px] overflow-hidden bg-[#5c7a4a]">
      <div className="absolute" style={{ top: arriba, left: izquierda, width: ancho, height: alto }}>
        <img src={rutaArte('barrio/mapa')} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
        {construido(partida, 'puente') && (
          <img src={rutaArte('huella/puente')} alt={UI.barrio.puente} className="anim-brotar absolute" draggable={false}
            style={{ left: `${PASO_ARROYO.x}%`, top: `${PASO_ARROYO.y}%`, width: `${PASO_ARROYO.ancho}%`, transform: 'translate(-50%, -60%)' }} />
        )}
        {huellasEn(partida, 'barrio').map((h) => (
          <button key={h.id} type="button" onClick={() => h.toque && setNota(h.toque)} aria-label={h.texto?.replace('\n', ' ') ?? h.arte}
            className="absolute before:absolute before:-inset-2 before:content-['']" style={{ left: `${h.sitio.x}%`, top: `${h.sitio.y}%`, width: `${h.sitio.ancho}%`, transform: 'translate(-50%, -100%)' }}>
            <img src={rutaArte(`huella/${h.arte}`)} alt="" className="block w-full" draggable={false} />
            {h.texto && (
              <span className="pointer-events-none absolute inset-x-[10%] top-[14%] flex h-[34%] items-center justify-center text-center leading-[1.05] font-bold whitespace-pre-line text-[#5a3424]"
                style={{ fontSize: Math.max(6, (h.sitio.ancho / 100) * ancho * 0.12) }}>{h.texto}</span>
            )}
          </button>
        ))}
        {vecinos.slice(0, PARCELAS.length).map((m, i) => {
          const p = PARCELAS[i]
          const huevo = i === vecinos.length - 1 && ultimoEnHuevo && !nacido(partida, m.companero, ahora)
          const nombre = huevo ? '?' : COMPANEROS[m.companero].nombre
          const anchoCasa = p.ancho * (huevo ? 0.45 : 0.82)
          return (
            <button key={m.companero} type="button" aria-label={huevo ? UI.casa.huevo : UI.barrio.casaDe(nombre)} onClick={() => onCasa(m.companero)}
              className="absolute flex flex-col items-center transition active:scale-95"
              style={{ left: `${dentro(p.x, anchoCasa)}%`, top: `${p.y}%`, width: `${anchoCasa}%`, transform: 'translate(-50%, -68%)' }}>
              <img src={rutaArte(huevo ? `huevo/${m.companero}/cerrado` : `casita/${m.companero}`)} alt=""
                className={`w-full drop-shadow-[0_3px_3px_rgba(63,42,58,0.35)] ${huevo ? 'anim-mecer' : ''}`} draggable={false} />
              <span className="-mt-1 rounded-full bg-tarjeta px-2.5 py-0.5 text-[12px] leading-tight font-bold whitespace-nowrap text-texto shadow-sm">{nombre}</span>
            </button>
          )
        })}
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-[max(12px,calc(env(safe-area-inset-top)+32px))]">
        <h1 className="flex min-h-11 items-center rounded-2xl bg-tarjeta/85 px-3.5 text-[18px] font-bold shadow-sm backdrop-blur-sm">{UI.barrio.titulo}</h1>
        {onVolver && (
          <button type="button" onClick={onVolver} className="pointer-events-auto min-h-11 shrink-0 whitespace-nowrap rounded-full bg-tarjeta/85 px-4 text-sm font-semibold text-texto-2 shadow-sm backdrop-blur-sm">
            ‹ {UI.casa.alaCasa}
          </button>
        )}
      </header>

      {nota && (
        <div role="status" className="animate-entrar absolute inset-x-0 top-[calc(max(12px,calc(env(safe-area-inset-top)+32px))+64px)] z-30 flex justify-center px-4" onClick={() => setNota(null)}>
          <span className="max-w-[340px] rounded-2xl bg-tarjeta/95 px-4 py-2.5 text-center text-[15px] leading-snug shadow-lg">{nota}</span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-[calc(78px+env(safe-area-inset-bottom))] z-30 px-3">
        <div className="rounded-3xl bg-tarjeta/92 px-3 py-2.5 shadow-lg backdrop-blur-sm">
          <Materiales mat={mat} />
          <button type="button" onClick={() => setHoja(true)}
            className={`mt-2 flex min-h-11 w-full items-center justify-center rounded-2xl text-[15px] font-bold active:scale-[0.98] ${listos ? 'bg-ambar text-tinta' : 'border-2 border-borde text-texto-2'}`}>
            {UI.casa.proyectosBarrio}
          </button>
        </div>
      </div>

      {hoja && <HojaBarrio partida={partida} ahora={ahora} abierto={abierto} onCerrar={() => setHoja(false)} />}
    </main>
  )
}

function Materiales({ mat }: { mat: Record<AreaId, number> }) {
  return (
    <ul className="grid grid-cols-5 gap-1">
      {ORDEN_AREAS.map((a) => (
        <li key={a} className="flex flex-col items-center">
          <span className="flex items-center gap-1 text-[18px] leading-none font-bold">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: MATERIALES[a].color }} />{mat[a]}
          </span>
          <span className="mt-1 text-[11px] font-medium text-texto-3">{MATERIALES[a].nombre}</span>
        </li>
      ))}
    </ul>
  )
}

function HojaBarrio({ partida, ahora, abierto, onCerrar }: { partida: Partida; ahora: Date; abierto: boolean; onCerrar: () => void }) {
  const construirBarrio = useJuego((s) => s.construirBarrio)
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] flex-col justify-end bg-[#2e2030]/45" onClick={onCerrar}>
      <section role="dialog" aria-label={UI.casa.proyectosBarrio} onClick={(e) => e.stopPropagation()}
        className="anim-hoja max-h-[85dvh] overflow-y-auto rounded-t-[28px] bg-fondo px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-borde" />
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold">{UI.casa.proyectosBarrio}</h2>
          <button type="button" onClick={onCerrar} className="min-h-11 px-2 font-semibold text-texto-3">{UI.casa.cerrar}</button>
        </div>
        {!abierto && <p className="mt-1 text-[14px] text-texto-3">{UI.casa.barrioNecesita}</p>}
        <ul className="mt-3 flex flex-col gap-2.5">
          {PROYECTOS_BARRIO.map((b) => {
            const hecho = construido(partida, b.id)
            const f = faltan(partida, b, ahora)
            const puede = abierto && !hecho && Object.keys(f).length === 0
            return (
              <li key={b.id} className="flex items-center gap-3 rounded-3xl bg-tarjeta p-3">
                <img src={rutaArte(`huella/${b.id === 'puente' ? 'puente' : 'expediente'}`)} alt="" className="h-16 w-16 shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{b.nombre}</div>
                  <div className="text-[13px] leading-snug text-texto-3 italic">«{b.descripcion}»</div>
                  <div className="mt-1 text-[13px] leading-snug font-semibold text-salvia-texto">{b.abre}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(Object.entries(b.coste) as [AreaId, number][]).map(([a, n]) => (
                      <span key={a} className={`flex items-center gap-1 rounded-full bg-hundido px-2 py-0.5 text-[12px] font-semibold ${!hecho && f[a] ? 'text-peligro' : 'text-texto-2'}`}>
                        <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: MATERIALES[a].color }} />{n} {MATERIALES[a].nombre}
                      </span>
                    ))}
                  </div>
                </div>
                {hecho ? (
                  <span className="w-20 shrink-0 text-center text-[12px] font-semibold text-salvia-texto">{UI.barrio.hecho}</span>
                ) : (
                  <button type="button" disabled={!puede} onClick={() => { if (construirBarrio(b.id)) onCerrar() }}
                    className="min-h-11 w-20 shrink-0 rounded-2xl bg-ambar text-[14px] font-bold text-tinta disabled:bg-hundido disabled:text-texto-3">{UI.casa.construir}</button>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>,
    document.body,
  )
}
