// La bolsa de materiales en una sola línea compacta (punto de color + cantidad), con un botón a la derecha.
// Los nombres de los materiales se ven en la hoja de construir; aquí solo cuentan las cantidades.
import type { ReactNode } from 'react'
import { MATERIALES, ORDEN_AREAS, type AreaId } from '../contenido'

export function BarraBolsa({ mat, boton, onBoton, resaltado, insignia }: {
  mat: Record<AreaId, number>; boton: string; onBoton: () => void; resaltado: boolean; insignia?: ReactNode
}) {
  const leer = ORDEN_AREAS.map((a) => `${mat[a]} ${MATERIALES[a].nombre.toLowerCase()}`).join(', ')
  return (
    <div className="flex items-center gap-2 rounded-full bg-tarjeta/92 py-1.5 pr-1.5 pl-3.5 shadow-lg backdrop-blur-sm">
      <ul aria-label={leer} className="flex flex-1 items-center justify-between gap-1">
        {ORDEN_AREAS.map((a) => (
          <li key={a} aria-hidden className="flex items-center gap-1 text-[16px] leading-none font-bold tabular-nums">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: MATERIALES[a].color }} />{mat[a]}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onBoton}
        className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-[15px] font-bold active:scale-[0.97] ${
          resaltado ? 'bg-ambar text-tinta' : 'bg-hundido text-texto-2'}`}>
        {boton}{insignia}
      </button>
    </div>
  )
}
