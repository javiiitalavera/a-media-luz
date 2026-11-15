// Pantalla principal: el bosque como un sendero vertical, una escena por rincón.
import { useEffect } from 'react'
import { AREAS, COMPANEROS, UI, type AreaId } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoBosque, type EstadoRincon } from '../logica/reglas'
import { momentoDelDia } from '../logica/momento'
import { useJuego } from '../estado/juego'
import { Bocadillo, BotonPrincipal, Pantalla } from '../componentes/comunes'
import { Escena } from '../componentes/Escena'

export function Bosque({ partida, ahora, onRincon, onOfrenda, onAjustes }: {
  partida: Partida; ahora: Date; onRincon: (a: AreaId) => void; onOfrenda: () => void; onAjustes: () => void
}) {
  const frase = useJuego((s) => s.fraseBosque)
  const claveFrase = useJuego((s) => s.claveFrase)
  const nuevaFrase = useJuego((s) => s.nuevaFraseBosque)
  const fijarClave = useJuego((s) => s.fijarClaveFrase)
  const rincones = estadoBosque(partida, ahora)
  // La frase se renueva si cambia el día, el momento o el estado de algún rincón.
  // (Si acabas de hacer una ofrenda, se queda la reacción hasta que cambie algo de eso.)
  const clave = `${ahora.toDateString()}|${momentoDelDia(ahora)}|${rincones.map((r) => `${r.llegado ? 1 : 0}${r.fase}`).join('')}`
  useEffect(() => {
    if (!frase) nuevaFrase(clave)
    else if (claveFrase === null) fijarClave(clave) // reacción recién hecha: se queda en esta situación
    else if (claveFrase !== clave) nuevaFrase(clave)
  }, [frase, claveFrase, clave, nuevaFrase, fijarClave])

  return (
    <Pantalla>
      <header className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-[28px] leading-none font-bold">{UI.app}</h1>
          <div className="mt-1 text-[14px] text-texto-3">{UI.momentos[momentoDelDia(ahora)]}</div>
        </div>
        <button type="button" onClick={onAjustes} className="min-h-11 rounded-full border-2 border-borde px-4 text-sm font-semibold text-texto-2">
          {UI.bosque.ajustes}
        </button>
      </header>

      {frase && (
        <div className="mt-4">
          <Bocadillo quien={COMPANEROS[frase.companero].nombre} texto={frase.texto} />
        </div>
      )}
      <div className="mt-3">
        <BotonPrincipal onClick={onOfrenda}>{UI.bosque.hacerOfrenda}</BotonPrincipal>
      </div>

      {/* El sendero: se baja de un rincón a otro. */}
      <ol className="mt-5 flex flex-col gap-5">
        {rincones.map((r) => (
          <li key={r.area}>
            <RinconDelSendero r={r} onClick={() => onRincon(r.area)} />
          </li>
        ))}
      </ol>
    </Pantalla>
  )
}

function RinconDelSendero({ r, onClick }: { r: EstadoRincon; onClick: () => void }) {
  const area = AREAS[r.area]
  const c = COMPANEROS[area.companero]
  const estado = !r.llegado ? `${UI.bosque.dormido} · ${UI.bosque.llegaCon(r.faltanParaLlegar)}` : UI.bosque.fases[r.fase]
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      <Escena r={r} className={r.llegado ? '' : 'border-2 border-dashed border-borde'} />
      <span className="mt-2 flex items-start justify-between gap-2 px-1">
        <span className="min-w-0">
          <span className="block font-bold">{area.rincon}</span>
          <span className="block text-[13px] text-texto-3">{c.nombre} · {area.nombre}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className={`text-[13px] font-semibold ${r.fase > 0 ? 'text-peligro' : 'text-salvia-texto'}`}>{estado}</span>
          <span className="flex gap-1" aria-label={UI.bosque.crecimiento(r.grado)}>
            {[1, 2, 3].map((g) => (
              <span key={g} className={`h-2.5 w-2.5 rounded-full ${r.grado >= g ? 'bg-salvia' : 'bg-tarjeta'}`} />
            ))}
          </span>
        </span>
      </span>
    </button>
  )
}
