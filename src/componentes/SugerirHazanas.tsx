// Sugerencias de hazañas de un área para añadir a tu lista con un toque (cuando un vecino o un proyecto
// necesitan algo de un área que no tienes en tu lista).
import { useState } from 'react'
import { AREAS, UI, type AreaId } from '../contenido'
import type { Partida } from '../logica/partida'
import { anadirHazana, delCatalogoSinUsar } from '../logica/hazanas'
import { useJuego } from '../estado/juego'

export function SugerirHazanas({ partida, area, titulo }: { partida: Partida; area: AreaId; titulo?: string }) {
  const ajustar = useJuego((s) => s.ajustar)
  const [anadida, setAnadida] = useState<string | null>(null)
  const opciones = delCatalogoSinUsar(partida).filter((c) => c.area === area).slice(0, 3)
  if (anadida) return <p className="mt-2 text-[14px] font-semibold text-salvia-texto">{UI.sugerir.anadida(anadida)}</p>
  if (!opciones.length) return null
  return (
    <div className="mt-2">
      <div className="text-[13px] font-semibold text-texto-2">{titulo ?? UI.sugerir.titulo(AREAS[area].nombre)}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {opciones.map((c) => (
          <button key={c.id} type="button" onClick={() => { ajustar((p) => anadirHazana(p, c.id)); setAnadida(c.nombre) }}
            className="min-h-11 rounded-full border-2 border-dashed border-borde bg-fondo px-3 text-[14px] font-medium text-texto-2">+ {c.nombre}</button>
        ))}
      </div>
    </div>
  )
}
