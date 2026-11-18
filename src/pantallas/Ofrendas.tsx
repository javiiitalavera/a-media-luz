// Hazañas (decidido por Javi, 18/11/2026): tu lista de cada día, que empieza sin tachar cada mañana.
// Un toque la tacha (con su sonido) y el vecino del área la comenta; otro toque la desmarca.
// «Algo más» apunta lo que has hecho fuera de tu lista. «Editar» ajusta metas, mínimas y la lista.
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ACCIONES, AREAS, COMPANEROS, MATERIALES, ORDEN_AREAS, UI, type Accion, type AreaId } from '../contenido'
import type { Partida } from '../logica/partida'
import { diaMaloActivo } from '../logica/ofrendas'
import { anadirHazana, crearHazana, delCatalogoSinUsar, editarHazana, esHabitual, extrasHoy, hechaHoy, misHazanas, quitarHazana, textoHazana } from '../logica/hazanas'
import { useJuego } from '../estado/juego'
import { verHazanas } from '../logica/avisos'
import { sfx } from '../sonido'
import { Interruptor, Pantalla } from '../componentes/comunes'
import { IconoArea } from '../componentes/IconoArea'

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const campo = 'h-11 w-full rounded-2xl border-2 border-borde bg-fondo px-3 text-base focus:border-coral focus:outline-none'

export function Ofrendas({ partida, ahora }: { partida: Partida; ahora: Date }) {
  const ofrecer = useJuego((s) => s.ofrecer)
  const quitarUna = useJuego((s) => s.quitarUna)
  const ponerDiaMalo = useJuego((s) => s.ponerDiaMalo)
  const olvidar = useJuego((s) => s.olvidarRecientes)
  const diaMalo = diaMaloActivo(partida, ahora)
  const mias = misHazanas(partida)
  const extras = extrasHoy(partida, ahora)
  const hechas = mias.filter((a) => hechaHoy(partida, a.id, ahora)).length
  const [hoja, setHoja] = useState<'editar' | 'algo' | null>(null)
  const [reaccion, setReaccion] = useState<{ texto: string; n: number; sorpresa?: string } | null>(null)
  useEffect(() => olvidar, [olvidar])
  // Abrir Hazañas apaga el aviso del día nuevo.
  const ajustar = useJuego((s) => s.ajustar)
  useEffect(() => { ajustar((p) => verHazanas(p, ahora)) }, [ajustar, ahora])
  useEffect(() => {
    if (!reaccion) return
    const t = setTimeout(() => setReaccion(null), reaccion.sorpresa ? 6500 : 4500)
    return () => clearTimeout(t)
  }, [reaccion])

  const marcar = (a: Accion) => {
    if (hechaHoy(partida, a.id, ahora)) { sfx.deshacer(); quitarUna(a.id); return }
    sfx.tachar()
    const r = ofrecer(a.id)
    if (r?.sorpresa) {
      setTimeout(() => sfx.sorpresa(), 250)
      setReaccion({ texto: `${UI.ofrendas.encontrado(COMPANEROS[r.sorpresa.vecino].nombre, r.sorpresa.nombre)}${r.frase ? ` «${r.frase.texto}»` : ''}`, n: Date.now(), sorpresa: r.sorpresa.arte })
    } else if (r?.frase) setReaccion({ texto: `${COMPANEROS[r.frase.companero].nombre}: «${r.frase.texto}»`, n: Date.now() })
  }

  return (
    <Pantalla>
      <div className="flex items-start justify-between gap-2 px-1">
        <div>
          <h1 className="text-[28px] leading-tight font-bold">{UI.ofrendas.titulo}</h1>
          <p className="mt-1 text-[14px] text-texto-3">{UI.ofrendas.subtitulo}</p>
        </div>
        <button type="button" onClick={() => setHoja('editar')} className="min-h-11 shrink-0 rounded-full bg-hundido px-4 text-[14px] font-semibold text-texto-2">
          {UI.ofrendas.editar}
        </button>
      </div>

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
        <div key={reaccion.n} role="status" className="animate-entrar pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[430px] justify-center px-4">
          <span className="flex items-center gap-3 rounded-2xl bg-[#2e2030]/88 px-4 py-2.5 text-[14px] leading-snug text-[#fbefe4] shadow-lg backdrop-blur-sm">
            {reaccion.sorpresa && <img src={reaccion.sorpresa} alt="" className="anim-brotar h-12 w-12 shrink-0 object-contain" />}
            <span className={reaccion.sorpresa ? '' : 'text-center'}>{reaccion.texto}</span>
          </span>
        </div>
      )}

      {hoja === 'editar' && <HojaEditar partida={partida} onCerrar={() => setHoja(null)} />}
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

