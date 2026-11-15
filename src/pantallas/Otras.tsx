// Semana, Álbum y Ajustes.
import { useRef, useState } from 'react'
import { AREAS, COLECCION, COMPANEROS, ORDEN_AREAS, RITMOS, UI, type Ritmo } from '../contenido'
import type { Partida } from '../logica/partida'
import { metas, objetosConseguidos, robados } from '../logica/reglas'
import { dia, lunes } from '../logica/fechas'
import { cambiarRitmo } from '../logica/ajustes'
import { exportarCopia, importarCopia } from '../logica/copia'
import { useJuego } from '../estado/juego'
import { BotonSecundario, HuecoArte, Pantalla, Tarjeta } from '../componentes/comunes'

export function Semana({ partida, ahora }: { partida: Partida; ahora: Date }) {
  const esta = metas(partida, ahora).filter((m) => m.semana === lunes(dia(ahora)))
  return (
    <Pantalla titulo={UI.semana.titulo}>
      {esta.length === 0 && <p className="px-1 text-texto-2">{UI.semana.sinCompaneros}</p>}
      <div className="flex flex-col gap-3">
        {esta.map((m) => {
          const c = COMPANEROS[AREAS[m.area].companero]
          return (
            <Tarjeta key={m.area}>
              <div className="flex items-center gap-3">
                <HuecoArte clave={`companero/${c.id}/base`} alt={c.nombre} className="h-12 w-12 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold">{c.nombre} · {AREAS[m.area].nombre}</div>
                  <div className="text-[15px] text-texto-2">{UI.semana.meta(m.meta)}</div>
                </div>
                <div className={`text-lg font-bold ${m.cumplida ? 'text-salvia-texto' : ''}`}>{Math.min(m.hechas, m.meta)}/{m.meta}</div>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-hundido">
                <div className="h-full rounded-full bg-salvia transition-[width] duration-700" style={{ width: `${Math.min(100, (m.hechas / m.meta) * 100)}%` }} />
              </div>
              {m.cumplida && <p className="mt-2 text-[15px] font-semibold text-salvia-texto">{UI.semana.cumplida}{m.premio ? ` · ${UI.semana.premio(m.premio.nombre)}` : ''}</p>}
            </Tarjeta>
          )
        })}
      </div>
    </Pantalla>
  )
}

