// Icono de cada material (dibujado por código): llama, semilla, gota, carrete y tornillo, con su color.
import { MATERIALES, type AreaId } from '../contenido'

const FORMA: Record<AreaId, string> = {
  cuerpo: 'M12 2.8c1.6 3.4 5.4 5.4 5.4 10a5.4 5.4 0 0 1-10.8 0c0-2.5 1.3-3.9 2.6-5 0 2.1 1.1 3.4 2.5 3.7-.3-3.2-1-5.9.3-8.7z',
  mente: 'M12 3.5c4.4 3.2 5.5 7.6 3.9 11.6-.9 2.4-2.2 4.2-3.9 5.4-1.7-1.2-3-3-3.9-5.4C6.5 11.1 7.6 6.7 12 3.5z',
  calma: 'M12 3c3.3 4.3 6.4 7.7 6.4 11.1a6.4 6.4 0 0 1-12.8 0C5.6 10.7 8.7 7.3 12 3z',
  vinculos: 'M6.5 4.5h11v2.6h-11z M6.5 16.9h11v2.6h-11z M8.2 7.1h7.6v9.8H8.2z',
  orden: 'M7.5 3.8h9l-1.3 3.4H8.8z M10.4 7.2h3.2v11.4l-1.6 2.4-1.6-2.4z',
}
/** Detalles interiores (vena de la semilla, hilo del carrete, rosca del tornillo). */
const DETALLE: Partial<Record<AreaId, string>> = {
  mente: 'M12 7v10',
  vinculos: 'M8.4 9.5l7.2 1.6 M8.4 12.2l7.2 1.6 M8.4 14.9l7.2 1.4',
  orden: 'M10.6 10l2.8-.9 M10.6 13l2.8-.9 M10.6 16l2.8-.9',
}

export function IconoMaterial({ area, tam = 18 }: { area: AreaId; tam?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={tam} height={tam} className="shrink-0" strokeLinejoin="round" strokeLinecap="round">
      <path d={FORMA[area]} fill={MATERIALES[area].color} stroke="#4a2f35" strokeWidth="1.5" />
      {DETALLE[area] && <path d={DETALLE[area]} fill="none" stroke="#4a2f35" strokeWidth="1.1" opacity="0.65" />}
    </svg>
  )
}
