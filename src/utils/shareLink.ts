import { algorithmInfo } from '../algorithms/algorithmInfo'
import { dataPatterns, type DataPattern } from './random'
import type { AlgorithmId } from '../types/sorting'

export type ShareConfig = {
  algorithm: AlgorithmId
  rival: AlgorithmId | null
  pattern: DataPattern
  seed: string
  size: number
  speed: number
}

const isAlgorithm = (value: string | null): value is AlgorithmId => value !== null && Object.hasOwn(algorithmInfo, value)
const isPattern = (value: string | null): value is DataPattern => value !== null && Object.hasOwn(dataPatterns, value)

export function parseShareConfig(search: string): Partial<ShareConfig> {
  const params = new URLSearchParams(search)
  const config: Partial<ShareConfig> = {}
  const algorithm = params.get('a')
  const rival = params.get('vs')
  const pattern = params.get('p')
  const seed = params.get('s')?.trim().slice(0, 32)
  const size = Number(params.get('n'))
  const speed = Number(params.get('t'))
  if (isAlgorithm(algorithm)) config.algorithm = algorithm
  if (isAlgorithm(rival) && rival !== algorithm) config.rival = rival
  if (isPattern(pattern)) config.pattern = pattern
  if (seed) config.seed = seed
  if (Number.isInteger(size) && size >= 16 && size <= 80 && size % 4 === 0) config.size = size
  if (Number.isInteger(speed) && speed >= 1 && speed <= 3) config.speed = speed
  return config
}

export function buildShareSearch(config: ShareConfig): string {
  const params = new URLSearchParams({ a: config.algorithm })
  if (config.rival) params.set('vs', config.rival)
  params.set('p', config.pattern)
  params.set('s', config.seed)
  params.set('n', String(config.size))
  params.set('t', String(config.speed))
  return `?${params.toString()}`
}
