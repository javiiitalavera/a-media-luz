// Inicio (solo la primera vez): llega el primer huevo y se eligen las hazañas de cada día.
import { useEffect, useState } from 'react'
import { ACCIONES, AREAS, HAZANAS_INICIALES, ORDEN_AREAS, UI, type AreaId, type CompaneroId } from '../contenido'
import { IconoArea } from '../componentes/IconoArea'
import { rutaArte } from '../arte/manifiesto'
import { useJuego } from '../estado/juego'
import { BotonPrincipal, Pantalla } from '../componentes/comunes'

/** El primer huevo es siempre el de Nox (el único compañero con todo su arte, de momento). */
const PRIMERO: CompaneroId = 'nox'

export function Inicio() {
  const empezar = useJuego((s) => s.empezar)
  const [paso, setPaso] = useState<1 | 2>(1)
  const [habituales, setHabituales] = useState<string[]>(HAZANAS_INICIALES)
  const [todas, setTodas] = useState(false)
  useEffect(() => { window.scrollTo(0, 0) }, [paso])
  const alternar = (id: string) => setHabituales((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]))

  return (
    <Pantalla>
      {paso === 1 ? (
        <>
          <h1 className="px-1 text-[28px] leading-tight font-bold">{UI.inicio.huevoTitulo}</h1>
          <p className="mt-2 px-1 text-texto-2">{UI.inicio.huevoExplicacion}</p>
          <div className="mt-8 flex justify-center">
            <img src={rutaArte(`huevo/${PRIMERO}/cerrado`)} alt="" className="anim-mecer w-[58%] max-w-[240px]" draggable={false} />
          </div>
        </>
      ) : (
        <>
          <button type="button" onClick={() => setPaso(1)} className="-ml-2 min-h-11 px-2 font-semibold text-texto-2">‹ {UI.inicio.atras}</button>
          <h1 className="mt-1 px-1 text-[28px] leading-tight font-bold">{UI.inicio.habitualesTitulo}</h1>
          <p className="mt-2 px-1 text-texto-2">{UI.inicio.habitualesExplicacion}</p>
          {!todas ? (
            <div className="mt-5 flex flex-col gap-2">
              {ACCIONES.filter((a) => HAZANAS_INICIALES.includes(a.id) || habituales.includes(a.id)).map((a) => (
                <Opcion key={a.id} nombre={a.nombre} area={a.area} activa={habituales.includes(a.id)} onToque={() => alternar(a.id)} />
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-5">
              {ORDEN_AREAS.map((area) => (
                <section key={area}>
                  <h2 className="mb-2 flex items-center gap-1.5 px-1 text-[15px] font-bold"><IconoArea area={area} pequeno />{AREAS[area].nombre}</h2>
                  <div className="flex flex-col gap-2">
                    {ACCIONES.filter((a) => a.area === area).map((a) => (
                      <Opcion key={a.id} nombre={a.nombre} area={a.area} activa={habituales.includes(a.id)} onToque={() => alternar(a.id)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          <button type="button" onClick={() => setTodas(!todas)} className="mt-3 min-h-11 w-full rounded-2xl text-[15px] font-semibold text-coral-texto">
            {todas ? UI.arranque.verMenos : UI.arranque.verTodas}
          </button>
          <p className="mt-1 px-1 text-center text-[13px] text-texto-3">{UI.arranque.cambiarLuego}</p>
        </>
      )}
      <div className="sticky bottom-0 -mx-4 mt-4 bg-gradient-to-t from-fondo from-70% to-transparent px-4 pt-6 pb-[max(20px,env(safe-area-inset-bottom))]">
        {paso === 1 ? (
          <BotonPrincipal onClick={() => setPaso(2)}>{UI.inicio.siguiente}</BotonPrincipal>
        ) : (
          <BotonPrincipal onClick={() => empezar(PRIMERO, habituales)}>{UI.inicio.empezarHuevo}</BotonPrincipal>
        )}
      </div>
    </Pantalla>
  )
}

function Opcion({ nombre, area, activa, onToque }: { nombre: string; area: AreaId; activa: boolean; onToque: () => void }) {
  return (
    <button type="button" aria-pressed={activa} onClick={onToque}
      className={`flex min-h-[56px] w-full items-center gap-3 rounded-2xl border-2 px-3 text-left transition ${activa ? 'border-salvia bg-tarjeta' : 'border-borde bg-tarjeta/60'}`}>
      <IconoArea area={area} />
      <span className="flex-1">
        <span className="block text-[16px] font-semibold">{nombre}</span>
        <span className="block text-[13px] text-texto-3">{AREAS[area].nombre}</span>
      </span>
      <span aria-hidden className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${activa ? 'bg-salvia text-tinta' : 'border-2 border-borde'}`}>
        {activa && <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
      </span>
    </button>
  )
}
