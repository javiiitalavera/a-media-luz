// Pantalla principal: el bosque con sus cinco rincones.
import { useEffect } from 'react'
import { AREAS, COMPANEROS, UI, type AreaId } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoBosque, type EstadoRincon } from '../logica/reglas'
import { momentoDelDia } from '../logica/momento'
import { useJuego } from '../estado/juego'
import { Bocadillo, BotonPrincipal, HuecoArte, Pantalla } from '../componentes/comunes'

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

      {/* Escena: la ilustración aprobada del bosque cuando exista. */}
      <div className="mt-4 overflow-hidden rounded-3xl">
        <HuecoArte clave="bosque/fondo" alt={UI.bosque.arteYaLlega} className="aspect-[4/3] w-full !rounded-3xl" />
      </div>

      {frase && (
        <div className="mt-3">
          <Bocadillo quien={COMPANEROS[frase.companero].nombre} texto={frase.texto} />
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {rincones.map((r) => (
          <li key={r.area}>
            <TarjetaRincon r={r} onClick={() => onRincon(r.area)} />
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <BotonPrincipal onClick={onOfrenda}>{UI.bosque.hacerOfrenda}</BotonPrincipal>
      </div>
    </Pantalla>
  )
}

function TarjetaRincon({ r, onClick }: { r: EstadoRincon; onClick: () => void }) {
  const area = AREAS[r.area]
  const c = COMPANEROS[area.companero]
  const estado = !r.llegado ? `${UI.bosque.dormido} · ${UI.bosque.llegaCon(r.faltanParaLlegar)}` : UI.bosque.fases[r.fase]
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[64px] w-full items-center gap-3 rounded-3xl bg-tarjeta px-4 py-3 text-left ${r.llegado ? '' : 'border-2 border-dashed border-borde'}`}
    >
      <HuecoArte clave={`companero/${c.id}/base`} alt={c.nombre} className="h-11 w-11 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-bold">{area.rincon}</span>
          <span className="flex shrink-0 gap-1" aria-label={UI.bosque.crecimiento(r.grado)}>
            {[1, 2, 3].map((g) => (
              <span key={g} className={`h-2.5 w-2.5 rounded-full ${r.grado >= g ? 'bg-salvia' : 'bg-hundido'}`} />
            ))}
          </span>
        </span>
        <span className="block text-[13px] text-texto-3">{c.nombre} · {area.nombre}</span>
        <span className={`block text-[13px] font-semibold ${r.fase > 0 ? 'text-peligro' : 'text-salvia-texto'}`}>{estado}</span>
      </span>
    </button>
  )
}
