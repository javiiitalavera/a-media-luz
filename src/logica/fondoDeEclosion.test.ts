import { describe, expect, it } from 'vitest'
import { fondoDeEclosion } from './fondoDeEclosion'

describe('transición de eclosión', () => {
  it('enseña solo el exterior mientras espera el huevo y mientras se rompe', () => {
    for (const [estado, paso] of [['huevo', null], ['naciendo', null], ['naciendo', 'rompiendo']] as const) {
      expect(fondoDeEclosion(estado, paso)).toEqual({
        conHuevo: true, mostrarNido: true, revelandoCasa: false,
      })
    }
  })

  it('mantiene el exterior durante el fundido hacia la casa y durante la presentación', () => {
    for (const paso of ['salio', 'ficha'] as const) {
      expect(fondoDeEclosion('naciendo', paso)).toEqual({
        conHuevo: false, mostrarNido: true, revelandoCasa: true,
      })
    }
  })

  it('si la presentación ya se guardó, entra en la casa sin repetir la transición', () => {
    expect(fondoDeEclosion('vivo', null)).toEqual({
      conHuevo: false, mostrarNido: false, revelandoCasa: false,
    })
    expect(fondoDeEclosion('vivo', 'ficha').revelandoCasa).toBe(false)
  })
})
