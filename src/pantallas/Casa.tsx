import type React from 'react'
// La casa de un vecino (docs/diseno-vecindario.md). Lo que manda es la escena: fondo, lo construido, las
// huellas de las historias y el vecino. La interfaz va encima, arriba y abajo, sin tapar el centro.
// Todo lo que se mueve es código.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { AREAS, COMPANEROS, ESCENAS, HISTORIAS, ORDEN_COMPANEROS, MATERIALES, OBJETOS_CASA, UI, type AreaId, type CompaneroId, type ObjetoCasa } from '../contenido'
import { FRASES_VISITA, type Huella } from '../contenido/situaciones'
import type { Partida } from '../logica/partida'
import { estadoRincon } from '../logica/reglas'
import { momentoDelDia } from '../logica/momento'
import { construido, disponibles, faltan, proyectosDe, proyectosVisibles, puedeConstruir } from '../logica/casa'
import { crecioSinVer, huevoDisponible, progreso } from '../logica/etapas'
import { estadoDelMes, faltanParaEclosion, mesActual } from '../logica/meses'
import { decisionPendiente, dondeGregorio, fraseDeSituacion, huellasEn, microDeHoy, visitante } from '../logica/situaciones'
import { sfx } from '../sonido'
import { BotonConstruir } from '../componentes/BotonConstruir'
import { BotonPastilla, BotonRedondo, Icono, ICONOS } from '../componentes/BotonFlotante'
import { Materiales } from '../componentes/Bolsa'
import { GREGORIO_EN_NOX, VISITANTES, sitioVisita } from '../contenido/casa'
import { colocar, encajar, guardado, guardar, movible, ordenOriginal, sacar, sitioDe } from '../logica/colocar'
import { globoEn, useGlobo } from '../estado/globo'
import { Aviso, Punto } from '../componentes/Aviso'
import { FichaVecino } from '../componentes/FichaVecino'
import { FiguraVecino } from '../componentes/FiguraVecino'
import { SugerirHazanas } from '../componentes/SugerirHazanas'
import { misHazanas } from '../logica/hazanas'
import { resolverTravesura, travesuraPendiente } from '../logica/curiosidades'
import { CURIOSIDADES } from '../contenido/curiosidades'

/** Dónde está la piña de la primera travesura de Nox (medio escondida tras su cola). */
const PIÑA = { x: 34, y: 75, ancho: 10 }
import { avisoFuera, fichaNueva, gagDeHoy, pendientesDelSobre, huellaNueva, microSinVer, verFicha, verGag, verHuella, verMicro, visitarLugar } from '../logica/avisos'
import { GagEnEscena } from '../componentes/GagEnEscena'
import { EfectoDeObjeto, GESTOS_DE_OBJETO, VidaDeCasa } from '../componentes/VidaDeCasa'
import { SONIDO_OBJETO, TOQUES_GREGORIO_EN_NOX, TOQUES_OBJETO } from '../contenido'
import { rutaArte, rutaCompanero, tieneMes, type Expresion } from '../arte/manifiesto'
import { useJuego } from '../estado/juego'
import { IconoMaterial } from '../componentes/IconoMaterial'

const ANCHO_HUEVO = 30
/** De dónde sale una nota: el vecino, quien está de visita o un objeto de la casa (su id). */
type Origen = 'vecino' | 'visita' | string
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


