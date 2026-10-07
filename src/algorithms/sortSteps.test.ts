import { describe, expect, it } from 'vitest'
import { createSortSteps } from './sortSteps'
import type { AlgorithmId } from '../types/sorting'

const algorithms: AlgorithmId[] = ['bubble', 'selection', 'insertion', 'quick']
const input = [5, 1, 4, 2, 8, 2]
const addedAlgorithms = ['merge', 'heap', 'shell', 'cocktail', 'comb', 'gnome'] as const

describe('createSortSteps', () => {
  it.each(algorithms)('sorts input and preserves values with %s', (algorithm) => {
    const steps = createSortSteps(input, algorithm)
    const finalStep = steps.at(-1)

    expect(steps.length).toBeGreaterThan(0)
    expect(finalStep?.kind).toBe('complete')
    expect(finalStep?.values).toEqual([1, 2, 2, 4, 5, 8])
    expect([...finalStep!.values].sort((a, b) => a - b)).toEqual([...input].sort((a, b) => a - b))
  })

  it.each(addedAlgorithms)('sorts input with the added %s algorithm', (algorithm) => {
    const steps = createSortSteps(input, algorithm as never)
    expect(steps.at(-1)?.values).toEqual([1, 2, 2, 4, 5, 8])
    expect(steps.at(-1)?.kind).toBe('complete')
  })

  it('exposes pivot information while running quick sort', () => {
    const steps = createSortSteps(input, 'quick')
    expect(steps.some((step) => step.kind === 'pivot' && step.pivot !== undefined)).toBe(true)
  })
})
