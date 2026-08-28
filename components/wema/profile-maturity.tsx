interface MaturityBand {
  label: string
  count: number
  width: number
  opacity: number
}

const BANDS: MaturityBand[] = [
  { label: 'Emerging', count: 34, width: 100, opacity: 0.22 },
  { label: 'Building', count: 25, width: 74, opacity: 0.4 },
  { label: 'Developing', count: 28, width: 82, opacity: 0.6 },
  { label: 'Established', count: 21, width: 62, opacity: 0.8 },
  { label: 'Strong', count: 8, width: 24, opacity: 1 },
]

export function ProfileMaturity() {
  return (
    <div className="wema-maturity">
      <div className="wema-maturity-header">
        <span className="wema-maturity-title">PROFILE MATURITY</span>
        <span className="wema-maturity-count">116 CONSENTED</span>
      </div>
      <div className="wema-maturity-bars">
        {BANDS.map((band) => (
          <div key={band.label} className="wema-maturity-row">
            <div className="wema-maturity-row-header">
              <span className="wema-maturity-label">{band.label}</span>
              <span className="wema-maturity-count">{band.count}</span>
            </div>
            <div className="wema-maturity-track">
              <div
                className="wema-maturity-fill"
                style={{ width: `${band.width}%`, opacity: band.opacity }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="wema-maturity-note">
        Maturity bands describe observed activity depth across consented profiles only · track width is each band&apos;s count relative to the largest band (34). They are not risk grades and carry no lending meaning.
      </p>
    </div>
  )
}