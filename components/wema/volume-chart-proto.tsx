interface VolumeChartProps {
  months: string[]
  valueListed: number[]
  volumeSold: number[]
}

const MAX_VALUE = 4000000
const TICKS = [4000000, 3000000, 2000000, 1000000, 0]
const GRIDLINES = [140, 105, 70, 35]
const CHART_HEIGHT = 154

export function VolumeChart({ months, valueListed, volumeSold }: VolumeChartProps) {
  const maxVal = Math.max(...valueListed, ...volumeSold, MAX_VALUE)
  const scale = CHART_HEIGHT / maxVal

  const formatNaira = (n: number) => {
    if (n === 0) return '0'
    if (n >= 1000000) {
      const m = n / 1000000
      return `₦${Number.isInteger(m) ? m : m.toFixed(1)}M`
    }
    return `₦${Math.round(n / 1000)}K`
  }

  return (
    <div className="wema-volume-chart">
      <div className="wema-volume-y-axis">
        {TICKS.map((tick) => (
          <span key={tick} style={{ bottom: `${(tick / maxVal) * CHART_HEIGHT}px` }}>
            {formatNaira(tick)}
          </span>
        ))}
      </div>
      <div className="wema-volume-bars" role="img" aria-label={`Transaction volume chart from ${months[0]} to ${months[months.length - 1]}`}>
        {GRIDLINES.map((pos) => (
          <div key={pos} className="wema-volume-gridline" style={{ bottom: `${pos}px` }} />
        ))}
        {months.map((month, i) => (
          <div key={month} className="wema-volume-bar-group">
            <div
              className="wema-volume-bar wema-volume-bar--listed"
              style={{ height: `${valueListed[i] * scale}px` }}
              title={`${month}: Value listed ${formatNaira(valueListed[i])}`}
            />
            <div
              className="wema-volume-bar wema-volume-bar--sold"
              style={{ height: `${volumeSold[i] * scale}px` }}
              title={`${month}: Volume sold ${formatNaira(volumeSold[i])}`}
            />
          </div>
        ))}
      </div>
      <div className="wema-volume-x-axis">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="wema-volume-legend">
        <span className="wema-legend-item">
          <span className="wema-legend-dot wema-legend-dot--listed" />
          Value listed
        </span>
        <span className="wema-legend-item">
          <span className="wema-legend-dot wema-legend-dot--sold" />
          Volume sold
        </span>
      </div>
    </div>
  )
}