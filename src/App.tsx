import { useEffect, useRef, useState } from 'react'
import { transicion } from './componentes/transicion'
import { hayAlbumNuevo, hayAlgoEnInicio, hayHazanasNuevas } from './logica/avisos'
import { flushSync } from 'react-dom'
import type { CompaneroId } from './contenido'
import type { Lugar } from './contenido/situaciones'
import { useJuego } from './estado/juego'
import { ahora as reloj } from './logica/reloj'
import { momentoDelDia } from './logica/momento'
import { mesActual } from './logica/meses'
import { nacidos } from './logica/etapas'
import { dia } from './logica/fechas'
import { useAhora } from './componentes/comunes'
import { Navegacion, type Pestana } from './componentes/Navegacion'
import { Novedades, nombreDelLugar } from './componentes/Novedades'
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
  const [abrirDecision, setAbrirDecision] = useState<{ lugar: CompaneroId; situacion: string } | null>(null)
  const [contextoVisita, setContextoVisita] = useState<{ lugar: Lugar; texto: string } | null>(null)
  const lugarActual = pestana === 'inicio' && partida
    ? casa ?? (verBarrio ? 'barrio' : mesActual(partida).companero) : null
  useEffect(() => {
    if (!contextoVisita) return
    if (lugarActual !== contextoVisita.lugar) {
      setContextoVisita(null)
      return
    }
    const id = setTimeout(() => setContextoVisita(null), 10_000)
    return () => clearTimeout(id)
  }, [contextoVisita, lugarActual])

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
  const recogerHuevo = (c: CompaneroId) => {
    if (useJuego.getState().incubar(c)) {
      setCasa(null)
      setVerBarrio(false)
      setUltimaCasa(c)
    }
  }
  // Al entrar (y al tocar Inicio) se abre la casa del último vecino en llegar; el barrio, desde su botón.
  const enBarrio = lugarActual === 'barrio'
  const irALugar = (l: Lugar) => {
    setPestana('inicio')
    if (l === 'barrio') { setCasa(null); setVerBarrio(true) }
    else if (l === ultimo) { setCasa(null); setVerBarrio(false) }
    else setCasa(l)
  }
  const visitarNovedad = (lugar: Lugar, contexto: string, situacion?: string) => {
    if (lugar === lugarActual) {
      setSobre(false)
      if (situacion && lugar !== 'barrio') setAbrirDecision({ lugar, situacion })
      return
    }

    const puerta = enBarrio && lugar !== 'barrio'
      ? document.querySelector(`[data-puerta="${lugar}"]`)?.getBoundingClientRect() : undefined
    const destino = puerta ? { x: puerta.left + puerta.width / 2, y: puerta.top + puerta.height / 2 }
      : punto(lugar === 'barrio' ? casa ?? ultimo : lugar)
    flushSync(() => setSobre(false))
    sfx.puerta()
    transicion(lugar === 'barrio' ? 'salir' : enBarrio ? 'entrar' : 'cambiar', destino, () => {
      irALugar(lugar)
      if (situacion && lugar !== 'barrio') {
        setContextoVisita(null)
        setAbrirDecision({ lugar, situacion })
      } else {
        setContextoVisita({ lugar, texto: contexto })
      }
    })
  }
  const peticionDeDecision = (c: CompaneroId) => ({
    abrirDecision: abrirDecision?.lugar === c ? abrirDecision.situacion : undefined,
    onDecisionAbierta: () => setAbrirDecision(null),
  })

  let pantalla
  if (pestana === 'inicio' && casa)
    pantalla = <Casa key={`c-${casa}`} partida={partida} ahora={ahora} dueno={casa} visita onNovedades={() => setSobre(true)} onRecogerHuevo={recogerHuevo} {...peticionDeDecision(casa)} onBarrio={() => transicion('salir', punto(casa), () => { setCasa(null); setVerBarrio(true) })} />
  else if (pestana === 'inicio' && verBarrio)
    pantalla = <Barrio partida={partida} ahora={ahora} onNovedades={() => setSobre(true)} onCasa={(c, p) => { if (p) puntos.current[c] = p; transicion('entrar', punto(c), () => setCasa(c)) }}
      volverA={conBarrio ? (ultimaCasa ?? ultimo) : ultimo}
      onVolver={(p) => {
        const c = conBarrio ? ultimaCasa ?? ultimo : ultimo
        if (p) puntos.current[c] = p
        transicion('entrar', punto(c), () => { if (c === ultimo) setVerBarrio(false); else setCasa(c) })
      }} />
  else if (pestana === 'inicio')
    pantalla = <Casa key={ultimo} partida={partida} ahora={ahora} dueno={ultimo} onNovedades={() => setSobre(true)} onRecogerHuevo={recogerHuevo} {...peticionDeDecision(ultimo)} onBarrio={() => transicion('salir', punto(ultimo), () => { setUltimaCasa(ultimo); setVerBarrio(true) })} />
  else if (pestana === 'ofrendas') pantalla = <Ofrendas partida={partida} ahora={ahora} onIrACasa={() => irALugar(ultimo)} />
  else if (pestana === 'ajustes') pantalla = <Ajustes partida={partida} ahora={ahora} />
  else pantalla = <Album partida={partida} onIr={irALugar} />

  return (
    <>
      <div key={`${pestana}-${verBarrio}-${casa}`} className={pestana === 'inicio' ? undefined : 'animate-aparecer'}>{pantalla}</div>
      <Navegacion actual={pestana} onCambiar={irA} sobreBarrio={enBarrio} avisos={{ inicio: hayAlgoEnInicio(partida, ahora), ofrendas: hayHazanasNuevas(partida, ahora), album: hayAlbumNuevo(partida) }} />
      {contextoVisita && lugarActual === contextoVisita.lugar && (
        <aside role="status" className="animate-entrar pointer-events-none fixed inset-x-4 bottom-[calc(142px+env(safe-area-inset-bottom))] z-[35] mx-auto max-w-[350px] rounded-2xl bg-tarjeta px-4 py-3 shadow-md">
          <p className="text-[13px] font-semibold text-texto-3">{nombreDelLugar(contextoVisita.lugar)}</p>
          <p className="mt-1 text-[15px] leading-snug text-texto">{contextoVisita.texto}</p>
        </aside>
      )}
      {sobre && <Novedades partida={partida} ahora={ahora} onVisitar={visitarNovedad} onCerrar={() => setSobre(false)} />}
      <Sonido momento={momento} apagada={false} />
      <Entrada noche={noche} />
      <GloboFlotante />
    </>
  )
}
