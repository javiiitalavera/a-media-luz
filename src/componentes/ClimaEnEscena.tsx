import '../estilos/ambiente-vivo.css'
import { useState, type CSSProperties } from 'react'
import type { EstacionBarrio, TiempoBarrio } from '../logica/convivencia'
import type { FenomenoBarrio } from '../logica/ambiente'
import { sfx } from '../sonido'

/** Clima ambiental ficticio y compartido entre barrio y casas. Sin bloquear interacciones. */
export function ClimaEnEscena({ tiempo, estacion, fenomeno = null, casa = false }: {
  tiempo: TiempoBarrio; estacion: EstacionBarrio; fenomeno?: FenomenoBarrio | null; casa?: boolean
}) {
  const n = casa ? 0 : tiempo === 'lluvia' ? 17 : tiempo === 'viento' ? 9 : tiempo === 'niebla' ? 4 : 0
  const adornos = fenomeno ? (casa ? 4 : 8) : 0
  return (
    <div aria-hidden="true" className="clima-del-barrio pointer-events-none absolute inset-0 overflow-hidden"
      data-tiempo={tiempo} data-estacion={estacion} data-fenomeno={fenomeno ?? undefined} data-interior={casa || undefined}>
      <span className="clima-tinte" />
      {Array.from({ length: n }, (_, i) => (
        <i key={i} className="clima-particula" style={{
          '--x': `${(i * 47 + 13) % 98}%`,
          '--y': `${(i * 31 + 7) % 90}%`,
          '--retardo': `${-(i % 8) * .46}s`,
          '--duracion': `${2 + (i % 4) * .55}s`,
        } as CSSProperties} />
      ))}
      {Array.from({ length: adornos }, (_, i) => (
        <i key={i} className="clima-estacional" style={{
          '--x': `${(i * 37 + 17) % 92}%`,
          '--y': `${(i * 19 + 23) % 78}%`,
          '--retardo': `${-i * .74}s`,
          '--duracion': `${5 + (i % 3) * 1.6}s`,
        } as CSSProperties} />
      ))}
    </div>
  )
}

const JUGAR_CON: Record<FenomenoBarrio, string> = {
  petalos: 'Jugar con los pétalos',
  motas: 'Jugar con las motitas de verano',
  hojas: 'Hacer girar las hojas',
  escarcha: 'Tocar la escarcha',
  gotas: 'Chapoteo en la lluvia',
  brillos: 'Apartar los brillos de la niebla',
  remolino: 'Hacer girar el remolino',
}

/** Una pequeña sorpresa visible y tocable. No da premios, no abre un diálogo,
 * no usa el guardado y se puede repetir sin límites cuando el ambiente lo permite. */
export function FenomenoTocable({ fenomeno, casa = false }: {
  fenomeno: FenomenoBarrio | null; casa?: boolean
}) {
  const [veces, setVeces] = useState(0)
  if (!fenomeno) return null
  return (
    <button type="button" aria-label={JUGAR_CON[fenomeno]}
      className="fenomeno-tocable absolute z-[11] flex min-h-11 min-w-11 items-center justify-center"
      data-fenomeno={fenomeno} data-interior={casa || undefined}
      style={{ left: casa ? '18%' : '34%', top: casa ? '36%' : '57%', transform: 'translate(-50%, -50%)' }}
      onClick={(e) => { e.stopPropagation(); setVeces((n) => n + 1); sfx.toque() }}>
      <span key={`${fenomeno}|${veces}`} className="fenomeno-sprite" data-tocado={veces > 0 ? '' : undefined} aria-hidden="true">
        <i /><i /><i />
      </span>
    </button>
  )
}
