import { useEffect, useRef, useState } from 'react'
import { transicion } from './componentes/transicion'
import { decisionesPendientes, hayAlbumNuevo, hayAlgoEnInicio, hayHazanasNuevas, leerNoticias, noticiasDelSobre } from './logica/avisos'
import { createPortal } from 'react-dom'
import { COMPANEROS, UI, type CompaneroId } from './contenido'
import type { Lugar } from './contenido/situaciones'
import { useJuego } from './estado/juego'
import { ahora as reloj } from './logica/reloj'
import { momentoDelDia } from './logica/momento'
import { mesActual } from './logica/meses'
import { nacidos } from './logica/etapas'
import { dia, diasEntre } from './logica/fechas'
import { useAhora } from './componentes/comunes'
import { Navegacion, type Pestana } from './componentes/Navegacion'
import { Inicio } from './pantallas/Inicio'
import { Casa } from './pantallas/Casa'
import { Barrio } from './pantallas/Barrio'
import { Ofrendas } from './pantallas/Ofrendas'
import { Ajustes, Album } from './pantallas/Otras'
import { Entrada } from './componentes/Entrada'
import { GloboFlotante } from './componentes/Globo'
import { Sonido } from './componentes/Sonido'
import { usePreferencias } from './estado/preferencias'
import { sfx } from './sonido'

export default function App() {
  const partida = useJuego((s) => s.partida)
  const avanzarBarrio = useJuego((s) => s.avanzarBarrio)
  const ahora = useAhora()
  const [pestana, setPestana] = useState<Pestana>('inicio')
  // En Inicio: casa que se está visitando (desde el barrio) o barrio abierto mientras solo hay un vecino.
  const [casa, setCasa] = useState<CompaneroId | null>(null)
  // La última casa visitada: desde el barrio, un toque te devuelve a ella.
  const [ultimaCasa, setUltimaCasa] = useState<CompaneroId | null>(null)
  useEffect(() => { if (casa) setUltimaCasa(casa) }, [casa])
  // Al abrir la app se empieza en el barrio si ya hay barrio (dos vecinos o más); si no, en la casa del primero
  // (decidido por Javi, 20/11/2026). Al cambiar de pestaña y volver, sigues donde estabas.
  const [verBarrio, setVerBarrio] = useState(() => {
    const p = useJuego.getState().partida
    return Boolean(p && nacidos(p, reloj()).length >= 2)
  })
  const [sobre, setSobre] = useState(false)
  // Si vienes del sobre a decidir algo, la casa abre la pregunta directamente.
  const [abrirDecision, setAbrirDecision] = useState(false)

  // De noche, la interfaz pasa a su versión oscura (ciruela).
  const momento = momentoDelDia(ahora)
  const aspecto = usePreferencias((s) => s.aspecto)
  const noche = aspecto === 'auto' ? momento === 'noche' : aspecto === 'noche'
  useEffect(() => {
    document.documentElement.dataset.noche = noche ? 'si' : 'no'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', noche ? '#2E2030' : '#F9EBDD')
  }, [noche])
  useEffect(() => { window.scrollTo(0, 0) }, [pestana, verBarrio, casa])
  // El barrio avanza al abrir y cada vez que cambia el día (como mucho una fase de historia al día).
  const hoy = dia(ahora.toISOString())
  useEffect(() => { if (partida) avanzarBarrio() }, [hoy, Boolean(partida), avanzarBarrio])

  // Al ir del barrio a una casa, el barrio se acerca a la casita y la casa sale de ella; al volver, al revés.
  const puntos = useRef<Partial<Record<CompaneroId, { x: number; y: number }>>>({})
  const punto = (c: CompaneroId) => puntos.current[c] ?? { x: innerWidth / 2, y: innerHeight * 0.55 }

  if (!partida) return <><Inicio /><Sonido momento={momento} apagada={false} /><Entrada noche={noche} /></>

  // Cambiar de pestaña no olvida dónde estabas: al volver a Inicio sigues en el barrio o en la casa en que te quedaste.
  const irA = (p: Pestana) => setPestana(p)
  const ultimo = mesActual(partida).companero
  const conBarrio = nacidos(partida, ahora).length >= 2
  // Al entrar (y al tocar Inicio) se abre la casa del último vecino en llegar; el barrio, desde su botón.
  const enBarrio = pestana === 'inicio' && !casa && verBarrio
  const irALugar = (l: Lugar) => {
    setPestana('inicio')
    if (l === 'barrio') { setCasa(null); setVerBarrio(true) }
    else if (l === ultimo) { setCasa(null); setVerBarrio(false) }
    else setCasa(l)
  }

  let pantalla
  if (pestana === 'inicio' && casa)
    pantalla = <Casa key={`c-${casa}`} partida={partida} ahora={ahora} dueno={casa} visita onNovedades={() => setSobre(true)} abrirDecision={abrirDecision} onDecisionAbierta={() => setAbrirDecision(false)} onBarrio={() => transicion('salir', punto(casa), () => { setCasa(null); setVerBarrio(true) })} />
  else if (pestana === 'inicio' && verBarrio)
    pantalla = <Barrio partida={partida} ahora={ahora} onNovedades={() => setSobre(true)} onCasa={(c, p) => { if (p) puntos.current[c] = p; transicion('entrar', punto(c), () => setCasa(c)) }}
      volverA={conBarrio ? (ultimaCasa ?? ultimo) : ultimo}
      onVolver={(p) => {
        const c = conBarrio ? ultimaCasa ?? ultimo : ultimo
        if (p) puntos.current[c] = p
        transicion('entrar', punto(c), () => { if (c === ultimo) setVerBarrio(false); else setCasa(c) })
      }} />
  else if (pestana === 'inicio')
    pantalla = <Casa key={ultimo} partida={partida} ahora={ahora} dueno={ultimo} onNovedades={() => setSobre(true)} onBarrio={() => transicion('salir', punto(ultimo), () => { setUltimaCasa(ultimo); setVerBarrio(true) })} />
  else if (pestana === 'ofrendas') pantalla = <Ofrendas partida={partida} ahora={ahora} onIrACasa={() => irALugar(ultimo)} />
  else if (pestana === 'ajustes') pantalla = <Ajustes partida={partida} ahora={ahora} />
  else pantalla = <Album partida={partida} ahora={ahora} onIr={irALugar} />

  return (
    <>
      <div key={`${pestana}-${verBarrio}-${casa}`} className={pestana === 'inicio' ? undefined : 'animate-aparecer'}>{pantalla}</div>
      <Navegacion actual={pestana} onCambiar={irA} sobreBarrio={enBarrio} avisos={{ inicio: hayAlgoEnInicio(partida, ahora), ofrendas: hayHazanasNuevas(partida, ahora), album: hayAlbumNuevo(partida) }} />
      {sobre && <Novedades ahora={ahora} onIr={irALugar} onDecidir={(c) => { irALugar(c); setAbrirDecision(true) }} onCerrar={() => setSobre(false)} />}
      <Sonido momento={momento} apagada={false} />
      <Entrada noche={noche} />
      <GloboFlotante />
    </>
  )
}

