import { useEffect, useRef, useState } from 'react'
import { transicion } from './componentes/transicion'
import { hayHazanasNuevas, leerNoticias } from './logica/avisos'
import { createPortal } from 'react-dom'
import { COMPANEROS, UI, type AreaId, type CompaneroId } from './contenido'
import type { Lugar } from './contenido/situaciones'
import { useJuego } from './estado/juego'
import { momentoDelDia } from './logica/momento'
import { mesActual } from './logica/meses'
import { nacidos } from './logica/etapas'
import { dia, diasEntre } from './logica/fechas'
import { useAhora } from './componentes/comunes'
import { Navegacion, type Pestana } from './componentes/Navegacion'
import { Inicio } from './pantallas/Inicio'
import { Casa } from './pantallas/Casa'
import { Barrio } from './pantallas/Barrio'
import { Rincon } from './pantallas/Rincon'
import { Ofrendas } from './pantallas/Ofrendas'
import { Ajustes, Album } from './pantallas/Otras'
import { Entrada } from './componentes/Entrada'
import { GloboFlotante } from './componentes/Globo'
import { Sonido } from './componentes/Sonido'
import { sfx } from './sonido'

export default function App() {
  const partida = useJuego((s) => s.partida)
  const avanzarBarrio = useJuego((s) => s.avanzarBarrio)
  const ahora = useAhora()
  const [pestana, setPestana] = useState<Pestana>('inicio')
  // En Inicio: casa que se está visitando (desde el barrio) o barrio abierto mientras solo hay un vecino.
  const [casa, setCasa] = useState<CompaneroId | null>(null)
  const [verBarrio, setVerBarrio] = useState(false)
  const [rincon, setRincon] = useState<AreaId | null>(null)
  const [sobre, setSobre] = useState(false)

  // De noche, la interfaz pasa a su versión oscura (ciruela).
  const momento = momentoDelDia(ahora)
  const noche = momento === 'noche'
  useEffect(() => {
    document.documentElement.dataset.noche = noche ? 'si' : 'no'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', noche ? '#2E2030' : '#F9EBDD')
  }, [noche])
  useEffect(() => { window.scrollTo(0, 0) }, [pestana, rincon, verBarrio, casa])
  // El barrio avanza al abrir y cada vez que cambia el día (como mucho una fase de historia al día).
  const hoy = dia(ahora.toISOString())
  useEffect(() => { if (partida) avanzarBarrio() }, [hoy, Boolean(partida), avanzarBarrio])

  // Al ir del barrio a una casa, el barrio se acerca a la casita y la casa sale de ella; al volver, al revés.
  const puntos = useRef<Partial<Record<CompaneroId, { x: number; y: number }>>>({})
  const punto = (c: CompaneroId) => puntos.current[c] ?? { x: innerWidth / 2, y: innerHeight * 0.55 }

  if (!partida) return <><Inicio /><Sonido momento={momento} apagada={false} /><Entrada noche={noche} /></>

  const irA = (p: Pestana) => { setRincon(null); setVerBarrio(false); setCasa(null); setPestana(p) }
  const ultimo = mesActual(partida).companero
  const conBarrio = nacidos(partida, ahora).length >= 2
  const irALugar = (l: Lugar) => { irA('inicio'); if (l === 'barrio') setVerBarrio(true); else setCasa(l) }

  let pantalla
  if (rincon)
    pantalla = <Rincon partida={partida} area={rincon} ahora={ahora} onVolver={() => setRincon(null)} onOfrenda={() => irA('ofrendas')} />
  else if (pestana === 'inicio' && casa)
    pantalla = <Casa key={`c-${casa}`} partida={partida} ahora={ahora} dueno={casa} visita onDetalle={() => setRincon(COMPANEROS[casa].area)} onBarrio={() => transicion('salir', punto(casa), () => { setCasa(null); setVerBarrio(true) })} />
  else if (pestana === 'inicio' && (conBarrio || verBarrio))
    pantalla = <Barrio partida={partida} ahora={ahora} onNovedades={() => setSobre(true)} onCasa={(c, p) => { if (p) puntos.current[c] = p; transicion('entrar', punto(c), () => setCasa(c)) }}
      onVolver={conBarrio ? undefined : () => transicion('entrar', punto(ultimo), () => setVerBarrio(false))} />
  else if (pestana === 'inicio')
    pantalla = <Casa key={ultimo} partida={partida} ahora={ahora} dueno={ultimo} onDetalle={() => setRincon(COMPANEROS[ultimo].area)} onBarrio={() => transicion('salir', punto(ultimo), () => setVerBarrio(true))} />
  else if (pestana === 'ofrendas') pantalla = <Ofrendas partida={partida} ahora={ahora} />
  else if (pestana === 'ajustes') pantalla = <Ajustes partida={partida} />
  else pantalla = <Album partida={partida} ahora={ahora} />

  return (
    <>
      <div key={`${pestana}-${rincon}-${verBarrio}-${casa}`} className="animate-aparecer">{pantalla}</div>
      <Navegacion actual={pestana} onCambiar={irA} avisos={{ ofrendas: hayHazanasNuevas(partida, ahora) }} />
      {sobre && <Novedades ahora={ahora} onIr={irALugar} onCerrar={() => setSobre(false)} />}
      <Sonido momento={momento} apagada={false} />
      <Entrada noche={noche} />
      <GloboFlotante />
    </>
  )
}

/** «Mientras no estabas…»: se abre al tocar el sobre del barrio. Al abrirlo, las novedades quedan leídas. */
function Novedades({ ahora, onIr, onCerrar }: { ahora: Date; onIr: (l: Lugar) => void; onCerrar: () => void }) {
  const noticias = useJuego((s) => s.partida?.noticias) ?? []
  const ajustar = useJuego((s) => s.ajustar)
  // Lo que no estaba leído al abrir se ve resaltado mientras el sobre siga abierto.
  const [nuevas] = useState(() => new Set(noticias.filter((n) => !n.leida).map((n) => n.fecha + n.texto)))
  useEffect(() => { sfx.pagina(); ajustar(leerNoticias) }, [ajustar])
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-start bg-[#2e2030]/35 px-3 pt-[max(16px,calc(env(safe-area-inset-top)+32px))]" onClick={onCerrar}>
      <section role="dialog" aria-label={UI.barrio.novedades} onClick={(e) => e.stopPropagation()} className="animate-entrar max-h-[80dvh] w-full overflow-y-auto rounded-[28px] bg-fondo p-4 shadow-xl">
        <h2 className="px-1 text-[20px] font-bold">{UI.barrio.novedades}</h2>
        {noticias.length === 0 && <p className="mt-2 px-1 text-[15px] text-texto-3">{UI.barrio.nadaNuevo}</p>}
        <ul className="mt-2 flex flex-col gap-2">
          {[...noticias].reverse().map((n, i) => {
            const nueva = nuevas.has(n.fecha + n.texto)
            return (
              <li key={i}>
                <button type="button" onClick={() => { onCerrar(); onIr(n.lugar) }}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-2xl px-3.5 py-2.5 text-left text-[15px] leading-snug ${nueva ? 'bg-tarjeta font-semibold text-texto shadow-sm' : 'bg-hundido/60 text-texto-3'}`}>
                  {nueva && <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-coral" />}
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
