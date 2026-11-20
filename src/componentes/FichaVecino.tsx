import { createPortal } from 'react-dom'
import { AREAS, COMPANEROS, HISTORIAS, MATERIALES, UI, type CompaneroId } from '../contenido'
import type { Partida } from '../logica/partida'
import { progreso } from '../logica/etapas'

export function FichaVecino({ partida, c, ahora, enHuevo, faltaHuevo, onCerrar }: {
  partida: Partida; c: CompaneroId; ahora: Date
  enHuevo: boolean; faltaHuevo: number; onCerrar: () => void
}) {
  const v = COMPANEROS[c]
  const h = HISTORIAS[c]
  const area = AREAS[v.area]
  const g = progreso(partida, c, ahora)
  const F = UI.ficha

  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] flex-col justify-end bg-[#2e2030]/45" onClick={onCerrar}>
      <section role="dialog" aria-label={enHuevo ? UI.casa.huevo : v.nombre} onClick={(e) => e.stopPropagation()}
        className="anim-hoja max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-fondo px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-borde" />
        {enHuevo ? (
          <>
            <h2 className="text-[24px] font-bold">{UI.casa.huevo}</h2>
            <p className="mt-2 text-[15px] text-texto-2">{F.huevo(faltaHuevo)}</p>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[24px] leading-tight font-bold">{v.nombre}</h2>
                <p className="text-[14px] text-texto-3">{h?.especie ?? v.humor}</p>
              </div>
              <span className="mt-1 rounded-full bg-hundido px-3 py-1 text-[13px] font-bold text-texto-2">{UI.casa.nivel(g.nivel)}</span>
            </div>

            <p className="mt-3 text-[15px] font-semibold text-texto-2">{F.retoYMaterial(area.nombre, MATERIALES[v.area].nombre)}</p>
            <div className="mt-4 rounded-3xl bg-tarjeta p-3.5">
              {g.siguiente ? (
                <>
                  <div className="text-[14px] font-bold">{F.paraNivel(g.siguiente.nivel)}</div>
                  <Barra texto={F.dias(g.dias, g.siguiente.dias, area.nombre)} v={g.dias / g.siguiente.dias} />
                  <p className="mt-2 text-[13px] text-texto-3">{F.comoSube}</p>
                </>
              ) : <p className="text-[15px]">{F.alMaximo}</p>}
            </div>

            {h && <p className="mt-4 px-1 text-[14px] leading-relaxed text-texto-2 italic">{h.historia}</p>}
          </>
        )}
        <button type="button" onClick={onCerrar} className="mt-3 min-h-11 w-full font-semibold text-texto-3">{UI.casa.cerrar}</button>
      </section>
    </div>,
    document.body,
  )
}

function Barra({ texto, v }: { texto: string; v: number }) {
  return (
    <div className="mt-2">
      <div className="text-[13px] text-texto-2">{texto}</div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-hundido">
        <div className="h-full rounded-full bg-[#f08a3c]" style={{ width: `${Math.min(1, v) * 100}%` }} />
      </div>
    </div>
  )
}
