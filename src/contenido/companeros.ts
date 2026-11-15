// Fuente: docs/personajes.md (aspecto, nombre, área y personalidad son canon).
import type { Companero, CompaneroId } from './tipos'

export const COMPANEROS: Record<CompaneroId, Companero> = {
  nox: { id: 'nox', nombre: 'Nox', area: 'cuerpo', humor: 'Sarcasmo cálido', presentacion: 'Te pica, pero se le nota que te quiere.' },
  tofu: { id: 'tofu', nombre: 'Tofu', area: 'mente', humor: 'Seco, cero drama', presentacion: 'Impasible. Su cara no cambia; el brote lo delata.' },
  bruma: { id: 'bruma', nombre: 'Bruma', area: 'calma', humor: 'Melancolía tierna', presentacion: 'Suspira, flota y te entiende demasiado.' },
  madeja: { id: 'madeja', nombre: 'Madeja', area: 'vinculos', humor: 'Cariñosa de más, cotilla', presentacion: 'Lo sabe todo y se emociona con cualquier quedada.' },
  tuerca: { id: 'tuerca', nombre: 'Tuerca', area: 'orden', humor: 'Caos obsesivo', presentacion: 'Lo clasifica todo y no encuentra nada.' },
}

export const ORDEN_COMPANEROS: CompaneroId[] = ['nox', 'tofu', 'bruma', 'madeja', 'tuerca']
