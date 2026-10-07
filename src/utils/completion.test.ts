import { describe, expect, it } from 'vitest'
import { getCompletionOrder } from './completion'

describe('getCompletionOrder', () => {
  it('returns stable indices from the smallest value to the largest', () => {
    expect(getCompletionOrder([70, 12, 45, 12, 90])).toEqual([1, 3, 2, 0, 4])
  })
})
