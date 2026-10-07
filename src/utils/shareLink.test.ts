import { describe, expect, it } from 'vitest'
import { buildShareSearch, parseShareConfig, type ShareConfig } from './shareLink'

describe('share links', () => {
  it('round-trips a full configuration', () => {
    const config: ShareConfig = { algorithm: 'quick', rival: 'merge', pattern: 'reversed', seed: 'demo 42&x', size: 64, speed: 3 }
    expect(parseShareConfig(buildShareSearch(config))).toEqual(config)
  })

  it('omits the rival when racing is off', () => {
    expect(buildShareSearch({ algorithm: 'heap', rival: null, pattern: 'random', seed: 'A', size: 48, speed: 2 })).toBe('?a=heap&p=random&s=A&n=48&t=2')
  })

  it('drops values the controls could not produce', () => {
    expect(parseShareConfig('?a=bogo&vs=toString&p=sorted&s=%20&n=50&t=9')).toEqual({})
    expect(parseShareConfig('?a=quick&vs=quick')).toEqual({ algorithm: 'quick' })
  })
})
