// Pantalla principal: el bosque como un sendero vertical continuo.
// Las cinco escenas van pegadas, a todo el ancho, y entre cada dos se monta una pieza
// de transición (sendero, vegetación, cambio de ambiente) que pisa el borde de ambas.
import { Fragment, useEffect } from 'react'
import { AREAS, COMPANEROS, UI, type AreaId } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoBosque, type EstadoRincon } from '../logica/reglas'
import { momentoDelDia } from '../logica/momento'
import { rutaArte, type ClaveArte } from '../arte/manifiesto'
import { transicionesDe } from '../arte/capas'
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
  const transiciones = transicionesDe(rincones.map((r) => r.area))
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

      {/* El sendero: a todo el ancho, sin huecos entre escenas. Solo se redondea por arriba. */}
      <ol className="-mx-4 mt-5 overflow-hidden rounded-t-3xl">
        {rincones.map((r, i) => (
          <Fragment key={r.area}>
            {i > 0 && <Transicion clave={transiciones[i - 1]} />}
            <li>
              <RinconDelSendero r={r} onClick={() => onRincon(r.area)} />
            </li>
          </Fragment>
        ))}
        <Transicion clave="sendero/final" final />
      </ol>
    </Pantalla>
  )
}

/** Pieza que une dos escenas: centrada en la costura, pisa un 15 % de cada una. Sin arte, no ocupa nada. */
function Transicion({ clave, final = false }: { clave: ClaveArte; final?: boolean }) {
  const ruta = rutaArte(clave)
  if (!ruta) return null
  return (
    <li aria-hidden className="pointer-events-none relative z-10 h-0">
      <img src={ruta} alt="" draggable={false}
        className={`absolute left-0 aspect-[4/1] w-full object-cover ${final ? '-translate-y-full' : '-translate-y-1/2'}`} />
    </li>
  )
}

function RinconDelSendero({ r, onClick }: { r: EstadoRincon; onClick: () => void }) {
  const area = AREAS[r.area]
  const c = COMPANEROS[area.companero]
  const estado = !r.llegado ? `${UI.bosque.dormido} · ${UI.bosque.llegaCon(r.faltanParaLlegar)}` : UI.bosque.fases[r.fase]
  return (
    <button type="button" onClick={onClick} className="relative block w-full text-left">
      <Escena r={r} continua />
      {/* Cartel del rincón, arriba a la izquierda, por encima del arte. */}
      <span className="absolute top-3 left-4 z-20 max-w-[75%] rounded-2xl bg-tarjeta/95 px-3 py-2 shadow-sm">
        <span className="block leading-tight font-bold">{area.rincon}</span>
        <span className="block text-[13px] text-texto-3">{c.nombre} · {area.nombre}</span>
        <span className="mt-1 flex items-center gap-2">
          <span className={`text-[13px] font-semibold ${r.fase > 0 ? 'text-peligro' : 'text-salvia-texto'}`}>{estado}</span>
          <span className="flex shrink-0 gap-1" aria-label={UI.bosque.crecimiento(r.grado)}>
            {[1, 2, 3].map((g) => (
              <span key={g} className={`h-2 w-2 rounded-full ${r.grado >= g ? 'bg-salvia' : 'bg-borde'}`} />
            ))}
          </span>
        </span>
      </span>
    </button>
  )
}
