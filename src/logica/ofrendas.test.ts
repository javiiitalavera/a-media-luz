import { describe, expect, it } from 'vitest'
import { cambiarDiaMalo, deshacerOfrenda, fraseAlTocar, hacerOfrenda } from './ofrendas'
import { exportarCopia, importarCopia } from './copia'
import { momentoDelDia } from './momento'
import { estadoRincon } from './reglas'
import { azarFijo, con, en, nueva } from './test-utils'
import type { Partida } from './partida'

let n = 0
const ofrecer = (p: Partida, accion: string, f: Date, azar = azarFijo(0, 0.99)) => hacerOfrenda(p, accion, f, azar, `t${++n}`)

describe('hacer una ofrenda', () => {
  it('guarda la ofrenda y reacciona el compañero de su área', () => {
    const r = ofrecer(nueva(), 'pasos', en('2026-01-05'))
    expect(r.partida.ofrendas).toHaveLength(1)
    expect(r.cuenta).toBe(true)
    expect(r.frase).toMatchObject({ companero: 'nox', tipo: 'ofrenda' })
  })
  it('si el compañero del área no ha llegado, comenta el principal', () => {
    const r = ofrecer(nueva(), 'leer', en('2026-01-05'))
    expect(r.frase).toMatchObject({ companero: 'nox', tipo: 'otraArea' })
  })
  it('la 3.ª ofrenda de un área trae a su compañero', () => {
    let p = nueva()
    p = ofrecer(p, 'leer', en('2026-01-05', 10)).partida
    p = ofrecer(p, 'leer', en('2026-01-05', 11)).partida
    const r = ofrecer(p, 'leer', en('2026-01-05', 12))
    expect(r.eventos).toContain('llegada')
    expect(r.frase).toMatchObject({ companero: 'tofu', tipo: 'llegada' })
  })
  it('la 4.ª del día no cuenta y lo dice', () => {
    let p = nueva()
    for (let i = 0; i < 3; i++) p = ofrecer(p, 'pasos', en('2026-01-05', 10 + i)).partida
    const r = ofrecer(p, 'agua', en('2026-01-05', 15))
    expect(r.cuenta).toBe(false)
    expect(r.frase?.tipo).toBe('tope')
  })
  it('día malo: cuenta igual y frase de día malo; se apaga al día siguiente', () => {
    const p = cambiarDiaMalo(nueva(), true, en('2026-01-05', 8))
    const r = ofrecer(p, 'pasos', en('2026-01-05'))
    expect(r.ofrenda.diaMalo).toBe(true)
    expect(r.cuenta).toBe(true)
    expect(r.frase?.tipo).toBe('diaMalo')
    expect(ofrecer(r.partida, 'pasos', en('2026-01-06')).ofrenda.diaMalo).toBe(false)
  })
  it('arreglar un rincón da frase de arreglo', () => {
    let p = con(nueva(), 'cuerpo', '2026-01-08')
    const r = ofrecer(p, 'pasos', en('2026-01-08', 15))
    expect(r.eventos).toContain('arreglo')
    expect(r.frase?.tipo).toBe('arreglo')
  })
  it('sorpresa: 15 %, una al día, un objeto del área que no tengas', () => {
    const r = ofrecer(nueva(), 'pasos', en('2026-01-05'), azarFijo(0, 0.1, 0))
    expect(r.sorpresa?.area).toBe('cuerpo')
    expect(r.sorpresa?.especial).toBeFalsy()
    expect(ofrecer(r.partida, 'pasos', en('2026-01-05', 15), azarFijo(0, 0)).sorpresa).toBeNull()
    expect(ofrecer(nueva(), 'pasos', en('2026-01-05'), azarFijo(0, 0.2)).sorpresa).toBeNull()
  })
  it('cumplir la meta semanal da su premio', () => {
    let p = nueva()
    for (const d of ['05', '06', '07', '08']) p = con(p, 'cuerpo', `2026-01-${d}`)
    const r = ofrecer(p, 'pasos', en('2026-01-09'))
    expect(r.eventos).toContain('metaCumplida')
    expect(r.premio?.id).toBe('farol-de-nox')
  })
  it('no repite las frases recientes', () => {
    let p = nueva()
    const vistas: string[] = []
    for (let i = 0; i < 4; i++) {
      const r = ofrecer(p, 'pasos', en(`2026-01-0${5 + i}`), azarFijo(0, 0.99))
      vistas.push(r.frase!.texto)
      p = r.partida
    }
    expect(new Set(vistas).size).toBe(4)
  })
})

describe('deshacer', () => {
  it('quita la ofrenda y su sorpresa; se pueden deshacer varias seguidas', () => {
    let p = nueva()
    const r1 = ofrecer(p, 'pasos', en('2026-01-05', 10), azarFijo(0, 0.1, 0))
    const r2 = ofrecer(r1.partida, 'agua', en('2026-01-05', 11))
    p = deshacerOfrenda(deshacerOfrenda(r2.partida, r2.ofrenda.id), r1.ofrenda.id)
    expect(p.ofrendas).toHaveLength(0)
    expect(p.hallazgos).toHaveLength(0)
  })
  it('deshacer la que trajo a un compañero lo devuelve a dormir', () => {
    let p = nueva()
    for (let i = 0; i < 3; i++) p = ofrecer(p, 'leer', en('2026-01-05', 10 + i)).partida
    expect(estadoRincon(p, 'mente', en('2026-01-05', 20)).llegado).toBe(true)
    p = deshacerOfrenda(p, p.ofrendas.at(-1)!.id)
    expect(estadoRincon(p, 'mente', en('2026-01-05', 20)).llegado).toBe(false)
  })
})

describe('bosque, momento y copia', () => {
  it('el bocadillo habla del peor rincón; si todo va bien, saluda el principal', () => {
    expect(fraseAlTocar(nueva(), 'nox', en('2026-01-05', 8), azarFijo(0)).frase?.tipo).toBe('saludo')
    expect(fraseAlTocar(nueva(), 'nox', en('2026-01-10', 8), azarFijo(0)).frase).toMatchObject({ companero: 'nox', tipo: 'fase3' })
  })
  it('momentos del día', () => {
    expect([6, 10, 11, 17, 18, 21, 22, 5].map((h) => momentoDelDia(en('2026-01-05', h, 30)))).toEqual(
      ['amanecer', 'amanecer', 'mediodia', 'mediodia', 'atardecer', 'atardecer', 'noche', 'noche'])
  })
  it('exportar e importar devuelve la misma partida; rechaza basura', () => {
    const p = ofrecer(nueva(), 'pasos', en('2026-01-05')).partida
    expect(importarCopia(exportarCopia(p, en('2026-01-06')))).toEqual(p)
    expect(importarCopia('hola')).toBeNull()
    expect(importarCopia('{"app":"otra"}')).toBeNull()
  })
})
