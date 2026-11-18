// Fuente: docs/personajes.md y docs/diseno-juego.md
import type { Area, AreaId, Ritmo } from './tipos'

export const AREAS: Record<AreaId, Area> = {
  cuerpo: { id: 'cuerpo', nombre: 'Energía', rincon: 'Claro del fuego', companero: 'nox', ritmo: 'diario', descripcion: 'moverse, dormir, comer, beber agua' },
  mente: { id: 'mente', nombre: 'Mente', rincon: 'Huerto de musgo', companero: 'tofu', ritmo: 'varias', descripcion: 'leer, aprender, concentrarse, crear' },
  calma: { id: 'calma', nombre: 'Calma', rincon: 'Estanque de niebla', companero: 'bruma', ritmo: 'varias', descripcion: 'desconectar, naturaleza, respirar, descansar sin pantallas' },
  vinculos: { id: 'vinculos', nombre: 'Vínculos', rincon: 'Porche de las visitas', companero: 'madeja', ritmo: 'par', descripcion: 'pareja, familia, amigos, llamadas, quedadas' },
  orden: { id: 'orden', nombre: 'Orden', rincon: 'Taller', companero: 'tuerca', ritmo: 'semanal', descripcion: 'pendientes, papeleo, finanzas, ordenar, planificar' },
}

export const ORDEN_AREAS: AreaId[] = ['cuerpo', 'mente', 'calma', 'vinculos', 'orden']

/** Días que aguanta un rincón sin ofrendas antes de estropearse. */
export const RITMOS: Record<Ritmo, { nombre: string; margen: number }> = {
  diario: { nombre: 'Cada día', margen: 1 },
  varias: { nombre: 'Varias veces por semana', margen: 2 },
  par: { nombre: 'Un par de veces por semana', margen: 4 },
  semanal: { nombre: 'Una vez por semana', margen: 7 },
}
