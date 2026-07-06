// Tiny dependency-free SVG bar chart. Supports a goal line and a second
// series (grouped bars) for calories in vs out. Light enough for old phones.

const W = 320, H = 130, PADL = 4, PADB = 18, PADT = 14

export default function MiniChart({ data = [], goal, unit = '', color = 'var(--accent)', color2 = '#ffd166', label2 }) {
  const n = data.length || 1
  const maxVal = Math.max(
    goal || 0,
    ...data.map((d) => Math.max(d.value || 0, d.value2 || 0)),
    1
  ) * 1.12
  const plotW = W - PADL * 2
  const plotH = H - PADB - PADT
  const slot = plotW / n
  const two = data.some((d) => d.value2 != null)
  const barW = Math.max(2, Math.min(two ? slot * 0.32 : slot * 0.62, 22))
  const y = (v) => PADT + plotH - (v / maxVal) * plotH
  const labelEvery = n > 12 ? Math.ceil(n / 6) : 1

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img"
        aria-label={`Chart, max ${Math.round(maxVal)}${unit}`}>
        {goal != null && goal > 0 && (
          <>
            <line x1={PADL} x2={W - PADL} y1={y(goal)} y2={y(goal)}
              stroke="var(--text-dim)" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
            <text x={W - PADL} y={y(goal) - 3} fontSize="8.5" fill="var(--text-dim)" textAnchor="end">
              goal {goal}{unit}
            </text>
          </>
        )}
        {data.map((d, i) => {
          const cx = PADL + slot * i + slot / 2
          const v1 = Math.max(0, d.value || 0)
          const bars = [
            <rect key="a" x={two ? cx - barW - 1 : cx - barW / 2} width={barW}
              y={y(v1)} height={Math.max(0, PADT + plotH - y(v1))}
              rx="2" fill={color} opacity={v1 ? 1 : 0.18} />,
          ]
          if (two) {
            const v2 = Math.max(0, d.value2 || 0)
            bars.push(
              <rect key="b" x={cx + 1} width={barW}
                y={y(v2)} height={Math.max(0, PADT + plotH - y(v2))}
                rx="2" fill={color2} opacity={v2 ? 1 : 0.18} />
            )
          }
          return (
            <g key={d.label + i}>
              {bars}
              {i % labelEvery === 0 && (
                <text x={cx} y={H - 5} fontSize="8" fill="var(--text-dim)" textAnchor="middle">
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      {two && (
        <div className="legend" style={{ marginTop: 2 }}>
          <span><i style={{ background: 'var(--accent)' }} /> In</span>
          <span><i style={{ background: color2 }} /> {label2 || 'Out'}</span>
        </div>
      )}
    </div>
  )
}
