// Hazañas (decidido por Javi, 18/11/2026): tu lista de cada día, que empieza sin tachar cada mañana.
// Un toque la tacha (con su sonido) y el vecino del área la comenta; otro toque la desmarca.
// «Algo más» apunta lo que has hecho fuera de tu lista. «Editar» ajusta la lista (las mínimas van por defecto).
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ACCIONES, AREAS, COMPANEROS, MATERIALES, ORDEN_AREAS, UI, type Accion, type AreaId } from '../contenido'
import type { Partida } from '../logica/partida'
import { diaMaloActivo } from '../logica/ofrendas'
import { MAX_RETOS, anadirHazana, borrarHazana, cabeOtro, esPropia, propiasFuera, crearHazana, delCatalogoSinUsar, editarHazana, esHabitual, extrasHoy, hechaHoy, misHazanas, pendientesHoy, quitarHazana, textoHazana } from '../logica/hazanas'
import { useJuego } from '../estado/juego'
import { verHazanas } from '../logica/avisos'
import { dia } from '../logica/fechas'
import { ahora as reloj } from '../logica/reloj'
import { estadoDelMes, mesActual } from '../logica/meses'
import { rutaArte } from '../arte/manifiesto'
import { sfx } from '../sonido'
import { Interruptor, Pantalla } from '../componentes/comunes'
import { IconoArea } from '../componentes/IconoArea'
import { HojaSugerencias } from '../componentes/HojaSugerencias'
import { TEXTOS_CUESTIONARIO as TC } from '../contenido/cuestionario'

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const campo = 'h-11 w-full rounded-2xl border-2 border-borde bg-fondo px-3 text-base focus:border-coral focus:outline-none'

