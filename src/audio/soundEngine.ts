export type Waveform = 'sine' | 'triangle' | 'square' | 'sawtooth'

export type SoundEngine = {
  play: (value: number | number[], max: number, pan?: number) => void
  setEnabled: (enabled: boolean) => void
  setVolume: (volume: number) => void
  setWaveform: (waveform: Waveform) => void
  close: () => void
}

export function createSoundEngine(initiallyEnabled: boolean): SoundEngine {
  let context: AudioContext | null = null
  let enabled = initiallyEnabled
  let volume = 0.7
  let waveform: Waveform = 'sine'

  const play = (value: number | number[], max: number, pan = 0) => {
    const notes = Array.isArray(value) ? value : [value]
    if (!enabled || volume <= 0 || notes.length === 0 || typeof window === 'undefined' || !window.AudioContext) return
    try {
      context ??= new window.AudioContext()
      if (context.state === 'suspended') void context.resume()
      const now = context.currentTime
      // Square and sawtooth carry far more harmonic energy than a sine at the same gain.
      const harshness = waveform === 'square' || waveform === 'sawtooth' ? 0.4 : 1
      const peak = Math.max(0.0002, (0.13 * volume * harshness) / Math.sqrt(notes.length))
      for (const note of notes) {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        const normalized = Math.max(0, Math.min(1, note / Math.max(max, 1)))
        const frequency = 180 + normalized * 700
        oscillator.type = waveform
        oscillator.frequency.setValueAtTime(frequency, now)
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(peak, now + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
        oscillator.connect(gain)
        if (pan !== 0 && typeof context.createStereoPanner === 'function') {
          const panner = context.createStereoPanner()
          panner.pan.setValueAtTime(pan, now)
          gain.connect(panner)
          panner.connect(context.destination)
        } else {
          gain.connect(context.destination)
        }
        oscillator.start(now)
        oscillator.stop(now + 0.085)
      }
    } catch {
      context = null
    }
  }

  return {
    play,
    setEnabled: (next) => { enabled = next },
    setVolume: (next) => { volume = Math.max(0, Math.min(1, next)) },
    setWaveform: (next) => { waveform = next },
    close: () => {
      if (context && context.state !== 'closed') void context.close()
      context = null
    },
  }
}
