// Icono de cada área (dibujado por código, línea sencilla), en un círculo con el color de su material.
import { MATERIALES, type AreaId } from '../contenido'

const TRAZOS: Record<AreaId, string> = {
  cuerpo: 'M12 3.5c1.2 3 4.5 4.8 4.5 9a4.5 4.5 0 0 1-9 0c0-2.2 1.1-3.4 2.2-4.4 0 1.9.9 3 2.1 3.2-.3-2.8-.8-5.2.2-7.8z',
  mente: 'M12 20.5v-7 M12 13.5c0-4-3-6.2-7-6.2 0 4 3 6.2 7 6.2z M12 11.5c0-3.4 2.4-5.4 6-5.4 0 3.4-2.4 5.4-6 5.4z',
  calma: 'M7.5 17.5h9a3.8 3.8 0 0 0 .3-7.6 5 5 0 0 0-9.5-1.2 3.4 3.4 0 0 0 .2 8.8z',
  vinculos: 'M12 19.5s-7-4.4-7-9.7a3.9 3.9 0 0 1 7-2.4 3.9 3.9 0 0 1 7 2.4c0 5.3-7 9.7-7 9.7z',
  orden: 'M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z M12 3v2.6 M12 18.4V21 M3 12h2.6 M18.4 12H21 M5.6 5.6l1.9 1.9 M16.5 16.5l1.9 1.9 M5.6 18.4l1.9-1.9 M16.5 7.5l1.9-1.9',
}

export function IconoArea({ area, pequeno }: { area: AreaId; pequeno?: boolean }) {
  const color = MATERIALES[area].color
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full ${pequeno ? 'h-6 w-6' : 'h-10 w-10'}`} style={{ background: `${color}33` }}>
      <svg viewBox="0 0 24 24" className={pequeno ? 'h-4 w-4' : 'h-6 w-6'} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'brightness(0.8)' }}>
        <path d={TRAZOS[area]} />
      </svg>
    </span>
  )
}