export function Casa({ partida, ahora, dueno, visita = false, onBarrio, onNovedades, abrirDecision = false, onDecisionAbierta }: {
  partida: Partida; ahora: Date; dueno: CompaneroId; visita?: boolean
  onBarrio: () => void
  /** Abre el sobre («Mientras no estabas…»). */
  onNovedades: () => void
  /** Venir del sobre a decidir: la pregunta sale abierta. */
  abrirDecision?: boolean; onDecisionAbierta?: () => void
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
  // Lo que pasa (narración): sale de quien lo protagoniza (el vecino, la visita o un objeto), no de arriba.
  const [nota, ponerNota] = useState<{ texto: string; de?: Origen } | null>(null)
  // Un mensaje cada vez: si aparece una nota, se cierra el bocadillo.
  const setNota = (t: string | null, de?: Origen) => { if (t) setHabla(null); ponerNota(t ? { texto: t, de } : null) }
  // Si sale un globo (has tocado un objeto), se callan el bocadillo y la nota.
  const globo = useGlobo((st) => st.globo)
  useEffect(() => { if (globo) { setHabla(null); ponerNota(null) } }, [globo])
  const [saltos, setSaltos] = useState(0)
  const [ladoTofu, setLadoTofu] = useState<-1 | 1>(1)
  const [recien, setRecien] = useState<string | null>(null)
  const [hoja, setHoja] = useState(false)
  // Ordenar la casa: los objetos se arrastran con el dedo; al soltar, se guarda dónde.
  const [ordenando, setOrdenando] = useState(false)
  const [arrastre, setArrastre] = useState<{ id: string; x: number; y: number } | null>(null)
  const baul = useRef<HTMLButtonElement>(null)
  const [verBaul, setVerBaul] = useState(false)
  const enBaul = OBJETOS_CASA.filter((o) => o.companero === DUENO && guardado(partida, o.id))
  const verEtapa = useJuego((s) => s.verEtapa)
  const g = progreso(partida, DUENO, ahora)
  const [celebra, setCelebra] = useState<number | null>(null)
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
  const verCosita = () => {
    if (!micro) return
    // Sale de la visita, del objeto del que va (si está en el suelo: los colgados quedan arriba, junto a la
    // cabecera, y parecería un aviso) o, si no, del propio vecino.
    setNota(micro.texto, micro.visita ? 'visita' : micro.requiere.find((r) => construido(partida, r) && OBJETOS_CASA.some((o) => o.id === r && o.companero === DUENO && !o.sitio.colgado)))
    ajustar((p) => verMicro(p, DUENO, ahora))
  }
  const [decisionAbierta, setDecisionAbierta] = useState(abrirDecision)
  useEffect(() => { if (abrirDecision) onDecisionAbierta?.() }, [abrirDecision, onDecisionAbierta])
  const [ficha, setFicha] = useState(false)
  // La escena que se puede tocar hoy (se fija al entrar, para que su animación no desaparezca al verla).
  const [gag] = useState(() => (estado === 'vivo' ? gagDeHoy(partida, DUENO, ahora) : null))
  // Primera travesura de Nox: una piña negra mal escondida tras la cola. Tocarla y decidir qué hacer con ella.
  const piñaPendiente = vivo && !nacer && travesuraPendiente(partida, DUENO)
  const piñaAqui = DUENO === 'nox' && partida.vistos?.pina === 'aqui'
  const [preguntaPiña, setPreguntaPiña] = useState(false)
  const tocarPiña = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (piñaAqui) { globoEn(e, CURIOSIDADES.find((x) => x.id === 'pina')!.texto); return }
    sfx.personaje('nox')
    globoEn(e, UI.arranque.piñaAviso)
    setTimeout(() => setPreguntaPiña(true), 1300)
  }
  // Al entrar, se apagan los avisos de novedades de esta casa.
  useEffect(() => { ajustar((p) => visitarLugar(p, DUENO)) }, [ajustar, DUENO])
  // El huevo listo espera a que lo toques: el último toque es tuyo.
  const [abriendo, setAbriendo] = useState(false)
  useEffect(() => {
    if (estado === 'naciendo' && !abriendo) setNota(UI.arranque.daleUnToque)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])
  useEffect(() => {
    if (estado !== 'naciendo' || !abriendo) return
    // Con «reducir movimiento», la eclosión dura menos.
    const k = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.35 : 1
    const pasos = [
      setTimeout(() => { setNacer('rompiendo'); sfx.eclosion(k < 1) }, 150),
      setTimeout(() => { setNacer('salio'); setCelebra(Date.now()); setSaltos((n) => n + 1) }, 1750 * k),
      setTimeout(() => setNacer('ficha'), 3250 * k),
    ]
    return () => pasos.forEach(clearTimeout)
  }, [estado, abriendo])

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
      const f = contar()
      // La reacción ya salió al tachar la hazaña: aquí solo se celebra con un saltito.
      if (f && f.companero === DUENO) setSaltos((n) => n + 1)
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
    if (estado === 'naciendo') { if (!abriendo) { setNota(null); setAbriendo(true) } return }
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
    ...OBJETOS_CASA.filter((o) => o.companero === DUENO && o.id !== 'aspiradora' && construido(partida, o.id) && !guardado(partida, o.id) && rutaArte(`casa/${DUENO}/objeto/${o.id}`))
      .map((o) => ({ ...o, sitio: sitioDe(partida, o, arrastre?.id === o.id ? arrastre : undefined) })),
    ...(gregorio === DUENO ? [DUENO === 'tuerca' ? aspiradora : { ...aspiradora, sitio: GREGORIO_EN_NOX }] : []),
  ]
  const hoguera = objetos.find((o) => o.id === 'hoguera')
  const maceta = objetos.find((o) => o.id === 'maceta')
  const huellas = huellasEn(partida, DUENO)
  const decision = decisionPendiente(partida, DUENO)
  const deVisita = (microVisible && micro?.visita) || visitante(partida, DUENO, ahora)
  const otroHuevo = esUltimo && vivo ? huevoDisponible(partida, ahora, ORDEN_COMPANEROS.filter(tieneMes)) : null
  const listos = proyectosVisibles(partida, DUENO).filter((o) => puedeConstruir(partida, o, ahora)).length
  const fuera = avisoFuera(partida, DUENO, ahora)
  const pendientes = pendientesDelSobre(partida, ahora)
  // Lo de abajo se pinta delante: se ordena por la altura de los pies.
  // Mientras arrastras algo, su orden no cambia (si el navegador lo moviera de sitio, se soltaría del dedo):
  // va por encima de todo y se reordena al soltarlo.
  const yOrden = (o: ObjetoCasa) => o.sitio.colgado ? 0 : arrastre?.id === o.id ? sitioDe(partida, OBJETOS_CASA.find((k) => k.id === o.id)!).y : o.sitio.y
  const capas = [...objetos.map((o) => ({ y: yOrden(o), o })), { y: NOX.y, o: null }].sort((a, b) => a.y - b.y)
  // Alto (en % del fondo) de algo que ocupa `ancho` % del ancho con esa proporción.
  const alto = (ancho: number, prop: number) => (ancho * prop * ew) / eh
  // Hasta que se celebra, se sigue viendo la etapa anterior.
  const etapaVista = pendiente ? (partida.etapasVistas?.[DUENO] ?? 0) : g.etapa
  // Mientras no ha salido, en su sitio está el huevo.
  const conHuevo = estado === 'huevo' || (estado === 'naciendo' && (nacer === null || nacer === 'rompiendo'))
  const anchoNox = conHuevo ? ANCHO_HUEVO : ANCHO_NOX[etapaVista]
  const altoNox = alto(anchoNox, 1)

  // De noche, el tinte se aclara alrededor del vecino: el fondo sigue oscuro y él conserva sus contornos.
  const centroY = NOX.y - altoNox * 0.45
  const radio = anchoNox * 0.75
  const gradiente = `radial-gradient(circle at ${NOX.x}% ${centroY}%, rgba(0,0,0,0.35) 0, rgba(0,0,0,0.35) ${radio * 0.55}%, black ${radio * 1.15}%)`
  const mascaraNoche: CSSProperties = { WebkitMaskImage: gradiente, maskImage: gradiente }
  const luzHoguera = noche && hoguera?.luz ? {
    x: hoguera.sitio.x + ((hoguera.luz.x - 50) / 100) * hoguera.sitio.ancho,
    y: hoguera.sitio.y - (1 - hoguera.luz.y / 100) * alto(hoguera.sitio.ancho, hoguera.proporcion),
  } : null
  const ladoMaceta = maceta ? (maceta.sitio.x < NOX.x ? -1 : 1) : undefined

  return (
    <main ref={ref} className="escena-vecindario relative mx-auto h-dvh max-w-[430px] overflow-hidden select-none bg-[#c9bf7f]">
      <div className="absolute" style={escenario} onClick={() => setHabla(null)}>
        <img src={rutaArte(`casa/${DUENO}/fondo`)} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
        {vivo && !ordenando && <VidaDeCasa vecino={DUENO} />}

        {huellas.map((hu) => <HuellaEnEscena quieta={ordenando} key={hu.id} h={hu} ew={ew} nueva={huellaNueva(partida, hu.id, ahora)} onTocar={(e) => { if (hu.toque) globoEn(e, hu.toque); ajustar((p) => verHuella(p, hu.id)) }} />)}
        {capas.map(({ o }) => o ? <Objeto key={o.id} o={o} nuevo={recien === o.id} ew={ew} eh={eh} frases={o.id === 'aspiradora' && DUENO === 'nox' ? TOQUES_GREGORIO_EN_NOX : TOQUES_OBJETO[o.id] ?? [o.descripcion]}
          ordenando={ordenando} movible={movible(o)} arrastrando={arrastre?.id === o.id}
          onMover={(x, y) => setArrastre({ id: o.id, ...encajar(o, x, y) })}
          onSoltar={(x, y, punto) => {
            setArrastre(null)
            // Soltado encima del baúl: se guarda. Si no, se deja donde está.
            const b = baul.current?.getBoundingClientRect()
            if (b && punto.x >= b.left - 8 && punto.x <= b.right + 8 && punto.y >= b.top - 8 && punto.y <= b.bottom + 8) {
              sfx.construir(); ajustar((p) => guardar(p, o.id)); return
            }
            sfx.objeto(SONIDO_OBJETO[o.id] ?? 'madera'); ajustar((p) => colocar(p, o.id, x, y))
          }} /> : (
          <div key="nox" className={`absolute z-10 ${ordenando ? 'pointer-events-none' : ''}`} style={{ left: `${NOX.x}%`, top: `${NOX.y}%`, width: `${anchoNox}%`, transform: 'translate(-50%, -100%)', transition: 'width 0.8s cubic-bezier(.3,.7,.4,1)' }}>
            <span aria-hidden className="sombra-vecino pointer-events-none" data-vecino={conHuevo ? 'huevo' : DUENO} />
            <button type="button" aria-label={conHuevo ? UI.casa.huevo : UI.bosque.hablar(COMPANEROS[DUENO].nombre)}
              onClick={(e) => {
                e.stopPropagation()
                if (ordenando) return
                if (DUENO === 'tofu') {
                  const caja = e.currentTarget.getBoundingClientRect()
                  setLadoTofu(e.detail && e.clientX < caja.left + caja.width / 2 ? -1 : 1)
                }
                hablar()
              }} className={`relative block w-full ${DUENO === 'tofu' && !conHuevo && !noche ? 'tofu-a-contraluz' : ''}`}>
              {conHuevo ? (
                <span key={`h${toques}`} className={`block ${toques ? 'anim-temblar' : ''}`}>
                  <img src={rutaArte(`huevo/${DUENO}/${faltaHuevo <= 1 || estado === 'naciendo' ? 'agrietado' : 'cerrado'}`)} alt="" draggable={false}
                    className={`block w-full ${nacer === 'rompiendo' ? 'anim-eclosionar' : estado === 'naciendo' ? 'anim-inquieto' : 'anim-mecer'}`} />
                </span>
              ) : (
                <span key={etapaVista} className={`block ${celebra ? 'anim-brotar' : ''}`}>
                  <FiguraVecino c={DUENO} etapa={etapaVista} expresion={expresion} reaccion={saltos} ladoToque={ladoTofu} ladoMaceta={ladoMaceta} />
                </span>
              )}
            </button>
          </div>
        ))}

        {/* El visitante que se cuela cuando llevas días sin aparecer: se va solo con unos pocos retos. */}
        {esUltimo && vivo && rReal.visitante && !ordenando && VISITANTES[DUENO] && (() => { const v = VISITANTES[DUENO]!; return (
          <button type="button" aria-label={UI.casa.visitante(UI.casa.visitantes[v.quien])}
            onClick={(e) => { e.stopPropagation(); sfx.toque(); globoEn(e, `${UI.casa.visitantes[v.quien]}: «${UI.casa.dichoVisitante[v.quien]}»`) }}
            className={`absolute z-10 ${v.quien === 'polilla' ? 'anim-flotar' : 'anim-respirar'}`}
            style={{ left: `${v.x}%`, top: `${v.y}%`, width: `${v.ancho}%`, transform: 'translate(-50%, -100%)' }}>
            <img src={`/arte/visitantes/${v.quien}.webp`} alt="" draggable={false} className="block w-full" />
          </button>
        ) })()}
        {deVisita && sitioVisita(DUENO, deVisita) && (() => { const sv = sitioVisita(DUENO, deVisita)!; return (
          <button type="button" aria-label={UI.casa.deVisita(COMPANEROS[deVisita].nombre)}
            onClick={(e) => { e.stopPropagation(); const l = FRASES_VISITA[deVisita] ?? []; if (l.length) globoEn(e, `${COMPANEROS[deVisita].nombre}: «${l[toquesSit % l.length]}»`); setToquesSit((n) => n + 1) }}
            className={`absolute z-10 ${ordenando ? 'pointer-events-none' : ''}`} style={{ left: `${sv.x}%`, top: `${sv.y}%`, width: `${sv.ancho}%`, transform: 'translate(-50%, -100%)' }}>
            <img src={rutaCompanero(deVisita, progreso(partida, deVisita, ahora).etapa, 'base')} alt="" draggable={false} className="anim-respirar block w-full" />
          </button>
        ) })()}
        {otroHuevo && (
          <button type="button" aria-label={UI.casa.huevoEnPuerta} onClick={(e) => { e.stopPropagation(); setPreguntaHuevo(true) }}
            className="absolute z-10" style={{ left: '81%', top: '71%', width: '12%', transform: 'translate(-50%, -100%)' }}>
            <img src={rutaArte(`huevo/${otroHuevo}/cerrado`)} alt="" draggable={false} className="anim-mecer block w-full" />
          </button>
        )}

        {/* Luz del momento del día: tiñe el dibujo, sin cambiarlo. */}
        <div aria-hidden style={luzHoguera ? {
          background: `radial-gradient(ellipse at ${luzHoguera.x}% ${luzHoguera.y}%, transparent 3%, #65517066 28%, #3b2c63 67%)`,
        } : noche && !conHuevo ? mascaraNoche : undefined} className={`pointer-events-none absolute inset-0 z-20 mix-blend-multiply transition-opacity duration-1000 ${
          luzHoguera ? 'opacity-80' : noche ? 'bg-[#3b2c63] opacity-75' : momento === 'atardecer' ? 'bg-[#ff9f7a] opacity-35' : momento === 'amanecer' ? 'bg-[#ffcfb8] opacity-40' : 'opacity-0'}`} />
        {luzHoguera && <div aria-hidden className="luz-hoguera pointer-events-none absolute inset-0 z-20 mix-blend-screen"
          style={{ background: `radial-gradient(ellipse 54% 20% at ${luzHoguera.x}% ${luzHoguera.y + 3}%, #ffa14775 0%, #f7a24b35 46%, transparent 100%)` }} />}

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

        {(piñaPendiente || piñaAqui) && (
          <button type="button" aria-label={UI.arranque.piña} onClick={tocarPiña} className="absolute z-[11] before:absolute before:-inset-2 before:content-['']"
            style={{ left: `${PIÑA.x}%`, top: `${PIÑA.y}%`, width: `${PIÑA.ancho}%`, transform: 'translate(-50%, -100%)' }}>
            <img src="/arte/curiosidades/pina.webp" alt="" draggable={false} className={`block w-full ${piñaPendiente ? 'anim-nuevo' : ''}`} />
          </button>
        )}
        {piñaPendiente && <span aria-hidden className="anim-brasa pointer-events-none absolute z-[11] h-2 w-2 rounded-full bg-[#ffb347] shadow-[0_0_8px_3px_#ff8a3d]" style={{ left: `${PIÑA.x + 2}%`, top: `${PIÑA.y - 11}%` }} />}

        {gag && !ordenando && <GagEnEscena gag={gag} onVisto={() => ajustar((p) => verGag(p, DUENO, ahora))} />}

        {/* Avisos sobre el vecino: «…» una cosa pequeña del día, «?» una decisión. Esperan a que los toques. */}
        {vivo && !celebra && !ordenando && (microPorVer || (decision && !decisionAbierta)) && (
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

        {/* Lo que pasa (narración): un globo oscuro que sale de quien lo protagoniza. Nunca a la vez que un bocadillo. */}
        {nota && !habla && !celebra && (() => {
          const o = typeof nota.de === 'string' && nota.de !== 'vecino' && nota.de !== 'visita' ? objetos.find((x) => x.id === nota.de) : undefined
          const sv = nota.de === 'visita' && deVisita ? sitioVisita(DUENO, deVisita) : undefined
          const p = o ? { x: o.sitio.x, y: o.sitio.colgado ? o.sitio.y + alto(o.sitio.ancho, o.proporcion) + 1 : o.sitio.y - alto(o.sitio.ancho, o.proporcion) - 1, abajo: Boolean(o.sitio.colgado) }
            : sv ? { x: sv.x, y: sv.y - alto(sv.ancho, 1) - 1, abajo: false }
            : { x: NOX.x, y: NOX.y - altoNox - 1, abajo: false }
          // Que no se salga por los lados: el globo se centra en el punto pero se queda dentro de la pantalla.
          const anchoGlobo = Math.min(w - 32, 280)
          const xPx = (p.x / 100) * ew + (w - ew) / 2
          const desplaza = Math.min(Math.max(xPx, 16 + anchoGlobo / 2), w - 16 - anchoGlobo / 2) - xPx
          return (
            <div key={nota.texto} role="status" className="pointer-events-none absolute z-30"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: anchoGlobo, transform: `translate(calc(-50% + ${desplaza}px), ${p.abajo ? '0' : '-100%'})` }}>
              <div className="animate-entrar relative mx-auto w-fit rounded-[20px] bg-[#2e2030]/85 px-3.5 py-2 text-center text-[14px] leading-snug text-[#fbefe4] italic shadow-md backdrop-blur-sm">
                {nota.texto}
                <span aria-hidden className={`absolute h-3.5 w-3.5 rotate-45 bg-[#2e2030]/85 ${p.abajo ? '-top-1.5' : '-bottom-1.5'}`} style={{ left: `calc(50% - ${desplaza}px - 7px)` }} />
              </div>
            </div>
          )
        })()}
        {/* Sobre el vecino: la celebración (nace o crece) y, debajo, lo que dice. Todo sale de él. */}
        {(habla || celebra) && (
          <div key={`${habla?.n ?? ''}-${celebra ?? ''}`} role="status" className="absolute z-30 flex flex-col items-center gap-2"
            style={{ left: `${NOX.x}%`, top: `${NOX.y - altoNox - 1}%`, width: Math.min(w - 48, 290), transform: 'translate(-50%, -100%)' }}>
            {celebra && (
              <span className="animate-entrar rounded-full bg-ambar px-4 py-2 text-[16px] font-bold whitespace-nowrap text-tinta shadow-lg">
                {nacer || g.etapa === 0 ? UI.casa.nacio(COMPANEROS[DUENO].nombre) : UI.casa.crecio(COMPANEROS[DUENO].nombre, UI.casa.etapas[g.etapa])}
              </span>
            )}
            {habla && (
              <div className="animate-entrar relative mx-auto w-fit rounded-[22px] bg-tarjeta px-3.5 py-2 text-center text-[15px] leading-snug text-texto shadow-md">
                {habla.texto}
                <span aria-hidden className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-tarjeta" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Arriba: a la izquierda, al barrio (con aviso si pasa algo en otra casa); a la derecha, el sobre. */}
      <header className={`pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-3 pt-[max(12px,calc(env(safe-area-inset-top)+32px))] ${ordenando ? 'hidden' : ''}`}>
        <h1 className="sr-only">{conHuevo ? UI.casa.huevo : COMPANEROS[DUENO].nombre}</h1>
        <span className="pointer-events-auto relative">
          <BotonPastilla etiqueta={fuera === 'pregunta' ? UI.barrio.esperanFuera : fuera ? UI.barrio.hayAlgoFuera : undefined} onToque={onBarrio}>
            <Icono d={visita ? ICONOS.atras : ICONOS.mapa} tam={22} />{UI.casa.alBarrio}
          </BotonPastilla>
          {fuera === 'pregunta' ? <span className="pointer-events-none absolute -top-2 -right-2"><Aviso tipo="pregunta" tam={22} /></span>
            : fuera && <Punto className="pointer-events-none absolute -top-0.5 -right-0.5" />}
        </span>
        {pendientes > 0 && (
          <span className="pointer-events-auto">
            <BotonRedondo etiqueta={UI.barrio.abrirNovedades(pendientes)} onToque={onNovedades}>
              <Aviso tipo="sobre" tam={34} numero={pendientes} />
            </BotonRedondo>
          </span>
        )}
      </header>

      {/* Abajo: materiales y construir, encima de la navegación. */}
      <div className={`absolute inset-x-0 bottom-[calc(78px+env(safe-area-inset-bottom))] z-30 flex flex-col gap-2 px-3 ${ordenando ? 'hidden' : ''}`}>
        {decision && decisionAbierta && (
          <div role="group" aria-label={decision.pregunta} className="animate-entrar rounded-3xl bg-tarjeta p-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="pt-1 text-[15px] font-bold">{decision.pregunta}</div>
              <button type="button" onClick={() => setDecisionAbierta(false)} className="-mt-1 min-h-11 shrink-0 px-2 text-[14px] font-semibold text-texto-3">{UI.casa.luego}</button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {decision.opciones.map((o) => (
                <button key={o.id} type="button" onClick={() => { sfx.elegir(); decidir(decision.situacion, o.id, o.respuesta); setDecisionAbierta(false); setNota(o.respuesta, 'vecino') }}
                  className="min-h-12 rounded-2xl bg-ambar px-2 text-[14px] leading-tight font-bold text-tinta">{o.texto}</button>
              ))}
            </div>
          </div>
        )}
        {/* Abajo: la ficha del vecino («i») a la izquierda y construir a la derecha. */}
        <div className="flex items-end justify-between">
          <BotonRedondo etiqueta={UI.casa.verFicha(conHuevo ? UI.casa.huevo : COMPANEROS[DUENO].nombre)} onToque={() => { setFicha(true); ajustar((p) => verFicha(p, DUENO)) }} className="mb-1"><Icono d={ICONOS.info} />{!conHuevo && fichaNueva(partida, DUENO) && <Punto className="absolute -top-0.5 -right-0.5" />}</BotonRedondo>
          <BotonConstruir etiqueta={UI.casa.construir} listos={listos} onToque={() => setHoja(true)} />
        </div>
      </div>


      {ficha && <FichaVecino partida={partida} c={DUENO} ahora={ahora} fase={r.fase} faltanParaArreglar={r.faltanParaArreglar} enHuevo={conHuevo} faltaHuevo={faltaHuevo} onCerrar={() => setFicha(false)} />}
      {nacer === 'ficha' && <Ficha c={DUENO} partida={partida} onCerrar={() => { setNacer(null); presentar() }} />}
      {preguntaPiña && (
        <Pregunta titulo={UI.arranque.piñaPregunta} texto={UI.arranque.piñaTexto} si={UI.arranque.guardarla} no={UI.arranque.dejarla}
          onSi={() => { sfx.sorpresa(); setPreguntaPiña(false); ajustar((p) => resolverTravesura(p, 'guardada', ahora)) }}
          onNo={() => { sfx.elegir(); setPreguntaPiña(false); ajustar((p) => resolverTravesura(p, 'aqui', ahora)) }}
          onFondo={() => setPreguntaPiña(false)} />
      )}
      {preguntaHuevo && otroHuevo && (
        <Pregunta titulo={UI.casa.huevoEnPuerta} texto={UI.casa.huevoPregunta}
          si={UI.casa.queVenga} no={UI.casa.ahoraNo}
          onSi={() => { sfx.elegir(); setPreguntaHuevo(false); incubar(otroHuevo) }} onNo={() => setPreguntaHuevo(false)} />
      )}

      {hoja && <Catalogo dueno={DUENO} partida={partida} ahora={ahora} onCerrar={() => setHoja(false)} onConstruir={alConstruir}
        onOrdenar={objetos.some(movible) ? () => { setHoja(false); setHabla(null); setNota(null); setOrdenando(true) } : undefined} />}
      {/* Ordenar: la ayuda se va sola (arriba cuelgan cosas) y los botones van en las esquinas de abajo. */}
      {ordenando && (
        <>
          <div role="status" className="anim-ayuda-ordenar pointer-events-none absolute inset-x-0 top-[calc(max(12px,calc(env(safe-area-inset-top)+32px))+56px)] z-40 flex justify-center px-5">
            <span className="max-w-[320px] rounded-2xl bg-[#2e2030]/85 px-3.5 py-2 text-center text-[14px] leading-snug text-[#fbefe4] shadow-md backdrop-blur-sm">{UI.casa.ordenarAyuda}</span>
          </div>
          <div role="group" aria-label={UI.casa.ordenar} className="absolute inset-x-0 bottom-[calc(78px+env(safe-area-inset-bottom))] z-40 flex items-end justify-between px-3">
            <BotonPastilla onToque={() => { sfx.toque(); ajustar((p) => ordenOriginal(p, DUENO)) }}>{UI.casa.comoAlPrincipio}</BotonPastilla>
            {/* El baúl: suelta algo encima para guardarlo; tócalo para ver lo guardado y sacarlo. */}
            <button ref={baul} type="button" aria-label={UI.casa.baul(enBaul.length)} onClick={() => { sfx.toque(); setVerBaul(true) }}
              className={`relative -mb-1 w-[74px] transition-transform ${arrastre ? 'scale-110' : ''}`}>
              <img src={`/arte/baul/${arrastre ? 'abierto' : 'cerrado'}.webp`} alt="" draggable={false} className="block w-full drop-shadow-lg" />
              {enBaul.length > 0 && <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a8424c] px-1 text-[12px] font-bold text-white">{enBaul.length}</span>}
            </button>
            <button type="button" onClick={() => { sfx.elegir(); setOrdenando(false) }}
              className="flex h-12 items-center rounded-full bg-ambar px-6 text-[16px] font-bold text-tinta shadow-lg ring-2 ring-tarjeta active:scale-95">{UI.casa.listo}</button>
          </div>
        </>
      )}
      {verBaul && <HojaBaul objetos={enBaul} onSacar={(id) => { sfx.construir(); ajustar((p) => sacar(p, id)) }} onCerrar={() => setVerBaul(false)} />}
    </main>
  )
}

/** Lo guardado en el baúl de esta casa: se saca con un toque (vuelve a su sitio). */
function HojaBaul({ objetos, onSacar, onCerrar }: { objetos: ObjetoCasa[]; onSacar: (id: string) => void; onCerrar: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[45] mx-auto flex max-w-[430px] touch-none flex-col justify-end bg-[#2e2030]/45" onClick={onCerrar}>
      <section role="dialog" aria-label={UI.casa.baulTitulo} onClick={(e) => e.stopPropagation()}
        className="anim-hoja max-h-[70dvh] touch-pan-y overflow-y-auto overscroll-contain rounded-t-[28px] bg-fondo px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-borde" />
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold">{UI.casa.baulTitulo}</h2>
          <button type="button" onClick={onCerrar} className="min-h-11 px-2 font-semibold text-texto-3">{UI.casa.cerrar}</button>
        </div>
        {objetos.length === 0 ? <p className="mt-2 text-[15px] text-texto-3">{UI.casa.baulVacio}</p> : (
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {objetos.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => onSacar(o.id)} aria-label={UI.casa.sacarDelBaul(o.nombre)}
                  className="flex min-h-[120px] w-full flex-col items-center justify-start gap-1.5 rounded-3xl bg-tarjeta p-2.5 text-center shadow-sm active:scale-[0.97]">
                  <img src={rutaArte(`casa/${o.companero}/objeto/${o.id}`)} alt="" className="h-14 w-14 object-contain" draggable={false} />
                  <span className="text-[12px] leading-tight font-semibold">{o.nombre}</span>
                  <span className="text-[12px] font-bold text-salvia-texto">{UI.casa.sacar}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>,
    document.body,
  )
}

/** Pregunta sencilla de sí o no (por ejemplo, incubar el huevo que ha aparecido en la puerta). */
function Pregunta({ titulo, texto, si, no, onSi, onNo, onFondo }: { titulo: string; texto: string; si: string; no: string; onSi: () => void; onNo: () => void; onFondo?: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-end bg-[#2e2030]/50 px-3 pb-[max(16px,env(safe-area-inset-bottom))]" onClick={onFondo ?? onNo}>
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
function HuellaEnEscena({ h, ew, nueva, onTocar, quieta = false }: { h: Huella; ew: number; nueva: boolean; onTocar: (e: React.MouseEvent<HTMLButtonElement>) => void; quieta?: boolean }) {
  const px = (h.sitio.ancho / 100) * ew
  return (
    <button type="button" aria-label={h.texto?.replace('\n', ' ') ?? h.arte} onClick={(e) => { e.stopPropagation(); onTocar(e) }}
      className={`absolute z-[5] before:absolute before:-inset-3 before:content-[''] ${quieta ? 'pointer-events-none opacity-60' : ''}`} style={{ left: `${h.sitio.x}%`, top: `${h.sitio.y}%`, width: `${h.sitio.ancho}%`, transform: 'translate(-50%, -100%)' }}>
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
function Ficha({ c, partida, onCerrar }: { c: CompaneroId; partida: Partida; onCerrar: () => void }) {
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
            {!misHazanas(partida).some((x) => x.area === comp.area) && <SugerirHazanas partida={partida} area={comp.area} />}
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
      background: `radial-gradient(circle, ${color}cc 0%, ${color}55 35%, transparent 70%)`, animationDelay: `-${retraso}s`,
    }} />
  )
}

/** Chispas que suben de la cola de Nox. */
function Chispas({ x, y }: { x: number; y: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute z-20" style={{ left: `${x}%`, top: `${y}%` }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="anim-chispa absolute h-1.5 w-1.5 rounded-full bg-[#ffd27a] shadow-[0_0_6px_2px_#ffb34799]"
          style={{ '--dx': `${(i % 2 ? 1 : -1) * (6 + i * 4)}px`, animationDelay: `-${i * 0.45}s` } as CSSProperties} />
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
        <span key={i} className="anim-luciernaga absolute rounded-full bg-[#fff3b0] shadow-[0_0_5px_1px_#ffe27a88]"
          style={{ left: `${x}%`, top: `${y}%`, width: 2 + i % 3, height: 2 + i % 3,
            '--dx': `${i % 2 ? 8 : -9}px`, '--dy': `${-7 - (i % 3) * 3}px`,
            '--t': `${6 + i % 5}s`, animationDelay: `-${i * 1.37}s` } as CSSProperties} />
      ))}
    </div>
  )
}

/** Cuántas veces se ha tocado cada objeto (para ir rotando sus frases). */
const vecesTocado = new Map<string, number>()

function Objeto({ o, nuevo, ew, eh, frases, ordenando = false, movible: sePuedeMover = false, arrastrando = false, onMover, onSoltar }: {
  o: ObjetoCasa; nuevo: boolean; ew: number; eh: number; frases: string[]
  /** Modo «Ordenar la casa»: se arrastra en vez de hablar. */
  ordenando?: boolean; movible?: boolean; arrastrando?: boolean
  onMover?: (x: number, y: number) => void; onSoltar?: (x: number, y: number, punto: { x: number; y: number }) => void
}) {
  const [toques, setToques] = useState(0)
  useEffect(() => { if (ordenando) setToques(0) }, [ordenando])
  const inicio = useRef<{ px: number; py: number; x: number; y: number; ultimo: { x: number; y: number } } | null>(null)
  const arrastrar = ordenando && sePuedeMover
  const aDonde = (e: React.PointerEvent) => {
    const i = inicio.current!
    return { x: i.x + ((e.clientX - i.px) / ew) * 100, y: i.y + ((e.clientY - i.py) / eh) * 100 }
  }
  const ultimoPunto = useRef({ x: 0, y: 0 })
  const soltar = () => { const i = inicio.current; inicio.current = null; if (i) onSoltar?.(i.ultimo.x, i.ultimo.y, ultimoPunto.current) }
  const eventosArrastre = arrastrar ? {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      inicio.current = { px: e.clientX, py: e.clientY, x: o.sitio.x, y: o.sitio.y, ultimo: { x: o.sitio.x, y: o.sitio.y } }
      ultimoPunto.current = { x: e.clientX, y: e.clientY }
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!inicio.current) return
      ultimoPunto.current = { x: e.clientX, y: e.clientY }
      inicio.current.ultimo = aDonde(e)
      onMover?.(inicio.current.ultimo.x, inicio.current.ultimo.y)
    },
    onPointerUp: soltar,
    onPointerCancel: soltar,
    onLostPointerCapture: soltar,
  } : {}
  const tocar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (ordenando) return
    setToques((n) => n + 1)
    const n = vecesTocado.get(o.id) ?? 0
    vecesTocado.set(o.id, n + 1)
    sfx.objeto(SONIDO_OBJETO[o.id] ?? 'madera')
    globoEn(e, frases[n % frases.length])
  }
  const s = o.sitio
  const gesto = ordenando ? undefined : GESTOS_DE_OBJETO[o.id]
  const estilo: CSSProperties = s.colgado
    ? { left: `${s.x}%`, top: `${s.y}%`, width: `${s.ancho}%`, transform: 'translateX(-50%)' }
    : { left: `${s.x}%`, top: `${s.y}%`, width: `${s.ancho}%`, transform: 'translate(-50%, -100%)' }
  const centroY = s.colgado ? s.y + (s.ancho * o.proporcion * ew) / eh / 2 : s.y - (s.ancho * o.proporcion * ew) / eh / 2
  return (
    <>
      {s.colgado && <span aria-hidden className="absolute top-0 w-[2px] bg-[#6b3f36]" style={{ left: `${s.x}%`, height: `${s.y + 1}%` }} />}
      <button type="button" aria-label={arrastrar ? UI.casa.moverObjeto(o.nombre) : o.nombre} onClick={tocar} {...eventosArrastre}
        className={`absolute ${ordenando ? (arrastrar ? `objeto-movible ${arrastrando ? 'objeto-arrastrado z-30' : ''}` : 'opacity-60') : 'active:brightness-110'}`}
        style={{ ...estilo, touchAction: arrastrar ? 'none' : undefined }}>
        <div className={s.colgado && !ordenando ? 'anim-balanceo' : ''}>
          <span className={`block ${nuevo ? 'anim-colocar' : ''}`}>
            <img key={toques} src={rutaArte(`casa/${o.companero}/objeto/${o.id}`)} alt="" draggable={false}
              className={`block w-full ${toques && !ordenando ? (gesto ? 'anim-gesto-de-objeto' : 'anim-palpar') : ''}`} data-gesto={gesto} />
          </span>
          {gesto && <EfectoDeObjeto gesto={gesto} toques={toques} />}
        </div>
      </button>
      {nuevo && <Estallido x={s.x} y={centroY} />}
    </>
  )
}

/** Puñado de chispas al construir algo. */
function Estallido({ x, y }: { x: number; y: number }) {
  const colores = ['#ffcf76', '#fff6db', '#ffab65']
  return (
    <div aria-hidden className="pointer-events-none absolute z-30" style={{ left: `${x}%`, top: `${y}%` }}>
      {Array.from({ length: 9 }, (_, i) => {
        const ang = (i / 9) * Math.PI * 2
        const radio = 28 + (i % 3) * 9
        return <span key={i} className="anim-estallido absolute h-1.5 w-1.5 rounded-full"
          style={{ background: colores[i % 3], '--dx': `${Math.cos(ang) * radio}px`, '--dy': `${Math.sin(ang) * radio - 10}px`, animationDelay: `${100 + (i % 3) * 32}ms` } as CSSProperties} />
      })}
    </div>
  )
}


function Catalogo({ partida, ahora, dueno: DUENO, onCerrar, onConstruir, onOrdenar }: {
  dueno: CompaneroId
  partida: Partida; ahora: Date; onCerrar: () => void; onConstruir: (id: string) => void
  /** Si hay algo que se pueda mover: entra en «Ordenar la casa». */
  onOrdenar?: () => void
}) {
  const mat = disponibles(partida, ahora)
  const visibles = proyectosVisibles(partida, DUENO)
  const quedan = proyectosDe(DUENO).length - visibles.length
  const siguiente = visibles.find((o) => !construido(partida, o.id))
  const faltaSiguiente = siguiente ? faltan(partida, siguiente, ahora) : {}
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
        {onOrdenar && (
          <button type="button" onClick={onOrdenar} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-borde text-[15px] font-bold text-texto-2">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20M12 2 9 5M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3" /></svg>
            {UI.casa.ordenar}
          </button>
        )}
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
                        <IconoMaterial area={a} tam={14} />{n} {MATERIALES[a].nombre}
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
        {/* Qué falta para el siguiente proyecto y de dónde sale (con sugerencias si no tienes hazañas de esa área). */}
        {siguiente && Object.keys(faltaSiguiente).length > 0 && (
          <div className="mt-3 rounded-3xl bg-tarjeta p-3">
            {(Object.entries(faltaSiguiente) as [AreaId, number][]).map(([a, n]) => (
              <div key={a} className="mt-1 first:mt-0">
                <p className="text-[14px] leading-snug text-texto-2">{UI.sugerir.faltan(n, MATERIALES[a].singular, MATERIALES[a].plural, AREAS[a].nombre)}</p>
                {!misHazanas(partida).some((x) => x.area === a) && <SugerirHazanas partida={partida} area={a} />}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>,
    document.body,
  )
}
