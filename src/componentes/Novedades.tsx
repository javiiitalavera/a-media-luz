import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { COMPANEROS, UI } from '../contenido'
import type { Lugar } from '../contenido/situaciones'
import { decisionesPendientes, leerNoticias, noticiasDelSobre, puedeVisitarNoticia } from '../logica/avisos'
import { dia, diasEntre } from '../logica/fechas'
import type { NoticiaBarrio, Partida } from '../logica/partida'
import { sfx } from '../sonido'
import { useJuego } from '../estado/juego'

const clave = (n: NoticiaBarrio) => `${n.fecha}|${n.lugar}|${n.texto}`
export const nombreDelLugar = (lugar: Lugar) => lugar === 'barrio' ? UI.barrio.titulo : UI.barrio.casaDe(COMPANEROS[lugar].nombre)

export function Novedades({ partida, ahora, lugarActual, onVisitar, onCerrar }: {
  partida: Partida; ahora: Date; lugarActual: Lugar | null
  onVisitar: (lugar: Lugar, contexto: string, situacion?: string) => void
  onCerrar: () => void
}) {
  const decisiones = decisionesPendientes(partida, ahora)
  const noticias = noticiasDelSobre(partida, ahora)
  const ajustar = useJuego((s) => s.ajustar)
  const [nuevas] = useState(() => new Set(noticias.filter((n) => !n.leida).map(clave)))

  const dialogo = useRef<HTMLElement>(null)
  const cerrar = useRef(onCerrar)
  cerrar.current = onCerrar
  useEffect(() => {
    sfx.pagina()
    const antes = document.activeElement as HTMLElement | null
    dialogo.current?.focus()
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar.current() }
    window.addEventListener('keydown', tecla)
    return () => { window.removeEventListener('keydown', tecla); antes?.focus() }
  }, [])
  useEffect(() => { ajustar((p) => leerNoticias(p, ahora)) }, [ajustar, ahora, partida.noticias])

  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-start bg-[#2e2030]/35 px-3 pt-[max(16px,calc(env(safe-area-inset-top)+32px))]" onClick={onCerrar}>
      <section ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="titulo-novedades" onClick={(e) => e.stopPropagation()}
        className="animate-entrar max-h-[80dvh] w-full overflow-y-auto rounded-[28px] bg-fondo p-4 shadow-xl outline-none">
        <h2 id="titulo-novedades" className="px-1 text-[20px] font-bold">{UI.barrio.novedades}</h2>
        {decisiones.map((d) => (
          <div key={d.situacion} className="mt-2 rounded-2xl bg-ambar px-3.5 py-3 text-tinta shadow-sm">
            <p className="text-[13px] font-semibold">{nombreDelLugar(d.lugar)}</p>
            {d.contexto && <p className="mt-1 text-[15px] leading-snug">{d.contexto}</p>}
            <p className="mt-1 text-[15px] font-bold leading-snug">{d.pregunta}</p>
            <button type="button" onClick={() => onVisitar(d.lugar, d.contexto, d.situacion)}
              className="mt-2 min-h-11 w-full rounded-xl bg-tinta/10 text-[15px] font-bold">{UI.barrio.decidir} ›</button>
          </div>
        ))}
        {noticias.length === 0 && decisiones.length === 0 && <p className="mt-2 px-1 text-[15px] text-texto-3">{UI.barrio.nadaNuevo}</p>}
        {noticias.length > 0 && (
          <ul className="mt-2 flex flex-col gap-2">
            {[...noticias].reverse().map((n) => {
              const id = clave(n)
              const nombre = nombreDelLugar(n.lugar)
              return (
                <li key={id} className="rounded-2xl bg-tarjeta px-3.5 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-[13px] text-texto-3">
                    {nuevas.has(id) && <span className="h-2 w-2 shrink-0 rounded-full bg-coral"><span className="sr-only">{UI.barrio.nueva}</span></span>}
                    <span className="flex-1 font-semibold">{nombre}</span>
                    <span>{UI.barrio.cuando(diasEntre(dia(n.fecha), dia(ahora)))}</span>
                  </div>
                  <p className="mt-1 text-[15px] leading-snug">{n.texto}</p>
                  {lugarActual !== n.lugar && puedeVisitarNoticia(partida, n) && (
                    <button type="button" onClick={() => onVisitar(n.lugar, n.texto)}
                      className="mt-2 min-h-11 w-full rounded-xl bg-hundido px-3 text-left text-[14px] font-semibold">{UI.barrio.verEscena(nombre)} ›</button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        <button type="button" onClick={onCerrar} className="mt-2 min-h-11 w-full font-semibold text-texto-3">{UI.casa.cerrar}</button>
      </section>
    </div>,
    document.body,
  )
}
