import { describe, expect, it } from 'vitest'
import { crearPartida, type Partida } from './partida'
import { anadirMomento, momentoNacimiento } from './momentos'
import { construir } from './casa'
import {
  avisoEnCasa, curiosidadNueva, hayAlbumNuevo, momentoNuevo, proyectosBarrioSinVer,
  proyectosCasaSinVer, seccionesNuevas, verProyectosBarrio, verProyectosCasa, verSeccionAlbum,
} from './avisos'
import { en } from './test-utils'

const AHORA = en('2026-01-31', 12)
const TODOS = ['nox', 'tuerca', 'tofu', 'bruma', 'madeja'] as const

/** Cinco vecinos ya presentados, sin otros avisos que distorsionen los de construcción. */
function conMateriales(cuerpo: number, orden = 0, calma = 0, vinculos = 0): Partida {
  const p = crearPartida('nox', en('2026-01-01', 8))
  const ofrendas = ([
    ['cuerpo', cuerpo], ['orden', orden], ['calma', calma], ['vinculos', vinculos],
  ] as const).flatMap(([area, cantidad]) =>
    Array.from({ length: cantidad }, (_, i) => ({
      id: `${area}-${i}`, accionId: `reto-${area}`, area,
      fecha: en(`2026-01-${String(i + 2).padStart(2, '0')}`, 10).toISOString(),
      diaMalo: false,
    })))
  return {
    ...p,
    ofrendas,
    meses: TODOS.map((companero) => ({ companero, inicio: p.inicio, presentado: p.inicio })),
    nivelesVistos: { nox: 5 },
  }
}

describe('avisos vistos sin obligar a gastar materiales', () => {
  it('entrar en la casa silencia los proyectos que ya eran construibles', () => {
    let p = conMateriales(10, 0, 0, 2)
    expect(proyectosCasaSinVer(p, 'nox', AHORA)).toEqual(['hoguera'])
    expect(avisoEnCasa(p, 'nox', AHORA)).toBe(true)
    p = verProyectosCasa(p, 'nox', AHORA)
    expect(proyectosCasaSinVer(p, 'nox', AHORA)).toEqual([])
    expect(avisoEnCasa(p, 'nox', AHORA)).toBe(false)
    expect(verProyectosCasa(p, 'nox', AHORA)).toBe(p) // volver no produce nuevos avisos
    expect(construir(p, 'hoguera', AHORA)).not.toBeNull() // sigue disponible
  })

  it('una construcción nueva sí vuelve a avisar; las antiguas no', () => {
    let p = verProyectosCasa(conMateriales(10, 0, 0, 2), 'nox', AHORA)
    p = construir(p, 'hoguera', AHORA)!
    expect(proyectosCasaSinVer(p, 'nox', AHORA)).toEqual(['banco', 'cojin'])
    p = verProyectosCasa(p, 'nox', AHORA)
    expect(proyectosCasaSinVer(p, 'nox', AHORA)).toEqual([])
    expect(p.vistos?.proyectosCasa?.nox).toEqual(['hoguera', 'banco', 'cojin'])
  })

  it('mirar el martillo del barrio quita el aviso aunque no se construya el puente', () => {
    let p = conMateriales(12, 11, 8)
    p = { ...p, construcciones: [
      { objetoId: 'hoguera', fecha: p.inicio }, { objetoId: 'caja', fecha: p.inicio },
    ] }
    expect(proyectosBarrioSinVer(p, AHORA)).toEqual(['puente'])
    p = verProyectosBarrio(p, AHORA)
    expect(proyectosBarrioSinVer(p, AHORA)).toEqual([])
    expect(verProyectosBarrio(p, AHORA)).toBe(p)
    p = construir(p, 'puente', AHORA, true)!
    expect(proyectosBarrioSinVer(p, AHORA)).toEqual(['fuente'])
    p = verProyectosBarrio(p, AHORA)
    expect(proyectosBarrioSinVer(p, AHORA)).toEqual([])
  })
})

describe('avisos del Álbum', () => {
  it('entrar en Momentos y Curiosidades marca todas las miniaturas como vistas', () => {
    const inicial = conMateriales(0)
    const foto = momentoNacimiento(inicial, 'nox', en('2026-01-10', 10))
    const hallazgos = [
      { objetoId: 'pina', fecha: en('2026-01-12', 9).toISOString() },
      { objetoId: 'tornillo', fecha: en('2026-01-13', 9).toISOString() },
    ]
    let p = { ...foto, hallazgos }
    expect(seccionesNuevas(p)).toContain('momentos')
    expect(seccionesNuevas(p)).toContain('curiosidades')
    p = verSeccionAlbum(p, 'momentos')
    expect(seccionesNuevas(p)).not.toContain('momentos')
    expect(seccionesNuevas(p)).toContain('curiosidades')
    expect(verSeccionAlbum(p, 'momentos')).toBe(p)
    p = verSeccionAlbum(p, 'curiosidades')
    expect(hayAlbumNuevo(p)).toBe(false)
    expect(curiosidadNueva(p, 'pina', hallazgos[0].fecha)).toBe(false)
    expect(curiosidadNueva(p, 'tornillo', hallazgos[1].fecha)).toBe(false)
    expect(verSeccionAlbum(p, 'cronicas')).toBe(p)
    const otraFoto = { ...p.momentos![0], id: 'foto-nueva', fecha: en('2026-01-16', 9).toISOString() }
    p = anadirMomento(p, otraFoto)
    expect(momentoNuevo(p, otraFoto)).toBe(true) // nueva foto, nuevo aviso
    expect(verSeccionAlbum(p, 'momentos').vistos?.momentos?.['foto-nueva']).toBeDefined()
  })
})
