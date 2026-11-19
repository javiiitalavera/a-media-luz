// Inicio (solo la primera vez): llega el primer huevo, cuatro preguntas (que se pueden saltar) y se eligen
// los retos de cada día a partir de lo sugerido.
import { useEffect, useState } from 'react'
import { ACCIONES, AREAS, HAZANAS_INICIALES, ORDEN_AREAS, UI, type AreaId, type CompaneroId } from '../contenido'
import { IconoArea } from '../componentes/IconoArea'
import { rutaArte } from '../arte/manifiesto'
import { useJuego } from '../estado/juego'
import { BotonPrincipal, Pantalla } from '../componentes/comunes'
import { Cuestionario } from '../componentes/Cuestionario'
import { TEXTOS_CUESTIONARIO as T, type Perfil } from '../contenido/cuestionario'
import { sugerencias, type Sugerencia } from '../logica/sugerencias'
import { MAX_RETOS } from '../logica/hazanas'

/** El primer huevo es siempre el de Nox (el único compañero con todo su arte, de momento). */
const PRIMERO: CompaneroId = 'nox'

export function Inicio() {
  const empezar = useJuego((s) => s.empezar)
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [perfil, setPerfil] = useState<Perfil>({ mejorar: [] })
  const [sugeridos, setSugeridos] = useState<Sugerencia[]>([])
  const [habituales, setHabituales] = useState<string[]>(HAZANAS_INICIALES)
  const verRetos = (p: Perfil) => { const s = sugerencias(p); setSugeridos(s); setHabituales(s.map((x) => x.id)); setPaso(3) }
  const nombreDe = (id: string, nombre: string) => sugeridos.find((x) => x.id === id)?.nombre ?? nombre
  const [todas, setTodas] = useState(false)
  useEffect(() => { window.scrollTo(0, 0) }, [paso])
  const alternar = (id: string) => setHabituales((h) => (h.includes(id) ? h.filter((x) => x !== id) : h.length >= MAX_RETOS ? h : [...h, id]))

  return (
    <Pantalla>
      {paso === 1 ? (
        <>
          <h1 className="px-1 text-[28px] leading-tight font-bold">{UI.inicio.huevoTitulo}</h1>
          <p className="mt-2 px-1 text-texto-2">{UI.inicio.huevoExplicacion}</p>
          <div className="mt-8 flex justify-center">
            <img src={rutaArte(`huevo/${PRIMERO}/cerrado`)} alt="" className="anim-mecer w-[58%] max-w-[240px]" draggable={false} />
          </div>
        </>
      ) : paso === 2 ? (
        <>
          <button type="button" onClick={() => setPaso(1)} className="-ml-2 min-h-11 px-2 font-semibold text-texto-2">‹ {UI.inicio.atras}</button>
          <h1 className="mt-1 px-1 text-[28px] leading-tight font-bold">{T.titulo}</h1>
          <p className="mt-2 mb-4 px-1 text-texto-2">{T.explicacion}</p>
          <Cuestionario perfil={perfil} onCambiar={setPerfil} />
          <button type="button" onClick={() => verRetos({ mejorar: [] })} className="mt-4 min-h-11 w-full text-[15px] font-semibold text-texto-3 underline underline-offset-4">{T.saltar}</button>
        </>
      ) : (
        <>
          <button type="button" onClick={() => setPaso(2)} className="-ml-2 min-h-11 px-2 font-semibold text-texto-2">‹ {UI.inicio.atras}</button>
          <h1 className="mt-1 px-1 text-[28px] leading-tight font-bold">{T.sugeridosTitulo}</h1>
          <p className="mt-2 px-1 text-texto-2">{T.sugeridosExplicacion}</p>
          {perfil.edad === 'menor' && <p className="mt-3 rounded-2xl bg-tarjeta p-3 text-[15px] leading-snug font-medium">{T.menor}</p>}
          {!todas ? (
            <div className="mt-5 flex flex-col gap-2">
              {ACCIONES.filter((a) => sugeridos.some((x) => x.id === a.id) || habituales.includes(a.id)).map((a) => (
                <Opcion key={a.id} nombre={nombreDe(a.id, a.nombre)} area={a.area} activa={habituales.includes(a.id)} onToque={() => alternar(a.id)} />
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-5">
              {ORDEN_AREAS.map((area) => (
                <section key={area}>
                  <h2 className="mb-2 flex items-center gap-1.5 px-1 text-[15px] font-bold"><IconoArea area={area} pequeno />{AREAS[area].nombre}</h2>
                  <div className="flex flex-col gap-2">
                    {ACCIONES.filter((a) => a.area === area).map((a) => (
                      <Opcion key={a.id} nombre={nombreDe(a.id, a.nombre)} area={a.area} activa={habituales.includes(a.id)} onToque={() => alternar(a.id)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          <button type="button" onClick={() => setTodas(!todas)} className="mt-3 min-h-11 w-full rounded-2xl text-[15px] font-semibold text-coral-texto">
            {todas ? UI.arranque.verMenos : UI.arranque.verTodas}
          </button>
          <p className="mt-1 px-1 text-center text-[13px] text-texto-3">{UI.arranque.cambiarLuego}</p>
        </>
      )}
      <div className="sticky bottom-0 -mx-4 mt-4 bg-gradient-to-t from-fondo from-70% to-transparent px-4 pt-6 pb-[max(20px,env(safe-area-inset-bottom))]">
        {paso === 1 ? (
          <BotonPrincipal onClick={() => setPaso(2)}>{UI.inicio.siguiente}</BotonPrincipal>
        ) : paso === 2 ? (
          <BotonPrincipal onClick={() => verRetos(perfil)}>{T.seguir}</BotonPrincipal>
        ) : (
          <BotonPrincipal onClick={() => empezar(PRIMERO, habituales, perfil, sugeridos)}>{UI.inicio.empezarHuevo}</BotonPrincipal>
        )}
      </div>
    </Pantalla>
  )
}

function Opcion({ nombre, area, activa, onToque }: { nombre: string; area: AreaId; activa: boolean; onToque: () => void }) {
  return (
    <button type="button" aria-pressed={activa} onClick={onToque}
      className={`flex min-h-[56px] w-full items-center gap-3 rounded-2xl border-2 px-3 text-left transition ${activa ? 'border-salvia bg-tarjeta' : 'border-borde bg-tarjeta/60'}`}>
      <IconoArea area={area} />
      <span className="flex-1">
        <span className="block text-[16px] font-semibold">{nombre}</span>
        <span className="block text-[13px] text-texto-3">{AREAS[area].nombre}</span>
      </span>
      <span aria-hidden className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${activa ? 'bg-salvia text-tinta' : 'border-2 border-borde'}`}>
        {activa && <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
      </span>
    </button>
  )
}
