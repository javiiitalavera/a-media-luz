import type React from 'react'
// La casa de un vecino (docs/diseno-vecindario.md). Lo que manda es la escena: fondo, lo construido, las
// huellas de las historias y el vecino. La interfaz va encima, arriba y abajo, sin tapar el centro.
// Todo lo que se mueve es código.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { COMPANEROS, ESCENAS, HISTORIAS, ORDEN_COMPANEROS, MATERIALES, OBJETOS_CASA, ORDEN_AREAS, UI, type AreaId, type CompaneroId, type ObjetoCasa } from '../contenido'
import { FRASES_VISITA, type Huella } from '../contenido/situaciones'
import type { Partida } from '../logica/partida'
import { estadoRincon } from '../logica/reglas'
import { momentoDelDia } from '../logica/momento'
import { construido, disponibles, faltan, proyectosDe, proyectosVisibles, puedeConstruir } from '../logica/casa'
import { crecioSinVer, huevoDisponible, progreso } from '../logica/etapas'
import { estadoDelMes, faltanParaEclosion, mesActual } from '../logica/meses'
import { decisionPendiente, dondeGregorio, fraseDeSituacion, huellasEn, microDeHoy, visitante } from '../logica/situaciones'
import { sfx } from '../sonido'
import { BarraBolsa } from '../componentes/Bolsa'
import { GREGORIO_EN_NOX, VISITA } from '../contenido/casa'
import { globoEn, useGlobo } from '../estado/globo'
import { Aviso } from '../componentes/Aviso'
import { FichaVecino } from '../componentes/FichaVecino'
import { huellaNueva, microSinVer, verHuella, verMicro, visitarLugar } from '../logica/avisos'
import { TOQUES_GREGORIO_EN_NOX, TOQUES_OBJETO } from '../contenido'
import { rutaArte, rutaCompanero, tieneMes, type Expresion } from '../arte/manifiesto'
import { useJuego } from '../estado/juego'

const ANCHO_HUEVO = 30
const SEGUNDOS_BOCADILLO = 7

