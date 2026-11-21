// El vecino en su casa, con sus gestos (tanda C). Cada uno se mueve a su manera, con trozos de su propio
// dibujo (sin arte nuevo):
// - Nox: respira, da saltitos impacientes y, al tocarlo, salta.
// - Tofu: el brote se adelanta al cuerpo al tocarlo. De adulto solo deja caer unas hojas.
// - Bruma: flota arriba y abajo; al tocarla se esponja y vuelve a flotar. Dormida, flota más despacio.
// - Madeja: escucha inclinándose a un lado y a otro; al tocarla, brinca y se le escapa una hebra.
// - Tuerca: respira y da algún tic; su engranaje gira a ratos. Al tocarlo, respingo y engranaje a toda prisa.
import type { CSSProperties } from 'react'
import type { CompaneroId } from '../contenido'
import { rutaCompanero, type Expresion } from '../arte/manifiesto'

/** Altura (en % del dibujo) donde se separa la parte que se mueve sola (brote o engranaje), por etapa. */
const CORTE: Partial<Record<CompaneroId, (number | null)[]>> = { tuerca: [31, null, null] }
/** Tofu: el brote nace a distinta altura en cada cara: [corte, eje x] por etapa y expresión. De adulto, la
 *  copa está enredada con el musgo y no se separa: se queda quieto y, al tocarlo, se le caen unas hojas. */
const BROTE: Partial<Record<Expresion, [number, number]>>[] = [
  { base: [43, 58.3], contento: [41, 47.1], enfurrunado: [40.5, 60.2], dormido: [40, 46.1] },
  { base: [42, 60], contento: [42, 48], enfurrunado: [34.5, 70.9], dormido: [34.5, 42.2] },
  {},
]
/** Punto sobre el que gira esa parte (x, y en %): el brote, desde su base; el engranaje, desde su centro. */
const EJE: Partial<Record<CompaneroId, [number, number][]>> = { tuerca: [[55.2, 20]] }
/** Tuerca joven y adulto (dos engranajes y antena): en vez de girar, parpadea la luz de la antena. */
const ANTENA: (null | { x: number; y: number; tam: number })[] = [null, { x: 56, y: 10.2, tam: 7 }, { x: 57.9, y: 10.7, tam: 6.5 },
  { x: 51.1, y: 10.1, tam: 7 }, { x: 50.8, y: 10.1, tam: 7 }]

export function FiguraVecino({ c, etapa, expresion, reaccion, ladoToque, ladoMaceta, noche = false }: {
  c: CompaneroId; etapa: number; expresion: Expresion; reaccion: number
  ladoToque: -1 | 1; ladoMaceta?: -1 | 1; noche?: boolean
}) {
  const src = rutaCompanero(c, etapa, expresion)
  const brote = c === 'tofu' ? BROTE[etapa]?.[expresion] : undefined
  const corte = brote ? brote[0] : CORTE[c]?.[etapa]
  const tocado = reaccion > 0
  const dormido = expresion === 'dormido'
  const antena = c === 'tuerca' ? ANTENA[etapa] ?? null : null
  if (antena) {
    return (
      <span key={reaccion} data-dormido={dormido || undefined} className={`relative block ${tocado ? 'anim-respingo' : 'anim-tic'}`}>
        <img src={src} alt="" draggable={false} className="anim-respirar block w-full" />
        <span aria-hidden className={`absolute rounded-full ${tocado ? 'anim-antena-prisa' : 'anim-antena'}`}
          style={{ left: `${antena.x}%`, top: `${antena.y}%`, width: `${antena.tam}%`, aspectRatio: '1', transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, #fff8c8 0%, #ffd34ecc 45%, transparent 72%)' }} />
      </span>
    )
  }
  if (c === 'madeja') {
    // Madeja: se inclina a un lado y a otro, como quien escucha detrás de una puerta; al tocarla, da un brinco de
    // emoción y se le escapa una hebra que se enrolla sola.
    return (
      <span key={reaccion} data-dormido={dormido || undefined} className={`relative block ${tocado && !dormido ? 'anim-madeja-brinco' : 'anim-madeja-escucha'}`}>
        <img src={src} alt="" draggable={false} className="anim-respirar block w-full" />
        {tocado && !dormido && <span aria-hidden className="hebra-de-madeja" />}
      </span>
    )
  }
  if (c === 'bruma') {
    return (
      <span key={reaccion} data-dormido={dormido || undefined} className={`block ${tocado && !dormido ? 'anim-esponjar' : 'anim-flotar'}`}>
        <img src={src} alt="" draggable={false} className="anim-respirar block w-full" />
      </span>
    )
  }
  if (c === 'tofu' && !corte) {
    // Tofu adulto: inmóvil del todo. Al tocarlo, se le caen tres hojas y él ni se inmuta.
    return (
      <span key={reaccion} data-dormido={dormido || undefined} className="relative block">
        <img src={src} alt="" draggable={false} className="block w-full" />
        {tocado && !dormido && [0, 1, 2].map((i) => (
          <span key={i} aria-hidden className="anim-hoja-cae absolute h-[7%] w-[5%] rounded-[50%_0] bg-[#8fae6b] shadow-[inset_0_0_0_1.5px_#4a6b32]"
            style={{ left: `${32 + i * 17}%`, top: `${26 + (i % 2) * 4}%`, animationDelay: `${i * 0.18}s`, rotate: `${i * 50 - 30}deg` } as CSSProperties} />
        ))}
      </span>
    )
  }
  if (!corte) {
    // Nox (y quien no tenga gesto propio): respira; saltitos de impaciencia; al tocar, salto.
    return (
      <span key={reaccion} data-dormido={dormido || undefined} className={`relative block ${tocado ? 'anim-saltar' : c === 'nox' ? 'anim-impaciente' : ''}`}>
        <img src={src} alt="" draggable={false} className="anim-respirar block w-full" />
        {/* De noche la llama de la cola de Nox se convierte en ascuas sin iluminar:
            se oscurece solo esa zona de la ilustración, sin cambiar la cara ni el cuerpo. */}
        {c === 'nox' && noche && <img aria-hidden src={src} alt="" draggable={false}
          className="nox-ascuas absolute inset-0 block w-full pointer-events-none" />}
      </span>
    )
  }
  const eje = brote ? [brote[1], corte] : EJE[c]?.[etapa] ?? [50, corte]
  const arriba: CSSProperties = { clipPath: `inset(0 0 ${100 - corte - 1}% 0)`, transformOrigin: `${eje[0]}% ${eje[1]}%` }
  const abajo: CSSProperties = { clipPath: `inset(${corte}% 0 0 0)` }
  const tofu = c === 'tofu'
  const cuerpo = tofu ? (tocado && !dormido ? 'tofu-responde' : '') : tocado ? 'anim-respingo' : 'anim-tic'
  const parte = tofu ? (tocado && !dormido ? 'tofu-brote-responde' : 'tofu-brote') : (tocado ? 'anim-engranaje-prisa' : 'anim-engranaje')
  const direccion = tofu ? {
    '--lado-toque': ladoToque,
    '--lado-maceta': !dormido ? ladoMaceta ?? 0 : 0,
  } as CSSProperties : undefined
  return (
    <span key={reaccion} style={direccion} data-dormido={dormido || undefined} className={`relative block ${cuerpo}`}>
      <span className={`block ${tofu ? '' : 'anim-respirar'}`}>
        <img src={src} alt="" draggable={false} className="block w-full" style={abajo} />
        <img src={src} alt="" draggable={false} className={`absolute inset-0 block w-full ${parte}`} style={arriba} />
      </span>
    </span>
  )
}
