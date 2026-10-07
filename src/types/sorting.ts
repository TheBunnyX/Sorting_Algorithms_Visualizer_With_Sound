export type AlgorithmId = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge' | 'heap' | 'shell' | 'cocktail' | 'comb' | 'gnome'

export type SortStep = {
  values: number[]
  active: number[]
  sorted: number[]
  pivot?: number
  range?: [number, number]
  kind: 'compare' | 'swap' | 'overwrite' | 'pivot' | 'complete'
  comparisons: number
  swaps: number
}