export function Album({ partida, ahora }: { partida: Partida; ahora: Date }) {
  const tengo = new Set(objetosConseguidos(partida, ahora).map((x) => x.objeto.id))
  const nido = new Set(robados(partida, ahora).map((o) => o.id))
  return (
    <Pantalla titulo={UI.album.titulo}>
      <div className="flex flex-col gap-5">
        {ORDEN_AREAS.map((area) => (
          <section key={area}>
            <h2 className="mb-2 px-1 text-[15px] font-bold">{AREAS[area].rincon}</h2>
            <div className="grid grid-cols-3 gap-2">
              {COLECCION.filter((o) => o.area === area).map((o) => {
                const visto = tengo.has(o.id)
                return (
                  <div key={o.id} className={`flex min-h-[110px] flex-col items-center gap-1 rounded-3xl p-2 text-center ${visto ? 'bg-tarjeta' : 'border-2 border-dashed border-borde'}`}>
                    {visto && <HuecoArte clave={`objeto/${o.id}`} alt={o.nombre} className="h-12 w-12" />}
                    <span className="text-[13px] leading-tight font-semibold">{visto ? o.nombre : UI.album.sinDescubrir}</span>
                    {visto && nido.has(o.id) && <span className="text-[12px] font-semibold text-peligro">{UI.album.enElNido}</span>}
                    {o.especial && <span className="text-[11px] text-texto-3">{UI.album.especial}</span>}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </Pantalla>
  )
}

export function Ajustes({ partida, onVolver }: { partida: Partida; onVolver: () => void }) {
  const ajustar = useJuego((s) => s.ajustar)
  const sustituir = useJuego((s) => s.sustituir)
  const borrar = useJuego((s) => s.borrar)
  const archivo = useRef<HTMLInputElement>(null)
  const [pendiente, setPendiente] = useState<Partida | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  const exportar = async () => {
    const ahora = new Date()
    const nombre = `a-media-luz-${dia(ahora)}.json`
    const f = new File([exportarCopia(partida, ahora)], nombre, { type: 'application/json' })
    if (navigator.canShare?.({ files: [f] })) {
      try { await navigator.share({ files: [f], title: nombre }); return } catch (e) { if ((e as Error).name === 'AbortError') return }
    }
    const url = URL.createObjectURL(f)
    const a = document.createElement('a')
    a.href = url; a.download = nombre; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const leer = async (f?: File) => {
    setMensaje(null)
    if (!f) return
    const p = importarCopia(await f.text())
    if (p) setPendiente(p)
    else setMensaje(UI.ajustes.errorCopia)
    if (archivo.current) archivo.current.value = ''
  }

  return (
    <Pantalla>
      <button type="button" onClick={onVolver} className="-ml-2 min-h-11 px-2 font-semibold text-texto-2">‹ {UI.volver}</button>
      <h1 className="mt-1 mb-4 px-1 text-[28px] font-bold">{UI.ajustes.titulo}</h1>

      <h2 className="mb-1 px-1 font-bold">{UI.ajustes.ritmos}</h2>
      <p className="mb-2 px-1 text-[13px] text-texto-3">{UI.ajustes.ritmoExplicacion}</p>
      <div className="flex flex-col gap-2">
        {ORDEN_AREAS.map((area) => (
          <label key={area} className="flex flex-col gap-1 rounded-3xl bg-tarjeta px-4 py-3">
            <span className="font-semibold">{AREAS[area].rincon} <span className="text-[13px] font-medium text-texto-3">· {AREAS[area].nombre}</span></span>
            <select
              value={partida.ritmos[area]}
              onChange={(e) => ajustar((p) => cambiarRitmo(p, area, e.target.value as Ritmo))}
              className="min-h-11 rounded-2xl border-2 border-borde bg-fondo px-2 text-[15px]"
            >
              {(Object.keys(RITMOS) as Ritmo[]).map((r) => <option key={r} value={r}>{RITMOS[r].nombre}</option>)}
            </select>
          </label>
        ))}
      </div>

      <h2 className="mt-6 mb-1 px-1 font-bold">{UI.ajustes.copia}</h2>
      <Tarjeta>
        <p className="text-[13px] text-texto-3">{UI.ajustes.copiaExplicacion}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <BotonSecundario onClick={exportar}>{UI.ajustes.exportar}</BotonSecundario>
          <BotonSecundario onClick={() => archivo.current?.click()}>{UI.ajustes.importar}</BotonSecundario>
        </div>
        <input ref={archivo} type="file" accept="application/json,.json" className="hidden" onChange={(e) => leer(e.target.files?.[0])} />
        {mensaje && <p role="status" className="mt-3 text-sm font-semibold text-coral-texto">{mensaje}</p>}
        {pendiente && (
          <Confirmar aviso={UI.ajustes.importarAviso} accion={UI.ajustes.sustituir}
            onSi={() => { sustituir(pendiente); setPendiente(null); setMensaje(UI.ajustes.importado) }} onNo={() => setPendiente(null)} />
        )}
      </Tarjeta>

      <div className="mt-8">
        {confirmarBorrado ? (
          <Confirmar aviso={UI.ajustes.empezarAviso} accion={UI.ajustes.borrar} onSi={borrar} onNo={() => setConfirmarBorrado(false)} />
        ) : (
          <button type="button" onClick={() => setConfirmarBorrado(true)} className="min-h-11 w-full text-[15px] font-semibold text-texto-3 underline underline-offset-4">
            {UI.ajustes.empezarDeNuevo}
          </button>
        )}
      </div>
    </Pantalla>
  )
}

function Confirmar({ aviso, accion, onSi, onNo }: { aviso: string; accion: string; onSi: () => void; onNo: () => void }) {
  return (
    <div role="alertdialog" className="mt-3 rounded-3xl border-2 border-peligro bg-tarjeta p-3">
      <p className="text-sm font-medium">{aviso}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <BotonSecundario onClick={onNo}>{UI.ajustes.cancelar}</BotonSecundario>
        <BotonSecundario peligro onClick={onSi}>{accion}</BotonSecundario>
      </div>
    </div>
  )
}
