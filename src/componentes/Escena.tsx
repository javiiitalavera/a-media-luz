// Escena de un rincón montada por capas (docs/capas-arte.md).
// Solo pinta capas APROBADAS del manifiesto; si falta el fondo queda un hueco neutro.
// Orden de abajo arriba: fondo → crecimiento (la del grado actual) → maleza → visitante → compañero.
// Si se pasa `onTocar`, el compañero se puede tocar y habla en un bocadillo sobre su cabeza.
import { AREAS, COMPANEROS, UI } from '../contenido'
import { rutaArte, type ClaveArte } from '../arte/manifiesto'
import { capasDe, expresionDe } from '../arte/capas'
import type { EstadoRincon } from '../logica/reglas'

function Capa({ clave }: { clave: ClaveArte }) {
  const ruta = rutaArte(clave)
  if (!ruta) return null
  return <img src={ruta} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover" draggable={false} />
}

/** `continua`: sin esquinas redondeadas, para encadenarla con las vecinas en el sendero. */
export function Escena({ r, className = '', continua = false, onTocar, bocadillo }: {
  r: EstadoRincon; className?: string; continua?: boolean; onTocar?: () => void; bocadillo?: string | null
}) {
  const area = AREAS[r.area]
  const c = COMPANEROS[area.companero]
  const exp = expresionDe(r)
  const ruta = rutaArte(`companero/${c.id}/${exp}`) ?? rutaArte(`companero/${c.id}/base`)
  const figura = ruta ? (
    <img src={ruta} alt="" aria-hidden className={`w-full object-contain ${exp === 'dormido' ? 'opacity-80' : ''}`} draggable={false} />
  ) : (
    <span className="block aspect-square w-full rounded-full bg-fondo/60" />
  )
  return (
    <div role="group" aria-label={`${area.rincon} · ${c.nombre}`} className={`relative aspect-[4/3] w-full overflow-hidden bg-hundido ${continua ? '' : 'rounded-3xl'} ${className}`}>
      {capasDe(r).map((k) => <Capa key={k} clave={k} />)}
      {/* Compañero en el centro, con los pies al 80 % de la altura. */}
      <div className="absolute bottom-[20%] left-1/2 z-20 w-[34%] -translate-x-1/2">
        {onTocar ? (
          <button type="button" aria-label={UI.bosque.hablar(c.nombre)} onClick={(e) => { e.stopPropagation(); onTocar() }}
            className="block w-full transition-transform active:scale-95">
            {figura}
          </button>
        ) : figura}
      </div>
      {bocadillo && (
        // Encima de la cabeza (la figura ocupa del 20 % al 65 % de la altura).
        <div role="status" className="animate-entrar absolute bottom-[63%] left-1/2 z-30 w-[78%] -translate-x-1/2">
          <div className="relative rounded-3xl bg-tarjeta px-4 py-2.5 text-[15px] leading-snug text-texto shadow-md">
            {bocadillo}
            <span aria-hidden className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-tarjeta" />
          </div>
        </div>
      )}
    </div>
  )
}
