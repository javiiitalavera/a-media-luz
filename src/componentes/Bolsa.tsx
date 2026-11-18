// La bolsa de materiales en una sola línea compacta (punto de color + cantidad), con un botón a la derecha.
// Los nombres de los materiales se ven en la hoja de construir; aquí solo cuentan las cantidades.
import type { ReactNode } from 'react'
import { MATERIALES, ORDEN_AREAS, type AreaId } from '../contenido'
import { globoEn } from '../estado/globo'

export function BarraBolsa({ mat, boton, onBoton, resaltado, insignia }: {
  mat: Record<AreaId, number>; boton: string; onBoton: () => void; resaltado: boolean; insignia?: ReactNode
}) {
  const leer = ORDEN_AREAS.map((a) => `${mat[a]} ${MATERIALES[a].nombre.toLowerCase()}`).join(', ')
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-tarjeta/92 py-1 pr-1.5 pl-2 shadow-lg backdrop-blur-sm">
      <ul aria-label={leer} className="flex flex-1 items-center justify-between">
        {ORDEN_AREAS.map((a) => (
          <li key={a}>
            <button type="button" aria-label={`${mat[a]} ${MATERIALES[a].nombre}`} onClick={(e) => globoEn(e, MATERIALES[a].explicacion)}
              className="flex min-h-11 min-w-11 items-center justify-center gap-1 text-[16px] leading-none font-bold tabular-nums active:scale-95">
              <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: MATERIALES[a].color }} />{mat[a]}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={onBoton}
        className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[15px] font-bold active:scale-[0.97] ${
          resaltado ? 'bg-ambar text-tinta' : 'bg-hundido text-texto-2'}`}>
        {boton}{insignia}
      </button>
    </div>
  )
}
