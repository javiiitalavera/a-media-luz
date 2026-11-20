// El último vecino te pide un reto de su área si tu lista no tiene ninguno (sin él no crece ni hay material).
// «Luego» lo deja hasta mañana, en su casa y en Retos. Con la lista llena, lleva a editarla.
import { COMPANEROS, UI } from '../contenido'
import { aplazarPista, type Pista } from '../logica/pista'
import { anadirSugerencia } from '../logica/sugerencias'
import { ahora as reloj } from '../logica/reloj'
import { useJuego } from '../estado/juego'
import { sfx } from '../sonido'

export function PideReto({ pista, onEditar, className = '' }: { pista: Pista; onEditar?: () => void; className?: string }) {
  const ajustar = useJuego((s) => s.ajustar)
  return (
    <div role="status" className={`rounded-3xl bg-tarjeta px-4 py-3 text-texto shadow-md ${className}`}>
      <p className="text-[15px] leading-snug"><b>{COMPANEROS[pista.vecino].nombre}:</b> «{UI.pideReto[pista.vecino]}»</p>
      {!pista.cabe && <p className="mt-1 text-[13px] text-texto-3">{UI.pideReto.lleno}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {pista.cabe ? (
          <button type="button" onClick={() => { sfx.elegir(); ajustar((p) => anadirSugerencia(p, pista.reto)) }}
            className="min-h-11 rounded-full bg-ambar px-4 text-left text-[14px] font-bold text-tinta">{UI.pideReto.anadir(pista.reto.nombre)}</button>
        ) : onEditar && (
          <button type="button" onClick={onEditar} className="min-h-11 rounded-full bg-ambar px-4 text-[14px] font-bold text-tinta">{UI.pideReto.editar}</button>
        )}
        <button type="button" onClick={() => ajustar((p) => aplazarPista(p, pista.vecino, reloj()))} className="min-h-11 px-2 text-[14px] font-semibold text-texto-3">{UI.pideReto.luego}</button>
      </div>
    </div>
  )
}
