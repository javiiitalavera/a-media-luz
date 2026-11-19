// Al abrir la app: nubes que tapan la pantalla y se apartan hacia los lados mientras se disipan (la
// primera vez del día; si vuelves a abrirla el mismo día, solo un fundido corto).
// Solo código (formas y degradados), sin dibujo. De noche, nubes color ciruela.
import { useEffect, useState, type CSSProperties } from 'react'

/** Nubes: lado al que se van, posición (% de pantalla), tamaño (% del ancho) y retraso. */
const NUBES: { lado: -1 | 1; x: number; y: number; t: number; r: number }[] = [
  { lado: -1, x: 18, y: 12, t: 95, r: 0 }, { lado: 1, x: 80, y: 20, t: 105, r: 0.08 },
  { lado: -1, x: 10, y: 38, t: 110, r: 0.04 }, { lado: 1, x: 88, y: 46, t: 100, r: 0.12 },
  { lado: -1, x: 30, y: 62, t: 120, r: 0.1 }, { lado: 1, x: 72, y: 70, t: 115, r: 0.02 },
  { lado: -1, x: 14, y: 88, t: 105, r: 0.14 }, { lado: 1, x: 84, y: 92, t: 110, r: 0.06 },
  { lado: 1, x: 50, y: 30, t: 90, r: 0.16 }, { lado: -1, x: 46, y: 80, t: 95, r: 0.18 },
]

const CLAVE = 'a-media-luz-entrada'
/** ¿Primera vez que se abre hoy? (las nubes, una vez al día; luego, un fundido corto). */
function primeraDelDia(): boolean {
  const hoy = new Date().toDateString()
  try {
    if (localStorage.getItem(CLAVE) === hoy) return false
    localStorage.setItem(CLAVE, hoy)
  } catch { /* sin almacenamiento: nubes siempre */ }
  return true
}

export function Entrada({ noche }: { noche: boolean }) {
  const [nubes] = useState(primeraDelDia)
  const [fuera, setFuera] = useState(false)
  useEffect(() => { const t = setTimeout(() => setFuera(true), nubes ? 2600 : 600); return () => clearTimeout(t) }, [nubes])
  if (fuera) return null
  if (!nubes) return <div aria-hidden className="anim-fundido pointer-events-none fixed inset-0 z-[60] mx-auto max-w-[430px]" style={{ background: noche ? '#2e2030' : '#f9ebdd' }} />
  const color = noche ? '#5b466e' : '#fff6ec'
  const sombra = noche ? '#3d2c4d' : '#f3d9c9'
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] mx-auto max-w-[430px] overflow-hidden">
      <div className="anim-velo absolute inset-0" style={{ background: noche ? '#2e2030' : '#f9ebdd' }} />
      {NUBES.map((n, i) => (
        <div key={i} className="anim-nube absolute" style={{
          left: `${n.x}%`, top: `${n.y}%`, width: `${n.t}%`, aspectRatio: '2 / 1',
          '--lado': n.lado, animationDelay: `${0.25 + n.r}s`,
        } as CSSProperties}>
          <Nube color={color} sombra={sombra} />
        </div>
      ))}
    </div>
  )
}

/** Una nube de cuento: varios círculos que se solapan, con una sombra suave debajo. */
function Nube({ color, sombra }: { color: string; sombra: string }) {
  const bolas = [[22, 62, 34], [42, 46, 44], [64, 52, 38], [80, 64, 28], [50, 70, 46]]
  return (
    <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2" style={{ filter: 'blur(1.5px)' }}>
      {bolas.map(([x, y, d], i) => (
        <span key={i} className="absolute rounded-full" style={{
          left: `${x}%`, top: `${y}%`, width: `${d}%`, aspectRatio: '1', transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 40% 35%, ${color} 60%, ${sombra} 100%)`,
        }} />
      ))}
    </div>
  )
}
