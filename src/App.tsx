import { useEffect, useMemo, useRef, useState } from 'react'
import AlgorithmInfo from './components/AlgorithmInfo'
import ControlPanel from './components/ControlPanel'
import MetricsBar from './components/MetricsBar'
import SortStage from './components/SortStage'
import Transport from './components/Transport'
import { algorithmInfo } from './algorithms/algorithmInfo'
import { createSortSteps } from './algorithms/sortSteps'
import { createSoundEngine, type Waveform } from './audio/soundEngine'
import { createRandomSeed, makeSeededValues, type DataPattern } from './utils/random'
import { getCompletionOrder } from './utils/completion'
import { buildShareSearch, parseShareConfig } from './utils/shareLink'
import type { AlgorithmId, SortStep } from './types/sorting'

type Status = 'ready' | 'running' | 'paused' | 'completing' | 'complete'
const delayFor = (speed: number) => [180, 70, 18][speed - 1] ?? 70

export default function App() {
  const [initial] = useState(() => parseShareConfig(window.location.search))
  const [algorithm, setAlgorithm] = useState<AlgorithmId>(initial.algorithm ?? 'bubble')
  const [rival, setRival] = useState<AlgorithmId | null>(initial.rival ?? null)
  const [pattern, setPattern] = useState<DataPattern>(initial.pattern ?? 'random')
  const [size, setSize] = useState(initial.size ?? 48)
  const [seed, setSeed] = useState(() => initial.seed ?? createRandomSeed())
  const [appliedSeed, setAppliedSeed] = useState(seed)
  const [speed, setSpeed] = useState(initial.speed ?? 2)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(70)
  const [waveform, setWaveform] = useState<Waveform>('sine')
  // cursor counts applied sort steps: 0 is the untouched array, `total` is the finished sort.
  const [cursor, setCursor] = useState(0)
  const [completionCount, setCompletionCount] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [sound] = useState(() => createSoundEngine(true))
  const clock = useRef<{ banked: number; startedAt: number | null }>({ banked: 0, startedAt: null })

  const baseValues = useMemo(() => makeSeededValues(size, appliedSeed, pattern), [size, appliedSeed, pattern])
  const lanes = useMemo(() => [algorithm, ...(rival ? [rival] : [])].map((id) => ({ id, steps: createSortSteps(baseValues, id) })), [algorithm, rival, baseValues])
  const total = Math.max(...lanes.map((lane) => lane.steps.length))
  const finalValues = lanes[0].steps.at(-1)?.values ?? baseValues
  const completionOrder = useMemo(() => getCompletionOrder(finalValues), [finalValues])
  const sortDone = cursor >= total
  const status: Status = playing ? (sortDone ? 'completing' : 'running') : cursor === 0 ? 'ready' : sortDone && completionCount >= completionOrder.length ? 'complete' : 'paused'
  const locked = status === 'running' || status === 'paused' || status === 'completing'

  const stopClock = () => {
    const { banked, startedAt } = clock.current
    if (startedAt !== null) clock.current = { banked: banked + performance.now() - startedAt, startedAt: null }
  }
  const readClock = () => clock.current.banked + (clock.current.startedAt === null ? 0 : performance.now() - clock.current.startedAt)

  const playStep = (next: number) => lanes.forEach((lane, laneIndex) => {
    const step = lane.steps[next - 1]
    if (!step || step.kind === 'complete') return
    sound.play(step.active.slice(0, 2).map((index) => step.values[index]), 100, lanes.length > 1 ? (laneIndex === 0 ? -0.7 : 0.7) : 0)
  })

  const showStep = (next: number) => {
    setCursor(next); setCompletionCount(0); playStep(next)
    if (next >= total) stopClock()
    setElapsedMs(readClock())
  }

  const advance = () => {
    if (!sortDone) return showStep(cursor + 1)
    if (completionCount < completionOrder.length) sound.play(finalValues[completionOrder[completionCount]], 100)
    setCompletionCount(completionCount + 1)
    if (completionCount + 1 >= completionOrder.length) setPlaying(false)
  }

  // Re-armed after every tick, so a tempo change applies to the very next step.
  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(advance, delayFor(speed))
    return () => window.clearTimeout(timer)
  }, [playing, cursor, completionCount, speed])

  useEffect(() => { sound.setEnabled(soundEnabled); sound.setVolume(volume / 100); sound.setWaveform(waveform) }, [sound, soundEnabled, volume, waveform])
  useEffect(() => () => sound.close(), [sound])

  useEffect(() => {
    window.history.replaceState(null, '', buildShareSearch({ algorithm, rival, pattern, seed: appliedSeed, size, speed }) + window.location.hash)
  }, [algorithm, rival, pattern, appliedSeed, size, speed])

  const resetPlayback = () => {
    clock.current = { banked: 0, startedAt: null }
    setPlaying(false); setCursor(0); setCompletionCount(0); setElapsedMs(0)
  }
  const start = () => {
    if (locked) return
    clock.current = { banked: 0, startedAt: performance.now() }
    setPlaying(true); showStep(1)
  }
  const pause = () => { stopClock(); setPlaying(false) }
  const resume = () => {
    if (!sortDone) clock.current.startedAt = performance.now()
    setPlaying(true)
  }
  const seek = (next: number) => {
    const target = Math.max(0, Math.min(total, next))
    stopClock(); setPlaying(false); setCursor(target); setCompletionCount(target >= total ? completionOrder.length : 0); playStep(target)
  }
  const generate = (nextSeed = seed) => { setSeed(nextSeed); setAppliedSeed(nextSeed); resetPlayback() }
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    window.setTimeout(() => setCopyState('idle'), 1800)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target as HTMLInputElement | null
      const tag = target?.tagName
      const type = tag === 'INPUT' ? target?.type : undefined
      // Leave keys alone where the focused control already uses them: typing, sliders (arrows), buttons and checkboxes (space).
      if (tag === 'SELECT' || tag === 'TEXTAREA' || (tag === 'INPUT' && type !== 'range' && type !== 'checkbox')) return
      const key = event.key.toLowerCase()
      if (key === ' ') {
        if (tag === 'BUTTON' || type === 'checkbox') return
        event.preventDefault()
        if (status === 'paused') resume(); else if (locked) pause(); else start()
      }
      else if (key === 'arrowright' && type !== 'range') seek(cursor + 1)
      else if (key === 'arrowleft' && type !== 'range') seek(cursor - 1)
      else if (key === 'r') resetPlayback()
      else if (key === 'n' && !locked) generate(createRandomSeed())
      else if (key === 'm') setSoundEnabled(!soundEnabled)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const fewestSteps = Math.min(...lanes.map((lane) => lane.steps.length))
  const views = lanes.map((lane) => {
    const finished = cursor >= lane.steps.length
    const step: SortStep = cursor === 0 ? { values: baseValues, active: [], sorted: [], kind: 'compare', comparisons: 0, swaps: 0 } : lane.steps[Math.min(cursor, lane.steps.length) - 1]
    const place = lane.steps.length > fewestSteps ? 'FINISHED' : total === fewestSteps ? 'TIE' : 'FINISHED FIRST'
    return {
      id: lane.id,
      step,
      status: finished && (status === 'running' || status === 'paused') ? 'complete' : status,
      badge: lanes.length > 1 && finished ? `${place} · ${lane.steps.length} STEPS` : undefined,
    }
  })
  const completionIndices = completionOrder.slice(0, completionCount)

  return <main className="app-shell">
    <header className="topbar"><div className="brand-mark"><span>SS</span><strong>SORT<br /><em>WITH SOUND</em></strong></div><div className="header-note">AUDIOVISUAL ALGORITHM LAB <span>● ONLINE</span></div><div className="header-index">NO. 001<br /><span>EXP. 2026</span></div></header>
    <section className="hero-copy"><p className="eyebrow">INTERACTIVE SORTING / REAL-TIME AUDIO</p><h1>Make data<br /><i>move.</i></h1><p>Watch the logic unfold. Hear every comparison.<br />Choose an algorithm and find its rhythm.</p></section>
    <section className="workspace">
      <div className="stage-column">
        <div className={views.length > 1 ? 'stages stages-race' : 'stages'}>
          {views.map((view) => <SortStage key={view.id} values={view.step.values} active={view.step.active} sorted={view.step.sorted} pivot={view.step.pivot} range={view.step.range} completionIndices={completionIndices} algorithm={view.id} status={view.status} comparisons={view.step.comparisons} swaps={view.step.swaps} label={algorithmInfo[view.id].label} badge={view.badge} showStats={views.length > 1} />)}
        </div>
        <Transport cursor={cursor} total={total} onSeek={seek} />
        <p className="shortcut-hint">SPACE PLAY / PAUSE · ← → STEP · R RESET · N NEW DATA · M MUTE</p>
      </div>
      <ControlPanel algorithm={algorithm} rival={rival} pattern={pattern} size={size} speed={speed} soundEnabled={soundEnabled} volume={volume} waveform={waveform} seed={seed} copyState={copyState} status={status}
        onAlgorithmChange={(next) => { setAlgorithm(next); if (next === rival) setRival(null); resetPlayback() }}
        onRivalChange={(next) => { setRival(next); resetPlayback() }}
        onPatternChange={(next) => { setPattern(next); resetPlayback() }}
        onSizeChange={(next) => { setSize(next); resetPlayback() }}
        onSpeedChange={setSpeed} onSoundChange={setSoundEnabled} onVolumeChange={setVolume} onWaveformChange={setWaveform} onSeedChange={setSeed}
        onGenerate={() => generate()} onRandomize={() => generate(createRandomSeed())} onStart={start} onPause={pause} onResume={resume} onReset={resetPlayback} onCopyLink={() => void copyLink()} />
    </section>
    <MetricsBar comparisons={views.map((view) => view.step.comparisons)} swaps={views.map((view) => view.step.swaps)} step={cursor} totalSteps={total} elapsedMs={elapsedMs} />
    <AlgorithmInfo ids={views.map((view) => view.id)} />
    <footer><span>USE HEADPHONES FOR THE FULL EXPERIENCE</span><span>BUILD / 001 — SORTING IN MOTION</span></footer>
  </main>
}
