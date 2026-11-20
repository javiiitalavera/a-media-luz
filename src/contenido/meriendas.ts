import type { CompaneroId } from './tipos'

export const MERIENDAS = {
  nox: { nombre: 'Dar una tostada', forma: 'tostada', muebles: ['cojin', 'hoguera'], frase: 'La parte quemada era para mí. Has acertado de casualidad.' },
  tofu: { nombre: 'Dar semillas', forma: 'semillas', muebles: ['libros', 'maceta'], frase: 'Me he comido el grupo de control.' },
  bruma: { nombre: 'Dar una baya', forma: 'baya', muebles: ['hamaca', 'tetera'], frase: 'La otra mitad la guardaba para luego. Ya es luego.' },
  madeja: { nombre: 'Dar una galleta', forma: 'galleta', muebles: ['mecedora', 'cesto'], frase: 'Te iba a ofrecer la mitad. Has tardado.' },
  tuerca: { nombre: 'Dar aceite', forma: 'aceite', muebles: ['caja', 'cajonera'], frase: 'He dejado de chirriar. Ahora se oye tu silla.' },
} satisfies Record<CompaneroId, { nombre: string; forma: string; muebles: string[]; frase: string }>
