// Ofrendas: contar lo que has hecho, en un toque.
import { useEffect, useState } from 'react'
import { ACCIONES, AREAS, COMPANEROS, DUENO_CASA, MATERIALES, ORDEN_AREAS, UI, type AreaId } from '../contenido'
import type { Partida } from '../logica/partida'
import { diaMaloActivo, type ResultadoOfrenda } from '../logica/ofrendas'
import { estadoRincon } from '../logica/reglas'
import { borrarAccion, crearAccion, editarAccion } from '../logica/ajustes'
import { dia } from '../logica/fechas'
import { useJuego } from '../estado/juego'
import { BotonSecundario, Interruptor, Pantalla } from '../componentes/comunes'

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function Ofrendas({ partida, ahora }: { partida: Partida; ahora: Date }) {
  const ofrecer = useJuego((s) => s.ofrecer)
  const ponerDiaMalo = useJuego((s) => s.ponerDiaMalo)
  const recientes = useJuego((s) => s.recientes)
  const olvidar = useJuego((s) => s.olvidarRecientes)
  const diaMalo = diaMaloActivo(partida, ahora)
  const hoy = dia(ahora)
  const veces = (id: string) => partida.ofrendas.filter((o) => o.accionId === id && dia(o.fecha) === hoy).length

  const [editando, setEditando] = useState<AreaId | null>(null)
  // Al salir se olvidan las reacciones (y ya no se puede deshacer).
  useEffect(() => olvidar, [olvidar])

  return (
    <Pantalla titulo={UI.ofrendas.titulo}>
      <Interruptor titulo={UI.ofrendas.diaMalo} explicacion={UI.ofrendas.diaMaloExplicacion} activo={diaMalo} onCambiar={ponerDiaMalo} />
      <div className={`mt-4 flex flex-col gap-5 ${recientes.length ? 'pb-56' : ''}`}>
        {ORDEN_AREAS.map((area) => {
          const r = estadoRincon(partida, area, ahora)
          return (
            <section key={area}>
              <div className="mb-1 flex items-center justify-between">
                <h2 className="px-1 text-[15px] font-bold">
                  {AREAS[area].nombre}
                  <span className="ml-2 text-[13px] font-medium text-texto-3">
                    {AREAS[area].rincon}{r.hoy >= 3 ? ` · ${UI.ofrendas.noCuenta}` : ''}
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={() => setEditando(editando === area ? null : area)}
                  aria-expanded={editando === area}
                  className="min-h-11 px-2 text-[13px] font-semibold text-coral-texto"
                >
                  {editando === area ? UI.ofrendas.listo : UI.ofrendas.editar}
                </button>
              </div>
              {editando === area ? (
                <EditorArea partida={partida} area={area} />
              ) : (
              <div className="flex flex-wrap gap-2">
                {partida.acciones.filter((a) => a.area === area).map((a) => {
                  const n = veces(a.id)
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => ofrecer(a.id)}
                      className={`min-h-11 rounded-full border-2 px-4 text-[15px] transition active:scale-95 ${n ? 'border-salvia bg-salvia font-semibold text-tinta' : 'border-borde bg-tarjeta font-medium'}`}
                    >
                      {n > 0 && '✓ '}
                      {diaMalo ? a.minima : a.nombre}
                      {n > 1 && <span className="ml-1 text-[13px] opacity-70">×{n}</span>}
                    </button>
                  )
                })}
                <NuevaAccion area={area} />
              </div>
              )}
            </section>
          )
        })}
      </div>
      {recientes.length > 0 && <Reaccion />}
    </Pantalla>
  )
}

