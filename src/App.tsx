import { useEffect, useState } from 'react'
import type { AreaId } from './contenido'
import { useJuego } from './estado/juego'
import { momentoDelDia } from './logica/momento'
import { useAhora } from './componentes/comunes'
import { Navegacion, type Pestana } from './componentes/Navegacion'
import { Inicio } from './pantallas/Inicio'
import { Bosque } from './pantallas/Bosque'
import { Rincon } from './pantallas/Rincon'
import { Ofrendas } from './pantallas/Ofrendas'
import { Ajustes, Album, Semana } from './pantallas/Otras'

export default function App() {
  const partida = useJuego((s) => s.partida)
  const ahora = useAhora()
  const [pestana, setPestana] = useState<Pestana>('bosque')
  const [rincon, setRincon] = useState<AreaId | null>(null)
  const [ajustes, setAjustes] = useState(false)

  // De noche, la interfaz pasa a su versión oscura (ciruela).
  const noche = momentoDelDia(ahora) === 'noche'
  useEffect(() => {
    document.documentElement.dataset.noche = noche ? 'si' : 'no'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', noche ? '#2E2030' : '#F9EBDD')
  }, [noche])
  useEffect(() => { window.scrollTo(0, 0) }, [pestana, rincon, ajustes])

  if (!partida) return <Inicio />

  const irA = (p: Pestana) => { setRincon(null); setAjustes(false); setPestana(p) }
  let pantalla
  if (ajustes) pantalla = <Ajustes partida={partida} onVolver={() => setAjustes(false)} />
  else if (pestana === 'bosque' && rincon)
    pantalla = <Rincon partida={partida} area={rincon} ahora={ahora} onVolver={() => setRincon(null)} onOfrenda={() => irA('ofrendas')} />
  else if (pestana === 'bosque')
    pantalla = <Bosque partida={partida} ahora={ahora} onRincon={setRincon} onAjustes={() => setAjustes(true)} />
  else if (pestana === 'ofrendas') pantalla = <Ofrendas partida={partida} ahora={ahora} />
  else if (pestana === 'semana') pantalla = <Semana partida={partida} ahora={ahora} />
  else pantalla = <Album partida={partida} ahora={ahora} />

  return (
    <>
      <div key={`${pestana}-${rincon}-${ajustes}`} className="animate-aparecer">{pantalla}</div>
      <Navegacion actual={pestana} onCambiar={irA} />
    </>
  )
}
