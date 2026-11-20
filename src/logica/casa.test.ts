import { describe, expect, it } from 'vitest'
import { construir, disponibles, faltan, ganados, gastados, proyectosBarrioVisibles, proyectosVisibles, queRecompensan } from './casa'
import { COMPANEROS, OBJETOS_CASA, PROYECTOS_BARRIO } from '../contenido'
import { con, en, nueva } from './test-utils'
import type { Partida } from './partida'

const objeto = (id: string) => OBJETOS_CASA.find((o) => o.id === id)!

describe('materiales (bolsa común)', () => {
  it('cada acción da recompensa una vez al día y como mucho 3 por área', () => {
    let p = con(nueva(), 'cuerpo', '2026-01-05', 3) // la misma acción 3 veces: cuenta 1
    expect(ganados(p, en('2026-01-05', 23)).cuerpo).toBe(1)
    const ids = p.acciones.filter((a) => a.area === 'cuerpo').map((a) => a.id)
    const mas = ids.map((accionId, i) => ({ id: 'm' + i, accionId, area: 'cuerpo' as const, fecha: en('2026-01-06', 10, i).toISOString(), diaMalo: false }))
    p = { ...p, ofrendas: [...p.ofrendas, ...mas] }
    expect(queRecompensan(mas)).toHaveLength(Math.min(3, ids.length))
  })
  it('lo construido se descuenta de la bolsa común y nunca baja de 0', () => {
    let p: Partida = nueva()
    const ids = p.acciones.filter((a) => a.area === 'cuerpo').map((a) => a.id)
    for (let d = 5; d < 8; d++) p = { ...p, ofrendas: [...p.ofrendas, { id: 'x' + d, accionId: ids[0], area: 'cuerpo', fecha: en(`2026-01-0${d}`).toISOString(), diaMalo: false }] }
    const ahora = en('2026-01-07', 23)
    p = construir(p, 'hoguera', ahora)!
    expect(disponibles(p, ahora).cuerpo).toBe(0)
    expect(disponibles({ ...p, construcciones: [...p.construcciones!, { objetoId: 'horno', fecha: ahora.toISOString() }] }, ahora).cuerpo).toBe(0)
  })
})

describe('proyectos', () => {
  it('el primer proyecto va solo y abre dos opciones, aunque falten otros materiales', () => {
    let p: Partida = nueva()
    expect(proyectosVisibles(p, 'nox').map((o) => o.id)).toEqual(['hoguera'])
    const ids = p.acciones.map((a) => a.id)
    const muchas = Array.from({ length: 30 }, (_, i) => {
      const a = p.acciones[i % ids.length]
      return { id: 'r' + i, accionId: a.id, area: a.area, fecha: en('2026-01-05', 8).toISOString().replace('T08', `T${String(8 + (i % 10)).padStart(2, '0')}`), diaMalo: false }
    })
    p = { ...p, ofrendas: muchas.map((o, i) => ({ ...o, fecha: new Date(en('2026-01-05').getTime() + i * 86_400_000).toISOString() })) }
    const ahora = en('2026-03-01')
    expect(construir(p, 'banco', ahora)).toBeNull()
    p = construir(p, 'hoguera', ahora)!
    expect(proyectosVisibles(p, 'nox').map((o) => o.id)).toEqual(['banco', 'cojin', 'hoguera'])
    expect(construir(p, 'horno', ahora)).toBeNull()
    const soloAscuas = { ...p, ofrendas: p.ofrendas.filter((o) => o.area === 'cuerpo') }
    expect(construir(soloAscuas, 'banco', ahora)).toBeNull()
    const conCojin = construir(soloAscuas, 'cojin', ahora)!
    expect(conCojin.construcciones?.at(-1)?.coste).toEqual({ cuerpo: 4 })
    expect(gastados(conCojin)).toMatchObject({ cuerpo: 7, vinculos: 0 })
    expect(construir(conCojin, 'cojin', ahora)).toBeNull()
    expect(proyectosVisibles(conCojin, 'nox').map((o) => o.id)).toEqual(['banco', 'mancuernas', 'hoguera', 'cojin'])
    const cojinAntiguo = { ...soloAscuas, construcciones: [...soloAscuas.construcciones!, { objetoId: 'cojin', fecha: ahora.toISOString() }] }
    expect(gastados(cojinAntiguo)).toMatchObject({ cuerpo: 5, vinculos: 2 })
  })
  it('cada casa tiene una opción con su propio material después de la primera obra', () => {
    const ahora = en('2026-01-07')
    for (const { id, area } of Object.values(COMPANEROS)) {
      const primera = proyectosVisibles(nueva(), id)[0]
      const p = { ...nueva(), construcciones: [{ objetoId: primera.id, fecha: ahora.toISOString() }] }
      const opciones = proyectosVisibles(p, id).filter((o) => o.id !== primera.id)
      expect(opciones).toHaveLength(2)
      expect(opciones.some((o) => Object.keys(o.coste).join() === area)).toBe(true)
    }
  })

  it('dice lo que falta', () => {
    const p = con(nueva(), 'cuerpo', '2026-01-05')
    expect(faltan(p, objeto('hoguera'), en('2026-01-05', 23))).toEqual({ cuerpo: 2 })
  })

  it('los proyectos del barrio se desvelan de uno en uno, después del puente', () => {
    const p = nueva()
    expect(proyectosBarrioVisibles(p).map((b) => b.id)).toEqual(['puente'])
    const conPuente = { ...p, construcciones: [{ objetoId: 'puente', fecha: en('2026-01-06').toISOString() }] }
    expect(proyectosBarrioVisibles(conPuente).map((b) => b.id)).toEqual(['puente', 'fuente'])
    // Los ids del barrio no chocan con los de las casas (construido() los mira todos juntos).
    const ids = [...OBJETOS_CASA, ...PROYECTOS_BARRIO].map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('para un vecino que aún está en el huevo no se construye nada', () => {
    // Partida con Nox nacido y Tuerca todavía en el huevo (sin sus tres retos).
    const p0 = con(con(nueva(), 'orden', '2026-01-05', 3), 'orden', '2026-01-06', 3)
    const p = { ...p0, meses: [{ companero: 'nox' as const, inicio: en('2026-01-05', 8).toISOString(), presentado: en('2026-01-05', 9).toISOString() },
      { companero: 'tuerca' as const, inicio: en('2026-01-07', 20).toISOString() }] }
    expect(construir(p, 'caja', en('2026-01-07', 21))).toBeNull()
  })
})
