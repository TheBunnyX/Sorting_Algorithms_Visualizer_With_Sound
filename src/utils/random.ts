export type DataPattern = 'random' | 'reversed' | 'nearly' | 'few-unique'

export const dataPatterns: Record<DataPattern, string> = {
  random: 'Random',
  reversed: 'Reversed',
  nearly: 'Nearly sorted',
  'few-unique': 'Few unique',
}

export function seedToNumber(seed: string): number {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createSeededRandom(seed: string): () => number {
  let state = seedToNumber(seed) || 1
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function makeSeededValues(size: number, seed: string, pattern: DataPattern = 'random'): number[] {
  const random = createSeededRandom(seed.trim() || 'default-seed')
  const values = Array.from({ length: size }, () => Math.floor(random() * 92) + 8)
  if (pattern === 'reversed') return values.sort((left, right) => right - left)
  if (pattern === 'few-unique') return values.map((value) => [14, 34, 54, 74, 94][value % 5])
  if (pattern === 'nearly' && size > 1) {
    values.sort((left, right) => left - right)
    for (let count = Math.max(1, Math.floor(size / 10)); count > 0; count -= 1) {
      const index = Math.floor(random() * (size - 1))
      ;[values[index], values[index + 1]] = [values[index + 1], values[index]]
    }
  }
  return values
}

export function createRandomSeed(): string {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const values = new Uint32Array(1)
    crypto.getRandomValues(values)
    return values[0].toString(36).toUpperCase()
  }
  return Math.floor(Math.random() * 0xffffffff).toString(36).toUpperCase()
}
