import { useState } from 'react'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// marks: { [dateKey]: 'logged' | 'period' | 'predicted' | 'fertile' }
export default function Calendar({ marks = {}, onPick }) {
  const [view, setView] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const todayKey = key(new Date())
  const year = view.getFullYear(), month = view.getMonth()
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const shift = (n) => setView(new Date(year, month + n, 1))
  const isFuture = (dk) => dk > todayKey

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="pill" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
        <strong>{view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>
        <button type="button" className="pill" onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>
      <div className="cal-grid">
        {DOW.map((d, i) => <span key={i} className="cal-dow">{d}</span>)}
        {cells.map((day, i) => {
          if (!day) return <span key={'e' + i} />
          const dk = key(new Date(year, month, day))
          const mark = marks[dk]
          return (
            <button
              key={dk} type="button"
              className={'cal-day' + (mark ? ' m-' + mark : '') + (dk === todayKey ? ' today' : '')}
              disabled={isFuture(dk) && !mark}
              onClick={() => onPick && !isFuture(dk) && onPick(dk)}
              aria-label={dk + (mark ? ' ' + mark : '')}
            >
              {day}
            </button>
          )
        })}
      </div>
      <div className="legend" style={{ marginTop: 8, fontSize: 11.5 }}>
        <span><i style={{ background: 'var(--danger)' }} /> Period</span>
        <span><i style={{ background: 'var(--accent)' }} /> Predicted</span>
        <span><i style={{ background: '#7aa2ff' }} /> Fertile</span>
      </div>
    </div>
  )
}
