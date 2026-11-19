// El vecino en su casa, con sus gestos (tanda C). Cada uno se mueve a su manera, con trozos de su propio
// dibujo (sin arte nuevo):
// - Nox: respira, da saltitos impacientes y, al tocarlo, salta.
// - Tofu: completamente quieto (es el chiste); solo su brote se mece. Al tocarlo, el brote se sobresalta.
// - Tuerca: respira y da algún tic; su engranaje gira a ratos. Al tocarlo, respingo y engranaje a toda prisa.
import type { CSSProperties } from 'react'
import type { CompaneroId } from '../contenido'
import { rutaCompanero, type Expresion } from '../arte/manifiesto'

/** Altura (en % del dibujo) donde se separa la parte que se mueve sola (brote o engranaje), por etapa. */
const CORTE: Partial<Record<CompaneroId, [number, number, number]>> = { tofu: [42, 44, 35], tuerca: [31, 25, 27] }
/** Punto sobre el que gira esa parte (x, y en %): el brote, desde su base; el engranaje, desde su centro. */
const EJE: Partial<Record<CompaneroId, [number, number][]>> = { tuerca: [[55.2, 20], [52, 15], [60.3, 17]] }

export function FiguraVecino({ c, etapa, expresion, reaccion, crecer }: {
  c: CompaneroId; etapa: 0 | 1 | 2; expresion: Expresion; reaccion: number; crecer: boolean
}) {
  const src = rutaCompanero(c, etapa, expresion)
  const corte = CORTE[c]?.[etapa]
  const tocado = reaccion > 0
  const brotar = crecer ? 'anim-brotar' : ''
  if (!corte) {
    // Nox (y quien no tenga gesto propio): respira; saltitos de impaciencia; al tocar, salto.
    return (
      <span key={reaccion} className={`block ${tocado ? 'anim-saltar' : c === 'nox' ? 'anim-impaciente' : ''}`}>
        <img src={src} alt="" draggable={false} className={`anim-respirar block w-full ${brotar}`} />
      </span>
    )
  }
  const eje = EJE[c]?.[etapa] ?? [50, corte]
  const arriba: CSSProperties = { clipPath: `inset(0 0 ${100 - corte - 1}% 0)`, transformOrigin: `${eje[0]}% ${eje[1]}%` }
  const abajo: CSSProperties = { clipPath: `inset(${corte}% 0 0 0)` }
  const tofu = c === 'tofu'
  const cuerpo = tofu ? '' : tocado ? 'anim-respingo' : 'anim-tic'
  const parte = tofu ? (tocado ? 'anim-brote-susto' : 'anim-brote') : (tocado ? 'anim-engranaje-prisa' : 'anim-engranaje')
  return (
    <span key={reaccion} className={`relative block ${cuerpo} ${brotar}`}>
      <span className={`block ${tofu ? '' : 'anim-respirar'}`}>
        <img src={src} alt="" draggable={false} className="block w-full" style={abajo} />
        <img src={src} alt="" draggable={false} className={`absolute inset-0 block w-full ${parte}`} style={arriba} />
      </span>
    </span>
  )
}
