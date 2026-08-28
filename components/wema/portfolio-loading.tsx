// Skeletons matched to real content geometry · six metric slots, two panels,
// an attention strip, and eight table rows at the real 48px. Never a spinner.

export function PortfolioLoading() {
  return (
    <div className="wema-main" aria-busy="true" aria-label="Loading portfolio">
      <header className="wema-crumb">
        <div className="wema-sk" style={{ width: 180, height: 20 }} />
        <div className="wema-sk" style={{ width: 180, height: 11 }} />
      </header>

      <div className="wema-band">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="wema-metric" key={i}>
            <div className="wema-sk" style={{ width: 88, height: 11 }} />
            <div className="wema-sk" style={{ width: 64, height: 28, marginTop: 7 }} />
            <div className="wema-sk" style={{ width: 76, height: 10, marginTop: 7 }} />
          </div>
        ))}
      </div>

      <section className="wema-split">
        <div className="wema-panel">
          <div className="wema-panel-h">
            <div className="wema-sk" style={{ width: 140, height: 13 }} />
          </div>
          <div className="wema-panel-b">
            <div className="wema-sk" style={{ height: 168 }} />
          </div>
        </div>
        <div className="wema-panel">
          <div className="wema-panel-h">
            <div className="wema-sk" style={{ width: 160, height: 13 }} />
          </div>
          <div className="wema-panel-b">
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="wema-sk" key={i} style={{ height: 8, marginBottom: 19 }} />
            ))}
          </div>
        </div>
      </section>

      <div className="wema-attn" style={{ height: 46, padding: 0 }} />

      <table className="wema-table" aria-hidden="true">
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} style={{ height: 48 }}>
              <td colSpan={8} style={{ padding: '7px 14px' }}>
                <div className="wema-sk" style={{ height: 34 }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}