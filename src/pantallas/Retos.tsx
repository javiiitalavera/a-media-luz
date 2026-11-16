// Retos del mes: elegirlos (con el compañero picándote) y ver cómo van. Sustituye a la antigua Semana.
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AREAS, COMPANEROS, MATERIALES, UI } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoDelMes, mesActual, type Reto } from '../logica/meses'
import { NIVELES, NUM_RETOS, nivelDe, premioDeReto, progresoRetos, retosValidos, type Nivel } from '../logica/retos'
import { progreso } from '../logica/etapas'
import { rutaArte, rutaCompanero } from '../arte/manifiesto'
import { useJuego } from '../estado/juego'
import { Pantalla } from '../componentes/comunes'

const TIPO: Record<Nivel, 'retoSuave' | 'retoNormal' | 'retoValiente'> = { suave: 'retoSuave', normal: 'retoNormal', valiente: 'retoValiente' }
type Hueco = { accionId: string; veces: number | null }

/** Bocadillo del compañero del mes (con su cara) para las reacciones al elegir. */
function Picadero({ partida, ahora, texto }: { partida: Partida; ahora: Date; texto: string }) {
  const c = mesActual(partida).companero
  const etapa = progreso(partida, c, ahora).etapa
  return (
    <div className="flex items-end gap-2">
      <img src={rutaCompanero(c, etapa, 'base')} alt={COMPANEROS[c].nombre} className="h-16 w-16 shrink-0" />
      <div key={texto} role="status" className="animate-entrar relative mb-2 flex-1 rounded-3xl bg-tarjeta px-4 py-2.5 text-[15px] leading-snug shadow-sm">
        {texto}
        <span aria-hidden className="absolute bottom-3 -left-1.5 h-3 w-3 rotate-45 bg-tarjeta" />
      </div>
    </div>
  )
}

