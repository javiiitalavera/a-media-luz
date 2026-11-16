// El bosque: una casita por cada mes. Se entra a visitar a cada vecino (y a seguir construyendo con
// lo que le sobró de su mes). El del mes en curso lleva a la casa principal.
import { COMPANEROS, UI, type CompaneroId } from '../contenido'
import type { Partida } from '../logica/partida'
import { estadoDelMes, mesesDe } from '../logica/meses'
import { progreso } from '../logica/etapas'
import { rutaArte } from '../arte/manifiesto'
import { Pantalla } from '../componentes/comunes'

export function Bosque({ partida, ahora, onVisitar, onCasa }: {
  partida: Partida; ahora: Date; onVisitar: (c: CompaneroId) => void; onCasa: () => void
}) {
  const meses = mesesDe(partida)
  const enHuevo = estadoDelMes(partida, ahora) === 'huevo'
  return (
    <Pantalla>
      <button type="button" onClick={onCasa} className="-ml-2 min-h-11 px-2 font-semibold text-texto-2">‹ {UI.casa.alaCasa}</button>
      <h1 className="mt-1 mb-1 px-1 text-[28px] leading-tight font-bold">{UI.vecinos.titulo}</h1>
      <p className="mb-4 px-1 text-texto-2">{UI.vecinos.explicacion}</p>
      <ul className="grid grid-cols-2 gap-3">
        {meses.map((m, i) => {
          const actual = i === meses.length - 1
          const oculto = actual && enHuevo
          const c = COMPANEROS[m.companero]
          const g = progreso(partida, m.companero, ahora)
          return (
            <li key={m.inicio}>
              <button type="button" onClick={() => (actual ? onCasa() : onVisitar(m.companero))}
                className={`flex w-full flex-col items-center rounded-3xl bg-tarjeta p-3 text-center transition active:scale-[0.97] ${actual ? 'ring-2 ring-ambar' : ''}`}>
                <img src={rutaArte(oculto ? `huevo/${m.companero}/cerrado` : `casita/${m.companero}`)} alt=""
                  className={`aspect-square w-full object-contain ${oculto ? 'anim-mecer p-4' : ''}`} draggable={false} />
                <span className="mt-1 text-[17px] font-bold">{oculto ? '?' : c.nombre}</span>
                <span className="text-[13px] text-texto-3">
                  {UI.vecinos.mes(i + 1)} · {actual ? UI.vecinos.esteMes : UI.casa.etapas[g.etapa]}
                </span>
                {oculto && <span className="text-[12px] text-texto-3">{UI.vecinos.huevo}</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </Pantalla>
  )
}
