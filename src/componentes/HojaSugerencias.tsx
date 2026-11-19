// Revisar el cuestionario y ver qué retos te sugerimos ahora (desde Retos o Ajustes).
import { createPortal } from 'react-dom'
import { AREAS, ACCIONES, UI } from '../contenido'
import { TEXTOS_CUESTIONARIO as T } from '../contenido/cuestionario'
import type { Partida } from '../logica/partida'
import { anadirSugerencia, sugerencias } from '../logica/sugerencias'
import { cabeOtro, misHazanas } from '../logica/hazanas'
import { useJuego } from '../estado/juego'
import { Cuestionario } from './Cuestionario'
import { IconoArea } from './IconoArea'

export function HojaSugerencias({ partida, onCerrar }: { partida: Partida; onCerrar: () => void }) {
  const ajustar = useJuego((s) => s.ajustar)
  const perfil = partida.perfil ?? { mejorar: [] }
  const mias = new Set(misHazanas(partida).map((a) => a.id))
  const lista = sugerencias(perfil)
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] flex-col justify-end bg-[#2e2030]/45" onClick={onCerrar}>
      <section role="dialog" aria-label={T.hojaTitulo} onClick={(e) => e.stopPropagation()}
        className="anim-hoja max-h-[90dvh] overflow-y-auto rounded-t-[28px] bg-fondo px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-borde" />
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold">{T.hojaTitulo}</h2>
          <button type="button" onClick={onCerrar} className="min-h-11 px-2 font-semibold text-texto-3">Listo</button>
        </div>
        <p className="mt-0.5 mb-3 text-[14px] text-texto-3">{T.hojaExplicacion}</p>
        <Cuestionario perfil={perfil} onCambiar={(nuevo) => ajustar((p) => ({ ...p, perfil: nuevo }))} />
        {perfil.edad === 'menor' && <p className="mt-4 rounded-2xl bg-tarjeta p-3 text-[14px] leading-snug">{T.menor}</p>}
        {!cabeOtro(partida) && <p className="mt-4 rounded-2xl bg-tarjeta p-3 text-[14px] font-medium text-texto-2">{UI.ofrendas.lleno}</p>}
        <ul className="mt-4 flex flex-col gap-2">
          {lista.map((s) => {
            const area = ACCIONES.find((a) => a.id === s.id)!.area
            const ya = mias.has(s.id) && partida.acciones.find((a) => a.id === s.id)?.nombre === s.nombre
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-tarjeta px-3 py-2">
                <IconoArea area={area} />
                <span className="flex-1">
                  <span className="block text-[15px] font-semibold">{s.nombre}</span>
                  <span className="block text-[13px] text-texto-3">{AREAS[area].nombre}</span>
                </span>
                {ya ? <span className="shrink-0 text-[13px] font-semibold text-salvia-texto">{T.yaLoTienes}</span> : (
                  <button type="button" disabled={!cabeOtro(partida) && !mias.has(s.id)} onClick={() => ajustar((p) => anadirSugerencia(p, s))}
                    className="min-h-11 shrink-0 rounded-full bg-ambar px-4 text-[14px] font-bold text-tinta disabled:opacity-40">+ {T.anadir}</button>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>,
    document.body,
  )
}
