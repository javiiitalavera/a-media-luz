// Casos señalados en la revisión de ChatGPT (15/11/2026).
import { describe, expect, it } from 'vitest'
import { estadoRincon } from './reglas'
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
