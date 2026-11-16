// Pantalla principal: la casa del compañero del mes (o la de un vecino, de visita). Lo que manda es la
// escena (fondo, objetos construidos y el compañero);
// la interfaz va encima, arriba y abajo, sin tapar el centro. Todo lo que se mueve es código.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { AREAS, COMPANEROS, ESCENAS, HISTORIAS, ORDEN_COMPANEROS, MATERIALES, OBJETOS_CASA, ORDEN_AREAS, UI, type AreaId, type CompaneroId, type ObjetoCasa } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoRincon } from '../logica/reglas'
import { momentoDelDia } from '../logica/momento'
import { construido, disponibles, faltan, puedeConstruir } from '../logica/casa'
import { crecioSinVer, progreso } from '../logica/etapas'
import { diaDelMes, estadoDelMes, faltanParaEclosion, informe, mesActual, mesesDe, OFRENDAS_ECLOSION } from '../logica/meses'
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

export function Casa({ partida, ahora, dueno, visita = false, onBosque, onDetalle, onVolver }: {
  partida: Partida; ahora: Date; dueno: CompaneroId; visita?: boolean
  onBosque: () => void; onDetalle: () => void; onVolver?: () => void
}) {
  const DUENO = dueno
  const AREA = COMPANEROS[DUENO].area
  const esc = ESCENAS[DUENO]!
  const PROPORCION_FONDO = esc.proporcion
  const NOX = esc.pies
  const ANCHO_NOX = esc.anchos
  const LUCES_FONDO = esc.luces
  const pasarMes = useJuego((s) => s.pasarMes)
  const tocar = useJuego((s) => s.tocar)
  const construirObjeto = useJuego((s) => s.construir)
  const [ref, { w, h }] = useTamano()
  // De visita, su mes ya pasó: ni se descuida ni crece; solo está en su casa.
  const rReal = estadoRincon(partida, AREA, ahora)
  const r = visita ? { ...rReal, fase: 0 as const, hoy: 0 } : rReal
  const momento = momentoDelDia(ahora)
  const noche = momento === 'noche'
  const [habla, setHabla] = useState<{ texto: string; n: number; contento?: boolean } | null>(null)
  const [saltos, setSaltos] = useState(0)
  const [recien, setRecien] = useState<string | null>(null)
  const [hoja, setHoja] = useState(false)
  const verEtapa = useJuego((s) => s.verEtapa)
  const g = progreso(partida, DUENO, ahora)
  const [celebra, setCelebra] = useState<number | null>(null)
  const [hallazgo, setHallazgo] = useState<string | null>(null)
  const presentar = useJuego((s) => s.presentar)
  // Compañero del mes: aún en el huevo, naciendo (se enseña la eclosión una vez) o ya en casa.
  const estado = visita ? 'vivo' : estadoDelMes(partida, ahora)
  const vivo = estado === 'vivo'
  const faltaHuevo = faltanParaEclosion(partida, ahora)
  const [toques, setToques] = useState(0)
  const [nacer, setNacer] = useState<'rompiendo' | 'salio' | 'ficha' | null>(null)
  useEffect(() => {
    if (estado !== 'naciendo') return
    const pasos = [
      setTimeout(() => setNacer('rompiendo'), 500),
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
    : habla?.contento ? 'contento'
    : noche && !habla ? 'dormido'
    : r.fase >= 2 ? 'enfurrunado'
    : r.hoy > 0 ? 'contento'
    : 'base'

  // Al volver a casa, Nox comenta lo último que hiciste (si no hay celebración de crecer, que va antes).
  const contar = useJuego((s) => s.contar)
  useEffect(() => {
    if (pendiente || !vivo || visita) return
    const t = setTimeout(() => {
      const noticia = contar()
      const f = noticia?.frase
      if (f && f.companero === DUENO) { setSaltos((n) => n + 1); setHabla({ texto: f.texto, n: Date.now(), contento: true }) }
      if (noticia?.hallazgos.length) setHallazgo(noticia.hallazgos.join(' · '))
    }, 600)
    return () => clearTimeout(t)
  }, [pendiente, vivo, visita, contar, DUENO])

  const hablar = () => {
    if (estado === 'huevo') {
      // Va rotando las frases para no repetir seguidas.
      const lista = UI.casa.huevoToques[Math.min(3, Math.max(1, faltaHuevo)) as 1 | 2 | 3]
      setToques((n) => n + 1)
      setHabla({ texto: lista[toques % lista.length], n: Date.now() })
      return
    }
    if (estado === 'naciendo') return
    setSaltos((n) => n + 1)
    if (!r.llegado) { setHabla({ texto: UI.casa.dormido(COMPANEROS[DUENO].nombre, r.faltanParaLlegar), n: Date.now() }); return }
    const f = tocar(DUENO, visita)
    if (f) setHabla({ texto: f.texto, n: Date.now() })
  }
  const alConstruir = (id: string) => {
    const res = construirObjeto(id, DUENO)
    if (!res.ok) return
    setHoja(false)
    setRecien(id)
    setTimeout(() => { setSaltos((n) => n + 1); if (res.frase) setHabla({ texto: res.frase.texto, n: Date.now(), contento: true }) }, 650)
  }

  const objetos = OBJETOS_CASA.filter((o) => o.companero === DUENO && construido(partida, o.id))
  const mat = disponibles(partida, DUENO, ahora)
  const listos = OBJETOS_CASA.filter((o) => o.companero === DUENO && puedeConstruir(partida, o, ahora)).length
  // Lo de abajo se pinta delante: se ordena por la altura de los pies.
  const capas = [...objetos.map((o) => ({ y: o.sitio.colgado ? 0 : o.sitio.y, o })), { y: NOX.y, o: null }].sort((a, b) => a.y - b.y)
  // Alto (en % del fondo) de algo que ocupa `ancho` % del ancho con esa proporción.
  const alto = (ancho: number, prop: number) => (ancho * prop * ew) / eh
  // Hasta que se celebra, se sigue viendo la etapa anterior.
  const etapaVista = pendiente ? (partida.etapasVistas?.[DUENO] ?? 0) : g.etapa
  // Acaba su mes: informe (solo si ya hay otro compañero listo para llegar; si no, el mes sigue).
  const mes = mesActual(partida)
  const diaMes = diaDelMes(mes, ahora).dia
  const finDeMes = vivo && !mes.cerrado && diaDelMes(mes, ahora).terminado &&
    ORDEN_COMPANEROS.filter(tieneMes).some((c) => !mesesDe(partida).some((m) => m.companero === c))

  // Mientras no ha salido, en su sitio está el huevo.
  const conHuevo = estado === 'huevo' || (estado === 'naciendo' && (nacer === null || nacer === 'rompiendo'))
  const anchoNox = conHuevo ? ANCHO_HUEVO : ANCHO_NOX[etapaVista]
  const altoNox = alto(anchoNox, 1)

  return (
    <main ref={ref} className="relative mx-auto h-dvh max-w-[430px] overflow-hidden bg-[#c9bf7f]">
      <div className="absolute" style={escenario} onClick={() => setHabla(null)}>
        <img src={rutaArte(`casa/${DUENO}/fondo`)} alt="" className="absolute inset-0 h-full w-full" draggable={false} />

        {capas.map(({ o }) => o ? <Objeto key={o.id} o={o} nuevo={recien === o.id} ew={ew} eh={eh} /> : (
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

        {habla && (
          <div key={habla.n} role="status" className="absolute z-30"
            style={{ left: `${NOX.x}%`, top: `${NOX.y - altoNox - 1}%`, width: Math.min(w - 32, 340), transform: 'translate(-50%, -100%)' }}>
            <div className="animate-entrar relative rounded-3xl bg-tarjeta px-4 py-3 text-[16px] leading-snug text-texto shadow-lg">
              {habla.texto}
              <span aria-hidden className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-tarjeta" />
            </div>
          </div>
        )}
      </div>

      {/* Arriba: de quién es la casa y ajustes. */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-[max(12px,calc(env(safe-area-inset-top)+32px))]">
        <button type="button" onClick={onDetalle} className="min-h-11 min-w-[150px] rounded-2xl bg-tarjeta/85 px-3.5 py-1.5 text-left shadow-sm backdrop-blur-sm">
          {conHuevo ? (
            <>
              <span className="block text-[18px] leading-tight font-bold">{UI.casa.huevo}</span>
              <span className="block text-[13px] text-texto-3">{UI.casa.diaCorto(diaMes)}</span>
              <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-hundido">
                <span className="block h-full rounded-full bg-[#f08a3c] transition-[width] duration-700" style={{ width: `${((OFRENDAS_ECLOSION - faltaHuevo) / OFRENDAS_ECLOSION) * 100}%` }} />
              </span>
            </>
          ) : (<>
          <span className="block text-[18px] leading-tight font-bold">{COMPANEROS[DUENO].nombre}</span>
          <span className="block text-[13px] text-texto-3">
            {visita ? HISTORIAS[DUENO]?.vecino[etapaVista] ?? UI.casa.etapas[etapaVista] : `${UI.casa.diaCorto(diaMes)} · ${UI.casa.etapas[etapaVista].toLowerCase()}`}
            {r.fase > 0 && <span className="font-semibold text-peligro"> · {UI.bosque.fases[r.fase]}</span>}
          </span>
          {g.siguiente && !pendiente && !visita && (
            <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-hundido">
              <span className="block h-full rounded-full bg-[#f08a3c] transition-[width] duration-700" style={{ width: `${((g.crecimiento - g.desde) / (g.siguiente - g.desde)) * 100}%` }} />
            </span>
          )}
          </>)}
        </button>
        <button type="button" onClick={visita ? onVolver : onBosque} className="min-h-11 shrink-0 whitespace-nowrap rounded-full bg-tarjeta/85 px-4 text-sm font-semibold text-texto-2 shadow-sm backdrop-blur-sm">
          {visita ? `‹ ${UI.casa.alBosque}` : `${UI.casa.alBosque} ›`}
        </button>
      </header>

      {/* Abajo: materiales y construir, encima de la navegación. */}
      <div className="absolute inset-x-0 bottom-[calc(78px+env(safe-area-inset-bottom))] z-30 px-3">
        <div className="rounded-3xl bg-tarjeta/92 p-3 shadow-lg backdrop-blur-sm">
          <Materiales mat={mat} />
          <button type="button" onClick={() => setHoja(true)}
            className={`relative mt-2.5 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-bold active:scale-[0.98] ${
              listos ? 'bg-ambar text-tinta' : 'border-2 border-borde text-texto-2'}`}>
            {UI.casa.construir}
            {listos > 0 && <span className="rounded-full bg-tinta px-2 py-0.5 text-[12px] text-ambar">{listos}</span>}
          </button>
        </div>
      </div>

      {hallazgo && !celebra && (
        <div className="animate-entrar absolute inset-x-0 top-[calc(max(12px,calc(env(safe-area-inset-top)+32px))+76px)] z-30 flex justify-center px-4">
          <span className="rounded-full bg-ambar px-5 py-2.5 text-center text-[15px] font-bold text-tinta shadow-lg">{UI.casa.encontrado(hallazgo)}</span>
        </div>
      )}
      {celebra && (
        <div role="status" className="animate-entrar absolute inset-x-0 top-[calc(max(12px,calc(env(safe-area-inset-top)+32px))+76px)] z-30 flex justify-center px-4">
          <span className="rounded-full bg-ambar px-5 py-2.5 text-[16px] font-bold text-tinta shadow-lg">{nacer ? UI.casa.nacio(COMPANEROS[DUENO].nombre) : UI.casa.crecio(COMPANEROS[DUENO].nombre, UI.casa.etapas[g.etapa])}</span>
        </div>
      )}

      {!visita && finDeMes && (
        <Informe partida={partida} ahora={ahora} dueno={DUENO} etapa={g.etapa} onSiguiente={pasarMes} />
      )}
      {nacer === 'ficha' && <Ficha c={DUENO} onCerrar={() => { setNacer(null); presentar() }} />}

      {hoja && <Catalogo dueno={DUENO} partida={partida} ahora={ahora} onCerrar={() => setHoja(false)} onConstruir={alConstruir} />}
    </main>
  )
}

/** Informe del mes: sobrio, con números y la última frase del compañero. */
function Informe({ partida, ahora, dueno, etapa, onSiguiente }: {
  partida: Partida; ahora: Date; dueno: CompaneroId; etapa: 0 | 1 | 2; onSiguiente: () => void
}) {
  const comp = COMPANEROS[dueno]
  const i = informe(partida, mesActual(partida), ahora)
  const suyos = OBJETOS_CASA.filter((o) => o.companero === dueno)
  const hechos = suyos.filter((o) => construido(partida, o.id)).length
  const cierre = HISTORIAS[dueno]?.cierre[etapa]
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-end bg-[#2e2030]/55 px-3 pb-[max(16px,env(safe-area-inset-bottom))]">
      <section role="dialog" aria-label={UI.casa.informe.titulo(comp.nombre)} className="anim-hoja max-h-[90dvh] w-full overflow-y-auto rounded-[28px] bg-fondo p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <img src={rutaCompanero(dueno, etapa, 'base')} alt="" className="h-16 w-16 shrink-0" />
          <div>
            <h2 className="text-[24px] leading-tight font-bold">{UI.casa.informe.titulo(comp.nombre)}</h2>
            <div className="text-[14px] text-texto-3">{UI.casa.informe.acaba(UI.casa.etapas[etapa])}</div>
          </div>
        </div>
        <dl className="mt-4 rounded-2xl bg-tarjeta p-3 text-[15px]">
          <div className="font-semibold">{UI.casa.informe.dias(i.diasConAlgo, i.dias)}</div>
          <div className="mt-1 text-texto-2">{UI.casa.informe.hazanas(i.total)}</div>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[14px]">
            {ORDEN_AREAS.map((a) => (
              <li key={a} className="flex items-center gap-1.5">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: MATERIALES[a].color }} />
                {AREAS[a].nombre}: <span className="font-semibold">{i.porArea[a]}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-texto-2">{UI.casa.informe.construido(hechos, suyos.length)}</div>
        </dl>
        {cierre && <p className="mt-4 text-[16px] leading-snug italic">«{cierre}»</p>}
        <p className="mt-3 text-[14px] leading-snug text-texto-3">{UI.casa.informe.seQueda(comp.nombre)}</p>
        <button type="button" onClick={onSiguiente} className="mt-4 min-h-12 w-full rounded-2xl bg-ambar text-[16px] font-bold text-tinta">
          {UI.casa.informe.siguiente}
        </button>
      </section>
    </div>,
    document.body,
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

function Luz({ x, y, tam, color, retraso }: { x: number; y: number; tam: number; color: string; retraso: number }) {
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
function Luciernagas({ cuantas }: { cuantas: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {SITIOS_LUCIERNAGAS.slice(0, cuantas).map(([x, y], i) => (
        <span key={i} className="anim-luciernaga absolute h-1.5 w-1.5 rounded-full bg-[#fff3b0] shadow-[0_0_8px_3px_#ffe27a88]"
          style={{ left: `${x}%`, top: `${y}%`, '--dx': `${(i % 3) * 8 - 8}px`, '--dy': `${(i % 2 ? -1 : 1) * 10}px`, '--t': `${5 + (i % 4)}s`, animationDelay: `${i * 0.6}s` } as CSSProperties} />
      ))}
    </div>
  )
}

function Objeto({ o, nuevo, ew, eh }: { o: ObjetoCasa; nuevo: boolean; ew: number; eh: number }) {
  const s = o.sitio
  const estilo: CSSProperties = s.colgado
    ? { left: `${s.x}%`, top: `${s.y}%`, width: `${s.ancho}%`, transform: 'translateX(-50%)' }
    : { left: `${s.x}%`, top: `${s.y}%`, width: `${s.ancho}%`, transform: 'translate(-50%, -100%)' }
  const centroY = s.colgado ? s.y + (s.ancho * o.proporcion * ew) / eh / 2 : s.y - (s.ancho * o.proporcion * ew) / eh / 2
  return (
    <>
      {s.colgado && <span aria-hidden className="absolute top-0 w-[2px] bg-[#6b3f36]" style={{ left: `${s.x}%`, height: `${s.y + 1}%` }} />}
      <div className="absolute" style={estilo}>
        <div className={s.colgado ? 'anim-balanceo' : ''}>
          <img src={rutaArte(`casa/${o.companero}/objeto/${o.id}`)} alt={o.nombre} draggable={false} className={`block w-full ${nuevo ? 'anim-brotar' : ''}`} />
        </div>
      </div>
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
  const mat = disponibles(partida, DUENO, ahora)
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
          {OBJETOS_CASA.filter((o) => o.companero === DUENO).map((o) => {
            const hecho = construido(partida, o.id)
            const f = faltan(partida, o, ahora)
            const puede = !hecho && Object.keys(f).length === 0
            return (
              <li key={o.id} className="flex items-center gap-3 rounded-3xl bg-tarjeta p-3">
                <img src={rutaArte(`casa/${o.companero}/objeto/${o.id}`)} alt="" className="h-16 w-16 shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{o.nombre}</div>
                  <div className="text-[13px] leading-snug text-texto-3 italic">«{o.descripcion}»</div>
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
      </section>
    </div>,
    document.body,
  )
}