/** Tamaño de un elemento, actualizado al girar o cambiar la ventana. */
function useTamano() {
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState({ w: 390, h: 844 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => setT({ w: el.clientWidth, h: el.clientHeight })
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, t] as const
}


export function Casa({ partida, ahora, dueno, visita = false, onBarrio }: {
  partida: Partida; ahora: Date; dueno: CompaneroId; visita?: boolean
  onBarrio: () => void
}) {
  const DUENO = dueno
  const AREA = COMPANEROS[DUENO].area
  const esc = ESCENAS[DUENO]!
  const PROPORCION_FONDO = esc.proporcion
  const NOX = esc.pies
  const ANCHO_NOX = esc.anchos
  const LUCES_FONDO = esc.luces
  const decidir = useJuego((s) => s.decidir)
  const incubar = useJuego((s) => s.incubar)
  const tocar = useJuego((s) => s.tocar)
  const ajustar = useJuego((s) => s.ajustar)
  const construirObjeto = useJuego((s) => s.construir)
  const [ref, { w, h }] = useTamano()
  // Solo el último en llegar se descuida (los demás siguen estables y participando en todo).
  const esUltimo = mesActual(partida).companero === DUENO
  const rReal = estadoRincon(partida, AREA, ahora)
  const r = esUltimo ? rReal : { ...rReal, fase: 0 as const }
  const momento = momentoDelDia(ahora)
  const noche = momento === 'noche'
  const [habla, setHabla] = useState<{ texto: string; n: number; contento?: boolean } | null>(null)
  const [nota, ponerNota] = useState<string | null>(null)
  // Un mensaje cada vez: si aparece una nota, se cierra el bocadillo.
  const setNota = (t: string | null) => { if (t) setHabla(null); ponerNota(t) }
  // Si sale un globo (has tocado un objeto), se callan el bocadillo y la nota.
  const globo = useGlobo((st) => st.globo)
  useEffect(() => { if (globo) { setHabla(null); ponerNota(null) } }, [globo])
  const [saltos, setSaltos] = useState(0)
  const [recien, setRecien] = useState<string | null>(null)
  const [hoja, setHoja] = useState(false)
  const verEtapa = useJuego((s) => s.verEtapa)
  const g = progreso(partida, DUENO, ahora)
  const [celebra, setCelebra] = useState<number | null>(null)
  const [hallazgo, setHallazgo] = useState<string | null>(null)
  const presentar = useJuego((s) => s.presentar)
  // El último en llegar: aún en el huevo, naciendo (se enseña la eclosión una vez) o ya en casa.
  const estado = esUltimo ? estadoDelMes(partida, ahora) : 'vivo'
  const vivo = estado === 'vivo'
  const faltaHuevo = faltanParaEclosion(partida, ahora)
  const [toques, setToques] = useState(0)
  const [nacer, setNacer] = useState<'rompiendo' | 'salio' | 'ficha' | null>(null)
  const [toquesSit, setToquesSit] = useState(0)
  const [preguntaHuevo, setPreguntaHuevo] = useState(false)
  useEffect(() => {
    if (!nota) return
    const t = setTimeout(() => setNota(null), 6000)
    return () => clearTimeout(t)
  }, [nota])
  // La pequeña cosa de hoy en esta casa: se ve en la escena (cara, visita) y su texto espera a que toques el «…».
  const micro = estado === 'vivo' ? microDeHoy(partida, DUENO, ahora) : null
  const microPorVer = estado === 'vivo' ? microSinVer(partida, DUENO, ahora) : null
  const microVisible = Boolean(micro)
  const verCosita = () => { if (!micro) return; setNota(micro.texto); ajustar((p) => verMicro(p, DUENO, ahora)) }
  const [decisionAbierta, setDecisionAbierta] = useState(false)
  const [ficha, setFicha] = useState(false)
  // Al entrar, se apagan los avisos de novedades de esta casa.
  useEffect(() => { ajustar((p) => visitarLugar(p, DUENO)) }, [ajustar, DUENO])
  useEffect(() => {
    if (estado !== 'naciendo') return
    const pasos = [
      setTimeout(() => { setNacer('rompiendo'); sfx.eclosion() }, 500),
      setTimeout(() => { setNacer('salio'); setCelebra(Date.now()); setSaltos((n) => n + 1) }, 2100),
      setTimeout(() => setNacer('ficha'), 3600),
    ]
    return () => pasos.forEach(clearTimeout)
  }, [estado])
  useEffect(() => {
    if (!hallazgo) return
    const t = setTimeout(() => setHallazgo(null), 5000)
    return () => clearTimeout(t)
  }, [hallazgo])

  // Ha crecido desde la última vez: celebración (una sola vez por etapa).
  const pendiente = vivo && crecioSinVer(partida, DUENO, g.etapa)
  useEffect(() => {
    if (!pendiente) return
    const t = setTimeout(() => {
      const f = verEtapa(DUENO, g.etapa)
      sfx.cumplido()
      setCelebra(Date.now())
      setSaltos((n) => n + 1)
      if (f) setHabla({ texto: f.texto, n: Date.now(), contento: true })
    }, 700)
    return () => clearTimeout(t)
  }, [pendiente, g.etapa, verEtapa])
  useEffect(() => {
    if (!celebra) return
    const t = setTimeout(() => setCelebra(null), 4500)
    return () => clearTimeout(t)
  }, [celebra])

  useEffect(() => {
    if (!habla) return
    const t = setTimeout(() => setHabla(null), SEGUNDOS_BOCADILLO * 1000)
    return () => clearTimeout(t)
  }, [habla])

  // El fondo cubre la pantalla (como una foto de fondo), centrado.
  const vertical = w / h < PROPORCION_FONDO
  const ew = vertical ? h * PROPORCION_FONDO : w
  const eh = vertical ? h : w / PROPORCION_FONDO
  const escenario: CSSProperties = { width: ew, height: eh, left: (w - ew) / 2, top: (h - eh) / 2 }

  const expresion: Expresion = nacer === 'salio' || nacer === 'ficha' ? 'contento'
    : !vivo ? 'dormido'
    : microVisible && micro?.cara ? micro.cara
    : habla?.contento ? 'contento'
    : noche && !habla ? 'dormido'
    : r.fase >= 2 ? 'enfurrunado'
    : r.hoy > 0 ? 'contento'
    : 'base'

  // Al volver a casa, Nox comenta lo último que hiciste (si no hay celebración de crecer, que va antes).
  const contar = useJuego((s) => s.contar)
  useEffect(() => {
    if (pendiente || !vivo || !esUltimo) return
    const t = setTimeout(() => {
      const noticia = contar()
      const f = noticia?.frase
      // La reacción ya salió al tachar la hazaña: aquí solo se celebra con un saltito.
      if (f && f.companero === DUENO) setSaltos((n) => n + 1)
      if (noticia?.hallazgos.length) setHallazgo(noticia.hallazgos.join(' · '))
    }, 600)
    return () => clearTimeout(t)
  }, [pendiente, vivo, esUltimo, contar, DUENO])

  const hablar = () => {
    if (estado === 'huevo') {
      // Va rotando las frases para no repetir seguidas.
      const lista = UI.casa.huevoToques[Math.min(3, Math.max(1, faltaHuevo)) as 1 | 2 | 3]
      setToques((n) => n + 1)
      setHabla({ texto: lista[toques % lista.length], n: Date.now() })
      return
    }
    if (estado === 'naciendo') return
    sfx.personaje(DUENO)
    setSaltos((n) => n + 1)
    // Si está metido en una historia, habla de ella; si no, lo de siempre.
    const deHistoria = fraseDeSituacion(partida, DUENO, ahora)
    if (deHistoria && toquesSit % 2 === 0) { setHabla({ texto: deHistoria[(toquesSit / 2) % deHistoria.length], n: Date.now() }); setToquesSit((n) => n + 1); return }
    setToquesSit((n) => n + 1)
    const f = tocar(DUENO, !esUltimo)
    if (f) setHabla({ texto: f.texto, n: Date.now() })
  }
  const alConstruir = (id: string) => {
    const res = construirObjeto(id, DUENO)
    if (!res.ok) return
    sfx.construir()
    setHoja(false)
    setRecien(id)
    setTimeout(() => { setSaltos((n) => n + 1); if (res.frase) setHabla({ texto: res.frase.texto, n: Date.now(), contento: true }) }, 650)
  }

  // Lo construido (con dibujo), y Gregorio, la aspiradora, en la casa donde esté hoy.
  const gregorio = dondeGregorio(partida, ahora)
  const aspiradora = OBJETOS_CASA.find((o) => o.id === 'aspiradora')!
  const objetos = [
    ...OBJETOS_CASA.filter((o) => o.companero === DUENO && o.id !== 'aspiradora' && construido(partida, o.id) && rutaArte(`casa/${DUENO}/objeto/${o.id}`)),
    ...(gregorio === DUENO ? [DUENO === 'tuerca' ? aspiradora : { ...aspiradora, sitio: GREGORIO_EN_NOX }] : []),
  ]
  const huellas = huellasEn(partida, DUENO)
  const decision = decisionPendiente(partida, DUENO)
  const deVisita = (microVisible && micro?.visita) || visitante(partida, DUENO, ahora)
  const otroHuevo = esUltimo && vivo ? huevoDisponible(partida, ahora, ORDEN_COMPANEROS.filter(tieneMes)) : null
  const mat = disponibles(partida, ahora)
  const listos = proyectosVisibles(partida, DUENO).filter((o) => puedeConstruir(partida, o, ahora)).length
  // Lo de abajo se pinta delante: se ordena por la altura de los pies.
  const capas = [...objetos.map((o) => ({ y: o.sitio.colgado ? 0 : o.sitio.y, o })), { y: NOX.y, o: null }].sort((a, b) => a.y - b.y)
  // Alto (en % del fondo) de algo que ocupa `ancho` % del ancho con esa proporción.
  const alto = (ancho: number, prop: number) => (ancho * prop * ew) / eh
  // Hasta que se celebra, se sigue viendo la etapa anterior.
  const etapaVista = pendiente ? (partida.etapasVistas?.[DUENO] ?? 0) : g.etapa
  // Mientras no ha salido, en su sitio está el huevo.
  const conHuevo = estado === 'huevo' || (estado === 'naciendo' && (nacer === null || nacer === 'rompiendo'))
  const anchoNox = conHuevo ? ANCHO_HUEVO : ANCHO_NOX[etapaVista]
  const altoNox = alto(anchoNox, 1)

  return (
    <main ref={ref} className="relative mx-auto h-dvh max-w-[430px] overflow-hidden bg-[#c9bf7f]">
      <div className="absolute" style={escenario} onClick={() => setHabla(null)}>
        <img src={rutaArte(`casa/${DUENO}/fondo`)} alt="" className="absolute inset-0 h-full w-full" draggable={false} />

        {huellas.map((hu) => <HuellaEnEscena key={hu.id} h={hu} ew={ew} nueva={huellaNueva(partida, hu.id, ahora)} onTocar={(e) => { if (hu.toque) globoEn(e, hu.toque); ajustar((p) => verHuella(p, hu.id)) }} />)}
        {capas.map(({ o }) => o ? <Objeto key={o.id} o={o} nuevo={recien === o.id} ew={ew} eh={eh} frases={o.id === 'aspiradora' && DUENO === 'nox' ? TOQUES_GREGORIO_EN_NOX : TOQUES_OBJETO[o.id] ?? [o.descripcion]} /> : (
          <div key="nox" className="absolute z-10" style={{ left: `${NOX.x}%`, top: `${NOX.y}%`, width: `${anchoNox}%`, transform: 'translate(-50%, -100%)', transition: 'width 0.8s cubic-bezier(.3,.7,.4,1)' }}>
            {/* sombra en el suelo */}
            <span aria-hidden className="absolute bottom-[1%] left-1/2 h-[9%] w-[62%] -translate-x-1/2 rounded-[50%] bg-[#4b5d3f]/30 blur-[2px]" />
            <button type="button" aria-label={UI.bosque.hablar(COMPANEROS[DUENO].nombre)}
              onClick={(e) => { e.stopPropagation(); hablar() }} className="relative block w-full">
              {conHuevo ? (
                <span key={`h${toques}`} className={`block ${toques ? 'anim-temblar' : ''}`}>
                  <img src={rutaArte(`huevo/${DUENO}/${faltaHuevo <= 1 || estado === 'naciendo' ? 'agrietado' : 'cerrado'}`)} alt="" draggable={false}
                    className={`block w-full ${nacer === 'rompiendo' ? 'anim-eclosionar' : 'anim-mecer'}`} />
                </span>
              ) : (
                <span key={saltos} className={`block ${saltos ? 'anim-saltar' : ''}`}>
                  <img key={etapaVista} src={rutaCompanero(DUENO, etapaVista, expresion)} alt="" draggable={false} className={`anim-respirar block w-full ${celebra ? 'anim-brotar' : ''}`} />
                </span>
              )}
            </button>
          </div>
        ))}

        {deVisita && VISITA[deVisita] && (
          <button type="button" aria-label={UI.casa.deVisita(COMPANEROS[deVisita].nombre)}
            onClick={(e) => { e.stopPropagation(); const l = FRASES_VISITA[deVisita] ?? []; if (l.length) globoEn(e, `${COMPANEROS[deVisita].nombre}: «${l[toquesSit % l.length]}»`); setToquesSit((n) => n + 1) }}
            className="absolute z-10" style={{ left: `${VISITA[deVisita]!.x}%`, top: `${VISITA[deVisita]!.y}%`, width: `${VISITA[deVisita]!.ancho}%`, transform: 'translate(-50%, -100%)' }}>
            <img src={rutaCompanero(deVisita, progreso(partida, deVisita, ahora).etapa, 'base')} alt="" draggable={false} className="anim-respirar block w-full" />
          </button>
        )}
        {otroHuevo && (
          <button type="button" aria-label={UI.casa.huevoEnPuerta} onClick={(e) => { e.stopPropagation(); setPreguntaHuevo(true) }}
            className="absolute z-10" style={{ left: '81%', top: '71%', width: '12%', transform: 'translate(-50%, -100%)' }}>
            <img src={rutaArte(`huevo/${otroHuevo}/cerrado`)} alt="" draggable={false} className="anim-mecer block w-full" />
          </button>
        )}

        {/* Luz del momento del día: tiñe el dibujo, sin cambiarlo. */}
        <div aria-hidden className={`pointer-events-none absolute inset-0 z-20 mix-blend-multiply transition-opacity duration-1000 ${
          noche ? 'bg-[#3b2c63] opacity-75' : momento === 'atardecer' ? 'bg-[#ff9f7a] opacity-35' : momento === 'amanecer' ? 'bg-[#ffcfb8] opacity-40' : 'opacity-0'}`} />

        {/* Luces que laten (por encima del tinte, para que de noche brillen). */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 mix-blend-screen">
          {LUCES_FONDO.map((l, i) => <Luz key={i} x={l.x} y={l.y} tam={noche ? 34 : 22} color="#ffcf73" retraso={i * 0.7} />)}
          {objetos.filter((o) => o.luz).map((o) => {
            const a = alto(o.sitio.ancho, o.proporcion)
            const x = o.sitio.x + ((o.luz!.x - 50) / 100) * o.sitio.ancho
            const y = o.sitio.colgado ? o.sitio.y + (o.luz!.y / 100) * a : o.sitio.y - (1 - o.luz!.y / 100) * a
            return <Luz key={o.id} x={x} y={y} tam={noche ? 30 : 18} color={o.luz!.color} retraso={0.3} />
          })}
          {/* La llama de la cola de Nox */}
          {conHuevo
            ? <Luz x={NOX.x} y={NOX.y - altoNox * 0.5} tam={(noche ? 34 : 26) + (faltaHuevo <= 1 ? 10 : 0)} color="#ffb347" retraso={0} />
            : esc.luzPropia && <Luz x={NOX.x + anchoNox * esc.luzPropia.x} y={NOX.y - altoNox * esc.luzPropia.y} tam={esc.luzPropia.tam * (noche ? 1.6 : 1)} color="#ffb347" retraso={0} />}
        </div>
        {!conHuevo && esc.luzPropia?.chispas && <Chispas x={NOX.x + anchoNox * esc.luzPropia.x} y={NOX.y - altoNox * (esc.luzPropia.y + 0.09)} />}
        <Luciernagas cuantas={noche ? 14 : 7} />
        {celebra && (
          <>
            <div aria-hidden className="pointer-events-none absolute inset-0 z-20 mix-blend-screen">
              <Luz x={NOX.x} y={NOX.y - altoNox / 2} tam={70} color="#ffd27a" retraso={0} />
            </div>
            <Estallido x={NOX.x} y={NOX.y - altoNox / 2} />
          </>
        )}

        {/* Avisos sobre el vecino: «…» una cosa pequeña del día, «?» una decisión. Esperan a que los toques. */}
        {vivo && !celebra && (microPorVer || (decision && !decisionAbierta)) && (
          <div className="absolute z-[25] flex gap-1" style={{ left: `${NOX.x + anchoNox * 0.3}%`, top: `${NOX.y - altoNox * 0.95}%`, transform: 'translate(-50%, -50%)' }}>
            {decision && !decisionAbierta && (
              <button type="button" aria-label={UI.casa.verDecision} onClick={(e) => { e.stopPropagation(); sfx.toque(); setDecisionAbierta(true) }}
                className="flex min-h-11 min-w-11 items-center justify-center"><Aviso tipo="pregunta" tam={32} /></button>
            )}
            {microPorVer && (
              <button type="button" aria-label={UI.casa.verCosita} onClick={(e) => { e.stopPropagation(); sfx.toque(); verCosita() }}
                className="flex min-h-11 min-w-11 items-center justify-center"><Aviso tipo="puntos" tam={32} /></button>
            )}
          </div>
        )}

        {habla && (
          <div key={habla.n} role="status" className="absolute z-30"
            style={{ left: `${NOX.x}%`, top: `${NOX.y - altoNox - 1}%`, width: Math.min(w - 48, 290), transform: 'translate(-50%, -100%)' }}>
            <div className="animate-entrar relative mx-auto w-fit rounded-[22px] bg-tarjeta px-3.5 py-2 text-center text-[15px] leading-snug text-texto shadow-md">
              {habla.texto}
              <span aria-hidden className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-tarjeta" />
            </div>
          </div>
        )}
      </div>

      {/* Arriba: de quién es la casa y ajustes. */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-[max(12px,calc(env(safe-area-inset-top)+32px))]">
        <button type="button" onClick={() => setFicha(true)} aria-label={UI.casa.verFicha(conHuevo ? UI.casa.huevo : COMPANEROS[DUENO].nombre)}
          className="flex min-h-11 items-center rounded-2xl bg-tarjeta/85 px-3.5 text-[18px] leading-tight font-bold shadow-sm backdrop-blur-sm">
          {conHuevo ? UI.casa.huevo : COMPANEROS[DUENO].nombre}
        </button>
        <button type="button" onClick={onBarrio} className="min-h-11 shrink-0 whitespace-nowrap rounded-full bg-tarjeta/85 px-4 text-sm font-semibold text-texto-2 shadow-sm backdrop-blur-sm">
          {visita ? `‹ ${UI.casa.alBarrio}` : `${UI.casa.alBarrio} ›`}
        </button>
      </header>

      {/* Abajo: materiales y construir, encima de la navegación. */}
      <div className="absolute inset-x-0 bottom-[calc(78px+env(safe-area-inset-bottom))] z-30 flex flex-col gap-2 px-3">
        {decision && decisionAbierta && (
          <div role="group" aria-label={decision.pregunta} className="animate-entrar rounded-3xl bg-tarjeta p-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="pt-1 text-[15px] font-bold">{decision.pregunta}</div>
              <button type="button" onClick={() => setDecisionAbierta(false)} className="-mt-1 min-h-11 shrink-0 px-2 text-[14px] font-semibold text-texto-3">{UI.casa.luego}</button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {decision.opciones.map((o) => (
                <button key={o.id} type="button" onClick={() => { sfx.elegir(); decidir(decision.situacion, o.id, o.respuesta); setDecisionAbierta(false); setNota(o.respuesta) }}
                  className="min-h-12 rounded-2xl bg-ambar px-2 text-[14px] leading-tight font-bold text-tinta">{o.texto}</button>
              ))}
            </div>
          </div>
        )}
        <BarraBolsa mat={mat} boton={UI.casa.construir} onBoton={() => setHoja(true)} resaltado={listos > 0}
          insignia={listos > 0 && <span className="rounded-full bg-tinta px-1.5 py-0.5 text-[12px] leading-none text-ambar">{listos}</span>} />
      </div>

      {/* Lo que pasa (narración): distinto de lo que dicen, en una franja discreta arriba. Nunca a la vez que un bocadillo. */}
      {nota && !habla && !celebra && !hallazgo && (
        <div role="status" className="animate-entrar pointer-events-none absolute inset-x-0 top-[calc(max(12px,calc(env(safe-area-inset-top)+32px))+64px)] z-30 flex justify-center px-5">
          <span className="max-w-[320px] rounded-2xl bg-[#2e2030]/70 px-3.5 py-2 text-center text-[14px] leading-snug text-[#fbefe4] italic shadow-md backdrop-blur-sm">{nota}</span>
        </div>
      )}
      {hallazgo && !celebra && (
        <div className="animate-entrar absolute inset-x-0 top-[calc(max(12px,calc(env(safe-area-inset-top)+32px))+76px)] z-30 flex justify-center px-4">
          <span className="rounded-full bg-ambar px-5 py-2.5 text-center text-[15px] font-bold text-tinta shadow-lg">{UI.casa.encontrado(hallazgo)}</span>
        </div>
      )}
      {celebra && (
        <div role="status" className="animate-entrar absolute inset-x-0 top-[calc(max(12px,calc(env(safe-area-inset-top)+32px))+76px)] z-30 flex justify-center px-4">
          <span className="rounded-full bg-ambar px-5 py-2.5 text-[16px] font-bold text-tinta shadow-lg">{nacer || g.etapa === 0 ? UI.casa.nacio(COMPANEROS[DUENO].nombre) : UI.casa.crecio(COMPANEROS[DUENO].nombre, UI.casa.etapas[g.etapa])}</span>
        </div>
      )}

      {ficha && <FichaVecino partida={partida} c={DUENO} ahora={ahora} fase={r.fase} faltanParaArreglar={r.faltanParaArreglar} enHuevo={conHuevo} faltaHuevo={faltaHuevo} onCerrar={() => setFicha(false)} />}
      {nacer === 'ficha' && <Ficha c={DUENO} onCerrar={() => { setNacer(null); presentar() }} />}
      {preguntaHuevo && otroHuevo && (
        <Pregunta titulo={UI.casa.huevoEnPuerta} texto={UI.casa.huevoPregunta}
          si={UI.casa.queVenga} no={UI.casa.ahoraNo}
          onSi={() => { sfx.elegir(); setPreguntaHuevo(false); incubar(otroHuevo) }} onNo={() => setPreguntaHuevo(false)} />
      )}

      {hoja && <Catalogo dueno={DUENO} partida={partida} ahora={ahora} onCerrar={() => setHoja(false)} onConstruir={alConstruir} />}
    </main>
  )
}

/** Pregunta sencilla de sí o no (por ejemplo, incubar el huevo que ha aparecido en la puerta). */
function Pregunta({ titulo, texto, si, no, onSi, onNo }: { titulo: string; texto: string; si: string; no: string; onSi: () => void; onNo: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-end bg-[#2e2030]/50 px-3 pb-[max(16px,env(safe-area-inset-bottom))]" onClick={onNo}>
      <section role="dialog" aria-label={titulo} onClick={(e) => e.stopPropagation()} className="anim-hoja w-full rounded-[28px] bg-fondo p-5 shadow-xl">
        <h2 className="text-[22px] leading-tight font-bold">{titulo}</h2>
        <p className="mt-2 text-[16px] leading-snug">{texto}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onNo} className="min-h-12 rounded-2xl border-2 border-borde font-semibold">{no}</button>
          <button type="button" onClick={onSi} className="min-h-12 rounded-2xl bg-ambar font-bold text-tinta">{si}</button>
        </div>
      </section>
    </div>,
    document.body,
  )
}

/** Una huella de una historia (cartel, extintor, expediente…). Los carteles llevan el texto encima. */
function HuellaEnEscena({ h, ew, nueva, onTocar }: { h: Huella; ew: number; nueva: boolean; onTocar: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const px = (h.sitio.ancho / 100) * ew
  return (
    <button type="button" aria-label={h.texto?.replace('\n', ' ') ?? h.arte} onClick={(e) => { e.stopPropagation(); onTocar(e) }}
      className="absolute z-[5] before:absolute before:-inset-3 before:content-['']" style={{ left: `${h.sitio.x}%`, top: `${h.sitio.y}%`, width: `${h.sitio.ancho}%`, transform: 'translate(-50%, -100%)' }}>
      <img src={rutaArte(`huella/${h.arte}`)} alt="" draggable={false} className={`block w-full ${nueva ? 'anim-nuevo' : ''}`} />
      {h.texto && (
        <span className="pointer-events-none absolute inset-x-[12%] top-[14%] flex h-[34%] items-center justify-center text-center leading-[1.05] font-bold whitespace-pre-line"
          style={{ fontSize: Math.max(7, px * 0.12), color: h.arte === 'cartel-quemado' ? '#3a2418' : '#5a3424' }}>
          {h.texto}
        </span>
      )}
    </button>
  )
}

/** Presentación del compañero al salir del huevo: quién es y qué necesita. */
function Ficha({ c, onCerrar }: { c: CompaneroId; onCerrar: () => void }) {
  const h = HISTORIAS[c]
  const comp = COMPANEROS[c]
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-end bg-[#2e2030]/50 px-3 pb-[max(16px,env(safe-area-inset-bottom))]">
      <section role="dialog" aria-label={comp.nombre} className="anim-hoja w-full rounded-[28px] bg-fondo p-5 shadow-xl">
        <div className="text-[13px] font-semibold text-coral-texto">{UI.casa.nacio(comp.nombre)}</div>
        <h2 className="mt-0.5 text-[28px] leading-tight font-bold">{comp.nombre}</h2>
        {h && <div className="text-[14px] text-texto-3">{h.especie} · {comp.humor}</div>}
        {h && <p className="mt-3 text-[16px] leading-snug">{h.historia}</p>}
        {h && (
          <div className="mt-4 rounded-2xl bg-tarjeta p-3">
            <div className="text-[13px] font-semibold text-texto-3">{UI.casa.necesita}</div>
            <p className="mt-0.5 text-[15px] leading-snug">{h.necesita}</p>
          </div>
        )}
        <button type="button" onClick={onCerrar} className="mt-4 min-h-12 w-full rounded-2xl bg-ambar text-[16px] font-bold text-tinta">
          {h?.despedida ?? UI.casa.cerrar}
        </button>
      </section>
    </div>,
    document.body,
  )
}

export function Luz({ x, y, tam, color, retraso }: { x: number; y: number; tam: number; color: string; retraso: number }) {
  return (
    <span className="anim-luz absolute rounded-full" style={{
      left: `${x}%`, top: `${y}%`, width: `${tam}%`, aspectRatio: '1',
      background: `radial-gradient(circle, ${color}cc 0%, ${color}55 35%, transparent 70%)`, animationDelay: `${retraso}s`,
    }} />
  )
}

/** Chispas que suben de la cola de Nox. */
function Chispas({ x, y }: { x: number; y: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute z-20" style={{ left: `${x}%`, top: `${y}%` }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="anim-chispa absolute h-1.5 w-1.5 rounded-full bg-[#ffd27a] shadow-[0_0_6px_2px_#ffb34799]"
          style={{ '--dx': `${(i % 2 ? 1 : -1) * (6 + i * 4)}px`, animationDelay: `${i * 0.45}s` } as CSSProperties} />
      ))}
    </div>
  )
}

/** Luciérnagas en la mitad de arriba (posiciones fijas para que no salten al repintar). */
const SITIOS_LUCIERNAGAS = [[12, 22], [30, 35], [44, 18], [58, 30], [70, 40], [86, 27], [22, 45], [36, 52], [64, 15], [80, 50], [8, 38], [50, 42], [92, 44], [26, 12]]
export function Luciernagas({ cuantas }: { cuantas: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {SITIOS_LUCIERNAGAS.slice(0, cuantas).map(([x, y], i) => (
        <span key={i} className="anim-luciernaga absolute h-1.5 w-1.5 rounded-full bg-[#fff3b0] shadow-[0_0_8px_3px_#ffe27a88]"
          style={{ left: `${x}%`, top: `${y}%`, '--dx': `${(i % 3) * 8 - 8}px`, '--dy': `${(i % 2 ? -1 : 1) * 10}px`, '--t': `${5 + (i % 4)}s`, animationDelay: `${i * 0.6}s` } as CSSProperties} />
      ))}
    </div>
  )
}

/** Cuántas veces se ha tocado cada objeto (para ir rotando sus frases). */
const vecesTocado = new Map<string, number>()

function Objeto({ o, nuevo, ew, eh, frases }: { o: ObjetoCasa; nuevo: boolean; ew: number; eh: number; frases: string[] }) {
  const tocar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    const n = vecesTocado.get(o.id) ?? 0
    vecesTocado.set(o.id, n + 1)
    globoEn(e, frases[n % frases.length])
  }
  const s = o.sitio
  const estilo: CSSProperties = s.colgado
    ? { left: `${s.x}%`, top: `${s.y}%`, width: `${s.ancho}%`, transform: 'translateX(-50%)' }
    : { left: `${s.x}%`, top: `${s.y}%`, width: `${s.ancho}%`, transform: 'translate(-50%, -100%)' }
  const centroY = s.colgado ? s.y + (s.ancho * o.proporcion * ew) / eh / 2 : s.y - (s.ancho * o.proporcion * ew) / eh / 2
  return (
    <>
      {s.colgado && <span aria-hidden className="absolute top-0 w-[2px] bg-[#6b3f36]" style={{ left: `${s.x}%`, height: `${s.y + 1}%` }} />}
      <button type="button" aria-label={o.nombre} onClick={tocar} className="absolute active:brightness-110" style={estilo}>
        <div className={s.colgado ? 'anim-balanceo' : ''}>
          <img src={rutaArte(`casa/${o.companero}/objeto/${o.id}`)} alt="" draggable={false} className={`block w-full ${nuevo ? 'anim-brotar' : ''}`} />
        </div>
      </button>
      {nuevo && <Estallido x={s.x} y={centroY} />}
    </>
  )
}

/** Puñado de chispas al construir algo. */
function Estallido({ x, y }: { x: number; y: number }) {
  const colores = ['#ffc145', '#e58b91', '#fff3b0', '#a1af8d']
  return (
    <div aria-hidden className="pointer-events-none absolute z-30" style={{ left: `${x}%`, top: `${y}%` }}>
      {Array.from({ length: 12 }, (_, i) => {
        const ang = (i / 12) * Math.PI * 2
        return <span key={i} className="anim-estallido absolute h-2.5 w-2.5 rounded-full"
          style={{ background: colores[i % 4], '--dx': `${Math.cos(ang) * 70}px`, '--dy': `${Math.sin(ang) * 70}px`, animationDelay: '0.15s' } as CSSProperties} />
      })}
    </div>
  )
}

function Materiales({ mat, falta }: { mat: Record<AreaId, number>; falta?: Partial<Record<AreaId, number>> }) {
  return (
    <ul className="grid grid-cols-5 gap-1">
      {ORDEN_AREAS.map((a) => (
        <li key={a} className="flex flex-col items-center">
          <span className="flex items-center gap-1 text-[18px] leading-none font-bold">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: MATERIALES[a].color }} />
            <span className={falta?.[a] ? 'text-peligro' : ''}>{mat[a]}</span>
          </span>
          <span className="mt-1 text-[11px] font-medium text-texto-3">{MATERIALES[a].nombre}</span>
        </li>
      ))}
    </ul>
  )
}