/** Mis hazañas: ajustar meta y mínima, quitar, añadir del catálogo o crear una propia. */
function HojaEditar({ partida, onCerrar }: { partida: Partida; onCerrar: () => void }) {
  const ajustar = useJuego((s) => s.ajustar)
  const mias = misHazanas(partida)
  const sinUsar = delCatalogoSinUsar(partida)
  return (
    <Hoja titulo={UI.ofrendas.misHazanas} explicacion={UI.ofrendas.misHazanasExplicacion} onCerrar={onCerrar}>
      <div className="mt-3 flex flex-col gap-2">
        {mias.map((a) => (
          <div key={a.id} className="rounded-3xl bg-tarjeta p-3">
            <div className="mb-2 flex items-center gap-2">
              <IconoArea area={a.area} pequeno />
              <span className="flex-1 text-[13px] font-semibold text-texto-3">{AREAS[a.area].nombre}</span>
              <button type="button" onClick={() => ajustar((p) => quitarHazana(p, a.id))} className="min-h-11 px-2 text-[14px] font-semibold text-peligro">{UI.ofrendas.quitar}</button>
            </div>
            <label className="block text-[13px] font-semibold text-texto-3">{UI.ofrendas.nombre}
              <input key={a.nombre} defaultValue={a.nombre} className={`${campo} mt-1`}
                onBlur={(e) => e.target.value !== a.nombre && ajustar((p) => editarHazana(p, a.id, { nombre: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
            </label>
            <label className="mt-2 block text-[13px] font-semibold text-texto-3">{UI.ofrendas.minima}
              <input key={a.minima ?? ''} defaultValue={a.minima ?? ''} placeholder={UI.ofrendas.minimaEjemplo} className={`${campo} mt-1`}
                onBlur={(e) => e.target.value !== (a.minima ?? '') && ajustar((p) => editarHazana(p, a.id, { minima: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
            </label>
          </div>
        ))}
      </div>

      <h3 className="mt-5 mb-1 px-1 font-bold">{UI.ofrendas.anadir}</h3>
      <div className="flex flex-col gap-3">
        {ORDEN_AREAS.map((area) => {
          const lista = sinUsar.filter((c) => c.area === area)
          if (!lista.length) return null
          return (
            <div key={area}>
              <div className="mb-1 px-1 text-[13px] font-semibold text-texto-3">{AREAS[area].nombre}</div>
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

      <h3 className="mt-5 mb-1 px-1 font-bold">{UI.ofrendas.crearPropia}</h3>
      <FormularioPropia boton={UI.ofrendas.crear} onCrear={(d) => ajustar((p) => crearHazana(p, d, nuevoId()))} />
    </Hoja>
  )
}

/** Algo más: apuntar algo del catálogo que no está en tu lista, o escribirlo. */
function HojaAlgoMas({ partida, onCerrar, onApuntar }: { partida: Partida; onCerrar: () => void; onApuntar: (a: Accion) => void }) {
  const ajustar = useJuego((s) => s.ajustar)
  // Las propias que se apuntaron alguna vez en «Algo más» también se ofrecen.
  const usadas = partida.acciones.filter((a) => !esHabitual(a) && !ACCIONES.some((c) => c.id === a.id))
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
      <FormularioPropia boton={UI.ofrendas.apuntar} sinMinima onCrear={(d) => {
        const id = nuevoId()
        ajustar((p) => crearHazana(p, d, id, false))
        onApuntar({ id: `propia-${id}`, area: d.area, nombre: d.nombre.trim(), habitual: false })
      }} />
    </Hoja>
  )
}

function FormularioPropia({ boton, sinMinima, onCrear }: { boton: string; sinMinima?: boolean; onCrear: (d: { nombre: string; area: AreaId; minima?: string }) => void }) {
  const [nombre, setNombre] = useState('')
  const [minima, setMinima] = useState('')
  const [area, setArea] = useState<AreaId>('cuerpo')
  const crear = () => {
    if (!nombre.trim()) return
    onCrear({ nombre, area, minima: sinMinima ? undefined : minima })
    setNombre(''); setMinima('')
  }
  return (
    <div className="rounded-3xl bg-tarjeta p-3">
      <label className="block text-[13px] font-semibold text-texto-3">{UI.ofrendas.nombre}
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={UI.ofrendas.nombreEjemplo} className={`${campo} mt-1`} />
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
      {!sinMinima && (
        <label className="mt-2 block text-[13px] font-semibold text-texto-3">{UI.ofrendas.minima}
          <input value={minima} onChange={(e) => setMinima(e.target.value)} placeholder={UI.ofrendas.minimaEjemplo} className={`${campo} mt-1`} />
        </label>
      )}
      <button type="button" disabled={!nombre.trim()} onClick={crear}
        className="mt-3 min-h-11 w-full rounded-full bg-ambar text-[15px] font-bold text-tinta disabled:opacity-40">{boton}</button>
    </div>
  )
}
