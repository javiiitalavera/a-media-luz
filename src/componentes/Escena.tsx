// Escena de un rincón montada por capas (docs/capas-arte.md).
// Solo pinta capas APROBADAS del manifiesto; si falta el fondo queda un hueco neutro.
// Orden de abajo arriba: fondo → crecimiento (la del grado actual) → maleza → visitante → compañero.
import { AREAS, COMPANEROS } from '../contenido'
import { rutaArte, type ClaveArte } from '../arte/manifiesto'
import { capasDe, expresionDe } from '../arte/capas'
import type { EstadoRincon } from '../logica/reglas'

function Capa({ clave }: { clave: ClaveArte }) {
  const ruta = rutaArte(clave)
  if (!ruta) return null
  return <img src={ruta} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover" draggable={false} />
}

export function Escena({ r, className = '' }: { r: EstadoRincon; className?: string }) {
  const area = AREAS[r.area]
  const c = COMPANEROS[area.companero]
  const exp = expresionDe(r)
  const ruta = rutaArte(`companero/${c.id}/${exp}`) ?? rutaArte(`companero/${c.id}/base`)
  return (
    <div role="img" aria-label={`${area.rincon} · ${c.nombre}`} className={`relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-hundido ${className}`}>
      {capasDe(r).map((k) => <Capa key={k} clave={k} />)}
      {/* Compañero anclado abajo en el centro; hueco neutro si no hay arte aprobado. */}
      <div className="absolute bottom-[8%] left-1/2 w-[34%] -translate-x-1/2">
        {ruta ? (
          <img src={ruta} alt="" aria-hidden className={`w-full object-contain ${exp === 'dormido' ? 'opacity-80' : ''}`} draggable={false} />
        ) : (
          <div className="aspect-square w-full rounded-full bg-fondo/60" />
        )}
      </div>
    </div>
  )
}
