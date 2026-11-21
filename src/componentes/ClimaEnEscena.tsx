import type { CSSProperties } from 'react'
import type { EstacionBarrio, TiempoBarrio } from '../logica/convivencia'

/** Capa ambiental sin imágenes nuevas, sin interacción y respetando movimiento reducido. */
export function ClimaEnEscena({ tiempo, estacion, casa = false }: {
  tiempo: TiempoBarrio; estacion: EstacionBarrio; casa?: boolean
}) {
  const n = tiempo === 'lluvia' ? 17 : tiempo === 'viento' ? 9 : tiempo === 'niebla' ? 4 : 0
  return (
    <div aria-hidden="true" className="clima-del-barrio pointer-events-none absolute inset-0 overflow-hidden"
      data-tiempo={tiempo} data-estacion={estacion} data-interior={casa || undefined}>
      <span className="clima-tinte" />
      {!casa && Array.from({ length: n }, (_, i) => (
        <i key={i} className="clima-particula" style={{
          '--x': `${(i * 47 + 13) % 98}%`,
          '--y': `${(i * 31 + 7) % 90}%`,
          '--retardo': `${-(i % 8) * .46}s`,
          '--duracion': `${2 + (i % 4) * .55}s`,
        } as CSSProperties} />
      ))}
    </div>
  )
}
