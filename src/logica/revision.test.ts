// Casos señalados en la revisión de ChatGPT (15/11/2026).
import { describe, expect, it } from 'vitest'
import { estadoRincon, metas } from './reglas'
import { importarCopia } from './copia'
import { con, en, nueva } from './test-utils'

describe('arreglo interrumpido', () => {
  it('el progreso del arreglo no se pierde aunque pasen días entre ofrendas', () => {
    // Cuerpo, margen 1: visitante desde el 10. Una ofrenda el 10 (1 de 3) y la siguiente días después.
    let p = con(nueva(), 'cuerpo', '2026-01-10')
    expect(estadoRincon(p, 'cuerpo', en('2026-01-10', 20)).faltanParaArreglar).toBe(2)
    // Pasan días: puede volver a afearse, pero lo ya arreglado cuenta.
    expect(estadoRincon(p, 'cuerpo', en('2026-01-16', 20)).faltanParaArreglar).toBe(2)
    p = con(p, 'cuerpo', '2026-01-16')
    expect(estadoRincon(p, 'cuerpo', en('2026-01-16', 20)).faltanParaArreglar).toBe(1)
  })
  it('con la niebla ya quitada y el visitante aún dentro, esperar no devuelve el contador a cero', () => {
    let p = con(nueva(), 'cuerpo', '2026-01-10', 2) // 2 de 3: sin niebla, visitante dentro
    expect(estadoRincon(p, 'cuerpo', en('2026-01-10', 20))).toMatchObject({ visitante: true, faltanParaArreglar: 1 })
    const tras = estadoRincon(p, 'cuerpo', en('2026-01-20', 20))
    expect(tras.visitante).toBe(true)
    expect(tras.faltanParaArreglar).toBe(1) // antes del arreglo volvía a 3
    p = con(p, 'cuerpo', '2026-01-20')
    expect(estadoRincon(p, 'cuerpo', en('2026-01-20', 20))).toMatchObject({ visitante: false, fase: 0 })
  })
})

describe('metas y deterioro', () => {
  it('un rincón estropeado al empezar la semana no tiene meta («se pausa lo bueno»)', () => {
    const p = nueva() // sin ofrendas: el lunes 12 el claro está estropeado
    expect(metas(p, en('2026-01-13')).map((m) => m.semana)).toEqual(['2026-01-05'])
  })
  it('las ofrendas de arreglo no cuentan para la meta', () => {
    let p = con(nueva(), 'cuerpo', '2026-01-08', 2) // las 2 arreglan el claro (fase 1 desde el día 8)
    expect(metas(p, en('2026-01-08', 20))[0].hechas).toBe(0)
    p = con(p, 'cuerpo', '2026-01-09')
    expect(metas(p, en('2026-01-09', 20))[0].hechas).toBe(1)
  })
})

describe('premios cuando se acaban los especiales', () => {
  it('tras los 2 especiales del área, da objetos normales que no tengas; si no queda nada, ninguno', () => {
    // Orden (Tuerca, semanal): meta de 2 ofrendas por semana. 8 semanas seguidas cumpliéndola (lunes y martes).
    let p = nueva('tuerca')
    const dias = [5, 12, 19, 26, 33, 40, 47, 54].flatMap((n) => [n, n + 1])
      .map((n) => new Date(2026, 0, n)).map((f) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`)
    for (const d of dias) p = con(p, 'orden', d)
    const premios = metas(p, en('2026-02-24', 20)).filter((m) => m.area === 'orden').map((m) => m.premio?.id ?? null)
    expect(premios.slice(0, 2)).toEqual(['etiquetadora', 'engranaje-dorado'])
    expect(premios.slice(2, 6).every((id) => id && !['etiquetadora', 'engranaje-dorado'].includes(id))).toBe(true)
    expect(new Set(premios.slice(0, 6)).size).toBe(6)
    expect(premios.slice(6)).toEqual([null, null])
  })
})

describe('copias incompletas', () => {
  it('rechaza copias con registros rotos y rellena lo opcional que falte', () => {
    const base = { app: 'a-media-luz', version: 1, partida: { ...nueva(), frasesRecientes: undefined } }
    expect(importarCopia(JSON.stringify(base))?.frasesRecientes).toEqual([])
    const rota = JSON.parse(JSON.stringify(base))
    rota.partida.ofrendas = [{ id: 'x', area: 'cuerpo' }] // sin fecha
    expect(importarCopia(JSON.stringify(rota))).toBeNull()
    const sinRitmo = JSON.parse(JSON.stringify(base))
    delete sinRitmo.partida.ritmos.orden
    expect(importarCopia(JSON.stringify(sinRitmo))).toBeNull()
  })
})
