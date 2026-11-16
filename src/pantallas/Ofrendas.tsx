// Ofrendas: contar lo que has hecho, en un toque.
import { useEffect, useState } from 'react'
import { ACCIONES, AREAS, COMPANEROS, ORDEN_AREAS, UI, type AreaId } from '../contenido'
import { DIAS_MES, diaDelMes, estadoDelMes, mesActual } from '../logica/meses'
import { accionesConReto } from '../logica/retos'
import type { Partida } from '../logica/partida'
import { diaMaloActivo } from '../logica/ofrendas'
import { estadoRincon } from '../logica/reglas'
import { borrarAccion, crearAccion, editarAccion } from '../logica/ajustes'
import { dia } from '../logica/fechas'
import { useJuego } from '../estado/juego'
import { BotonSecundario, Interruptor, Pantalla } from '../componentes/comunes'

const nuevoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function Ofrendas({ partida, ahora }: { partida: Partida; ahora: Date }) {
  const ofrecer = useJuego((s) => s.ofrecer)
  const quitarUna = useJuego((s) => s.quitarUna)
  const ponerDiaMalo = useJuego((s) => s.ponerDiaMalo)
  const olvidar = useJuego((s) => s.olvidarRecientes)
  const diaMalo = diaMaloActivo(partida, ahora)
  const mes = mesActual(partida)
  const conReto = accionesConReto(mes)
  const hoy = dia(ahora)
  const veces = (id: string) => partida.ofrendas.filter((o) => o.accionId === id && dia(o.fecha) === hoy).length

  const [editando, setEditando] = useState<AreaId | null>(null)
  // Al salir se olvidan las reacciones (y ya no se puede deshacer).
  useEffect(() => olvidar, [olvidar])

  return (
    <Pantalla titulo={UI.ofrendas.titulo}>
      <p className="-mt-3 mb-3 px-1 text-[14px] font-semibold text-texto-3">
        {UI.casa.dia(diaDelMes(mes, ahora).dia, DIAS_MES)} · {estadoDelMes(partida, ahora) === 'huevo' ? UI.casa.mesDelHuevo : UI.casa.mesDe(COMPANEROS[mes.companero].nombre)}
      </p>
      <Interruptor titulo={UI.ofrendas.diaMalo} explicacion={UI.ofrendas.diaMaloExplicacion} activo={diaMalo} onCambiar={ponerDiaMalo} />
      <div className="mt-4 flex flex-col gap-5">
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
                  const nombre = diaMalo ? a.minima : a.nombre
                  return (
                    <span key={a.id} className={`flex rounded-full border-2 transition ${n ? 'border-salvia bg-salvia text-tinta' : 'border-borde bg-tarjeta'}`}>
                      <button type="button" onClick={() => ofrecer(a.id)}
                        className={`min-h-11 rounded-full px-4 text-[15px] transition active:scale-95 ${n ? 'pr-2 font-semibold' : 'font-medium'}`}>
                        {n > 0 && '✓ '}{nombre}
                        {conReto.has(a.id) && <span className="ml-1.5 rounded-full bg-ambar px-1.5 py-0.5 text-[11px] font-bold text-tinta">{UI.retos.doble}</span>}
                        {n > 1 && <span className="ml-1 text-[13px] opacity-70">×{n}</span>}
                      </button>
                      {n > 0 && (
                        <button type="button" onClick={() => quitarUna(a.id)} aria-label={UI.ofrendas.quitar(nombre)}
                          className="min-h-11 min-w-11 rounded-full border-l border-tinta/20 text-[20px] leading-none font-bold active:scale-90">
                          −
                        </button>
                      )}
                    </span>
                  )
                })}
                <NuevaAccion area={area} />
              </div>
              )}
            </section>
          )
        })}
      </div>
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