/** «Mientras no estabas…»: se abre al tocar el sobre del barrio. Al abrirlo, las novedades quedan leídas. */
function Novedades({ ahora, onIr, onDecidir, onCerrar }: { ahora: Date; onIr: (l: Lugar) => void; onDecidir: (c: CompaneroId) => void; onCerrar: () => void }) {
  const partida = useJuego((s) => s.partida)
  const decisiones = partida ? decisionesPendientes(partida, ahora) : []
  const noticias = partida ? noticiasDelSobre(partida, ahora) : []
  const ajustar = useJuego((s) => s.ajustar)
  // Lo que no estaba leído al abrir se ve resaltado mientras el sobre siga abierto.
  const [nuevas] = useState(() => new Set(noticias.filter((n) => !n.leida).map((n) => n.fecha + n.texto)))
  useEffect(() => { sfx.pagina(); ajustar(leerNoticias) }, [ajustar])
  // Accesibilidad: al abrir, el foco va al diálogo; al cerrar, vuelve a donde estaba. Escape lo cierra.
  const dialogo = useRef<HTMLElement>(null)
  const cerrar = useRef(onCerrar)
  cerrar.current = onCerrar
  useEffect(() => {
    const antes = document.activeElement as HTMLElement | null
    dialogo.current?.focus()
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar.current() }
    window.addEventListener('keydown', tecla)
    return () => { window.removeEventListener('keydown', tecla); antes?.focus?.() }
  }, [])
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-start bg-[#2e2030]/35 px-3 pt-[max(16px,calc(env(safe-area-inset-top)+32px))]" onClick={onCerrar}>
      <section ref={dialogo} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="titulo-novedades" onClick={(e) => e.stopPropagation()} className="animate-entrar max-h-[80dvh] w-full overflow-y-auto rounded-[28px] bg-fondo p-4 shadow-xl outline-none">
        <h2 id="titulo-novedades" className="px-1 text-[20px] font-bold">{UI.barrio.novedades}</h2>
        {/* Cada decisión, una sola tarjeta: lo que pasó y la pregunta. Se queda arriba hasta que decidas. */}
        {decisiones.map((d) => (
          <div key={d.lugar} className="mt-2 rounded-2xl bg-ambar px-3.5 py-3 text-tinta shadow-sm">
            {d.contexto && <p className="text-[15px] leading-snug">{d.contexto}</p>}
            <p className="mt-1 text-[15px] leading-snug font-bold">{UI.barrio.esperaDecision(COMPANEROS[d.lugar].nombre, d.pregunta)}</p>
            <button type="button" onClick={() => { onCerrar(); onDecidir(d.lugar) }}
              className="mt-2 min-h-11 w-full rounded-xl bg-tinta/10 text-[15px] font-bold">{UI.barrio.decidir} ›</button>
          </div>
        ))}
        {noticias.length === 0 && decisiones.length === 0 && <p className="mt-2 px-1 text-[15px] text-texto-3">{UI.barrio.nadaNuevo}</p>}
        <ul className="mt-2 flex flex-col gap-2">
          {[...noticias].reverse().map((n, i) => {
            const nueva = nuevas.has(n.fecha + n.texto)
            return (
              <li key={i}>
                <button type="button" onClick={() => { onCerrar(); onIr(n.lugar) }}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-2xl px-3.5 py-2.5 text-left text-[15px] leading-snug ${nueva ? 'bg-tarjeta font-semibold text-texto shadow-sm' : 'bg-hundido/60 text-texto-3'}`}>
                  {nueva && <span className="h-2 w-2 shrink-0 rounded-full bg-coral"><span className="sr-only">{UI.barrio.nueva}</span></span>}
                  <span className="flex-1">{n.texto}</span>
                  <span className="shrink-0 text-[12px] font-medium text-texto-3">{UI.barrio.cuando(diasEntre(dia(n.fecha), dia(ahora)))}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <button type="button" onClick={onCerrar} className="mt-2 min-h-11 w-full font-semibold text-texto-3">{UI.casa.cerrar}</button>
      </section>
    </div>,
    document.body,
  )
}
