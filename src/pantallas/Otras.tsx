// Álbum y Ajustes.
import { useEffect, useRef, useState } from 'react'
import { AREAS, COMPANEROS, RITMOS, UI, type Ritmo } from '../contenido'
import { createPortal } from 'react-dom'
import { FotoEscena } from '../componentes/FotoEscena'
import { momentosRecientes, type MomentoAlbum } from '../logica/momentos'
import { curiosidadesTenidas } from '../logica/curiosidades'
import { verAlbum } from '../logica/avisos'
import type { Curiosidad } from '../contenido/curiosidades'
import type { Partida } from '../logica/partida'
import { dia, diasEntre } from '../logica/fechas'
import { cambiarRitmo } from '../logica/ajustes'
import { exportarCopia, importarCopia } from '../logica/copia'
import { useJuego } from '../estado/juego'
import { cronicas } from '../logica/situaciones'
import { desfaseDias, inicioDia, ponerDesfase, ponerInicioDia } from '../logica/reloj'
import { nacidos } from '../logica/etapas'
import { desplazarPartida } from '../logica/desplazar'
import { BotonSecundario, Interruptor, Pantalla, Tarjeta } from '../componentes/comunes'
import { usePreferencias } from '../estado/preferencias'

export function Album({ partida, ahora }: { partida: Partida; ahora: Date }) {
  // Abrir el Álbum apaga su aviso (lo nuevo se ve, de todas formas, arriba del todo).
  const ajustar = useJuego((s) => s.ajustar)
  useEffect(() => { ajustar((p) => verAlbum(p, ahora)) }, [ajustar, ahora])
  const momentos = momentosRecientes(partida)
  const lista = cronicas(partida)
  const [seccion, setSeccion] = useState<'momentos' | 'cronicas' | 'curiosidades'>(momentos.length || !lista.length ? 'momentos' : 'cronicas')
  const curiosidades = curiosidadesTenidas(partida)
  const [cosa, setCosa] = useState<{ c: Curiosidad; fecha: string } | null>(null)
  const [abierto, setAbierto] = useState<MomentoAlbum | null>(null)
  return (
    <Pantalla titulo={UI.album.titulo}>
      <p className="-mt-3 mb-3 px-1 text-[14px] text-texto-3">{UI.album2.subtitulo}</p>
      <div role="tablist" className="mb-4 grid grid-cols-3 gap-1 rounded-full bg-hundido p-1">
        {(['momentos', 'cronicas', 'curiosidades'] as const).map((s) => (
          <button key={s} type="button" role="tab" aria-selected={seccion === s} onClick={() => setSeccion(s)}
            className={`min-h-11 rounded-full text-[14px] font-semibold ${seccion === s ? 'bg-tarjeta text-texto shadow-sm' : 'text-texto-3'}`}>
            {UI.album2[s]}
          </button>
        ))}
      </div>

      {seccion === 'curiosidades' ? (
        curiosidades.length === 0 ? (
          <p className="rounded-3xl border-2 border-dashed border-borde px-4 py-3 text-[14px] text-texto-3">{UI.album2.sinCuriosidades}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {curiosidades.map((x) => (
              <button key={x.c.id} type="button" onClick={() => setCosa(x)}
                className="flex min-h-[124px] flex-col items-center justify-start gap-1.5 rounded-3xl bg-tarjeta p-2.5 text-center shadow-sm active:scale-[0.97]">
                <img src={x.c.arte} alt="" className="h-16 w-16 object-contain" draggable={false} />
                <span className="text-[12px] leading-tight font-semibold">{x.c.nombre}</span>
              </button>
            ))}
          </div>
        )
      ) : seccion === 'momentos' ? (
        momentos.length === 0 ? (
          <p className="rounded-3xl border-2 border-dashed border-borde px-4 py-3 text-[14px] text-texto-3">{UI.album2.sinMomentos}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {momentos.map((m, i) => (
              <button key={m.id} type="button" onClick={() => setAbierto(m)}
                className="rounded-md bg-[#fffaf3] p-2 pb-3 text-left shadow-md transition active:scale-[0.98]"
                style={{ transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)` }}>
                <FotoEscena e={m.escena} />
                <span className="mt-2 block text-[13px] leading-tight font-bold text-[#3f2a3a]">{m.titulo}</span>
                <span className="mt-0.5 block text-[11px] text-[#7a6670]">{UI.album2.fecha(m.fecha)}</span>
              </button>
            ))}
          </div>
        )
      ) : lista.length === 0 ? (
        <p className="rounded-3xl border-2 border-dashed border-borde px-4 py-3 text-[14px] text-texto-3">{UI.barrio.sinCronicas}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {lista.map((c) => (
            <details key={c.id} className="rounded-3xl bg-tarjeta px-4 py-3">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-bold">
                <span className="flex-1">{c.titulo}</span>
                {c.enMarcha && <span className="rounded-full bg-ambar px-2.5 py-0.5 text-[12px] font-bold text-tinta">{UI.barrio.enMarcha}</span>}
              </summary>
              <ol className="mt-1 flex list-decimal flex-col gap-1.5 pl-5 text-[14px] leading-snug text-texto-2">
                {c.fases.map((f, i) => <li key={i}>{f}</li>)}
              </ol>
            </details>
          ))}
        </div>
      )}

      {cosa && createPortal(
        <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-center justify-center bg-[#2e2030]/60 px-6" onClick={() => setCosa(null)}>
          <div role="dialog" aria-label={cosa.c.nombre} className="anim-globo w-full rounded-[28px] bg-fondo p-5 text-center shadow-2xl">
            <img src={cosa.c.arte} alt="" className="mx-auto h-36 w-36 object-contain" draggable={false} />
            <div className="mt-3 text-[19px] font-bold">{cosa.c.nombre}</div>
            <p className="mt-1.5 text-[15px] leading-snug text-texto-2 italic">{cosa.c.texto}</p>
            <p className="mt-3 text-[12px] text-texto-3">{UI.album2.deVecino(COMPANEROS[cosa.c.vecino].nombre, UI.album2.fecha(cosa.fecha))}</p>
          </div>
        </div>,
        document.body,
      )}
      {abierto && createPortal(
        <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] items-center justify-center bg-[#2e2030]/60 px-6" onClick={() => setAbierto(null)}>
          <figure role="dialog" aria-label={abierto.titulo} className="anim-globo w-full rounded-md bg-[#fffaf3] p-3 pb-4 shadow-2xl">
            <FotoEscena e={abierto.escena} />
            <figcaption className="mt-3 px-1">
              <span className="block text-[17px] font-bold text-[#3f2a3a]">{abierto.titulo}</span>
              {abierto.texto && <span className="mt-1 block text-[14px] leading-snug text-[#5e4a56] italic">{abierto.texto}</span>}
              <span className="mt-2 block text-[12px] text-[#7a6670]">{UI.album2.fecha(abierto.fecha)}</span>
            </figcaption>
          </figure>
        </div>,
        document.body,
      )}
    </Pantalla>
  )
}

export function Ajustes({ partida, ahora }: { partida: Partida; ahora: Date }) {
  const ajustar = useJuego((s) => s.ajustar)
  const sustituir = useJuego((s) => s.sustituir)
  const borrar = useJuego((s) => s.borrar)
  const archivo = useRef<HTMLInputElement>(null)
  const [pendiente, setPendiente] = useState<Partida | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const prefs = usePreferencias()
  const [toquesVersion, setToquesVersion] = useState(0)

  const exportar = async () => {
    const ahora = new Date()
    const nombre = `a-media-luz-${dia(ahora)}.json`
    const f = new File([exportarCopia(partida, ahora)], nombre, { type: 'application/json' })
    if (navigator.canShare?.({ files: [f] })) {
      try { await navigator.share({ files: [f], title: nombre }); prefs.copiaHecha(new Date().toISOString()); return } catch (e) { if ((e as Error).name === 'AbortError') return }
    }
    const url = URL.createObjectURL(f)
    const a = document.createElement('a')
    a.href = url; a.download = nombre; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    prefs.copiaHecha(new Date().toISOString())
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

      <h2 className="mb-1 px-1 font-bold">{UI.ajustes.paciencia}</h2>
      <p className="mb-2 px-1 text-[13px] text-texto-3">{UI.ajustes.pacienciaExplicacion}</p>
      <div className="flex flex-col gap-2">
        {nacidos(partida, ahora).map((c) => {
          const area = COMPANEROS[c].area
          return (
            <label key={c} className="flex flex-col gap-1 rounded-3xl bg-tarjeta px-4 py-3">
              <span className="font-semibold">{COMPANEROS[c].nombre} <span className="text-[13px] font-medium text-texto-3">· {AREAS[area].nombre}</span></span>
              <select value={partida.ritmos[area]} onChange={(e) => ajustar((p) => cambiarRitmo(p, area, e.target.value as Ritmo))}
                className="min-h-11 rounded-2xl border-2 border-borde bg-fondo px-2 text-[15px]">
                {(Object.keys(RITMOS) as Ritmo[]).map((r) => <option key={r} value={r}>{UI.ajustes.aguanta(RITMOS[r].nombre)}</option>)}
              </select>
            </label>
          )
        })}
      </div>

      <h2 className="mt-6 mb-1 px-1 font-bold">{UI.ajustes.inicioDia}</h2>
      <p className="mb-2 px-1 text-[13px] text-texto-3">{UI.ajustes.inicioDiaExplicacion}</p>
      <Opciones valor={String(inicioDia())} opciones={[['0', UI.ajustes.medianoche], ['3', '3:00'], ['5', '5:00']]}
        onCambiar={(v) => { ponerInicioDia(Number(v)); location.reload() }} />

      <h2 className="mt-6 mb-2 px-1 font-bold">{UI.ajustes.aspecto}</h2>
      <Opciones valor={prefs.aspecto} opciones={[['auto', UI.ajustes.automatico], ['dia', UI.ajustes.dia], ['noche', UI.ajustes.noche]]}
        onCambiar={(v) => prefs.ponerAspecto(v as 'auto' | 'dia' | 'noche')} />
      <p className="mt-1 px-1 text-[13px] text-texto-3">{UI.ajustes.aspectoExplicacion}</p>

      <h2 className="mt-6 mb-2 px-1 font-bold">{UI.sonido.titulo}</h2>
      <div className="flex flex-col gap-2">
        <Interruptor titulo={UI.sonido.musica} explicacion={UI.sonido.musicaExplicacion} activo={prefs.musica} onCambiar={prefs.ponerMusica} />
        <Interruptor titulo={UI.sonido.efectos} explicacion={UI.sonido.efectosExplicacion} activo={prefs.sonidos} onCambiar={prefs.ponerSonidos} />
      </div>

      <h2 className="mt-6 mb-1 px-1 font-bold">{UI.ajustes.copia}</h2>
      <Tarjeta>
        <p className="text-[13px] text-texto-3">{UI.ajustes.copiaExplicacion}</p>
        <p className="mt-1 text-[14px] font-semibold">{UI.ajustes.ultimaCopia(prefs.ultimaCopia ? diasEntre(dia(prefs.ultimaCopia), dia(new Date())) : null)}</p>
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

      {prefs.pruebas && (
        <div className="mt-6">
        <h2 className="mt-6 mb-1 px-1 font-bold">{UI.prueba.titulo}</h2>
        <Tarjeta>
          <p className="text-[13px] text-texto-3">{UI.prueba.explicacion}</p>
          <p className="mt-1 text-[14px] font-semibold">{UI.prueba.desfase(desfaseDias())}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <BotonSecundario onClick={() => { ponerDesfase(desfaseDias() + 1); location.reload() }}>{UI.prueba.adelantar}</BotonSecundario>
            <BotonSecundario onClick={() => { sustituir(desplazarPartida(partida, -desfaseDias())); ponerDesfase(0); setTimeout(() => location.reload(), 100) }}>{UI.prueba.volver}</BotonSecundario>
          </div>
        </Tarjeta>
        </div>
      )}

      <button type="button" onClick={() => { const n = toquesVersion + 1; setToquesVersion(n); if (n >= 5) prefs.ponerPruebas(!prefs.pruebas) }}
        className="mt-8 block min-h-11 w-full text-center text-[12px] leading-snug text-texto-3">
        {UI.ajustes.version}<br />{UI.ajustes.creditos}
      </button>
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

/** Botones de opción en una fila (como un selector segmentado). */
function Opciones({ valor, opciones, onCambiar }: { valor: string; opciones: [string, string][]; onCambiar: (v: string) => void }) {
  return (
    <div role="radiogroup" className="grid gap-1 rounded-full bg-hundido p-1" style={{ gridTemplateColumns: `repeat(${opciones.length}, 1fr)` }}>
      {opciones.map(([v, texto]) => (
        <button key={v} type="button" role="radio" aria-checked={valor === v} onClick={() => valor !== v && onCambiar(v)}
          className={`min-h-11 rounded-full text-[14px] font-semibold ${valor === v ? 'bg-tarjeta text-texto shadow-sm' : 'text-texto-3'}`}>{texto}</button>
      ))}
    </div>
  )
}
