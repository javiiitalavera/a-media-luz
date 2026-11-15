// Pantalla principal: el bosque como un sendero vertical continuo.
// Lo principal es el paisaje y los compañeros: al tocar uno, habla en un bocadillo.
// Las escenas van pegadas a todo el ancho y entre cada dos se monta una pieza de transición.
import { Fragment, useEffect, useState } from 'react'
import { AREAS, UI, type AreaId } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoBosque, type EstadoRincon } from '../logica/reglas'
import { momentoDelDia } from '../logica/momento'
import { rutaArte, type ClaveArte } from '../arte/manifiesto'
import { transicionesDe } from '../arte/capas'
import { useJuego } from '../estado/juego'
import { Pantalla } from '../componentes/comunes'
import { Escena } from '../componentes/Escena'

const SEGUNDOS_BOCADILLO = 7

export function Bosque({ partida, ahora, onRincon, onAjustes }: {
  partida: Partida; ahora: Date; onRincon: (a: AreaId) => void; onAjustes: () => void
}) {
  const tocar = useJuego((s) => s.tocar)
  const rincones = estadoBosque(partida, ahora)
  const transiciones = transicionesDe(rincones.map((r) => r.area))
  const [habla, setHabla] = useState<{ area: AreaId; texto: string; n: number } | null>(null)
  useEffect(() => {
    if (!habla) return
    const t = setTimeout(() => setHabla(null), SEGUNDOS_BOCADILLO * 1000)
    return () => clearTimeout(t)
  }, [habla])
  const alTocar = (r: EstadoRincon) => {
    const f = tocar(AREAS[r.area].companero)
    if (f) setHabla({ area: r.area, texto: f.texto, n: (habla?.n ?? 0) + 1 })
  }

  return (
    <Pantalla>
      <header className="-mt-2 flex items-center justify-between px-1">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[20px] font-bold">{UI.app}</h1>
          <span className="text-[14px] text-texto-3">{UI.momentos[momentoDelDia(ahora)]}</span>
        </div>
        <button type="button" onClick={onAjustes} className="min-h-11 px-2 text-sm font-semibold text-texto-3">
          {UI.bosque.ajustes}
        </button>
      </header>

      {/* El sendero: a todo el ancho, sin huecos entre escenas. */}
      <ol className="-mx-4 mt-1 overflow-hidden rounded-t-3xl" onClick={() => setHabla(null)}>
        {rincones.map((r, i) => (
          <Fragment key={r.area}>
            {i > 0 && <Transicion clave={transiciones[i - 1]} />}
            <li className="relative">
              <Escena
                r={r}
                continua
                onTocar={r.llegado ? () => alTocar(r) : undefined}
                bocadillo={habla?.area === r.area ? habla.texto : null}
                key={habla?.area === r.area ? habla.n : 0}
              />
              <Cartel r={r} onClick={() => onRincon(r.area)} />
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

/** Cartelito discreto abajo a la izquierda: nombre, estado y crecimiento. Lleva al rincón. */
function Cartel({ r, onClick }: { r: EstadoRincon; onClick: () => void }) {
  const area = AREAS[r.area]
  const estado = !r.llegado ? UI.bosque.dormido : UI.bosque.fases[r.fase]
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      aria-label={UI.bosque.verRincon(area.rincon)}
      className="absolute bottom-3 left-3 z-20 flex min-h-11 max-w-[calc(100%-24px)] items-center gap-2 rounded-full bg-tarjeta/95 px-3.5 text-left shadow-sm"
    >
      <span className="truncate text-[13px] font-bold">{area.rincon}</span>
      <span className={`shrink-0 text-[13px] font-semibold ${r.fase > 0 ? 'text-peligro' : 'text-salvia-texto'}`}>{estado}</span>
      <span className="flex shrink-0 gap-1" aria-label={UI.bosque.crecimiento(r.grado)}>
        {[1, 2, 3].map((g) => (
          <span key={g} className={`h-2 w-2 rounded-full ${r.grado >= g ? 'bg-salvia' : 'bg-borde'}`} />
        ))}
      </span>
      <span aria-hidden className="text-texto-3">›</span>
    </button>
  )
}
