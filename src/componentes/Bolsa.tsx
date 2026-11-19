// Los materiales que tienes (en la hoja de construir y en la de proyectos del barrio). Al tocar uno,
// un globo explica de dónde sale y para qué sirve.
import { MATERIALES, ORDEN_AREAS, type AreaId } from '../contenido'
import { globoEn } from '../estado/globo'
import { IconoMaterial } from './IconoMaterial'

export function Materiales({ mat, falta }: { mat: Record<AreaId, number>; falta?: Partial<Record<AreaId, number>> }) {
  return (
    <ul className="grid grid-cols-5 gap-1">
      {ORDEN_AREAS.map((a) => (
        <li key={a}>
          <button type="button" aria-label={`${mat[a]} ${MATERIALES[a].nombre}`} onClick={(e) => globoEn(e, MATERIALES[a].explicacion)}
            className="flex min-h-11 w-full flex-col items-center justify-center rounded-xl active:bg-hundido/60">
            <span className="flex items-center gap-1 text-[18px] leading-none font-bold tabular-nums">
              <IconoMaterial area={a} tam={17} />
              <span className={falta?.[a] ? 'text-peligro' : ''}>{mat[a]}</span>
            </span>
            <span className="mt-1 text-[11px] font-medium text-texto-3">{MATERIALES[a].nombre}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
