import { describe, expect, it, vi } from 'vitest'
import { createSoundEngine } from './soundEngine'

describe('createSoundEngine', () => {
  it('does not construct audio when disabled', () => {
    const original = window.AudioContext
    const AudioContextMock = vi.fn()
    window.AudioContext = AudioContextMock

    createSoundEngine(false).play(50, 100)

    expect(AudioContextMock).not.toHaveBeenCalled()
    window.AudioContext = original
  })

  it('maps values to a positive frequency and survives blocked audio', () => {
    const oscillator = { frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
    const gain = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }
    const context = { currentTime: 0, destination: {}, state: 'running', createOscillator: () => oscillator, createGain: () => gain }
    const original = window.AudioContext
    class AudioContextMock {
      currentTime = context.currentTime
      destination = context.destination
      state = context.state
      createOscillator = context.createOscillator
      createGain = context.createGain
    }
    window.AudioContext = AudioContextMock as unknown as typeof AudioContext

    const engine = createSoundEngine(true)
    expect(() => engine.play(50, 100)).not.toThrow()
    expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(expect.any(Number), 0)
    expect((oscillator.frequency.setValueAtTime.mock.calls[0][0] as number)).toBeGreaterThan(0)
    window.AudioContext = original
  })

  it('plays one oscillator per note and honours enable, volume and waveform changes', () => {
    const oscillators: Array<{ type: string }> = []
    const original = window.AudioContext
    class AudioContextMock {
      currentTime = 0
      destination = {}
      state = 'running'
      createOscillator = () => {
        const oscillator = { type: 'sine', frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
        oscillators.push(oscillator)
        return oscillator
      }
      createGain = () => ({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() })
    }
    window.AudioContext = AudioContextMock as unknown as typeof AudioContext

    const engine = createSoundEngine(false)
    engine.play([20, 80], 100)
    expect(oscillators).toHaveLength(0)

    engine.setEnabled(true)
    engine.setWaveform('square')
    engine.play([20, 80], 100)
    expect(oscillators.map((oscillator) => oscillator.type)).toEqual(['square', 'square'])

    engine.setVolume(0)
    engine.play(50, 100)
    expect(oscillators).toHaveLength(2)
    window.AudioContext = original
  })

  it('swallows AudioContext construction errors', () => {
    const original = window.AudioContext
    window.AudioContext = vi.fn(() => { throw new Error('blocked') })
    const engine = createSoundEngine(true)
    expect(() => engine.play(1, 10)).not.toThrow()
    window.AudioContext = original
  })
})
