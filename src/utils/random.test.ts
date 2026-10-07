import { describe, expect, it } from 'vitest'
import { makeSeededValues } from './random'

describe('makeSeededValues', () => {
  it('recreates the same array for the same seed', () => {
    expect(makeSeededValues(8, 'demo-42')).toEqual(makeSeededValues(8, 'demo-42'))
  })

  it('changes the generated array when the seed changes', () => {
    expect(makeSeededValues(8, 'demo-42')).not.toEqual(makeSeededValues(8, 'demo-43'))
  })

  it('keeps generated values inside the visualizer range', () => {
    expect(makeSeededValues(32, 'bounds').every((value) => value >= 8 && value <= 99)).toBe(true)
  })

  it('shapes the same values into each data pattern', () => {
    const ascending = [...makeSeededValues(40, 'shape')].sort((left, right) => left - right)
    const nearly = makeSeededValues(40, 'shape', 'nearly')
    expect(makeSeededValues(40, 'shape', 'reversed')).toEqual([...ascending].reverse())
    expect([...nearly].sort((left, right) => left - right)).toEqual(ascending)
    expect(nearly.filter((value, index) => value !== ascending[index]).length).toBeLessThanOrEqual(8)
    expect(new Set(makeSeededValues(40, 'shape', 'few-unique')).size).toBeLessThanOrEqual(5)
  })
})
