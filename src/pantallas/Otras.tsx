// Álbum y Ajustes.
import { useRef, useState } from 'react'
import { AREAS, COLECCION, ORDEN_AREAS, RITMOS, UI, type Ritmo } from '../contenido'
import type { Partida } from '../logica/partida'
import { objetosConseguidos, robados } from '../logica/reglas'
import { dia } from '../logica/fechas'
import { cambiarRitmo } from '../logica/ajustes'
import { exportarCopia, importarCopia } from '../logica/copia'
import { useJuego } from '../estado/juego'
import { cronicas } from '../logica/situaciones'
import { desfaseDias, ponerDesfase } from '../logica/reloj'
import { BotonSecundario, HuecoArte, Interruptor, Pantalla, Tarjeta } from '../componentes/comunes'
import { usePreferencias } from '../estado/preferencias'

export function Album({ partida, ahora }: { partida: Partida; ahora: Date }) {
  const tengo = new Set(objetosConseguidos(partida, ahora).map((x) => x.objeto.id))
  const nido = new Set(robados(partida, ahora).map((o) => o.id))
  return (
    <Pantalla titulo={UI.album.titulo}>
      <div className="flex flex-col gap-5">
        <section>
          <h2 className="mb-2 px-1 text-[15px] font-bold">{UI.barrio.cronicas}</h2>
          {cronicas(partida).length === 0 ? (
            <p className="rounded-3xl border-2 border-dashed border-borde px-4 py-3 text-[14px] text-texto-3">{UI.barrio.sinCronicas}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {cronicas(partida).map((c) => (
                <details key={c.id} className="rounded-3xl bg-tarjeta px-4 py-3">
                  <summary className="flex min-h-11 cursor-pointer items-center font-bold">{c.titulo}</summary>
                  <ol className="mt-1 flex list-decimal flex-col gap-1.5 pl-5 text-[14px] leading-snug text-texto-2">
                    {c.fases.map((f, i) => <li key={i}>{f}</li>)}
                  </ol>
                </details>
              ))}
            </div>
          )}
        </section>
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

export function Ajustes({ partida }: { partida: Partida }) {
  const ajustar = useJuego((s) => s.ajustar)
  const sustituir = useJuego((s) => s.sustituir)
  const borrar = useJuego((s) => s.borrar)
  const archivo = useRef<HTMLInputElement>(null)
  const [pendiente, setPendiente] = useState<Partida | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const prefs = usePreferencias()

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
      <h1 className="mb-4 px-1 text-[28px] font-bold">{UI.ajustes.titulo}</h1>

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

      <h2 className="mt-6 mb-2 px-1 font-bold">{UI.sonido.titulo}</h2>
      <div className="flex flex-col gap-2">
        <Interruptor titulo={UI.sonido.musica} explicacion={UI.sonido.musicaExplicacion} activo={prefs.musica} onCambiar={prefs.ponerMusica} />
        <Interruptor titulo={UI.sonido.efectos} explicacion={UI.sonido.efectosExplicacion} activo={prefs.sonidos} onCambiar={prefs.ponerSonidos} />
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

      <h2 className="mt-6 mb-1 px-1 font-bold">{UI.prueba.titulo}</h2>
      <Tarjeta>
        <p className="text-[13px] text-texto-3">{UI.prueba.explicacion}</p>
        <p className="mt-1 text-[14px] font-semibold">{UI.prueba.desfase(desfaseDias())}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <BotonSecundario onClick={() => { ponerDesfase(desfaseDias() + 1); location.reload() }}>{UI.prueba.adelantar}</BotonSecundario>
          <BotonSecundario onClick={() => { ponerDesfase(0); location.reload() }}>{UI.prueba.volver}</BotonSecundario>
        </div>
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