export function Ofrendas({ partida, ahora, onIrACasa }: { partida: Partida; ahora: Date; onIrACasa: () => void }) {
  const ofrecer = useJuego((s) => s.ofrecer)
  const quitarUna = useJuego((s) => s.quitarUna)
  const ponerDiaMalo = useJuego((s) => s.ponerDiaMalo)
  const diaMalo = diaMaloActivo(partida, ahora)
  const mias = misHazanas(partida)
  const extras = extrasHoy(partida, ahora)
  const pendientes = pendientesHoy(partida, ahora)
  const hechas = mias.filter((a) => hechaHoy(partida, a.id, ahora)).length
  const [hoja, setHoja] = useState<'editar' | 'algo' | 'puntual' | 'sugerencias' | null>(null)
  const [reaccion, setReaccion] = useState<{ texto: string; n: number; sorpresa?: string; deshacer?: string } | null>(null)
  // Abrir Hazañas apaga el aviso del día nuevo.
  const ajustar = useJuego((s) => s.ajustar)
  useEffect(() => { ajustar((p) => verHazanas(p, ahora)) }, [ajustar, ahora])
  useEffect(() => {
    if (!reaccion) return
    const t = setTimeout(() => setReaccion(null), reaccion.sorpresa || reaccion.deshacer ? 6500 : 4500)
    const sonido = reaccion.sorpresa ? setTimeout(() => sfx.sorpresa(), 250) : undefined
    return () => { clearTimeout(t); clearTimeout(sonido) }
  }, [reaccion])

  const marcar = (a: Accion) => {
    if (!a.soloEl && hechaHoy(partida, a.id, ahora)) { sfx.deshacer(); quitarUna(a.id); setReaccion(null); return }
    const r = ofrecer(a.id)
    if (!r) return
    sfx.tachar(a.area)
    const frase = r.frase && `${COMPANEROS[r.frase.companero].nombre}: «${r.frase.texto}»`
    const texto = r.sorpresa
      ? `${UI.ofrendas.encontrado(COMPANEROS[r.sorpresa.vecino].nombre, r.sorpresa.nombre)}${r.frase ? ` «${r.frase.texto}»` : ''}`
      : frase || (a.soloEl ? UI.ofrendas.retoCumplido : '')
    if (texto) setReaccion({ texto, n: Date.now(), sorpresa: r.sorpresa?.arte, deshacer: a.soloEl ? a.id : undefined })
  }

  const guardarPuntual = (datos: DatosReto, hecho: boolean) => {
    const id = nuevoId()
    const a = { ...datos, soloEl: dia(reloj()) }
    ajustar((p) => crearHazana(p, a, id))
    setHoja(null)
    if (hecho) marcar({ ...a, id: `propia-${id}` })
  }

  return (
    <Pantalla>
      <div className="flex items-start justify-between gap-2 px-1">
        <div>
          <h1 className="text-[28px] leading-tight font-bold">{UI.ofrendas.titulo}</h1>
          <p className="mt-1 text-[14px] text-texto-3">{UI.ofrendas.subtitulo}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={() => setHoja('sugerencias')} className="min-h-11 rounded-full bg-hundido px-3.5 text-[14px] font-semibold text-texto-2">
            {TC.boton}
          </button>
          <button type="button" onClick={() => setHoja('editar')} className="min-h-11 rounded-full bg-hundido px-3.5 text-[14px] font-semibold text-texto-2">
            {UI.ofrendas.editar}
          </button>
        </div>
      </div>

      {/* El huevo está listo: la invitación se queda hasta que vas a verlo (el último toque es tuyo). */}
      {estadoDelMes(partida, ahora) === 'naciendo' && (
        <button type="button" onClick={onIrACasa}
          className="animate-entrar mt-4 flex min-h-[64px] w-full items-center gap-3 rounded-3xl bg-ambar px-4 py-3 text-left text-tinta shadow-md active:scale-[0.99]">
          <img src={rutaArte(`huevo/${mesActual(partida).companero}/agrietado`)} alt="" className="anim-inquieto h-11 w-11 shrink-0 object-contain" draggable={false} />
          <span className="flex-1 text-[16px] font-bold">{UI.arranque.algoSeMueve}</span>
          <span className="shrink-0 rounded-full bg-tinta/10 px-3 py-1.5 text-[14px] font-bold">{UI.arranque.irAVer} ›</span>
        </button>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 px-1">
        {pendientes.length > 0 && <h2 className="text-[15px] font-bold">{UI.ofrendas.soloHoy}</h2>}
        <button type="button" onClick={() => setHoja('puntual')}
          className="ml-auto min-h-11 rounded-full bg-ambar px-4 text-[15px] font-bold text-tinta">+ {UI.ofrendas.paraHoy}</button>
      </div>
      {pendientes.length > 0 && (
        <ul className="mt-2 divide-y divide-borde/60 overflow-hidden rounded-3xl bg-tarjeta shadow-sm">
          {pendientes.map((a) => <Fila key={a.id} a={a} hecha={false} texto={a.nombre} onToque={() => marcar(a)} />)}
        </ul>
      )}

      <div className="mt-4 overflow-hidden rounded-3xl bg-tarjeta shadow-sm">
        {mias.length === 0 && <p className="px-4 py-5 text-[15px] text-texto-3">{UI.ofrendas.vacia}</p>}
        <ul className="divide-y divide-borde/60">
          {mias.map((a) => <Fila key={a.id} a={a} hecha={hechaHoy(partida, a.id, ahora)} texto={textoHazana(a, diaMalo)} onToque={() => marcar(a)} />)}
        </ul>
        <div className="flex items-center justify-between gap-2 border-t border-borde/60 px-4 py-2.5">
          <span className="text-[14px] text-texto-3">{UI.ofrendas.hechas(hechas, mias.length)}</span>
          <button type="button" onClick={() => setHoja('algo')} className="min-h-11 rounded-full border-2 border-borde px-4 text-[15px] font-semibold text-texto-2">
            + {UI.ofrendas.algoMas}
          </button>
        </div>
      </div>

      {extras.length > 0 && (
        <>
          <h2 className="mt-5 mb-2 px-1 text-[15px] font-bold">{UI.ofrendas.ademasHoy}</h2>
          <ul className="divide-y divide-borde/60 overflow-hidden rounded-3xl bg-tarjeta shadow-sm">
            {extras.map((a) => <Fila key={a.id} a={a} hecha texto={a.nombre} onToque={() => marcar(a)} />)}
          </ul>
        </>
      )}

      <div className="mt-5">
        <Interruptor titulo={UI.ofrendas.diaMalo} explicacion={UI.ofrendas.diaMaloExplicacion} activo={diaMalo} onCambiar={ponerDiaMalo} />
      </div>

      {reaccion && (
        <div key={reaccion.n} className="animate-entrar pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[430px] justify-center px-4">
          <span className="flex items-center gap-3 rounded-2xl bg-[#2e2030]/88 px-4 py-2.5 text-[14px] leading-snug text-[#fbefe4] shadow-lg backdrop-blur-sm">
            {reaccion.sorpresa && <img src={reaccion.sorpresa} alt="" className="anim-brotar h-12 w-12 shrink-0 object-contain" />}
            <span role="status" className={reaccion.sorpresa ? '' : 'text-center'}>{reaccion.texto}</span>
            {reaccion.deshacer && (
              <button type="button" onClick={() => { if (reaccion.deshacer) quitarUna(reaccion.deshacer); sfx.deshacer(); setReaccion(null) }}
                className="pointer-events-auto min-h-11 shrink-0 px-1 text-[14px] font-bold underline underline-offset-4">{UI.ofrendas.deshacerPuntual}</button>
            )}
          </span>
        </div>
      )}

      {hoja === 'sugerencias' && <HojaSugerencias partida={partida} onCerrar={() => setHoja(null)} />}
      {hoja === 'editar' && <HojaEditar partida={partida} onCerrar={() => setHoja(null)} />}
      {hoja === 'puntual' && (
        <Hoja titulo={UI.ofrendas.retoPuntual} onCerrar={() => setHoja(null)}>
          <div className="mt-3">
            <FormularioPropia boton={UI.ofrendas.guardarParaHoy} onCrear={(d) => guardarPuntual(d, false)} onHecho={(d) => guardarPuntual(d, true)} />
          </div>
        </Hoja>
      )}
      {hoja === 'algo' && <HojaAlgoMas partida={partida} onCerrar={() => setHoja(null)} onApuntar={(a) => { setHoja(null); marcar(a) }} />}
    </Pantalla>
  )
}

/** Una hazaña: icono de su área, texto (tachado si está hecha), de quién es y el círculo. */
function Fila({ a, hecha, texto, onToque }: { a: Accion; hecha: boolean; texto: string; onToque: () => void }) {
  const area = AREAS[a.area]
  return (
    <li>
      <button type="button" onClick={onToque} aria-pressed={hecha} aria-label={hecha ? UI.ofrendas.desmarcar(texto) : UI.ofrendas.marcar(texto)}
        className="flex min-h-[64px] w-full items-center gap-3 px-4 py-2.5 text-left active:bg-hundido/60">
        <IconoArea area={a.area} />
        <span className="min-w-0 flex-1">
          <span className={`relative inline-block text-[16px] leading-snug font-semibold transition-colors ${hecha ? 'text-texto-3' : 'text-texto'}`}>
            {texto}
            <span aria-hidden className={`tachon absolute top-1/2 left-0 h-[2px] rounded-full bg-texto-3 ${hecha ? 'tachon-si' : ''}`} />
          </span>
          <span className="block text-[13px] text-texto-3">{COMPANEROS[area.companero].nombre} · {area.nombre}</span>
        </span>
        <Circulo hecha={hecha} />
      </button>
    </li>
  )
}

function Circulo({ hecha }: { hecha: boolean }) {
  return hecha ? (
    <span aria-hidden className="anim-brotar flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-salvia text-tinta">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </span>
  ) : (
    <span aria-hidden className="h-8 w-8 shrink-0 rounded-full border-2 border-borde" />
  )
}

function Hoja({ titulo, explicacion, onCerrar, children }: { titulo: string; explicacion?: string; onCerrar: () => void; children: ReactNode }) {
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] flex-col justify-end bg-[#2e2030]/45" onClick={onCerrar}>
      <section role="dialog" aria-label={titulo} onClick={(e) => e.stopPropagation()}
        className="anim-hoja max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-fondo px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-borde" />
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold">{titulo}</h2>
          <button type="button" onClick={onCerrar} className="min-h-11 px-2 font-semibold text-texto-3">{UI.ofrendas.listo}</button>
        </div>
        {explicacion && <p className="mt-0.5 text-[14px] text-texto-3">{explicacion}</p>}
        {children}
      </section>
    </div>,
    document.body,
  )
}

/** Mis retos: una fila por reto (tocar para cambiarlo), y debajo, plegados, el catálogo y crear uno propio.
 *  Las versiones mínimas no se piden: van por defecto (las del catálogo o «…, aunque sea un poco»). */
function HojaEditar({ partida, onCerrar }: { partida: Partida; onCerrar: () => void }) {
  const ajustar = useJuego((s) => s.ajustar)
  const mias = misHazanas(partida)
  const sinUsar = delCatalogoSinUsar(partida)
  const [abierta, setAbierta] = useState<string | null>(null)
  const [plegable, setPlegable] = useState<'catalogo' | 'propia' | null>(null)
  const cabe = cabeOtro(partida)
  return (
    <Hoja titulo={`${UI.ofrendas.misHazanas} · ${UI.ofrendas.cuantos(mias.length, MAX_RETOS)}`} explicacion={UI.ofrendas.misHazanasExplicacion} onCerrar={onCerrar}>
      <ul className="mt-3 divide-y divide-borde/60 overflow-hidden rounded-3xl bg-tarjeta">
        {mias.map((a) => (
          <li key={a.id}>
            <div className="flex items-center gap-1 pl-3">
              <button type="button" aria-expanded={abierta === a.id} aria-label={UI.ofrendas.cambiar(a.nombre)} onClick={() => setAbierta(abierta === a.id ? null : a.id)}
                className="flex min-h-12 flex-1 items-center gap-2.5 py-1.5 text-left">
                <IconoArea area={a.area} pequeno />
                <span className="flex-1 text-[15px] leading-snug font-semibold">{a.nombre}</span>
              </button>
              <button type="button" aria-label={UI.ofrendas.quitarDeLista(a.nombre)} onClick={() => ajustar((p) => quitarHazana(p, a.id))}
                className="flex h-12 w-12 shrink-0 items-center justify-center text-texto-3">
                <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            {abierta === a.id && (
              <div className="animate-entrar px-3 pb-3">
                <label className="block text-[13px] font-semibold text-texto-3">{UI.ofrendas.nombre}
                  <input key={a.nombre} defaultValue={a.nombre} className={`${campo} mt-1`}
                    onBlur={(e) => e.target.value !== a.nombre && ajustar((p) => editarHazana(p, a.id, { nombre: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
                </label>
                {esPropia(a) && (
                  <>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ORDEN_AREAS.map((ar) => (
                        <button key={ar} type="button" aria-pressed={a.area === ar} onClick={() => ajustar((p) => editarHazana(p, a.id, { area: ar }))}
                          className={`min-h-11 rounded-full border-2 px-3 text-[13px] font-semibold ${a.area === ar ? 'border-transparent text-tinta' : 'border-borde text-texto-3'}`}
                          style={a.area === ar ? { background: MATERIALES[ar].color } : undefined}>{AREAS[ar].nombre}</button>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-end"><BotonBorrar onBorrar={() => ajustar((p) => borrarHazana(p, a.id))} /></div>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
        {mias.length === 0 && <li className="px-4 py-4 text-[14px] text-texto-3">{UI.ofrendas.vacia}</li>}
      </ul>
      {!cabe && <p className="mt-2 rounded-2xl bg-tarjeta px-3 py-2 text-[14px] font-medium text-texto-2">{UI.ofrendas.lleno}</p>}

      {propiasFuera(partida).length > 0 && (
        <>
          <h3 className="mt-5 mb-1 px-1 font-bold">{UI.ofrendas.otrosPropios}</h3>
          <div className="flex flex-col gap-2">
            {propiasFuera(partida).map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-3xl bg-tarjeta py-1 pr-1 pl-3">
                <IconoArea area={a.area} pequeno />
                <span className="flex-1 text-[15px] font-medium">{a.nombre}</span>
                <button type="button" disabled={!cabe} onClick={() => ajustar((p) => anadirHazana(p, a.id))} className="min-h-11 px-2 text-[14px] font-semibold text-salvia-texto disabled:opacity-40">+ {UI.ofrendas.aMiLista}</button>
                <BotonBorrar onBorrar={() => ajustar((p) => borrarHazana(p, a.id))} />
              </div>
            ))}
          </div>
        </>
      )}

      {cabe && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(['catalogo', 'propia'] as const).map((k) => (
            <button key={k} type="button" aria-expanded={plegable === k} onClick={() => setPlegable(plegable === k ? null : k)}
              className={`min-h-12 rounded-2xl border-2 px-2 text-[14px] leading-tight font-bold ${plegable === k ? 'border-transparent bg-ambar text-tinta' : 'border-borde text-texto-2'}`}>
              + {k === 'catalogo' ? UI.ofrendas.anadir : UI.ofrendas.crearPropia}
            </button>
          ))}
        </div>
      )}
      {cabe && plegable === 'catalogo' && (
        <div className="animate-entrar mt-3 flex flex-col gap-3">
          {ORDEN_AREAS.map((area) => {
            const lista = sinUsar.filter((c) => c.area === area)
            if (!lista.length) return null
            return (
              <div key={area}>
                <div className="mb-1 flex items-center gap-1.5 px-1 text-[13px] font-semibold text-texto-3"><IconoArea area={area} pequeno />{AREAS[area].nombre}</div>
                <div className="flex flex-wrap gap-2">
                  {lista.map((c) => (
                    <button key={c.id} type="button" onClick={() => ajustar((p) => anadirHazana(p, c.id))}
                      className="min-h-11 rounded-full border-2 border-dashed border-borde px-3.5 text-[14px] font-medium text-texto-2">+ {c.nombre}</button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {cabe && plegable === 'propia' && (
        <div className="animate-entrar mt-3"><FormularioPropia boton={UI.ofrendas.crear} onCrear={(d) => { ajustar((p) => crearHazana(p, d, nuevoId())); setPlegable(null) }} /></div>
      )}
    </Hoja>
  )
}

/** Borrar con confirmación (un segundo toque). */
function BotonBorrar({ onBorrar }: { onBorrar: () => void }) {
  const [seguro, setSeguro] = useState(false)
  return (
    <button type="button" onClick={() => (seguro ? onBorrar() : setSeguro(true))} onBlur={() => setSeguro(false)}
      className={`min-h-11 rounded-full px-3 text-[14px] font-semibold ${seguro ? 'bg-peligro text-white' : 'text-peligro'}`}>
      {seguro ? UI.ofrendas.seguroBorrar : UI.ofrendas.borrar}
    </button>
  )
}

/** Algo más: apuntar algo del catálogo que no está en tu lista, o escribirlo. */
function HojaAlgoMas({ partida, onCerrar, onApuntar }: { partida: Partida; onCerrar: () => void; onApuntar: (a: Accion) => void }) {
  const ajustar = useJuego((s) => s.ajustar)
  // Las propias que se apuntaron alguna vez en «Algo más» también se ofrecen.
  const usadas = partida.acciones.filter((a) => !a.soloEl && !esHabitual(a) && !ACCIONES.some((c) => c.id === a.id))
  const lista: Accion[] = [...delCatalogoSinUsar(partida), ...usadas]
  const apuntar = (a: Accion) => {
    if (!partida.acciones.some((x) => x.id === a.id)) ajustar((p) => anadirHazana(p, a.id, false))
    onApuntar(a)
  }
  return (
    <Hoja titulo={UI.ofrendas.algoMasTitulo} explicacion={UI.ofrendas.algoMasExplicacion} onCerrar={onCerrar}>
      <div className="mt-3 flex flex-col gap-3">
        {ORDEN_AREAS.map((area) => {
          const delArea = lista.filter((c) => c.area === area)
          if (!delArea.length) return null
          return (
            <div key={area}>
              <div className="mb-1 flex items-center gap-1.5 px-1 text-[13px] font-semibold text-texto-3"><IconoArea area={area} pequeno />{AREAS[area].nombre}</div>
              <div className="flex flex-wrap gap-2">
                {delArea.map((c) => (
                  <button key={c.id} type="button" onClick={() => apuntar(c)}
                    className="min-h-11 rounded-full border-2 border-borde bg-tarjeta px-3.5 text-[14px] font-medium">{c.nombre}</button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <h3 className="mt-5 mb-1 px-1 font-bold">{UI.ofrendas.otra}</h3>
      <FormularioPropia boton={UI.ofrendas.apuntar} onCrear={(d) => {
        const id = nuevoId()
        ajustar((p) => crearHazana(p, d, id, false))
        onApuntar({ id: `propia-${id}`, area: d.area, nombre: d.nombre.trim(), habitual: false })
      }} />
    </Hoja>
  )
}

type DatosReto = { nombre: string; area: AreaId }

function FormularioPropia({ boton, onCrear, onHecho }: { boton: string; onCrear: (d: DatosReto) => void; onHecho?: (d: DatosReto) => void }) {
  const [nombre, setNombre] = useState('')
  const [area, setArea] = useState<AreaId | null>(onHecho ? null : 'cuerpo')
  const crear = (guardar: (d: DatosReto) => void) => {
    if (!nombre.trim() || !area) return
    guardar({ nombre: nombre.trim(), area })
    setNombre('')
  }
  return (
    <form className="rounded-3xl bg-tarjeta p-3" onSubmit={(e) => { e.preventDefault(); crear(onCrear) }}>
      <label className="block text-[13px] font-semibold text-texto-3">{onHecho ? UI.ofrendas.nombrePuntual : UI.ofrendas.nombre}
        <input autoFocus={Boolean(onHecho)} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={onHecho ? UI.ofrendas.ejemploPuntual : UI.ofrendas.nombreEjemplo} className={`${campo} mt-1`} />
      </label>
      <div className="mt-2 text-[13px] font-semibold text-texto-3">{UI.ofrendas.area}</div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {ORDEN_AREAS.map((a) => (
          <button key={a} type="button" aria-pressed={area === a} onClick={() => setArea(a)}
            className={`flex min-h-11 items-center gap-1.5 rounded-full border-2 px-3 text-[14px] font-semibold ${area === a ? 'border-transparent text-tinta' : 'border-borde text-texto-2'}`}
            style={area === a ? { background: MATERIALES[a].color } : undefined}>
            {AREAS[a].nombre}
          </button>
        ))}
      </div>
      <button type="submit" disabled={!nombre.trim() || !area}
        className="mt-3 min-h-11 w-full rounded-full bg-ambar text-[15px] font-bold text-tinta disabled:opacity-40">{boton}</button>
      {onHecho && (
        <button type="button" disabled={!nombre.trim() || !area} onClick={() => crear(onHecho)}
          className="mt-1 min-h-11 w-full rounded-full text-[15px] font-semibold text-texto-2 disabled:opacity-40">{UI.ofrendas.yaLoHice}</button>
      )}
    </form>
  )
}
