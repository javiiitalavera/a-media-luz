import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { COMPANEROS, UI, type AreaId, type CompaneroId } from './contenido'
import type { Lugar } from './contenido/situaciones'
import { useJuego } from './estado/juego'
import { momentoDelDia } from './logica/momento'
import { mesActual } from './logica/meses'
import { nacidos } from './logica/etapas'
import { dia } from './logica/fechas'
import { useAhora } from './componentes/comunes'
import { Navegacion, type Pestana } from './componentes/Navegacion'
import { Inicio } from './pantallas/Inicio'
import { Casa } from './pantallas/Casa'
import { Barrio } from './pantallas/Barrio'
import { Rincon } from './pantallas/Rincon'
import { Ofrendas } from './pantallas/Ofrendas'
import { Ajustes, Album } from './pantallas/Otras'

export default function App() {
  const partida = useJuego((s) => s.partida)
  const avanzarBarrio = useJuego((s) => s.avanzarBarrio)
  const ahora = useAhora()
  const [pestana, setPestana] = useState<Pestana>('inicio')
  // En Inicio: casa que se está visitando (desde el barrio) o barrio abierto mientras solo hay un vecino.
  const [casa, setCasa] = useState<CompaneroId | null>(null)
  const [verBarrio, setVerBarrio] = useState(false)
  const [rincon, setRincon] = useState<AreaId | null>(null)

  // De noche, la interfaz pasa a su versión oscura (ciruela).
  const noche = momentoDelDia(ahora) === 'noche'
  useEffect(() => {
    document.documentElement.dataset.noche = noche ? 'si' : 'no'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', noche ? '#2E2030' : '#F9EBDD')
  }, [noche])
  useEffect(() => { window.scrollTo(0, 0) }, [pestana, rincon, verBarrio, casa])
  // El barrio avanza al abrir y cada vez que cambia el día (como mucho una fase de historia al día).
  const hoy = dia(ahora.toISOString())
  useEffect(() => { if (partida) avanzarBarrio() }, [hoy, Boolean(partida), avanzarBarrio])

  if (!partida) return <Inicio />

  const irA = (p: Pestana) => { setRincon(null); setVerBarrio(false); setCasa(null); setPestana(p) }
  const ultimo = mesActual(partida).companero
  const conBarrio = nacidos(partida, ahora).length >= 2
  const irALugar = (l: Lugar) => { irA('inicio'); if (l === 'barrio') setVerBarrio(true); else setCasa(l) }

  let pantalla
  if (rincon)
    pantalla = <Rincon partida={partida} area={rincon} ahora={ahora} onVolver={() => setRincon(null)} onOfrenda={() => irA('ofrendas')} />
  else if (pestana === 'inicio' && casa)
    pantalla = <Casa key={`c-${casa}`} partida={partida} ahora={ahora} dueno={casa} visita onDetalle={() => setRincon(COMPANEROS[casa].area)} onBarrio={() => { setCasa(null); setVerBarrio(true) }} />
  else if (pestana === 'inicio' && (conBarrio || verBarrio))
    pantalla = <Barrio partida={partida} ahora={ahora} onCasa={setCasa} onVolver={conBarrio ? undefined : () => setVerBarrio(false)} />
  else if (pestana === 'inicio')
    pantalla = <Casa key={ultimo} partida={partida} ahora={ahora} dueno={ultimo} onDetalle={() => setRincon(COMPANEROS[ultimo].area)} onBarrio={() => setVerBarrio(true)} />
  else if (pestana === 'ofrendas') pantalla = <Ofrendas partida={partida} ahora={ahora} />
  else if (pestana === 'ajustes') pantalla = <Ajustes partida={partida} />
  else pantalla = <Album partida={partida} ahora={ahora} />

  return (
    <>
      <div key={`${pestana}-${rincon}-${verBarrio}-${casa}`} className="animate-aparecer">{pantalla}</div>
      <Navegacion actual={pestana} onCambiar={irA} />
      {pestana === 'inicio' && !rincon && <Novedades onIr={irALugar} />}
    </>
  )
}

/** «Mientras no estabas…»: lo que ha pasado en el barrio desde la última visita. */
function Novedades({ onIr }: { onIr: (l: Lugar) => void }) {
  const noticias = useJuego((s) => s.partida?.noticias)
  const verNoticias = useJuego((s) => s.verNoticias)
  if (!noticias?.length) return null
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-start bg-[#2e2030]/35 px-3 pt-[max(16px,calc(env(safe-area-inset-top)+32px))]" onClick={verNoticias}>
      <section role="dialog" aria-label={UI.barrio.novedades} onClick={(e) => e.stopPropagation()} className="animate-entrar w-full rounded-[28px] bg-fondo p-4 shadow-xl">
        <h2 className="px-1 text-[20px] font-bold">{UI.barrio.novedades}</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {noticias.slice(-3).map((n, i) => (
            <li key={i}>
              <button type="button" onClick={() => { verNoticias(); onIr(n.lugar) }}
                className="flex min-h-11 w-full items-center gap-2 rounded-2xl bg-tarjeta px-3.5 py-2.5 text-left text-[15px] leading-snug">
                <span className="flex-1">{n.texto}</span><span aria-hidden className="text-texto-3">›</span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={verNoticias} className="mt-2 min-h-11 w-full font-semibold text-texto-3">{UI.casa.cerrar}</button>
      </section>
    </div>,
    document.body,
  )
}
