// El vecino de su área propone subir la meta de un reto que ya te sale solo (logica/subir.ts).
import { COMPANEROS, UI } from '../contenido'
import { aceptarMeta, rechazarMeta, type PropuestaMeta as Propuesta } from '../logica/subir'
import { ahora as reloj } from '../logica/reloj'
import { useJuego } from '../estado/juego'
import { sfx } from '../sonido'

export function PropuestaMeta({ propuesta, className = '' }: { propuesta: Propuesta; className?: string }) {
  const ajustar = useJuego((s) => s.ajustar)
  const { reto, vecino, nueva } = propuesta
  return (
    <div role="status" className={`rounded-3xl bg-tarjeta px-4 py-3 text-texto shadow-md ${className}`}>
      <p className="text-[15px] leading-snug"><b>{COMPANEROS[vecino].nombre}:</b> «{UI.subirMeta[vecino](reto.nombre, nueva)}»</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => { sfx.elegir(); ajustar((p) => aceptarMeta(p, reto.id, nueva, reloj())) }}
          className="min-h-11 rounded-full bg-ambar px-4 text-left text-[14px] font-bold text-tinta">{UI.subirMeta.subir(nueva)}</button>
        <button type="button" onClick={() => ajustar((p) => rechazarMeta(p, reto.id, reloj()))} className="min-h-11 px-2 text-[14px] font-semibold text-texto-3">{UI.subirMeta.asi}</button>
      </div>
    </div>
  )
}
