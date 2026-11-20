import '../estilos/claro-del-barrio.css'
// El barrio (docs/diseno-vecindario.md): el mapa con la casita de cada vecino en su parcela, lo construido
// en común (el puente) y las huellas de las historias. Es la pantalla principal cuando hay dos vecinos.
// El mapa ocupa toda la pantalla, como la casa: se ajusta al alto (sin cortar arriba ni abajo) y se recortan
// los lados por igual. Las casitas se apoyan en sus entradas y se ajustan al hueco visible.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { COMPANEROS, LUCES_BARRIO, MATERIALES, PARCELAS, PASO_ARROYO, PLAZA, PROPORCION_BARRIO, PROYECTOS_BARRIO, UI, type AreaId, type CompaneroId } from '../contenido'
import { CASITAS } from '../contenido/barrio'
import type { Partida } from '../logica/partida'
import { construido, disponibles, faltan, proyectosBarrioVisibles } from '../logica/casa'
import { estadoDelMes, mesesDe } from '../logica/meses'
import { barrioAbierto, huellasEn } from '../logica/situaciones'
import { rutaArte } from '../arte/manifiesto'
import { progreso } from '../logica/etapas'
import { BotonRedondo, Icono, ICONOS } from '../componentes/BotonFlotante'
import { useJuego } from '../estado/juego'
import { momentoDelDia } from '../logica/momento'
import { Luciernagas, Luz } from './Casa'
import { sfx } from '../sonido'
import { BotonConstruir } from '../componentes/BotonConstruir'
import { Materiales } from '../componentes/Bolsa'
import { globoEn } from '../estado/globo'
import { Aviso } from '../componentes/Aviso'
import { avisoEnCasa, gagDeHoy, huellaNueva, pendientesDelSobre, verGag, verHuella, visitarLugar } from '../logica/avisos'
import { GagEnEscena } from '../componentes/GagEnEscena'
import { IconoMaterial } from '../componentes/IconoMaterial'
import { colocarCasita } from '../logica/mapaBarrio'
import { ArroyoEnMovimiento, HojasAlViento, VidaDeCasita, VecinoDePaseo } from '../componentes/VidaBarrio'

type Punto = { x: number; y: number }
const PUERTAS: Partial<Record<CompaneroId, Punto>> = {
  nox: { x: 52, y: 62 }, tuerca: { x: 41, y: 66 },
  tofu: { x: 41, y: 65 }, bruma: { x: 49, y: 63 },
}
const juntoAlSuelo = (p: Punto & { ancho: number }): CSSProperties =>
  ({ left: `${p.x}%`, top: `${p.y}%`, width: `${p.ancho}%`, translate: '-50% -100%' })

