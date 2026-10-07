type Props = { cursor: number; total: number; onSeek: (cursor: number) => void }

export default function Transport({ cursor, total, onSeek }: Props) {
  return <div className="transport" role="group" aria-label="Playback timeline">
    <button className="step-button" aria-label="Step back" disabled={cursor <= 0} onClick={() => onSeek(cursor - 1)}>◀</button>
    <input aria-label="Timeline" type="range" min="0" max={total} value={cursor} onChange={(event) => onSeek(Number(event.target.value))} />
    <button className="step-button" aria-label="Step forward" disabled={cursor >= total} onClick={() => onSeek(cursor + 1)}>▶</button>
  </div>
}
