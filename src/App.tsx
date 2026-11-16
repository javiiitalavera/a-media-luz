import { useEffect, useState } from 'react'
import type { AreaId } from './contenido'
import { useJuego } from './estado/juego'
import { momentoDelDia } from './logica/momento'
import { useAhora } from './componentes/comunes'
import { Navegacion, type Pestana } from './componentes/Navegacion'
import { Inicio } from './pantallas/Inicio'
import { Casa } from './pantallas/Casa'
import { Bosque } from './pantallas/Bosque'
import { mesActual } from './logica/meses'
import { COMPANEROS, type CompaneroId } from './contenido'
import { Rincon } from './pantallas/Rincon'
import { Ofrendas } from './pantallas/Ofrendas'
import { Ajustes, Album, Semana } from './pantallas/Otras'

export default function App() {
  const partida = useJuego((s) => s.partida)
  const ahora = useAhora()
  const [pestana, setPestana] = useState<Pestana>('casa')
  const [visita, setVisita] = useState<CompaneroId | null>(null)
  const [rincon, setRincon] = useState<AreaId | null>(null)
  const [ajustes, setAjustes] = useState(false)

  // De noche, la interfaz pasa a su versión oscura (ciruela).
  const noche = momentoDelDia(ahora) === 'noche'
  useEffect(() => {
    document.documentElement.dataset.noche = noche ? 'si' : 'no'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', noche ? '#2E2030' : '#F9EBDD')
  }, [noche])
  useEffect(() => { window.scrollTo(0, 0) }, [pestana, rincon, ajustes, visita])

  if (!partida) return <Inicio />

  const irA = (p: Pestana) => { setRincon(null); setAjustes(false); setVisita(null); setPestana(p) }
  const dueno = mesActual(partida).companero
  let pantalla
  if (ajustes) pantalla = <Ajustes partida={partida} onVolver={() => setAjustes(false)} />
  else if (rincon)
    pantalla = <Rincon partida={partida} area={rincon} ahora={ahora} onVolver={() => setRincon(null)} onOfrenda={() => irA('ofrendas')} />
  else if (pestana === 'casa')
    pantalla = <Casa key={dueno} partida={partida} ahora={ahora} dueno={dueno} onDetalle={() => setRincon(COMPANEROS[dueno].area)} onAjustes={() => setAjustes(true)} />
  else if (pestana === 'bosque' && visita)
    pantalla = <Casa key={`v-${visita}`} partida={partida} ahora={ahora} dueno={visita} visita onDetalle={() => setRincon(COMPANEROS[visita].area)} onAjustes={() => setAjustes(true)} onVolver={() => setVisita(null)} />
  else if (pestana === 'bosque')
    pantalla = <Bosque partida={partida} ahora={ahora} onVisitar={setVisita} onCasa={() => irA('casa')} />
  else if (pestana === 'ofrendas') pantalla = <Ofrendas partida={partida} ahora={ahora} />
  else if (pestana === 'semana') pantalla = <Semana partida={partida} ahora={ahora} />
  else pantalla = <Album partida={partida} ahora={ahora} />

  return (
    <>
      <div key={`${pestana}-${rincon}-${ajustes}-${visita}`} className="animate-aparecer">{pantalla}</div>
      <Navegacion actual={pestana} onCambiar={irA} />
    </>
  )
}