function Catalogo({ partida, ahora, dueno: DUENO, onCerrar, onConstruir }: {
  dueno: CompaneroId
  partida: Partida; ahora: Date; onCerrar: () => void; onConstruir: (id: string) => void
}) {
  const mat = disponibles(partida, ahora)
  const visibles = proyectosVisibles(partida, DUENO)
  const quedan = proyectosDe(DUENO).length - visibles.length
  // Se pinta directamente en el documento para quedar por encima de la navegación.
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] flex-col justify-end bg-[#2e2030]/45" onClick={onCerrar}>
      <section role="dialog" aria-label={UI.casa.catalogo} onClick={(e) => e.stopPropagation()}
        className="anim-hoja max-h-[85dvh] overflow-y-auto rounded-t-[28px] bg-fondo px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-borde" />
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold">{UI.casa.catalogo}</h2>
          <button type="button" onClick={onCerrar} className="min-h-11 px-2 font-semibold text-texto-3">{UI.casa.cerrar}</button>
        </div>
        <div className="mt-2 rounded-2xl bg-tarjeta p-2.5"><Materiales mat={mat} /></div>
        <ul className="mt-3 flex flex-col gap-2.5">
          {visibles.map((o) => {
            const hecho = construido(partida, o.id)
            const f = faltan(partida, o, ahora)
            const puede = !hecho && Object.keys(f).length === 0
            return (
              <li key={o.id} className="flex items-center gap-3 rounded-3xl bg-tarjeta p-3">
                <img src={rutaArte(`casa/${o.companero}/objeto/${o.id}`)} alt="" className="h-16 w-16 shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{o.nombre}</div>
                  <div className="text-[13px] leading-snug text-texto-3 italic">«{o.descripcion}»</div>
                  {o.abre && <div className="mt-1 text-[13px] leading-snug font-semibold text-salvia-texto">{o.abre}</div>}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(Object.entries(o.coste) as [AreaId, number][]).map(([a, n]) => (
                      <span key={a} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-semibold ${!hecho && f[a] ? 'bg-hundido text-peligro' : 'bg-hundido text-texto-2'}`}>
                        <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: MATERIALES[a].color }} />{n} {MATERIALES[a].nombre}
                      </span>
                    ))}
                  </div>
                </div>
                {hecho ? (
                  <span className="w-20 shrink-0 text-center text-[12px] font-semibold text-salvia-texto">{UI.casa.yaEsta}</span>
                ) : (
                  <button type="button" disabled={!puede} onClick={() => onConstruir(o.id)}
                    className="min-h-11 w-20 shrink-0 rounded-2xl bg-ambar text-[14px] font-bold text-tinta disabled:bg-hundido disabled:text-texto-3">
                    {UI.casa.construir}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        {quedan > 0 && <p className="mt-3 px-1 text-[13px] text-texto-3">{UI.casa.masProyectos}</p>}
      </section>
    </div>,
    document.body,
  )
}