export function Barrio({ partida, ahora, onCasa, volverA, onVolver, onNovedades }: {
  partida: Partida; ahora: Date; onCasa: (c: CompaneroId, punto?: Punto) => void
  /** El vecino en cuya casa estabas (para volver con un toque). */
  volverA: CompaneroId; onVolver: (punto?: Punto) => void; onNovedades: () => void
}) {
  const caja = useRef<HTMLDivElement>(null)
  const puertas = useRef<Partial<Record<CompaneroId, HTMLSpanElement | null>>>({})
  const esperaEntrada = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [entrada, setEntrada] = useState<CompaneroId | null>(null)
  const [t, setT] = useState({ w: 390, h: 844 })
  const [hoja, setHoja] = useState(false)
  const [proyectoNuevo, setProyectoNuevo] = useState<string | null>(null)
  useLayoutEffect(() => () => clearTimeout(esperaEntrada.current), [])
  useLayoutEffect(() => {
    const el = caja.current
    if (!el) return
    const medir = () => setT({ w: el.clientWidth, h: el.clientHeight })
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // Cubre la pantalla entera; en móviles (más altos que el mapa) se ajusta al alto y se centra.
  const ancho = Math.max(t.w, t.h * PROPORCION_BARRIO)
  const alto = ancho / PROPORCION_BARRIO
  const arriba = (t.h - alto) / 2
  const izquierda = (t.w - ancho) / 2
  const ajustar = useJuego((st) => st.ajustar)
  const [gag] = useState(() => gagDeHoy(partida, 'barrio', ahora))
  // Entrar en el barrio da por vistas sus novedades (el puente, los barquitos…): si no, el punto de «Barrio» no se apagaba nunca.
  const ultimaNoticia = partida.noticias?.at(-1)?.fecha
  useEffect(() => { ajustar((p) => visitarLugar(p, 'barrio')) }, [ajustar, ultimaNoticia])
  const sinLeer = pendientesDelSobre(partida, ahora)
  const momento = momentoDelDia(ahora)
  const noche = momento === 'noche'
  const vecinos = mesesDe(partida)
  const estadoUltimo = estadoDelMes(partida, ahora)
  const hueco = { margen: 800 / ancho, ancho: 100 * t.w / ancho }
  const casas = vecinos.slice(0, PARCELAS.length).map(({ companero }, i) => {
    const huevo = i === vecinos.length - 1 && estadoUltimo !== 'vivo'
    return { companero, huevo, ...colocarCasita(PARCELAS[i], companero, hueco, huevo) }
  })
  const puente = construido(partida, 'puente')
  const volverEsHuevo = volverA === vecinos.at(-1)?.companero && estadoUltimo !== 'vivo'
  const abierto = barrioAbierto(partida, ahora)
  const listos = abierto && proyectosBarrioVisibles(partida).some((b) => !construido(partida, b.id) && Object.keys(faltan(partida, b, ahora)).length === 0)
  const entrar = (c: CompaneroId, ir = (p?: Punto) => onCasa(c, p)) => {
    if (esperaEntrada.current !== undefined) return
    sfx.puerta()
    const puerta = puertas.current[c]
    const centro = puerta?.getBoundingClientRect()
    const punto = centro && { x: centro.left + centro.width / 2, y: centro.top + centro.height / 2 }
    if (!puerta || matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) {
      ir(punto)
      return
    }
    setEntrada(c)
    esperaEntrada.current = setTimeout(() => {
      esperaEntrada.current = undefined
      ir(punto)
    }, 120)
  }

  return (
    <main ref={caja} className="escena-vecindario relative mx-auto h-dvh max-w-[430px] overflow-hidden bg-[#5c7a4a]">
      <div className="absolute" style={{ top: arriba, left: izquierda, width: ancho, height: alto }}>
        <img src={rutaArte('barrio/mapa')} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
        {!noche && (
          <div aria-hidden="true" className="claro-del-barrio" data-momento={momento}>
            <span className="mariposa-del-claro" />
          </div>
        )}
        <ArroyoEnMovimiento />
        <img src={rutaArte('casa/nox/objeto/banco')} alt="" draggable={false} className="mueble-plaza absolute pointer-events-none" style={juntoAlSuelo(PLAZA.banco)} />
        <img src={rutaArte('casa/nox/objeto/farolillo')} alt="" draggable={false} className="mueble-plaza absolute pointer-events-none" style={juntoAlSuelo(PLAZA.farol)} />
        {puente && (
          <div className="puente-barrio absolute" style={{ left: `${PASO_ARROYO.x}%`, top: `${PASO_ARROYO.y}%`, width: `${PASO_ARROYO.ancho}%`, translate: '-50% -50%', rotate: `${PASO_ARROYO.giro}deg` }}>
            <img src={rutaArte('barrio/puente')} alt={UI.barrio.puente} className={`relative block w-full ${proyectoNuevo === 'puente' ? 'anim-colocar' : ''}`} draggable={false} />
          </div>
        )}
        {/* Lo construido en la plaza: se apoya en el suelo y al tocarlo cuenta algo. */}
        {PROYECTOS_BARRIO.filter((b) => b.sitio && b.arte && construido(partida, b.id)).map((b) => (
          <button key={b.id} type="button" aria-label={b.nombre}
            onClick={(e) => { sfx.objeto('madera'); globoEn(e, b.toques?.[Math.floor(Math.random() * b.toques.length)] ?? b.descripcion) }}
            className="mueble-plaza absolute" style={juntoAlSuelo(b.sitio!)}>
            <img src={rutaArte(`barrio/proyecto/${b.arte}`)} alt="" draggable={false} className={`block w-full ${proyectoNuevo === b.id ? 'anim-colocar' : ''}`} />
          </button>
        ))}
        {huellasEn(partida, 'barrio').map((h) => (
          <button key={h.id} type="button" onClick={(e) => {
            if (h.toque) globoEn(e, h.textoCorto && h.texto ? `«${h.texto.replace('\n', ' ')}». ${h.toque}` : h.toque)
            ajustar((p) => verHuella(p, h.id))
          }} aria-label={h.texto?.replace('\n', ' ') ?? h.arte}
            className="absolute before:absolute before:-inset-2 before:content-['']" style={{ left: `${h.sitio.x}%`, top: `${h.sitio.y}%`, width: `${h.sitio.ancho}%`, transform: 'translate(-50%, -100%)' }}>
            <img src={rutaArte(`huella/${h.arte}`)} alt="" className={`block w-full ${huellaNueva(partida, h.id, ahora) ? 'anim-nuevo' : ''}`} draggable={false} />
            {h.texto && (
              <span className="pointer-events-none absolute inset-x-[10%] top-[14%] flex h-[34%] items-center justify-center text-center leading-[1.05] font-bold whitespace-pre-line text-[#5a3424]"
                style={{ fontSize: Math.max(6, (h.sitio.ancho / 100) * ancho * (h.textoCorto ? 0.17 : 0.12)) }}>{h.textoCorto ?? h.texto}</span>
            )}
          </button>
        ))}
        {casas.map(({ companero, huevo, x, y, ancho: anchoCasa }) => {
          const nombre = huevo ? '?' : COMPANEROS[companero].nombre
          return (
            <button key={companero} type="button" aria-label={huevo ? UI.casa.huevo : UI.barrio.casaDe(nombre)} onClick={() => entrar(companero)}
              className="absolute min-h-11"
              style={{ left: `${x}%`, top: `${y}%`, width: `${anchoCasa}%`, aspectRatio: huevo ? undefined : CASITAS[companero].proporcion }}>
              <span className={`relative block w-full ${huevo ? '' : 'casita-en-terreno'}`} data-vecino={companero}>
                {!huevo && <span aria-hidden className="pasos-de-casa" />}
                <img src={rutaArte(huevo ? `huevo/${companero}/${estadoUltimo === 'naciendo' ? 'agrietado' : 'cerrado'}` : `casita/${companero}`)} alt=""
                  className={`relative block w-full ${huevo ? (estadoUltimo === 'naciendo' ? 'anim-inquieto' : 'anim-mecer') : 'dibujo-de-casita'}`} draggable={false} />
                {!huevo && <VidaDeCasita vecino={companero} />}
                <span ref={(el) => { puertas.current[companero] = el }} aria-hidden
                  className={`luz-puerta pointer-events-none absolute ${!huevo && entrada === companero ? 'luz-puerta-activa' : ''}`}
                  style={{ left: `${huevo ? 50 : PUERTAS[companero]?.x ?? 50}%`, top: `${huevo ? 50 : PUERTAS[companero]?.y ?? 66}%` }} />
              </span>
              <span className="absolute top-full left-1/2 -mt-0.5 -translate-x-1/2 rounded-full bg-tarjeta/95 px-2.5 py-0.5 text-[12px] leading-tight font-bold whitespace-nowrap text-texto shadow-sm">{nombre}</span>
            </button>
          )
        })}
        {casas.filter(({ huevo, companero }) => !huevo && (!noche || companero === 'nox')).map(({ companero }) => (
          <VecinoDePaseo key={companero} vecino={companero} etapa={progreso(partida, companero, ahora).etapa}
            ancho={ancho} alto={alto} puente={puente} />
        ))}
        <HojasAlViento />

        {/* Luz del momento del día (igual que en las casas): tiñe el mapa sin cambiarlo. */}
        <div aria-hidden className={`pointer-events-none absolute inset-0 mix-blend-multiply transition-opacity duration-1000 ${
          noche ? 'bg-[#3b2c63] opacity-75' : momento === 'atardecer' ? 'bg-[#ff9f7a] opacity-35' : momento === 'amanecer' ? 'bg-[#ffcfb8] opacity-40' : 'opacity-0'}`} />
        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen">
          {LUCES_BARRIO.map((l, i) => <Luz key={i} x={l.x} y={l.y} tam={noche ? 16 : 9} color="#ffcf73" retraso={i * 0.5} />)}
          <Luz x={PLAZA.farol.x} y={PLAZA.farol.y - 1} tam={noche ? 10 : 5} color="#ffcf73" retraso={1.1} />
          {/* Ventanas encendidas de cada casita. */}
          {(noche || momento === 'atardecer') && casas.map(({ companero, huevo, x, y, ancho: anchoCasa, alto: altoCasa }, i) => {
            if (huevo) return null
            const punto = CASITAS[companero].ventana
            const tam = anchoCasa * (noche ? 0.64 : 0.46)
            return <Luz key={companero} x={x + anchoCasa * punto.x / 100} y={y + altoCasa * punto.y / 100}
              tam={tam} color="#ffc56b" retraso={0.3 + i * 0.4} />
          })}
        </div>
        {noche && <Luciernagas cuantas={12} />}
        {gag && <GagEnEscena gag={gag} onVisto={() => ajustar((p) => verGag(p, 'barrio', ahora))} />}

        {/* Avisos: «!» sobre la casita donde ha pasado algo (por encima del tinte de la noche). */}
        {casas.map(({ companero, x, y, ancho: anchoCasa }) => {
          if (!avisoEnCasa(partida, companero, ahora)) return null
          const borde = (100 - hueco.ancho) / 2 + 2200 / ancho
          const aLaIzquierda = x + anchoCasa * 0.5 < 50
          const destino = x + anchoCasa * (aLaIzquierda ? 0.87 : 0.13)
          return (
            <button key={`aviso-${companero}`} type="button" aria-label={UI.barrio.hayAlgo(COMPANEROS[companero].nombre)}
              onClick={() => entrar(companero)}
              className="absolute flex min-h-11 min-w-11 -translate-1/2 items-center justify-center"
              style={{ left: `${Math.min(Math.max(destino, borde), 100 - borde)}%`, top: `${y + 1.8}%` }}>
              <Aviso tipo="exclamacion" tam={28} />
            </button>
          )
        })}
      </div>

      <header data-tapa-globo className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-[max(12px,calc(env(safe-area-inset-top)+32px))]">
        <h1 className="sr-only">{UI.barrio.titulo}</h1>
        {/* A la izquierda, volver a la casa en la que estabas (flecha); el sobre, a la derecha. */}
        <span className="pointer-events-auto">
          <BotonRedondo etiqueta={UI.barrio.volverA(volverEsHuevo ? UI.casa.huevo : COMPANEROS[volverA].nombre)} onToque={() => entrar(volverA, onVolver)}>
            <Icono d={ICONOS.atras} />
          </BotonRedondo>
        </span>
        <span className="pointer-events-auto">
          <BotonRedondo etiqueta={UI.barrio.abrirNovedades(sinLeer)} onToque={onNovedades}>
            {sinLeer > 0 ? <Aviso tipo="sobre" tam={34} numero={sinLeer} /> : <Icono d={ICONOS.sobre} />}
          </BotonRedondo>
        </span>
      </header>

      <div className="absolute inset-x-0 bottom-[calc(78px+env(safe-area-inset-bottom))] z-30 flex justify-end px-3">
        <BotonConstruir etiqueta={UI.barrio.proyectos} listos={listos ? 1 : 0} onToque={() => setHoja(true)} />
      </div>

      {hoja && <HojaBarrio partida={partida} ahora={ahora} abierto={abierto} onConstruido={setProyectoNuevo} onCerrar={() => setHoja(false)} />}
    </main>
  )
}


function HojaBarrio({ partida, ahora, abierto, onConstruido, onCerrar }: { partida: Partida; ahora: Date; abierto: boolean; onConstruido: (id: string) => void; onCerrar: () => void }) {
  const construirBarrio = useJuego((s) => s.construirBarrio)
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] flex-col justify-end bg-[#2e2030]/45" onClick={onCerrar}>
      <section role="dialog" aria-label={UI.casa.proyectosBarrio} onClick={(e) => e.stopPropagation()}
        className="anim-hoja max-h-[85dvh] overflow-y-auto rounded-t-[28px] bg-fondo px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-borde" />
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold">{UI.casa.proyectosBarrio}</h2>
          <button type="button" onClick={onCerrar} className="min-h-11 px-2 font-semibold text-texto-3">{UI.casa.cerrar}</button>
        </div>
        <div className="mt-2 rounded-2xl bg-tarjeta px-2 py-2.5"><Materiales mat={disponibles(partida, ahora)} /></div>
        {!abierto && <p className="mt-1 text-[14px] text-texto-3">{UI.casa.barrioNecesita}</p>}
        <ul className="mt-3 flex flex-col gap-2.5">
          {proyectosBarrioVisibles(partida).map((b) => {
            const hecho = construido(partida, b.id)
            const f = faltan(partida, b, ahora)
            const puede = abierto && !hecho && Object.keys(f).length === 0
            return (
              <li key={b.id} className="flex items-center gap-3 rounded-3xl bg-tarjeta p-3">
                <img src={b.arte ? rutaArte(`barrio/proyecto/${b.arte}`) : rutaArte('barrio/puente')} alt="" className="h-16 w-16 shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{b.nombre}</div>
                  <div className="text-[13px] leading-snug text-texto-3 italic">«{b.descripcion}»</div>
                  <div className="mt-1 text-[13px] leading-snug font-semibold text-salvia-texto">{b.abre}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(Object.entries(b.coste) as [AreaId, number][]).map(([a, n]) => (
                      <span key={a} className={`flex items-center gap-1 rounded-full bg-hundido px-2 py-0.5 text-[12px] font-semibold ${!hecho && f[a] ? 'text-peligro' : 'text-texto-2'}`}>
                        <IconoMaterial area={a} tam={14} />{n} {MATERIALES[a].nombre}
                      </span>
                    ))}
                  </div>
                </div>
                {hecho ? (
                  <span className="w-20 shrink-0 text-center text-[12px] font-semibold text-salvia-texto">{UI.barrio.hecho}</span>
                ) : (
                  <button type="button" disabled={!puede} onClick={() => { if (construirBarrio(b.id)) { sfx.construir(); onConstruido(b.id); onCerrar() } }}
                    className="min-h-11 w-20 shrink-0 rounded-2xl bg-ambar text-[14px] font-bold text-tinta disabled:bg-hundido disabled:text-texto-3">{UI.casa.construir}</button>
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
