// Inicio (solo la primera vez): llega el primer huevo y se marcan las acciones habituales.
import { useEffect, useState } from 'react'
import { ACCIONES, AREAS, ORDEN_AREAS, UI, type CompaneroId } from '../contenido'
import { rutaArte } from '../arte/manifiesto'
import { useJuego } from '../estado/juego'
import { BotonPrincipal, Pantalla } from '../componentes/comunes'

/** El primer huevo es siempre el de Nox (el único compañero con todo su arte, de momento). */
const PRIMERO: CompaneroId = 'nox'

export function Inicio() {
  const empezar = useJuego((s) => s.empezar)
  const [paso, setPaso] = useState<1 | 2>(1)
  const [habituales, setHabituales] = useState<string[]>([])
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
          <div className="mt-5 flex flex-col gap-5">
            {ORDEN_AREAS.map((area) => (
              <section key={area}>
                <h2 className="mb-2 px-1 text-[15px] font-bold">{AREAS[area].nombre}</h2>
                <div className="flex flex-wrap gap-2">
                  {ACCIONES.filter((a) => a.area === area).map((a) => {
                    const activa = habituales.includes(a.id)
                    return (
                      <button
                        key={a.id}
                        type="button"
                        aria-pressed={activa}
                        onClick={() => alternar(a.id)}
                        className={`min-h-11 rounded-full border-2 px-4 text-[15px] ${activa ? 'border-salvia bg-salvia font-semibold text-tinta' : 'border-borde bg-tarjeta font-medium'}`}
                      >
                        {activa && '✓ '}{a.nombre}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
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
