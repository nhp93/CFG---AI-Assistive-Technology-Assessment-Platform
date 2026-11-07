import { useRef, useState } from 'react'

const W = 760, H = 330, PAD = { l: 58, r: 24, t: 22, b: 58 }

// Line chart with one point per row per series. Arrow keys move between points (one tab stop);
// hover or focus shows the exact value. Series differ by color, marker shape, and line dash
export function LineChart({ rows, series, label, unit = 'min' }) {
  const [active, setActive] = useState(null)
  const svgRef = useRef(null)
  const max = Math.ceil(Math.max(...rows.flatMap((r) => series.map((s) => r[s.key]))) / 10) * 10
  const x = (i) => PAD.l + (i * (W - PAD.l - PAD.r)) / (rows.length - 1)
  const y = (v) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b)
  const ticks = Array.from({ length: max / 10 + 1 }, (_, i) => i * 10)
  const pointLabel = (r, s) => `${r.name}, ${s.label}: ${r[s.key]} minutes${r.note ? ` (${r.note})` : ''}`

  function onKey(e, i, k) {
    const moves = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1], Home: [-i, 0], End: [rows.length - 1 - i, 0] }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    const ni = Math.min(rows.length - 1, Math.max(0, i + move[0])), nk = Math.min(series.length - 1, Math.max(0, k + move[1]))
    svgRef.current.querySelector(`[data-pt="${ni}-${nk}"]`).focus()
  }

  const tip = active && { r: rows[active.i], s: series[active.k] }
  return (
    <div className="line-chart">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${label}. Use arrow keys to move between points.`}>
        {ticks.map((t) => (
          <g key={t} aria-hidden="true">
            <line className="grid" x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
            <text className="tick" x={PAD.l - 10} y={y(t) + 5} textAnchor="end">{t}</text>
          </g>
        ))}
        <text className="axis-title" aria-hidden="true" transform={`translate(16 ${(H - PAD.b + PAD.t) / 2}) rotate(-90)`} textAnchor="middle">Minutes</text>
        {rows.map((r, i) => (
          <text key={r.id} className="tick" aria-hidden="true" x={x(i)} y={H - PAD.b + 24} textAnchor="middle">{r.name.split(' ')[0]}</text>
        ))}
        <text className="axis-title" aria-hidden="true" x={(W + PAD.l) / 2} y={H - 8} textAnchor="middle">Client</text>
        {active && <line className="crosshair" aria-hidden="true" x1={x(active.i)} x2={x(active.i)} y1={PAD.t} y2={H - PAD.b} />}
        {series.map((s, k) => (
          <g key={s.key}>
            <polyline aria-hidden="true" fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash}
              points={rows.map((r, i) => `${x(i)},${y(r[s.key])}`).join(' ')} />
            {rows.map((r, i) => {
              const cx = x(i), cy = y(r[s.key]), on = active?.i === i && active?.k === k
              return (
                <g key={r.id} data-pt={`${i}-${k}`} className="pt" role="img" aria-label={pointLabel(r, s)}
                  tabIndex={(active ? on : i === 0 && k === 0) ? 0 : -1}
                  onMouseEnter={() => setActive({ i, k })} onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive({ i, k })} onBlur={() => setActive(null)} onKeyDown={(e) => onKey(e, i, k)}>
                  <circle cx={cx} cy={cy} r="16" fill="transparent" />
                  {s.shape === 'square'
                    ? <rect x={cx - (on ? 8 : 6)} y={cy - (on ? 8 : 6)} width={on ? 16 : 12} height={on ? 16 : 12} rx="2" fill={s.color} className="mark" />
                    : <circle cx={cx} cy={cy} r={on ? 9 : 7} fill={s.color} className="mark" />}
                </g>
              )
            })}
          </g>
        ))}
      </svg>
      {tip && (
        <div className="chart-tip" aria-hidden="true"
          style={{ left: `${(x(active.i) / W) * 100}%`, top: `${(y(tip.r[tip.s.key]) / H) * 100}%` }}>
          <strong>{tip.r.name}</strong>
          <span><Swatch color={tip.s.color} shape={tip.s.shape} dash={tip.s.dash} /> {tip.s.label}: {tip.r[tip.s.key]} {unit}</span>
          {tip.r.note && <em>{tip.r.note}</em>}
        </div>
      )}
    </div>
  )
}

// Legend marker that repeats the line's shape and dash, so series never rely on color alone
export function Swatch({ color, shape, dash }) {
  return (
    <svg className="s-swatch" width="34" height="14" viewBox="0 0 34 14" aria-hidden="true">
      <line x1="1" x2="33" y1="7" y2="7" stroke={color} strokeWidth="2" strokeDasharray={dash} />
      {shape === 'square' ? <rect x="11" y="1" width="12" height="12" rx="2" fill={color} /> : <circle cx="17" cy="7" r="6" fill={color} />}
    </svg>
  )
}

// Horizontal bar chart rendered as a table, so the text values are the accessible equivalent.
export function Bars({ caption, head = ['Item', 'Value'], rows, max }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value))
  return (
    <table className="bars">
      <caption>{caption}</caption>
      <thead><tr><th scope="col">{head[0]}</th><th scope="col">{head[1]}</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <th scope="row">{r.label}</th>
            <td>
              <span className="bar-track" aria-hidden="true"><span className="bar" style={{ width: `${(r.value / top) * 100}%` }} /></span>
              <span className="bar-value">{r.display ?? r.value}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
