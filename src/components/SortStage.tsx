import type { AlgorithmId, SortStep } from '../types/sorting'

type Props = Pick<SortStep, 'values' | 'active' | 'sorted' | 'pivot' | 'range'> & { algorithm: AlgorithmId; status: string; comparisons: number; swaps: number; completionIndices?: number[]; label?: string; badge?: string; showStats?: boolean }

const pad = (value: number) => value.toString().padStart(2, '0')

export default function SortStage({ values, active, sorted, pivot, range, algorithm, status, comparisons, swaps, completionIndices = [], label, badge, showStats = false }: Props) {
  const caption = status === 'completing' ? 'GREEN PASS / ASCENDING' : status === 'complete' ? 'SORT COMPLETE' : pivot !== undefined ? `PIVOT INDEX ${pad(pivot)}` : range ? `RANGE ${pad(range[0])}–${pad(range[1])}` : 'SIGNAL READY'
  const barClass = (index: number) => [
    'bar',
    active.includes(index) && 'bar-active',
    sorted.includes(index) && 'bar-sorted',
    completionIndices.includes(index) && 'bar-complete',
    pivot === index && 'bar-pivot',
    range && (index < range[0] || index > range[1]) && 'bar-outside',
  ].filter(Boolean).join(' ')
  return <section className="stage" aria-label="Sorting visualization">
    <div className="stage-grid" aria-hidden="true" />
    {label && <div className="stage-head"><strong>{label}</strong>{badge ? <span className="stage-badge">{badge}</span> : showStats && <span>CMP {comparisons} · SWP {swaps}</span>}</div>}
    <div className="bars" role="img" aria-label={`${algorithm} sort ${status}, ${comparisons} comparisons, ${swaps} swaps`}>
      {values.map((value, index) => <div key={index} className={barClass(index)} style={{ height: `${Math.max(4, value)}%` }} title={`Value ${value}`} aria-label={`Value ${value}${active.includes(index) ? ', active' : ''}${sorted.includes(index) ? ', sorted' : ''}${completionIndices.includes(index) ? ', complete' : ''}${pivot === index ? ', pivot' : ''}`} />)}
    </div>
    <div className="stage-caption"><span>LIVE ARRAY / {values.length} VALUES</span><span>{caption}</span></div>
    <p className="sr-only">{algorithm} sort is {status}. {comparisons} comparisons and {swaps} swaps.</p>
  </section>
}
