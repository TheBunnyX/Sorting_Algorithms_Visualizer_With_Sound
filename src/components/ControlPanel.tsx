import { algorithmIds, algorithmInfo } from '../algorithms/algorithmInfo'
import { dataPatterns, type DataPattern } from '../utils/random'
import type { Waveform } from '../audio/soundEngine'
import type { AlgorithmId } from '../types/sorting'

type Props = {
  algorithm: AlgorithmId
  rival: AlgorithmId | null
  pattern: DataPattern
  size: number
  speed: number
  soundEnabled: boolean
  volume: number
  waveform: Waveform
  seed: string
  copyState: 'idle' | 'copied' | 'failed'
  status: 'ready' | 'running' | 'paused' | 'completing' | 'complete'
  onAlgorithmChange: (value: AlgorithmId) => void
  onRivalChange: (value: AlgorithmId | null) => void
  onPatternChange: (value: DataPattern) => void
  onSizeChange: (value: number) => void
  onSpeedChange: (value: number) => void
  onSoundChange: (value: boolean) => void
  onVolumeChange: (value: number) => void
  onWaveformChange: (value: Waveform) => void
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSeedChange: (value: string) => void
  onGenerate: () => void
  onRandomize: () => void
  onCopyLink: () => void
}

const waveforms: Record<Waveform, string> = { sine: 'Sine', triangle: 'Triangle', square: 'Square', sawtooth: 'Sawtooth' }
const copyLabels = { idle: 'Copy share link', copied: 'Link copied', failed: 'Copy failed' }

export default function ControlPanel(props: Props) {
  const { status } = props
  const running = status === 'running' || status === 'paused' || status === 'completing'
  return (
    <section className="control-panel" aria-label="Sorting controls">
      <div className="control-heading">
        <span className="eyebrow">CONTROL DECK</span>
        <span role="status" aria-label={status} aria-live="polite" className={`status status-${status}`}><i /> {status}</span>
      </div>
      <label className="field">Algorithm
        <select aria-label="Algorithm" value={props.algorithm} disabled={running} onChange={(event) => props.onAlgorithmChange(event.target.value as AlgorithmId)}>
          {algorithmIds.map((id) => <option key={id} value={id}>{algorithmInfo[id].label}</option>)}
        </select>
      </label>
      <label className="field">Race against
        <select aria-label="Race against" value={props.rival ?? ''} disabled={running} onChange={(event) => props.onRivalChange((event.target.value || null) as AlgorithmId | null)}>
          <option value="">Off</option>
          {algorithmIds.map((id) => <option key={id} value={id} disabled={id === props.algorithm}>{algorithmInfo[id].label}</option>)}
        </select>
      </label>
      <label className="field">Data pattern
        <select aria-label="Data pattern" value={props.pattern} disabled={running} onChange={(event) => props.onPatternChange(event.target.value as DataPattern)}>
          {Object.entries(dataPatterns).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="field seed-field">Seed <output>{props.seed.length}/32</output>
        <input aria-label="Seed" type="text" maxLength={32} value={props.seed} disabled={running} onChange={(event) => props.onSeedChange(event.target.value)} />
      </label>
      <div className="seed-actions">
        <button className="seed-button" aria-label="Generate from seed" disabled={running || !props.seed.trim()} onClick={props.onGenerate}>Generate from seed <span>↻</span></button>
        <button className="seed-button" aria-label="New random data" disabled={running} onClick={props.onRandomize}>Random</button>
      </div>
      <label className="field">Array size <output>{props.size}</output>
        <input aria-label="Array size" type="range" min="16" max="80" step="4" value={props.size} disabled={running} onChange={(event) => props.onSizeChange(Number(event.target.value))} />
      </label>
      <label className="field">Tempo <output>{props.speed === 1 ? 'slow' : props.speed === 2 ? 'steady' : 'fast'}</output>
        <input aria-label="Tempo" type="range" min="1" max="3" value={props.speed} onChange={(event) => props.onSpeedChange(Number(event.target.value))} />
      </label>
      <label className="toggle"><input type="checkbox" checked={props.soundEnabled} onChange={(event) => props.onSoundChange(event.target.checked)} /><span /> Sound enabled</label>
      <label className="field">Volume <output>{props.volume}%</output>
        <input aria-label="Volume" type="range" min="0" max="100" step="5" value={props.volume} disabled={!props.soundEnabled} onChange={(event) => props.onVolumeChange(Number(event.target.value))} />
      </label>
      <label className="field">Waveform
        <select aria-label="Waveform" value={props.waveform} disabled={!props.soundEnabled} onChange={(event) => props.onWaveformChange(event.target.value as Waveform)}>
          {Object.entries(waveforms).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="button-row">
        {!running && <button className="primary-button" aria-label="Start sorting" onClick={props.onStart}>{status === 'complete' ? 'Run again' : 'Start sorting'} <span>↗</span></button>}
        {(status === 'running' || status === 'completing') && <button className="primary-button" aria-label="Pause sorting" onClick={props.onPause}>Pause <span>Ⅱ</span></button>}
        {status === 'paused' && <button className="primary-button" aria-label="Resume sorting" onClick={props.onResume}>Resume <span>▶</span></button>}
        <button className="secondary-button" aria-label="Reset data" onClick={props.onReset}>Reset data</button>
        <button className="secondary-button" aria-label="Copy share link" onClick={props.onCopyLink}>{copyLabels[props.copyState]}</button>
      </div>
    </section>
  )
}
