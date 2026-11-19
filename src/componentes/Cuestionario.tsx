// Las cuatro preguntas del cuestionario (edad, qué mejorar, tu día, cuánto te mueves) en botones.
import { PREGUNTAS, type Mejora, type Perfil } from '../contenido/cuestionario'

export function Cuestionario({ perfil, onCambiar }: { perfil: Perfil; onCambiar: (p: Perfil) => void }) {
  const unica = <K extends 'edad' | 'dia' | 'actividad'>(k: K) => (
    <Pregunta titulo={PREGUNTAS[k].titulo}>
      {PREGUNTAS[k].opciones.map(([v, t]) => (
        <Chip key={v} activo={perfil[k] === v} onToque={() => onCambiar({ ...perfil, [k]: perfil[k] === v ? undefined : v })}>{t}</Chip>
      ))}
    </Pregunta>
  )
  const alternar = (m: Mejora) => {
    const ya = perfil.mejorar.includes(m)
    if (!ya && perfil.mejorar.length >= 3) return
    onCambiar({ ...perfil, mejorar: ya ? perfil.mejorar.filter((x) => x !== m) : [...perfil.mejorar, m] })
  }
  return (
    <div className="flex flex-col gap-4">
      {unica('edad')}
      <Pregunta titulo={PREGUNTAS.mejorar.titulo} ayuda={PREGUNTAS.mejorar.ayuda}>
        {PREGUNTAS.mejorar.opciones.map(([v, t]) => <Chip key={v} activo={perfil.mejorar.includes(v)} onToque={() => alternar(v)}>{t}</Chip>)}
      </Pregunta>
      {unica('dia')}
      {unica('actividad')}
    </div>
  )
}

function Pregunta({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-1.5 px-1 text-[15px] font-bold">{titulo} {ayuda && <span className="text-[13px] font-medium text-texto-3">{ayuda}</span>}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  )
}

function Chip({ activo, onToque, children }: { activo: boolean; onToque: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={activo} onClick={onToque}
      className={`min-h-11 rounded-full border-2 px-3.5 text-[15px] transition ${activo ? 'border-salvia bg-salvia font-semibold text-tinta' : 'border-borde bg-tarjeta font-medium'}`}>
      {children}
    </button>
  )
}
