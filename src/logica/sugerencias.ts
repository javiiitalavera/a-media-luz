// Reglas para sugerir retos a partir del cuestionario (edad, qué quieres mejorar, tu día y cuánto te mueves).
// Propuesta de Claude, pendiente de revisión de Javi con criterio médico. Metas prudentes: mejor empezar
// por algo que se cumple que por algo que se abandona.
import type { Actividad, Perfil } from '../contenido/cuestionario'
import { ACCIONES } from '../contenido'
import type { Partida } from './partida'
import { cabeOtro } from './hazanas'

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

/** Las sugerencias, de la más importante a la menos (como mucho cinco). */
export function sugerencias(perfil: Perfil): Sugerencia[] {
  const menor = perfil.edad === 'menor'
  const mayor = perfil.edad === '65+'
  const madura = perfil.edad === '50-64'
  const act = perfil.actividad
  const pasos = metaPasos(act, mayor)
  const pasosSug = del('pasos', `Andar ${pasos.toLocaleString('es-ES')} pasos`, `Andar ${Math.round(pasos / 4 / 500) * 500 || 1000} pasos`)

  // Para cada cosa que quieres mejorar: [lo principal, un segundo].
  const porMejora: Record<string, [Sugerencia, Sugerencia]> = {
    moverme: menor ? [del('jugar-fuera'), del('bici')]
      : mayor ? [pasosSug, del('equilibrio')]
      : act === 'bastante' ? [del('correr', madura ? 'Correr 20 minutos' : undefined), del('fuerza')]
      : [pasosSug, del('fuerza', act === 'poco' ? 'Fuerza 10 minutos' : undefined, '5 sentadillas')],
    dormir: menor ? [del('dormir', 'Dormir 9 horas'), del('pantallas')] : [del('dormir'), del('pantallas')],
    aprender: menor ? [del('deberes'), del('leer', 'Leer 10 páginas')]
      : perfil.dia === 'estudio' ? [del('concentrado'), del('leer')]
      : perfil.dia === 'jubilado' ? [del('leer'), del('curso')]
      : [del('leer'), del('idioma')],
    calma: [del('meditar', act === 'poco' || mayor ? 'Meditar 5 minutos' : undefined),
      perfil.dia === 'sentado' ? del('estirar', 'Estirar 5 minutos') : perfil.dia === 'cuido' ? del('para-mi') : del('paseo')],
    gente: menor ? [del('cena', 'Cenar en familia sin móviles'), del('amigo')]
      : mayor ? [del('amigo', 'Llamar a alguien que quiero'), del('quedar')]
      : [del('padres'), del('quedar')],
    orden: menor ? [del('ayudar-casa'), del('planificar', 'Preparar la mochila de mañana', 'Mirar el horario de mañana')]
      : perfil.dia === 'estudio' ? [del('planificar'), del('ordenar')]
      : [del('gastos'), del('ordenar')],
  }
  const mejorar = perfil.mejorar.length ? perfil.mejorar : (['moverme', 'aprender', 'gente'] as const)
  const lista: Sugerencia[] = []
  const meter = (s: Sugerencia) => { if (lista.length < 5 && !lista.some((x) => x.id === s.id)) lista.push(s) }
  for (const m of mejorar) meter(porMejora[m][0])
  // Lo que pide tu día, aunque no lo hayas marcado.
  if (perfil.dia === 'sentado') meter(del('estirar', 'Estirar 5 minutos'))
  if (perfil.dia === 'cuido') meter(del('para-mi'))
  // Un segundo reto por cosa que quieres mejorar (si no has dicho nada, mejor empezar con tres).
  if (perfil.mejorar.length) for (const m of mejorar) meter(porMejora[m][1])
  // Al menos tres.
  for (const s of [pasosSug, del('leer'), del('padres')]) if (lista.length < 3) meter(s)
  return lista
}

/** Añade una sugerencia a tu lista (con su meta ajustada) o la vuelve a hacer tuya si ya la usaste. */
export function anadirSugerencia(p: Partida, s: Sugerencia): Partida {
  const ya = p.acciones.find((a) => a.id === s.id)
  if (!(ya && ya.habitual !== false) && !cabeOtro(p)) return p
  const nueva = { id: s.id, area: ACCIONES.find((a) => a.id === s.id)!.area, nombre: s.nombre, ...(s.minima ? { minima: s.minima } : {}) }
  return { ...p, acciones: ya ? p.acciones.map((a) => (a.id === s.id ? nueva : a)) : [...p.acciones, nueva] }
}
