import type { AlgorithmId } from '../types/sorting'

export type AlgorithmInfo = {
  label: string
  best: string
  average: string
  worst: string
  space: string
  stable: boolean
  summary: string
}

export const algorithmInfo: Record<AlgorithmId, AlgorithmInfo> = {
  bubble: { label: 'Bubble Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true, summary: 'Sweeps the array swapping adjacent pairs that are out of order, so the largest value bubbles to the end on every pass.' },
  selection: { label: 'Selection Sort', best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false, summary: 'Scans the unsorted part for its minimum and swaps it into place. Always the same number of comparisons, but very few swaps.' },
  insertion: { label: 'Insertion Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true, summary: 'Grows a sorted prefix by sliding each new value left until it fits. Very fast on data that is already nearly sorted.' },
  quick: { label: 'Quick Sort', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false, summary: 'Partitions around the last element as pivot, then recurses on both sides. Sorted or reversed input triggers its worst case.' },
  merge: { label: 'Merge Sort', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true, summary: 'Splits the array in half, sorts each half, then merges them back. Predictable speed at the cost of extra memory.' },
  heap: { label: 'Heap Sort', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: false, summary: 'Builds a max-heap, then repeatedly moves the root to the end and repairs the heap over the shrinking remainder.' },
  shell: { label: 'Shell Sort', best: 'O(n log n)', average: 'gap-dependent', worst: 'O(n²)', space: 'O(1)', stable: false, summary: 'Insertion sort over elements a gap apart, halving the gap each round so values travel long distances early.' },
  cocktail: { label: 'Cocktail Shaker Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true, summary: 'Bubble sort that alternates direction, carrying large values right and small values left in the same round.' },
  comb: { label: 'Comb Sort', best: 'O(n log n)', average: 'O(n² / 2ᵖ)', worst: 'O(n²)', space: 'O(1)', stable: false, summary: 'Bubble sort with a shrinking gap (÷1.3 each pass) that clears out small values stuck near the end early on.' },
  gnome: { label: 'Gnome Sort', best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true, summary: 'Walks forward while pairs are in order and steps back after every swap, like insertion sort with a single cursor.' },
}

export const algorithmIds = Object.keys(algorithmInfo) as AlgorithmId[]
