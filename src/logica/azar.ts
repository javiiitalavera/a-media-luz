export type Azar = () => number
export const azarReal: Azar = () => Math.random()
export const elegir = <T,>(lista: readonly T[], azar: Azar): T | undefined =>
  lista.length ? lista[Math.floor(azar() * lista.length)] : undefined
