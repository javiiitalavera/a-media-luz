import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { EfectoVecindad } from './VidaDeCasa'

describe('vida visual de una combinación', () => {
  it('sigue teniendo tres partículas ambientales después de tocarla', () => {
    const quieta = renderToStaticMarkup(createElement(EfectoVecindad, { efecto: 'lana', toques: 0 }))
    const tocada = renderToStaticMarkup(createElement(EfectoVecindad, { efecto: 'lana', toques: 1 }))
    expect(quieta.match(/<i>/g)).toHaveLength(3)
    expect(tocada.match(/<i>/g)).toHaveLength(3)
    expect(quieta).not.toContain('vecindad-reaccion')
    expect(tocada).toContain('vecindad-reaccion')
    expect(tocada).not.toContain('data-tocado')
  })

  it('la reacción es un elemento aparte, no sustituye la ambientación', () => {
    const a = renderToStaticMarkup(createElement(EfectoVecindad, { efecto: 'estrellas', toques: 8 }))
    const b = renderToStaticMarkup(createElement(EfectoVecindad, { efecto: 'estrellas', toques: 9 }))
    expect(a).toContain('data-efecto="estrellas"')
    expect(b).toContain('data-efecto="estrellas"')
    expect(a).toContain('<b class="vecindad-reaccion"')
    expect(b).toContain('<b class="vecindad-reaccion"')
  })
})
