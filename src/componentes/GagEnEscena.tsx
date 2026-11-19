// Algo brilla en la escena (casa o barrio). Al tocarlo asoma un dibujo unos segundos y sale su frase.
import { useState } from 'react'
import type { Gag } from '../contenido/gags'
import { UI } from '../contenido'
import { globoEn } from '../estado/globo'
import { sfx } from '../sonido'

export function GagEnEscena({ gag, onVisto }: { gag: Gag; onVisto: () => void }) {
  const [fase, setFase] = useState<'brilla' | 'asoma' | 'fin'>('brilla')
  if (fase === 'fin') return null
  if (fase === 'asoma') {
    return (
      <div aria-hidden className="anim-asoma pointer-events-none absolute z-[12]"
        style={{ left: `${gag.sitio.x}%`, top: `${gag.sitio.y}%`, width: `${gag.ancho}%`, transform: 'translate(-50%, -100%)' }}
        onAnimationEnd={() => setFase('fin')}>
        {gag.artes.map((a, i) => (
          <img key={a} src={a} alt="" draggable={false} className="block w-full drop-shadow-[0_2px_3px_rgba(46,32,48,0.4)]"
            style={i > 0 ? { position: 'absolute', left: '35%', top: '-35%', width: '70%' } : undefined} />
        ))}
      </div>
    )
  }
  return (
    <button type="button" aria-label={UI.casa.algoBrilla} className="absolute z-[12] flex min-h-11 min-w-11 items-center justify-center"
      style={{ left: `${gag.sitio.x}%`, top: `${gag.sitio.y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={(e) => { e.stopPropagation(); sfx.sorpresa(); globoEn(e, gag.texto); setFase('asoma'); onVisto() }}>
      <svg aria-hidden viewBox="0 0 24 24" className="anim-destello h-7 w-7 drop-shadow-[0_0_6px_#ffe08a]">
        <path d="M12 2.5c.6 4.6 2.4 6.9 7 7.5-4.6.6-6.4 2.9-7 7.5-.6-4.6-2.4-6.9-7-7.5 4.6-.6 6.4-2.9 7-7.5z" fill="#fff6c8" stroke="#ffd36b" strokeWidth="1" />
      </svg>
    </button>
  )
}
