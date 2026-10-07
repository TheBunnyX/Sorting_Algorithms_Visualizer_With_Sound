export function getCompletionOrder(values: number[]): number[] {
  return values.map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value || left.index - right.index)
    .map(({ index }) => index)
}
