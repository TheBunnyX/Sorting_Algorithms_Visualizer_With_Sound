import { algorithmInfo } from '../algorithms/algorithmInfo'
import type { AlgorithmId } from '../types/sorting'

export default function AlgorithmInfo({ ids }: { ids: AlgorithmId[] }) {
  return <section className="algo-info" aria-label="Algorithm details">
    {ids.map((id) => {
      const info = algorithmInfo[id]
      return <article key={id}>
        <h2>{info.label}</h2>
        <p>{info.summary}</p>
        <dl>
          <div><dt>BEST</dt><dd>{info.best}</dd></div>
          <div><dt>AVERAGE</dt><dd>{info.average}</dd></div>
          <div><dt>WORST</dt><dd>{info.worst}</dd></div>
          <div><dt>SPACE</dt><dd>{info.space}</dd></div>
          <div><dt>STABLE</dt><dd>{info.stable ? 'Yes' : 'No'}</dd></div>
        </dl>
      </article>
    })}
  </section>
}