/** Editar las acciones de un área: nombre, mínima, borrar y recuperar las de ejemplo. */
function EditorArea({ partida, area }: { partida: Partida; area: AreaId }) {
  const ajustar = useJuego((s) => s.ajustar)
  const acciones = partida.acciones.filter((a) => a.area === area)
  const faltan = ACCIONES.filter((a) => a.area === area && !acciones.some((x) => x.id === a.id))
  const campo = 'h-11 w-full rounded-2xl border-2 border-borde bg-fondo px-3 text-base focus:border-coral focus:outline-none'
  return (
    <div className="flex flex-col gap-2">
      {acciones.map((a) => (
        <div key={a.id} className="rounded-3xl bg-tarjeta p-3">
          <label className="block text-[13px] font-semibold text-texto-3">{UI.ofrendas.nombre}
            <input key={a.nombre} defaultValue={a.nombre} className={`${campo} mt-1`}
              onBlur={(e) => e.target.value !== a.nombre && ajustar((p) => editarAccion(p, a.id, { nombre: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
          </label>
          <label className="mt-2 block text-[13px] font-semibold text-texto-3">{UI.ofrendas.minima}
            <input key={a.minima} defaultValue={a.minima} className={`${campo} mt-1`}
              onBlur={(e) => e.target.value !== a.minima && ajustar((p) => editarAccion(p, a.id, { minima: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} />
          </label>
          {acciones.length > 1 && (
            <div className="mt-2 text-right">
              <BotonSecundario peligro onClick={() => ajustar((p) => borrarAccion(p, a.id))}>{UI.ofrendas.borrar}</BotonSecundario>
            </div>
          )}
        </div>
      ))}
      {faltan.length > 0 && (
        <div>
          <div className="mb-1 px-1 text-[13px] font-semibold text-texto-3">{UI.ofrendas.deEjemplo}</div>
          <div className="flex flex-wrap gap-2">
            {faltan.map((a) => (
              <button key={a.id} type="button" onClick={() => ajustar((p) => ({ ...p, acciones: [...p.acciones, { ...a }] }))}
                className="min-h-11 rounded-full border-2 border-dashed border-borde px-4 text-[15px] font-medium text-texto-2">
                + {a.nombre}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NuevaAccion({ area }: { area: AreaId }) {
  const ajustar = useJuego((s) => s.ajustar)
  const [abierta, setAbierta] = useState(false)
  const [nombre, setNombre] = useState('')
  const [minima, setMinima] = useState('')
  if (!abierta) {
    return (
      <button type="button" onClick={() => setAbierta(true)} className="min-h-11 rounded-full border-2 border-dashed border-borde px-4 text-[15px] font-medium text-texto-3">
        + {UI.ofrendas.nueva}
      </button>
    )
  }
  const crear = () => {
    if (!nombre.trim()) return
    ajustar((p) => crearAccion(p, area, nombre, minima, nuevoId()))
    setNombre(''); setMinima(''); setAbierta(false)
  }
  const campo = 'h-11 w-full rounded-2xl border-2 border-borde bg-fondo px-3 text-base focus:border-coral focus:outline-none'
  return (
    <div className="w-full rounded-3xl border-2 border-dashed border-borde p-3">
      <label className="block text-[13px] font-semibold text-texto-3">{UI.ofrendas.nombre}
        <input autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} className={`${campo} mt-1`} />
      </label>
      <label className="mt-2 block text-[13px] font-semibold text-texto-3">{UI.ofrendas.minima}
        <input value={minima} onChange={(e) => setMinima(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && crear()} className={`${campo} mt-1`} />
      </label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <BotonSecundario onClick={() => setAbierta(false)}>{UI.ofrendas.cancelar}</BotonSecundario>
        <button type="button" disabled={!nombre.trim()} onClick={crear} className="min-h-11 rounded-full bg-ambar text-sm font-bold text-tinta disabled:opacity-40">{UI.ofrendas.crear}</button>
      </div>
    </div>
  )
}

function Sorpresa({ resultado }: { resultado: ResultadoOfrenda }) {
  const quien = AREAS[resultado.ofrenda.area].companero
  return (
    <div className="animate-entrar rounded-3xl border-2 border-ambar bg-tarjeta px-4 py-3">
      <div className="text-[13px] font-semibold text-coral-texto">{UI.ofrendas.sorpresa(COMPANEROS[quien].nombre)}</div>
      <div className="mt-0.5 font-bold">{resultado.sorpresa!.nombre}</div>
    </div>
  )
}

function Reaccion() {
  const recientes = useJuego((s) => s.recientes)
  const deshacer = useJuego((s) => s.deshacer)
  const olvidar = useJuego((s) => s.olvidarRecientes)
  const u = recientes.at(-1)!
  const { resultado } = u
  const [puede, setPuede] = useState(true)
  useEffect(() => {
    setPuede(true)
    const t = setTimeout(() => setPuede(false), Math.max(0, u.hasta - Date.now()))
    return () => clearTimeout(t)
  }, [u])
  return (
    <div
      onClick={(e) => !(e.target as HTMLElement).closest('button') && olvidar()}
      className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-10 mx-auto flex max-w-[430px] flex-col gap-2 px-4 pb-3"
    >
      {resultado.premio && (
        <div className="animate-entrar rounded-3xl bg-ambar px-4 py-3 font-semibold text-tinta">{UI.semana.cumplida} · {UI.semana.premio(resultado.premio.nombre)}</div>
      )}
      {resultado.sorpresa && <Sorpresa resultado={resultado} />}
      {/* Aquí solo lo que ganas; lo que opina el compañero te lo dice en casa. */}
      <div key={resultado.ofrenda.id} role="status" className="animate-entrar flex min-h-14 items-center justify-between gap-2 rounded-3xl bg-tarjeta py-1.5 pr-1.5 pl-4 shadow-md">
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-[15px] font-bold">
            {resultado.cuenta ? (
              <>
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: MATERIALES[resultado.ofrenda.area].color }} />
                {UI.casa.gana(1, MATERIALES[resultado.ofrenda.area].singular)}
              </>
            ) : UI.ofrendas.noCuenta}
          </span>
          {resultado.frase?.companero === DUENO_CASA && <span className="block text-[13px] text-texto-3">{UI.ofrendas.teLoCuenta(COMPANEROS[resultado.frase.companero].nombre)}</span>}
        </span>
        {puede && (
          <button type="button" onClick={deshacer} className="min-h-11 shrink-0 rounded-full px-3 text-sm font-semibold text-coral-texto underline underline-offset-2">
            {UI.ofrendas.deshacer}
          </button>
        )}
      </div>
    </div>
  )
}
