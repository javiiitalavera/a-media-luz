// El barrio (docs/diseno-vecindario.md): el mapa con la casita de cada vecino en su parcela, lo construido
// en común (el puente) y las huellas de las historias. Es la pantalla principal cuando hay dos vecinos.
// El mapa ocupa toda la pantalla, como la casa: se ajusta al alto (sin cortar arriba ni abajo) y se recortan
// los lados por igual. Las casitas que quedarían cortadas en el borde se acercan lo justo hacia dentro.
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { COMPANEROS, LUCES_BARRIO, MATERIALES, PARCELAS, PASO_ARROYO, PLAZA, PROPORCION_BARRIO, PROYECTOS_BARRIO, UI, type AreaId, type CompaneroId } from '../contenido'
import { FRASES_PLAZA, VISITA_PLAZA } from '../contenido/barrio'
import type { Partida } from '../logica/partida'
import { construido, disponibles, faltan } from '../logica/casa'
import { estadoDelMes, mesesDe } from '../logica/meses'
import { barrioAbierto, huellasEn } from '../logica/situaciones'
import { rutaArte, rutaCompanero } from '../arte/manifiesto'
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
import { avisoEnCasa, gagDeHoy, huellaNueva, pendientesDelSobre, verGag, verHuella } from '../logica/avisos'
import { GagEnEscena } from '../componentes/GagEnEscena'
import { IconoMaterial } from '../componentes/IconoMaterial'

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
  /** Posición horizontal (en % del mapa) para que algo de `anchoPct` % quepa entero en pantalla. */
  const dentro = (x: number, anchoPct: number) => {
    const mitad = (anchoPct / 100) * ancho / 2 + 4
    const px = Math.min(Math.max((x / 100) * ancho, -izquierda + mitad), -izquierda + t.w - mitad)
    return (px / ancho) * 100
  }
  const ajustar = useJuego((st) => st.ajustar)
  const [gag] = useState(() => gagDeHoy(partida, 'barrio', ahora))
  const sinLeer = pendientesDelSobre(partida, ahora)
  const momento = momentoDelDia(ahora)
  const noche = momento === 'noche'
  const vecinos = mesesDe(partida)
  const estadoUltimo = estadoDelMes(partida, ahora)
  const posibleVisita = VISITA_PLAZA[momento]
  const visita = posibleVisita && vecinos.some((m, i) =>
    m.companero === posibleVisita && (i < vecinos.length - 1 || estadoUltimo === 'vivo'))
    ? posibleVisita : null
  const volverEsHuevo = volverA === vecinos.at(-1)?.companero && estadoUltimo !== 'vivo'
  const abierto = barrioAbierto(partida, ahora)
  const listos = abierto && PROYECTOS_BARRIO.some((b) => !construido(partida, b.id) && Object.keys(faltan(partida, b, ahora)).length === 0)
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
        <div aria-hidden className="barrio-arroyo pointer-events-none absolute inset-0">
          {[0, 1, 2].map((i) => <span key={i} />)}
        </div>
        <img src={rutaArte('casa/nox/objeto/banco')} alt="" draggable={false} className="mueble-plaza absolute pointer-events-none" style={juntoAlSuelo(PLAZA.banco)} />
        <img src={rutaArte('casa/nox/objeto/farolillo')} alt="" draggable={false} className="mueble-plaza absolute pointer-events-none" style={juntoAlSuelo(PLAZA.farol)} />
        {construido(partida, 'puente') && (
          <div className="puente-barrio absolute" style={{ left: `${PASO_ARROYO.x}%`, top: `${PASO_ARROYO.y}%`, width: `${PASO_ARROYO.ancho}%`, translate: '-50% -50%', rotate: `${PASO_ARROYO.giro}deg` }}>
            <img src={rutaArte('barrio/puente')} alt={UI.barrio.puente} className={`relative block w-full ${proyectoNuevo === 'puente' ? 'anim-colocar' : ''}`} draggable={false} />
          </div>
        )}
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
        {vecinos.slice(0, PARCELAS.length).map((m, i) => {
          const p = PARCELAS[i]
          // Hasta que lo ves salir del huevo (aunque ya esté listo), en el mapa sigue siendo un huevo sin nombre.
          const huevo = i === vecinos.length - 1 && estadoUltimo !== 'vivo'
          const nombre = huevo ? '?' : COMPANEROS[m.companero].nombre
          const anchoCasa = p.ancho * (huevo ? 0.45 : 0.82)
          return (
            <button key={m.companero} type="button" aria-label={huevo ? UI.casa.huevo : UI.barrio.casaDe(nombre)} onClick={() => entrar(m.companero)}
              className="absolute flex flex-col items-center"
              style={{ left: `${dentro(p.x, anchoCasa)}%`, top: `${p.y}%`, width: `${anchoCasa}%`, transform: 'translate(-50%, -68%)' }}>
              <span className={`relative block w-full ${huevo ? '' : 'casita-en-terreno'}`} data-vecino={m.companero}>
                {!huevo && <span aria-hidden className="pasos-de-casa" />}
                <img src={rutaArte(huevo ? `huevo/${m.companero}/${estadoUltimo === 'naciendo' ? 'agrietado' : 'cerrado'}` : `casita/${m.companero}`)} alt=""
                  className={`relative block w-full ${huevo ? (estadoUltimo === 'naciendo' ? 'anim-inquieto' : 'anim-mecer') : ''}`} draggable={false} />
                {!huevo && <span aria-hidden className="gesto-de-casa" />}
                <span ref={(el) => { puertas.current[m.companero] = el }} aria-hidden
                  className={`luz-puerta pointer-events-none absolute ${!huevo && entrada === m.companero ? 'luz-puerta-activa' : ''}`}
                  style={{ left: `${PUERTAS[m.companero]?.x ?? 50}%`, top: `${huevo ? 50 : PUERTAS[m.companero]?.y ?? 66}%` }} />
              </span>
              <span className={`relative -mt-1 rounded-full bg-tarjeta/95 px-2.5 py-0.5 text-[12px] leading-tight font-bold whitespace-nowrap text-texto shadow-sm ${m.companero === 'bruma' ? 'ml-[38%]' : ''}`}>{nombre}</span>
            </button>
          )
        })}
        {visita && (
          <button key={visita} type="button" aria-label={UI.barrio.enLaPlaza(COMPANEROS[visita].nombre)}
            className="vecino-en-plaza absolute min-h-11 min-w-11"
            style={juntoAlSuelo(PLAZA.encuentro)}
            onClick={(e) => { sfx.personaje(visita); globoEn(e, `${COMPANEROS[visita].nombre}: «${FRASES_PLAZA[visita]}»`) }}>
            <img src={rutaCompanero(visita, progreso(partida, visita, ahora).etapa, 'base')} alt="" draggable={false} className="block w-full" />
          </button>
        )}

        {/* Luz del momento del día (igual que en las casas): tiñe el mapa sin cambiarlo. */}
        <div aria-hidden className={`pointer-events-none absolute inset-0 mix-blend-multiply transition-opacity duration-1000 ${
          noche ? 'bg-[#3b2c63] opacity-75' : momento === 'atardecer' ? 'bg-[#ff9f7a] opacity-35' : momento === 'amanecer' ? 'bg-[#ffcfb8] opacity-40' : 'opacity-0'}`} />
        <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen">
          {LUCES_BARRIO.map((l, i) => <Luz key={i} x={l.x} y={l.y} tam={noche ? 16 : 9} color="#ffcf73" retraso={i * 0.5} />)}
          <Luz x={PLAZA.farol.x} y={PLAZA.farol.y - 1} tam={noche ? 10 : 5} color="#ffcf73" retraso={1.1} />
          {/* Ventanas encendidas de cada casita. */}
          {(noche || momento === 'atardecer') && vecinos.slice(0, PARCELAS.length).map((m, i) => (
            <Luz key={m.companero} x={dentro(PARCELAS[i].x, PARCELAS[i].ancho * 0.82)} y={PARCELAS[i].y - 4} tam={noche ? 20 : 14} color="#ffc56b" retraso={0.3 + i * 0.4} />
          ))}
        </div>
        {noche && <Luciernagas cuantas={12} />}
        {gag && <GagEnEscena gag={gag} onVisto={() => ajustar((p) => verGag(p, 'barrio', ahora))} />}

        {/* Avisos: «!» sobre la casita donde ha pasado algo (por encima del tinte de la noche). */}
        {vecinos.slice(0, PARCELAS.length).map((m, i) => {
          if (!avisoEnCasa(partida, m.companero, ahora)) return null
          const p = PARCELAS[i]
          const anchoCasa = p.ancho * 0.82
          return (
            <button key={`aviso-${m.companero}`} type="button" aria-label={UI.barrio.hayAlgo(COMPANEROS[m.companero].nombre)}
              onClick={() => entrar(m.companero)}
              className="absolute flex min-h-11 min-w-11 items-center justify-center"
              style={{ left: `${dentro(p.x, anchoCasa) + anchoCasa * 0.32}%`, top: `${p.y - anchoCasa * PROPORCION_BARRIO * 0.62}%`, transform: 'translate(-50%, -50%)' }}>
              <Aviso tipo="exclamacion" tam={28} />
            </button>
          )
        })}
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-[max(12px,calc(env(safe-area-inset-top)+32px))]">
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
          {PROYECTOS_BARRIO.map((b) => {
            const hecho = construido(partida, b.id)
            const f = faltan(partida, b, ahora)
            const puede = abierto && !hecho && Object.keys(f).length === 0
            return (
              <li key={b.id} className="flex items-center gap-3 rounded-3xl bg-tarjeta p-3">
                <img src={rutaArte(`huella/${b.id === 'puente' ? 'puente' : 'expediente'}`)} alt="" className="h-16 w-16 shrink-0 object-contain" />
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
