// Detalle de un rincón del bosque.
import { AREAS, COMPANEROS, RITMOS, UI, type AreaId } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoRincon, metas } from '../logica/reglas'
import { dia, lunes } from '../logica/fechas'
import { BotonPrincipal, Pantalla, Tarjeta } from '../componentes/comunes'

export function Rincon({ partida, area, ahora, onVolver, onOfrenda }: {
  partida: Partida; area: AreaId; ahora: Date; onVolver: () => void; onOfrenda: () => void
}) {
  const info = AREAS[area]
  const c = COMPANEROS[info.companero]
  const r = estadoRincon(partida, area, ahora)
  const meta = metas(partida, ahora).find((m) => m.area === area && m.semana === lunes(dia(ahora)))
  return (
    <Pantalla>
      <button type="button" onClick={onVolver} className="-ml-2 min-h-11 px-2 font-semibold text-texto-2">‹ {UI.rincon.volver}</button>
      <div className="mt-2 px-1">
        <h1 className="text-[26px] leading-tight font-bold">{info.rincon}</h1>
        <div className="text-texto-3">{c.nombre} · {info.nombre}</div>
      </div>

      <Tarjeta className="mt-4">
        <div className="text-[13px] font-semibold text-texto-3">{UI.rincon.estado}</div>
        {!r.llegado ? (
          <p className="mt-1 text-lg font-semibold">{UI.bosque.dormido} · {UI.bosque.llegaCon(r.faltanParaLlegar)}</p>
        ) : (
          <>
            <p className={`mt-1 text-lg font-semibold ${r.fase > 0 ? 'text-peligro' : 'text-salvia-texto'}`}>{UI.bosque.fases[r.fase]}</p>
            <p className="mt-1 text-[15px] text-texto-2">
              {r.visitante ? UI.rincon.paraEcharVisitante(r.faltanParaArreglar)
                : r.fase > 0 ? UI.rincon.paraArreglar(r.faltanParaArreglar)
                : UI.rincon.seEstropeaEn(r.diasDeMargen)}
            </p>
            {r.robado && <p className="mt-1 text-[15px] text-texto-2">{UI.rincon.robado(r.robado.nombre)}</p>}
          </>
        )}
        <p className="mt-2 text-[13px] text-texto-3">{UI.bosque.crecimiento(r.grado)} · {UI.rincon.ritmo}: {RITMOS[partida.ritmos[area]].nombre}</p>
      </Tarjeta>

      {meta && (
        <Tarjeta className="mt-3">
          <div className="text-[13px] font-semibold text-texto-3">{UI.semana.titulo}</div>
          <p className="mt-1 font-semibold">{UI.semana.meta(meta.meta)} · {Math.min(meta.hechas, meta.meta)}/{meta.meta}</p>
          {meta.cumplida && meta.premio && <p className="text-[15px] text-salvia-texto">{UI.semana.premio(meta.premio.nombre)}</p>}
        </Tarjeta>
      )}

      <div className="mt-5">
        <BotonPrincipal onClick={onOfrenda}>{UI.bosque.hacerOfrenda}</BotonPrincipal>
      </div>
    </Pantalla>
  )
}