/** Un hueco de reto: qué acción y cuántas veces. */
function EditorHueco({ partida, i, hueco, usadas, onCambiar, onNivel }: {
  partida: Partida; i: number; hueco: Hueco; usadas: string[]
  onCambiar: (h: Hueco) => void; onNivel: (n: Nivel) => void
}) {
  const mes = mesActual(partida)
  const area = COMPANEROS[mes.companero].area
  const opciones = partida.acciones.filter((a) => (i === 0 ? a.area === area : true) && (a.id === hueco.accionId || !usadas.includes(a.id)))
  return (
    <div className="rounded-3xl bg-tarjeta p-3">
      <div className="text-[13px] font-semibold text-texto-3">
        {UI.retos.reto(i + 1)} · {i === 0 ? UI.retos.delArea(AREAS[area].nombre) : UI.retos.libre}
      </div>
      <select value={hueco.accionId} onChange={(e) => onCambiar({ ...hueco, accionId: e.target.value })}
        className="mt-1.5 min-h-11 w-full rounded-2xl border-2 border-borde bg-fondo px-2 text-[15px]">
        {!hueco.accionId && <option value="">—</option>}
        {opciones.map((a) => <option key={a.id} value={a.id}>{a.nombre}{i === 0 ? '' : ` · ${AREAS[a.area].nombre}`}</option>)}
      </select>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {(Object.keys(NIVELES) as Nivel[]).map((n) => {
          const activo = hueco.veces === NIVELES[n]
          return (
            <button key={n} type="button" disabled={!hueco.accionId}
              onClick={() => { onCambiar({ ...hueco, veces: NIVELES[n] }); onNivel(n) }}
              className={`min-h-12 rounded-2xl border-2 text-center leading-tight disabled:opacity-40 ${activo ? 'border-ambar bg-ambar text-tinta' : 'border-borde'}`}>
              <span className="block text-[14px] font-bold">{UI.retos.niveles[n]}</span>
              <span className="block text-[12px]">{UI.retos.veces(NIVELES[n])}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Elegir los 3 retos del mes. */
export function SelectorRetos({ partida, ahora, onListo }: { partida: Partida; ahora: Date; onListo?: () => void }) {
  const picar = useJuego((s) => s.picar)
  const fijarRetos = useJuego((s) => s.fijarRetos)
  const [huecos, setHuecos] = useState<Hueco[]>(Array.from({ length: NUM_RETOS }, () => ({ accionId: '', veces: null })))
  const [texto, setTexto] = useState<string>(UI.retos.explicacion)
  const retos = huecos.filter((h) => h.accionId && h.veces).map((h) => ({ accionId: h.accionId, veces: h.veces! }))
  const valido = retos.length === NUM_RETOS && retosValidos(partida, mesActual(partida), retos)
  return (
    <div className="flex flex-col gap-2.5">
      <Picadero partida={partida} ahora={ahora} texto={texto} />
      {huecos.map((h, i) => (
        <EditorHueco key={i} partida={partida} i={i} hueco={h} usadas={huecos.filter((_, k) => k !== i).map((x) => x.accionId)}
          onCambiar={(nuevo) => setHuecos((hs) => hs.map((x, k) => (k === i ? nuevo : x)))}
          onNivel={(n) => { const f = picar(TIPO[n]); if (f) setTexto(f.texto) }} />
      ))}
      <button type="button" disabled={!valido} onClick={() => fijarRetos(retos) && onListo?.()}
        className="mt-1 min-h-12 rounded-2xl bg-ambar text-[16px] font-bold text-tinta disabled:bg-hundido disabled:text-texto-3">
        {UI.retos.listo}
      </button>
    </div>
  )
}

/** El selector como hoja, para cuando acaba de nacer el compañero. */
export function HojaRetos({ partida, ahora, onListo, onLuego }: { partida: Partida; ahora: Date; onListo: () => void; onLuego: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] flex-col justify-end bg-[#2e2030]/50">
      <section role="dialog" aria-label={UI.retos.elegir}
        className="anim-hoja max-h-[92dvh] overflow-y-auto rounded-t-[28px] bg-fondo px-4 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[22px] font-bold">{UI.retos.elegir}</h2>
          <button type="button" onClick={onLuego} className="min-h-11 px-2 font-semibold text-texto-3">{UI.retos.luego}</button>
        </div>
        <SelectorRetos partida={partida} ahora={ahora} onListo={onListo} />
      </section>
    </div>,
    document.body,
  )
}

/** Pestaña Retos. */
export function Retos({ partida, ahora }: { partida: Partida; ahora: Date }) {
  const gastarComodin = useJuego((s) => s.gastarComodin)
  const mes = mesActual(partida)
  const c = mes.companero
  const [cambiando, setCambiando] = useState<number | null>(null)
  const [hueco, setHueco] = useState<Hueco>({ accionId: '', veces: null })
  const [texto, setTexto] = useState<string | null>(null)
  const enHuevo = estadoDelMes(partida, ahora) === 'huevo'
  const nombreAccion = (id: string) => partida.acciones.find((a) => a.id === id)?.nombre ?? id

  return (
    <Pantalla titulo={UI.retos.titulo}>
      <p className="-mt-3 mb-3 px-1 text-[14px] font-semibold text-texto-3">{enHuevo ? UI.casa.mesDelHuevo : UI.retos.deMes(COMPANEROS[c].nombre)}</p>
      {enHuevo ? (
        <p className="px-1 text-texto-2">{UI.retos.huevo}</p>
      ) : !mes.retos?.length ? (
        <SelectorRetos partida={partida} ahora={ahora} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {texto && <Picadero partida={partida} ahora={ahora} texto={texto} />}
          {progresoRetos(partida, mes, ahora).map((r, i) => {
            const accion = partida.acciones.find((a) => a.id === r.reto.accionId)
            const premio = premioDeReto(c, i)
            if (cambiando === i) {
              const usadas = mes.retos!.filter((_, k) => k !== i).map((x) => x.accionId)
              const nuevo = hueco.accionId && hueco.veces ? { accionId: hueco.accionId, veces: hueco.veces } : null
              const valido = nuevo && retosValidos(partida, mes, mes.retos!.map((x, k) => (k === i ? nuevo : x)))
              return (
                <div key={i} className="flex flex-col gap-2">
                  <EditorHueco partida={partida} i={i} hueco={hueco} usadas={usadas} onCambiar={setHueco} onNivel={() => {}} />
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setCambiando(null)} className="min-h-11 rounded-2xl border-2 border-borde font-semibold">{UI.retos.cancelar}</button>
                    <button type="button" disabled={!valido} onClick={() => { const f = gastarComodin(i, nuevo as Reto); setCambiando(null); if (f) setTexto(f.texto) }}
                      className="min-h-11 rounded-2xl bg-ambar font-bold text-tinta disabled:bg-hundido disabled:text-texto-3">{UI.retos.listo}</button>
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className="rounded-3xl bg-tarjeta p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-texto-3">{UI.retos.reto(i + 1)} · {UI.retos.niveles[nivelDe(r.reto.veces)]}</div>
                    <div className="text-[17px] font-bold">{nombreAccion(r.reto.accionId)}</div>
                  </div>
                  <div className={`shrink-0 text-[17px] font-bold ${r.cumplido ? 'text-salvia-texto' : ''}`}>{r.cumplido ? `✓ ${UI.retos.cumplido}` : UI.retos.progreso(r.hechas, r.reto.veces)}</div>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-hundido">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(100, (r.hechas / r.reto.veces) * 100)}%`, background: accion ? MATERIALES[accion.area].color : undefined }} />
                </div>
                {premio && (
                  <div className="mt-2 flex items-center gap-2 text-[13px] text-texto-3">
                    {rutaArte(`casa/${c}/objeto/${premio.id}`) && <img src={rutaArte(`casa/${c}/objeto/${premio.id}`)} alt="" className={`h-8 w-8 object-contain ${r.cumplido ? '' : 'opacity-40 grayscale'}`} />}
                    <span>{UI.retos.premio(premio.nombre)}</span>
                  </div>
                )}
                {!mes.comodinUsado && !r.cumplido && cambiando === null && (
                  <button type="button" onClick={() => { setCambiando(i); setHueco({ accionId: r.reto.accionId, veces: r.reto.veces }) }}
                    className="mt-1 min-h-11 text-[13px] font-semibold text-coral-texto underline underline-offset-2">{UI.retos.cambiarEste}</button>
                )}
              </div>
            )
          })}
          <p className="px-1 text-[13px] text-texto-3">{mes.comodinUsado ? UI.retos.comodinUsado : UI.retos.comodinTexto}</p>
        </div>
      )}
    </Pantalla>
  )
}
