// Ficha de un vecino (se abre al tocar su nombre en casa): quién es, cuánto le falta para crecer,
// cómo está, su casa y sus historias. Sustituye al antiguo «rincón».
import { createPortal } from 'react-dom'
import { AREAS, COMPANEROS, HISTORIAS, UI, type CompaneroId } from '../contenido'
import { SITUACIONES } from '../contenido/situaciones'
import type { Partida } from '../logica/partida'
import { progreso } from '../logica/etapas'
import { proyectosDe, construido } from '../logica/casa'
import { cronicas } from '../logica/situaciones'

export function FichaVecino({ partida, c, ahora, fase, faltanParaArreglar, enHuevo, faltaHuevo, onCerrar }: {
  partida: Partida; c: CompaneroId; ahora: Date; fase: number; faltanParaArreglar: number
  enHuevo: boolean; faltaHuevo: number; onCerrar: () => void
}) {
  const v = COMPANEROS[c]
  const h = HISTORIAS[c]
  const area = AREAS[v.area]
  const g = progreso(partida, c, ahora)
  const proyectos = proyectosDe(c)
  const hechos = proyectos.filter((o) => construido(partida, o.id))
  const siguiente = proyectos.find((o) => !construido(partida, o.id))
  const suyas = new Set(SITUACIONES.filter((s) => s.requiere.vecinos.includes(c)).map((s) => s.id))
  const historias = cronicas(partida).filter((x) => suyas.has(x.id))
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
                <p className="text-[14px] text-texto-3">{h?.especie ?? v.humor} · {area.nombre}</p>
              </div>
              <span className="mt-1 rounded-full bg-hundido px-3 py-1 text-[13px] font-bold text-texto-2">{UI.casa.etapas[g.etapa]}</span>
            </div>

            {/* Crecer */}
            <div className="mt-4 rounded-3xl bg-tarjeta p-3.5">
              {g.siguiente ? (
                <>
                  <div className="text-[14px] font-bold">{F.paraSer(UI.casa.etapas[g.etapa + 1].toLowerCase())}</div>
                  <Barra texto={F.dias(g.dias, g.siguiente.dias, area.nombre)} v={g.dias / g.siguiente.dias} />
                  <Barra texto={F.proyectos(g.proyectos, g.siguiente.proyectos)} v={g.proyectos / g.siguiente.proyectos} />
                </>
              ) : <p className="text-[15px]">{F.yaAdulto}</p>}
            </div>

            {/* Cómo está (solo el último en llegar se descuida) */}
            {fase > 0 && (
              <div className="mt-2 rounded-3xl bg-tarjeta p-3.5">
                <div className="text-[14px] font-bold text-peligro">{UI.bosque.fases[fase]}</div>
                <p className="mt-0.5 text-[14px] text-texto-2">{F.seLePasa(faltanParaArreglar, area.nombre)}</p>
              </div>
            )}

            {/* Su casa */}
            <div className="mt-2 rounded-3xl bg-tarjeta p-3.5">
              <div className="text-[14px] font-bold">{F.casa}</div>
              <p className="mt-0.5 text-[14px] text-texto-2">{hechos.length ? hechos.map((o) => o.nombre).join(' · ') : F.nadaAun}</p>
              {siguiente && <p className="mt-1 text-[13px] text-texto-3">{F.siguiente(siguiente.nombre)}</p>}
            </div>

            {/* Historias */}
            {historias.length > 0 && (
              <div className="mt-2 rounded-3xl bg-tarjeta p-3.5">
                <div className="text-[14px] font-bold">{F.historias}</div>
                <ul className="mt-1 flex flex-col gap-1">
                  {historias.map((x) => (
                    <li key={x.id} className="flex items-center gap-2 text-[14px] text-texto-2">
                      <span className="flex-1">{x.titulo}</span>
                      {x.enMarcha && <span className="rounded-full bg-ambar px-2 py-0.5 text-[11px] font-bold text-tinta">{UI.barrio.enMarcha}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
