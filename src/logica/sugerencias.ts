// Reglas para sugerir retos a partir del cuestionario (edad, qué quieres mejorar, tu día y cuánto te mueves).
// Propuesta de Claude, pendiente de revisión de Javi con criterio médico. Metas prudentes: mejor empezar
// por algo que se cumple que por algo que se abandona.
import type { Actividad, Perfil } from '../contenido/cuestionario'
import { ACCIONES } from '../contenido'
import type { Partida } from './partida'
import { cabeOtro, esHabitual, MAX_RETOS_POR_AREA } from './hazanas'

export interface Sugerencia { id: string; nombre: string; minima?: string }

const del = (id: string, nombre?: string, minima?: string): Sugerencia => {
  const c = ACCIONES.find((a) => a.id === id)!
  return { id, nombre: nombre ?? c.nombre, minima: minima ?? c.minima }
}

/** Pasos diarios según lo que te mueves ahora y la edad. */
export function metaPasos(actividad: Actividad | undefined, mayor: boolean): number {
  if (actividad === 'bastante') return mayor ? 8000 : 10000
  if (actividad === 'algo') return 6000
  return mayor ? 3000 : 4000
}

/** Las sugerencias principales van primero, seguidas por alternativas si se piden. */
export function sugerencias(perfil: Perfil, limite = 5): Sugerencia[] {
  const menor = perfil.edad === 'menor'
  const mayor = perfil.edad === '65+'
  const madura = perfil.edad === '50-64'
  const joven = perfil.edad === '18-29'
  const act = perfil.actividad
  const pasos = metaPasos(act, mayor)
  const pasosSug = del('pasos', `Andar ${pasos.toLocaleString('es-ES')} pasos`, `Andar ${Math.round(pasos / 4 / 500) * 500 || 1000} pasos`)

  // Para cada cosa que quieres mejorar: [lo principal, un segundo].
  const porMejora: Record<string, [Sugerencia, Sugerencia]> = {
    moverme: menor ? [del('jugar-fuera'), del('bici')]
      : mayor ? [pasosSug, del('equilibrio')]
      : act === 'bastante' ? [del('correr', madura ? 'Correr 20 minutos' : undefined), del(joven ? 'bici' : 'fuerza')]
      : [pasosSug, madura ? del('estirar', 'Hacer 5 minutos de movilidad') : del('fuerza', act === 'poco' ? 'Fuerza 10 minutos' : undefined, '5 sentadillas')],
    dormir: menor ? [del('dormir', 'Dormir 9 horas'), del('pantallas')]
      : perfil.dia === 'cuido' ? [del('pantallas', 'Dejar el móvil 15 minutos antes de acostarme'), del('para-mi', 'Reservar 5 minutos para desconectar')]
      : [del('dormir'), del('pantallas')],
    aprender: menor ? [del('deberes'), del('leer', 'Leer 10 páginas')]
      : perfil.dia === 'estudio' ? [del('concentrado'), del('leer')]
      : perfil.dia === 'jubilado' ? [del('curso', 'Dedicar 15 minutos a aprender algo'), del('podcast')]
      : joven ? [del('idioma'), del('crear')] : [del('leer'), del('idioma')],
    calma: [del('meditar', act === 'poco' || mayor ? 'Meditar 5 minutos' : undefined),
      perfil.dia === 'cuido' ? del('para-mi') : del('paseo')],
    gente: menor ? [del('compartir-foto'), del('cena', 'Cenar en familia sin móviles')]
      : mayor ? [del('amigo', 'Llamar a alguien que quiero'), del('preguntar')]
      : perfil.dia === 'cuido' ? [del('preguntar'), del('gracias')]
      : joven ? [del('amigo', 'Mandar un mensaje a un amigo'), del('compartir-foto')]
      : [del('preguntar'), del('gracias')],
    orden: menor ? [del('ayudar-casa'), del('planificar', 'Preparar la mochila de mañana', 'Mirar el horario de mañana')]
      : perfil.dia === 'estudio' ? [del('planificar'), del('ordenar', 'Preparar el sitio para estudiar')]
      : perfil.dia === 'sentado' ? [del('correo', 'Resolver tres correos pendientes'), del('gestion')]
      : perfil.dia === 'jubilado' ? [del('gestion'), del('gastos')]
      : [del('gastos'), del('ordenar')],
  }
  const mejorar = perfil.mejorar.length ? perfil.mejorar : (['moverme', 'aprender', 'gente'] as const)
  const lista: Sugerencia[] = []
  const areas = new Map(ACCIONES.map((a) => [a.id, a.area]))
  const meter = (s: Sugerencia) => {
    const deSuArea = lista.filter((x) => areas.get(x.id) === areas.get(s.id)).length
    if (lista.length < limite && deSuArea < MAX_RETOS_POR_AREA && !lista.some((x) => x.id === s.id)) lista.push(s)
  }
  for (const m of mejorar) meter(porMejora[m][0])
  // Lo que pide tu día, aunque no lo hayas marcado.
  if (perfil.dia === 'sentado' && !perfil.mejorar.includes('calma')) meter(del('estirar', 'Estirar 5 minutos'))
  if (perfil.dia === 'cuido') meter(del('para-mi'))
  // Un segundo reto por cosa que quieres mejorar (si no has dicho nada, mejor empezar con tres).
  if (perfil.mejorar.length) for (const m of mejorar) meter(porMejora[m][1])
  // Al menos tres.
  const alternativas = [
    menor ? del('jugar-fuera') : pasosSug, menor ? del('deberes') : del('leer'),
    joven || mayor ? del('amigo') : del('padres'), porMejora.calma[1], porMejora.orden[0],
    del('diario'), del('gracias'), del('cocina'), del('aficion'), del('bici'),
  ]
  for (const s of alternativas) if (lista.length < 3) meter(s)
  if (limite > 5) {
    for (const m of mejorar) meter(porMejora[m][1])
    for (const s of alternativas) meter(s)
  }
  return lista
}

/** Añade una sugerencia a tu lista (con su meta ajustada) o la vuelve a hacer tuya si ya la usaste.
 *  Si ya la tenías, cambia la meta pero respeta la versión mínima que hubieras escrito tú. */
export function anadirSugerencia(p: Partida, s: Sugerencia): Partida {
  const ya = p.acciones.find((a) => a.id === s.id)
  const catalogo = ACCIONES.find((a) => a.id === s.id)!
  if (!(ya && esHabitual(ya)) && !cabeOtro(p, catalogo.area)) return p
  const minima = ya?.minima && ya.minima !== catalogo.minima ? ya.minima : s.minima
  const nueva = { id: s.id, area: catalogo.area, nombre: s.nombre, ...(minima ? { minima } : {}) }
  return { ...p, acciones: ya ? p.acciones.map((a) => (a.id === s.id ? nueva : a)) : [...p.acciones, nueva] }
}
