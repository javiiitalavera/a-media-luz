// Inicio (solo la primera vez): elegir compañero y marcar las acciones habituales.
import { useEffect, useState } from 'react'
import { ACCIONES, AREAS, COMPANEROS, ORDEN_AREAS, ORDEN_COMPANEROS, UI, type CompaneroId } from '../contenido'
import { useJuego } from '../estado/juego'
import { BotonPrincipal, HuecoArte, Pantalla } from '../componentes/comunes'

export function Inicio() {
  const empezar = useJuego((s) => s.empezar)
  const [paso, setPaso] = useState<1 | 2>(1)
  const [elegido, setElegido] = useState<CompaneroId>('nox')
  const [habituales, setHabituales] = useState<string[]>([])
  useEffect(() => { window.scrollTo(0, 0) }, [paso])
  const alternar = (id: string) => setHabituales((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]))

  return (
    <Pantalla>
      {paso === 1 ? (
        <>
          <h1 className="px-1 text-[28px] leading-tight font-bold">{UI.inicio.titulo}</h1>
          <p className="mt-2 px-1 text-texto-2">{UI.inicio.explicacion}</p>
          <div className="mt-5 flex flex-col gap-3">
            {ORDEN_COMPANEROS.map((id) => {
              const c = COMPANEROS[id]
              const activo = id === elegido
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setElegido(id)}
                  className={`flex items-center gap-3 rounded-3xl border-[3px] bg-tarjeta p-3 text-left transition ${activo ? 'border-ambar' : 'border-transparent'}`}
                >
                  <HuecoArte clave={`companero/${id}/base`} alt={c.nombre} className="h-16 w-16 shrink-0" />
                  <span>
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-xl font-bold">{c.nombre}</span>
                      <span className="text-[13px] font-semibold text-coral-texto">{c.humor}</span>
                    </span>
                    <span className="mt-0.5 block text-[15px] leading-snug text-texto-2">{c.presentacion}</span>
                    <span className="mt-0.5 block text-[13px] text-texto-3">{AREAS[c.area].nombre} · {AREAS[c.area].descripcion}</span>
                  </span>
                </button>
              )
            })}
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
          <BotonPrincipal onClick={() => empezar(elegido, habituales)}>{UI.inicio.empezar(COMPANEROS[elegido].nombre)}</BotonPrincipal>
        )}
      </div>
    </Pantalla>
  )
}
