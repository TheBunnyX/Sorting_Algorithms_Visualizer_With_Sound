type Props = { comparisons: number[]; swaps: number[]; step: number; totalSteps: number; elapsedMs: number }

const pad = (value: number) => value.toString().padStart(4, '0')

export default function MetricsBar({ comparisons, swaps, step, totalSteps, elapsedMs }: Props) {
  const lanes = comparisons.length > 1 ? ' A / B' : ''
  return <div className="metrics-bar" aria-label="Sort metrics">
    <div><span>COMPARISONS{lanes}</span><strong>{comparisons.map(pad).join(' / ')}</strong></div>
    <div><span>SWAPS{lanes}</span><strong>{swaps.map(pad).join(' / ')}</strong></div>
    <div><span>STEP</span><strong>{pad(step)} / {pad(totalSteps)}</strong></div>
    <div><span>ELAPSED</span><strong>{(elapsedMs / 1000).toFixed(2)}s</strong></div>
  </div>
}
