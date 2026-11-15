// Elegir compañero (solo la primera vez).
import { useState } from 'react'
import { AREAS, COMPANEROS, ORDEN_COMPANEROS, UI, type CompaneroId } from '../contenido'
import { useJuego } from '../estado/juego'
import { BotonPrincipal, HuecoArte, Pantalla } from '../componentes/comunes'

export function Inicio() {
  const empezar = useJuego((s) => s.empezar)
  const [elegido, setElegido] = useState<CompaneroId>('nox')
  return (
    <Pantalla>
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
      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-fondo from-70% to-transparent px-4 pt-6 pb-[max(20px,env(safe-area-inset-bottom))]">
        <BotonPrincipal onClick={() => empezar(elegido)}>{UI.inicio.empezar(COMPANEROS[elegido].nombre)}</BotonPrincipal>
      </div>
    </Pantalla>
  )
}
