import type { AlgorithmId, SortStep } from '../types/sorting'

export function createSortSteps(input: number[], algorithm: AlgorithmId): SortStep[] {
  const values = [...input]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  const sorted = new Set<number>()

  const push = (kind: SortStep['kind'], active: number[] = [], extra: Partial<SortStep> = {}) => {
    steps.push({
      values: [...values],
      active: [...active],
      sorted: [...sorted].sort((a, b) => a - b),
      kind,
      comparisons,
      swaps,
      ...extra,
    })
  }

  const compare = (left: number, right: number, extra: Partial<SortStep> = {}) => {
    comparisons += 1
    push('compare', [left, right], extra)
  }

  const swap = (left: number, right: number) => {
    ;[values[left], values[right]] = [values[right], values[left]]
    swaps += 1
    push('swap', [left, right])
  }

  const write = (index: number, value: number, range?: [number, number]) => {
    values[index] = value
    swaps += 1
    push('overwrite', [index], range ? { range } : {})
  }

  if (algorithm === 'bubble') {
    for (let end = values.length - 1; end >= 0; end -= 1) {
      let changed = false
      for (let index = 0; index < end; index += 1) {
        compare(index, index + 1)
        if (values[index] > values[index + 1]) {
          swap(index, index + 1)
          changed = true
        }
      }
      sorted.add(end)
      if (!changed) {
        for (let index = 0; index < end; index += 1) sorted.add(index)
        break
      }
    }
  }

  if (algorithm === 'selection') {
    for (let start = 0; start < values.length; start += 1) {
      let minimum = start
      for (let index = start + 1; index < values.length; index += 1) {
        compare(minimum, index)
        if (values[index] < values[minimum]) minimum = index
      }
      if (minimum !== start) swap(start, minimum)
      sorted.add(start)
    }
  }

  if (algorithm === 'insertion') {
    sorted.add(0)
    for (let index = 1; index < values.length; index += 1) {
      let cursor = index
      while (cursor > 0) {
        compare(cursor - 1, cursor)
        if (values[cursor - 1] <= values[cursor]) break
        swap(cursor - 1, cursor)
        cursor -= 1
      }
      for (let sortedIndex = 0; sortedIndex <= index; sortedIndex += 1) sorted.add(sortedIndex)
    }
  }

  if (algorithm === 'merge' && values.length > 0) {
    const mergeSort = (low: number, high: number): void => {
      if (low >= high) {
        sorted.add(low)
        return
      }
      const middle = Math.floor((low + high) / 2)
      mergeSort(low, middle)
      mergeSort(middle + 1, high)
      const merged: number[] = []
      let left = low
      let right = middle + 1
      while (left <= middle && right <= high) {
        compare(left, right, { range: [low, high] })
        if (values[left] <= values[right]) merged.push(values[left++])
        else merged.push(values[right++])
      }
      while (left <= middle) merged.push(values[left++])
      while (right <= high) merged.push(values[right++])
      merged.forEach((value, offset) => write(low + offset, value, [low, high]))
      for (let index = low; index <= high; index += 1) sorted.add(index)
    }
    mergeSort(0, values.length - 1)
  }

  if (algorithm === 'heap') {
    const heapify = (length: number, root: number): void => {
      let largest = root
      const left = root * 2 + 1
      const right = root * 2 + 2
      if (left < length) { compare(largest, left); if (values[left] > values[largest]) largest = left }
      if (right < length) { compare(largest, right); if (values[right] > values[largest]) largest = right }
      if (largest !== root) { swap(root, largest); heapify(length, largest) }
    }
    for (let index = Math.floor(values.length / 2) - 1; index >= 0; index -= 1) heapify(values.length, index)
    for (let end = values.length - 1; end > 0; end -= 1) { swap(0, end); sorted.add(end); heapify(end, 0) }
  }

  if (algorithm === 'shell') {
    for (let gap = Math.floor(values.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let index = gap; index < values.length; index += 1) {
        let cursor = index
        while (cursor >= gap) {
          compare(cursor - gap, cursor)
          if (values[cursor - gap] <= values[cursor]) break
          swap(cursor - gap, cursor)
          cursor -= gap
        }
      }
    }
  }

  if (algorithm === 'cocktail') {
    let start = 0
    let end = values.length - 1
    let changed = true
    while (changed) {
      changed = false
      for (let index = start; index < end; index += 1) { compare(index, index + 1); if (values[index] > values[index + 1]) { swap(index, index + 1); changed = true } }
      sorted.add(end)
      end -= 1
      for (let index = end; index > start; index -= 1) { compare(index - 1, index); if (values[index - 1] > values[index]) { swap(index - 1, index); changed = true } }
      sorted.add(start)
      start += 1
    }
  }

  if (algorithm === 'comb') {
    let gap = values.length
    let changed = true
    while (gap > 1 || changed) {
      gap = Math.max(1, Math.floor(gap / 1.3))
      changed = false
      for (let index = 0; index + gap < values.length; index += 1) { compare(index, index + gap); if (values[index] > values[index + gap]) { swap(index, index + gap); changed = true } }
    }
  }

  if (algorithm === 'gnome') {
    let index = 1
    while (index < values.length) {
      compare(index - 1, index)
      if (values[index - 1] <= values[index]) index += 1
      else { swap(index - 1, index); index = Math.max(1, index - 1) }
    }
  }

  if (algorithm === 'quick' && values.length > 0) {
    const partition = (low: number, high: number): number => {
      const pivotValue = values[high]
      push('pivot', [high], { pivot: high, range: [low, high] })
      let store = low
      for (let index = low; index < high; index += 1) {
        compare(index, high, { pivot: high, range: [low, high] })
        if (values[index] <= pivotValue) {
          if (store !== index) swap(store, index)
          store += 1
        }
      }
      if (store !== high) swap(store, high)
      sorted.add(store)
      return store
    }
    const sortRange = (low: number, high: number): void => {
      if (low > high) return
      if (low === high) {
        sorted.add(low)
        return
      }
      const pivot = partition(low, high)
      sortRange(low, pivot - 1)
      sortRange(pivot + 1, high)
    }
    sortRange(0, values.length - 1)
  }

  for (let index = 0; index < values.length; index += 1) sorted.add(index)
  push('complete')
  return steps
}
